import type { MessageKey } from "@kierratysappi/localization";
import { describe, expect, it } from "vitest";
import { lookupAnnouncement } from "../result-announcement";

const t = (key: MessageKey) => key;

describe("lookup accessibility announcements", () => {
  it("maps every lookup state to silence, progress, or an uninterruptible terminal update", () => {
    expect(lookupAnnouncement({ status: "idle" }, t, "fi")).toBeUndefined();
    expect(lookupAnnouncement({ status: "loading" }, t, "fi")).toEqual({
      message: "loading",
      priority: "default",
    });
    expect(lookupAnnouncement({ status: "offline" }, t, "fi")).toEqual({
      message: "offlineTitle. offlineBody",
      priority: "high",
    });
    expect(lookupAnnouncement({ status: "invalid" }, t, "fi")).toEqual({
      message: "checkCode. invalidGtin",
      priority: "high",
    });
    expect(
      lookupAnnouncement({ status: "complete", result: { status: "not_found" } }, t, "fi"),
    ).toEqual({ message: "notFoundTitle. notFoundBody", priority: "high" });
    expect(
      lookupAnnouncement(
        { status: "complete", result: { status: "provider_unavailable" } },
        t,
        "fi",
      ),
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
            components: [
              {
                sorting: {
                  status: "resolved",
                  destination: { label: { fi: "Muovipakkaus", en: "Plastic packaging" } },
                },
              },
            ],
          },
        },
        t,
        "fi",
      ),
    ).toEqual({
      message: "sortingResultReady. Muovipakkaus. Nutella",
      priority: "high",
    });
    expect(
      lookupAnnouncement(
        {
          status: "complete",
          result: { status: "packaging_missing", gtin: "3017620422003", product: {} },
        },
        t,
        "fi",
      ),
    ).toEqual({ message: "3017620422003. packagingMissingTitle", priority: "high" });
  });

  it("announces uncertainty before product metadata", () => {
    expect(
      lookupAnnouncement(
        {
          status: "complete",
          result: {
            status: "resolved",
            gtin: "3017620422003",
            product: { name: { value: "Example" } },
            components: [
              {
                sorting: {
                  status: "ambiguous",
                  question: { fi: "Onko pakkaus pantillinen?", en: "Is it a deposit package?" },
                },
              },
            ],
          },
        },
        t,
        "fi",
      ),
    ).toEqual({ message: "needsCheckLabel. Onko pakkaus pantillinen?", priority: "high" });

    expect(
      lookupAnnouncement(
        {
          status: "complete",
          result: {
            status: "resolved",
            gtin: "3017620422003",
            product: {},
            components: [
              {
                sorting: {
                  status: "unknown",
                  nextAction: { fi: "Tarkista materiaali.", en: "Check the material." },
                },
              },
            ],
          },
        },
        t,
        "en",
      ),
    ).toEqual({ message: "confidenceUnknown. Check the material.", priority: "high" });
  });
});
