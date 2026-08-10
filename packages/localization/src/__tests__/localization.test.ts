import { describe, expect, it } from "vitest";
import { localizedText, messages, translate } from "../index";

describe("localization", () => {
  it("keeps Finnish and English key sets in parity", () => {
    expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages.fi).sort());
  });

  it("contains no empty interface messages", () => {
    for (const language of ["fi", "en"] as const) {
      for (const value of Object.values(messages[language])) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("selects typed interface and domain text", () => {
    expect(translate("fi", "cameraAction")).toBe("Avaa kamera");
    expect(localizedText("en", { fi: "Lasi", en: "Glass" })).toBe("Glass");
  });
});
