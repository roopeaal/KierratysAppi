import type { MessageKey } from "@kierratysappi/localization";

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
            readonly status: "resolved" | "packaging_missing";
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
  return {
    message:
      state.result.status === "packaging_missing" ? `${name}. ${t("packagingMissingTitle")}` : name,
    priority: "high",
  };
}
