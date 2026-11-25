import type { ProductLookupResult } from "@kierratysappi/contracts/lookup-schema";
import { type Gtin, parseGtin } from "@kierratysappi/domain";
import { fetch as streamingFetch } from "expo/fetch";
import Constants from "expo-constants";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { historyArtworkFor } from "@/features/history/product-artwork";
import { addHistoryEntry, queuePendingLookup } from "@/features/history/storage";
import { offlineCatalogue } from "@/features/local-vision/catalogue";
import { isExpoGoHost } from "@/features/runtime/host";
import { localDataGeneration } from "@/features/security/local-data-generation";
import { useLanguage } from "@/i18n/language-context";
import { trackTechnicalEvent } from "@/telemetry/technical-events";
import barcodeData from "../../../assets/data/off-finland-barcodes.json";
import communityPackagingData from "../../../assets/data/fi-package-observations.json";
import { LookupNetworkError, requestProductLookup } from "./api";
import { createBarcodeLibraryLookup } from "./barcode-library";
import { createCommunityPackagingLookup } from "./community-packaging-lookup";
import { lookupWithIdentityBackup, shouldSaveOnlineLookup } from "./local-first-lookup";
import { cachedLookup, cacheLookup } from "./lookup-cache";
import { createPublicIdentityLookup } from "./public-identity-lookup";
import { reviewedBarcodeLookup } from "./reviewed-barcode-packaging";
import { createRuntimeBarcodeLookup } from "./runtime-lookup";
import {
  isDuplicateScan,
  type ScanSource,
  type SessionState,
  sessionReducer,
} from "./session-machine";

type LookupAttempt =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly reason: "invalid" | "duplicate" | "busy" };

type ScanSessionContextValue = {
  readonly state: SessionState;
  readonly lookupBarcode: (raw: string, source: ScanSource) => Promise<LookupAttempt>;
  readonly reset: () => void;
};

const ScanSessionContext = createContext<ScanSessionContextValue | undefined>(undefined);
const publicLookup = createPublicIdentityLookup((url, init) => streamingFetch(url, init));
const publicOnlineLookup = async (gtin: Gtin, language: "fi" | "en", signal?: AbortSignal) => {
  try {
    return await publicLookup(gtin, language, signal);
  } catch {
    throw new LookupNetworkError();
  }
};
const originalLookup = createRuntimeBarcodeLookup(
  offlineCatalogue,
  isExpoGoHost() ? "storeClient" : Constants.executionEnvironment,
  requestProductLookup,
  publicOnlineLookup,
);
const bundled = createBarcodeLibraryLookup(barcodeData);
const communityPackaging = createCommunityPackagingLookup(communityPackagingData);
async function localFirstLookup(gtin: Gtin, language: "fi" | "en", signal: AbortSignal) {
  const generation = localDataGeneration();
  const reviewed = reviewedBarcodeLookup(gtin, language);
  if (reviewed) return reviewed;
  const cached = await cachedLookup(gtin, language);
  if (cached?.status === "resolved") return cached;
  const community = communityPackaging(gtin, language);
  if (community) return community;
  const backup = cached ?? bundled.lookup(gtin, language);
  const result = await lookupWithIdentityBackup(
    () => originalLookup(gtin, language, signal),
    backup,
    signal,
  );
  if (!signal.aborted && shouldSaveOnlineLookup(result, backup))
    await cacheLookup(result, language, Date.now(), generation).catch(() => undefined);
  return result;
}

export function ScanSessionProvider({ children }: PropsWithChildren) {
  const { language } = useLanguage();
  const [state, dispatch] = useReducer(sessionReducer, { status: "idle" });
  const busy = useRef(false);
  const currentRequest = useRef<AbortController | undefined>(undefined);
  const previousScan = useRef<{ gtin: Gtin; at: number } | undefined>(undefined);

  const lookupBarcode = useCallback(
    async (raw: string, source: ScanSource): Promise<LookupAttempt> => {
      const parsed = parseGtin(raw);
      if (!parsed.ok) {
        dispatch({ type: "invalid", input: raw });
        return { accepted: false, reason: "invalid" };
      }
      if (busy.current) return { accepted: false, reason: "busy" };
      const now = Date.now();
      if (source === "camera" && isDuplicateScan(previousScan.current, parsed.value, now)) {
        return { accepted: false, reason: "duplicate" };
      }

      busy.current = true;
      const controller = new AbortController();
      currentRequest.current = controller;
      const generation = localDataGeneration();
      if (source === "camera") previousScan.current = { gtin: parsed.value, at: now };
      dispatch({ type: "started", gtin: parsed.value, source });

      trackTechnicalEvent("scan_decoded", { source });
      void (async () => {
        try {
          const result = await localFirstLookup(parsed.value, language, controller.signal);
          if (controller.signal.aborted || generation !== localDataGeneration()) return;
          dispatch({ type: "completed", gtin: parsed.value, result });
          trackTechnicalEvent("lookup_completed", {
            status: result.status,
            providerId:
              result.status === "resolved" || result.status === "packaging_missing"
                ? result.provider.id
                : "none",
            cacheHit:
              result.status === "resolved" || result.status === "packaging_missing"
                ? result.cache.hit
                : false,
          });
          void saveHistoryResult(parsed.value, result).catch(() => undefined);
        } catch (error) {
          if (controller.signal.aborted || generation !== localDataGeneration()) return;
          dispatch({ type: "offline", gtin: parsed.value });
          if (error instanceof LookupNetworkError) {
            trackTechnicalEvent("offline_queued", { source });
            void queuePendingLookup(parsed.value).catch(() => undefined);
          }
        } finally {
          if (currentRequest.current === controller) {
            busy.current = false;
            currentRequest.current = undefined;
          }
        }
      })();
      return { accepted: true };
    },
    [language],
  );

  const reset = useCallback(() => {
    currentRequest.current?.abort();
    currentRequest.current = undefined;
    busy.current = false;
    previousScan.current = undefined;
    dispatch({ type: "reset" });
  }, []);
  const value = useMemo(() => ({ state, lookupBarcode, reset }), [state, lookupBarcode, reset]);
  return <ScanSessionContext.Provider value={value}>{children}</ScanSessionContext.Provider>;
}

export function useScanSession() {
  const context = useContext(ScanSessionContext);
  if (!context) throw new Error("useScanSession must be used within ScanSessionProvider");
  return context;
}

async function saveHistoryResult(gtin: Gtin, result: ProductLookupResult) {
  if (result.status === "provider_unavailable") return;
  const product = result.status !== "not_found" ? result.product : undefined;
  const artwork = product ? historyArtworkFor(product.packagingComponents) : undefined;
  await addHistoryEntry({
    gtin,
    productName: product?.name?.value,
    ...(artwork ? { artwork } : {}),
    resultStatus: result.status,
    scannedAt: new Date().toISOString(),
  });
}
