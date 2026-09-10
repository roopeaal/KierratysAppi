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

  it("uses KeepItGreen consistently in both languages and privacy/deletion copy", () => {
    for (const language of ["fi", "en"] as const) {
      expect(translate(language, "appName")).toBe("KeepItGreen");
      for (const key of ["privacyDraft", "deleteLocalDataBody", "localDataDeleted"] as const) {
        expect(translate(language, key)).toContain("KeepItGreen");
      }
      expect(Object.values(messages[language]).join(" ")).not.toContain("KierrätysAppi");
    }
  });

  it("selects typed interface and domain text", () => {
    expect(translate("fi", "cameraAction")).toBe("Avaa kamera");
    expect(localizedText("en", { fi: "Lasi", en: "Glass" })).toBe("Glass");
  });
});
