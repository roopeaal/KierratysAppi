import {
  type MunicipalitySelection,
  municipalitySelection,
  resolveSortingMunicipality,
} from "@kierratysappi/recycling-engine";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

type ReadFix = (
  signal: AbortSignal,
  options?: { prompt?: boolean },
) => Promise<{ coords: { latitude: number; longitude: number; accuracy: number | null } }>;
type Selection = MunicipalitySelection & { method: "manual" | "device" };
type RegionContext = {
  suggestion: MunicipalitySelection | undefined;
  selection: Selection | undefined;
  busy: boolean;
  issue: "boundary" | "unavailable" | undefined;
  locate: () => Promise<void>;
  select: (code: string) => void;
  fromCoordinates: (fix: unknown) => void;
  clear: () => void;
  clearDevice: () => void;
};
const Context = createContext<RegionContext | undefined>(undefined);
const fallback: RegionContext = {
  suggestion: undefined,
  selection: undefined,
  busy: false,
  issue: undefined,
  locate: async () => {},
  select: () => {},
  fromCoordinates: () => {},
  clear: () => {},
  clearDevice: () => {},
};
export function SortingRegionProvider({
  children,
  readFix,
  permissionRevision = 0,
}: PropsWithChildren<{ readFix?: ReadFix; permissionRevision?: number }>) {
  const [selection, setSelection] = useState<Selection>(),
    [suggestion, setSuggestion] = useState<MunicipalitySelection>(),
    [busy, setBusy] = useState(false),
    [issue, setIssue] = useState<RegionContext["issue"]>();
  const active = useRef<AbortController | undefined>(undefined);
  const manuallySelected = useRef(false);
  const clear = useCallback(() => {
    manuallySelected.current = false;
    active.current?.abort();
    active.current = undefined;
    setSelection(undefined);
    setBusy(false);
    setIssue(undefined);
    setSuggestion(undefined);
  }, []);
  const fromCoordinates = useCallback((fix: unknown) => {
    if (manuallySelected.current) return;
    active.current?.abort();
    active.current = undefined;
    setBusy(false);
    const result = resolveSortingMunicipality(fix);
    setSuggestion(result.status === "boundary" ? result.suggestion : undefined);
    setSelection(result.status === "known" ? { ...result.selection, method: "device" } : undefined);
    setIssue(
      result.status === "known"
        ? undefined
        : result.status === "boundary"
          ? "boundary"
          : "unavailable",
    );
  }, []);
  const clearDevice = useCallback(() => {
    if (!manuallySelected.current) clear();
  }, [clear]);
  useEffect(() => {
    if (permissionRevision) clearDevice();
  }, [permissionRevision, clearDevice]);
  const locate = useCallback(async () => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    manuallySelected.current = false;
    setSelection(undefined);
    setBusy(true);
    setIssue(undefined);
    setSuggestion(undefined);
    try {
      if (!readFix) throw Error("no_location_port");
      const fix = await readFix(controller.signal, { prompt: true });
      if (!controller.signal.aborted) fromCoordinates(fix.coords);
    } catch {
      if (!controller.signal.aborted) setIssue("unavailable");
    } finally {
      if (active.current === controller) {
        active.current = undefined;
        setBusy(false);
      }
    }
  }, [readFix, fromCoordinates]);
  const select = useCallback(
    (code: string) => {
      const next = municipalitySelection(code);
      if (!next) return;
      clear();
      manuallySelected.current = true;
      setSelection({ ...next, method: "manual" });
    },
    [clear],
  );
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "background") clear();
    });
    return () => {
      listener.remove();
      active.current?.abort();
    };
  }, [clear]);
  return (
    <Context.Provider
      value={{
        selection,
        suggestion,
        busy,
        issue,
        locate,
        select,
        fromCoordinates,
        clear,
        clearDevice,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useSortingRegion = () => useContext(Context) ?? fallback;
