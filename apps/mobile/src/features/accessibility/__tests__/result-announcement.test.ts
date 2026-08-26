import type { MessageKey } from "@kierratysappi/localization";
import { describe, expect, it } from "vitest";
import { lookupAnnouncement } from "../result-announcement";

const t = (key: MessageKey) => key;

describe("lookup accessibility announcements", () => {
  it("maps every lookup state to silence, progress, or an uninterruptible terminal update", () => {
    expect(lookupAnnouncement({ status: "idle" }, t)).toBeUndefined();
    expect(lookupAnnouncement({ status: "loading" }, t)).toEqual({
      message: "loading",
      priority: "default",
    });
    expect(lookupAnnouncement({ status: "offline" }, t)).toEqual({
      message: "offlineTitle. offlineBody",
      priority: "high",
    });
    expect(lookupAnnouncement({ status: "invalid" }, t)).toEqual({
      message: "checkCode. invalidGtin",
      priority: "high",
    });
    expect(lookupAnnouncement({ status: "complete", result: { status: "not_found" } }, t)).toEqual({
      message: "notFoundTitle. notFoundBody",
      priority: "high",
    });
    expect(
      lookupAnnouncement({ status: "complete", result: { status: "provider_unavailable" } }, t),
    ).toEqual({
      message: "providerUnavailableTitle. providerUnavailableBody",
      priority: "high",
    });
    expect(
      lookupAnnouncement(
        {
          status: "complete",
          result: {
            status: "resolved",
            gtin: "3017620422003",
            product: { name: { value: "Nutella" } },
          },
        },
        t,
      ),
    ).toEqual({ message: "Nutella", priority: "high" });
    expect(
      lookupAnnouncement(
        {
          status: "complete",
          result: { status: "packaging_missing", gtin: "3017620422003", product: {} },
        },
        t,
      ),
    ).toEqual({ message: "3017620422003. packagingMissingTitle", priority: "high" });
  });
});
