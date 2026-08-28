import type { Language, LocalizedText } from "@kierratysappi/domain";
import { localizedText, type MessageKey } from "@kierratysappi/localization";

type AnnouncementSortingResult =
  | {
      readonly status: "resolved";
      readonly destination: { readonly label: LocalizedText };
    }
  | { readonly status: "ambiguous"; readonly question: LocalizedText }
  | { readonly status: "unknown"; readonly nextAction: LocalizedText };

type LookupAnnouncementState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "invalid" }
  | { readonly status: "offline" }
  | {
      readonly status: "complete";
      readonly result:
        | { readonly status: "not_found" }
        | { readonly status: "provider_unavailable" }
        | {
            readonly status: "resolved";
            readonly gtin: string;
            readonly product: { readonly name?: { readonly value: string } };
            readonly components: readonly { readonly sorting: AnnouncementSortingResult }[];
          }
        | {
            readonly status: "packaging_missing";
            readonly gtin: string;
            readonly product: { readonly name?: { readonly value: string } };
          };
    };

type Translator = (key: MessageKey) => string;

export type LookupAnnouncement = {
  readonly message: string;
  readonly priority: "default" | "high";
};

export function lookupAnnouncement(
  state: LookupAnnouncementState,
  t: Translator,
  language: Language,
): LookupAnnouncement | undefined {
  if (state.status === "loading") return { message: t("loading"), priority: "default" };
  if (state.status === "offline") {
    return { message: `${t("offlineTitle")}. ${t("offlineBody")}`, priority: "high" };
  }
  if (state.status === "invalid") {
    return { message: `${t("checkCode")}. ${t("invalidGtin")}`, priority: "high" };
  }
  if (state.status !== "complete") return undefined;
  if (state.result.status === "not_found") {
    return { message: `${t("notFoundTitle")}. ${t("notFoundBody")}`, priority: "high" };
  }
  if (state.result.status === "provider_unavailable") {
    return {
      message: `${t("providerUnavailableTitle")}. ${t("providerUnavailableBody")}`,
      priority: "high",
    };
  }

  const name = state.result.product.name?.value ?? state.result.gtin;
  if (state.result.status === "packaging_missing") {
    return { message: `${name}. ${t("packagingMissingTitle")}`, priority: "high" };
  }

  const firstSortingResult = state.result.components[0]?.sorting;
  if (!firstSortingResult) return { message: name, priority: "high" };
  if (firstSortingResult.status === "resolved") {
    return {
      message: `${t("sortingResultReady")}. ${localizedText(
        language,
        firstSortingResult.destination.label,
      )}. ${name}`,
      priority: "high",
    };
  }
  if (firstSortingResult.status === "ambiguous") {
    return {
      message: `${t("needsCheckLabel")}. ${localizedText(language, firstSortingResult.question)}`,
      priority: "high",
    };
  }
  return {
    message: `${t("confidenceUnknown")}. ${localizedText(language, firstSortingResult.nextAction)}`,
    priority: "high",
  };
}
