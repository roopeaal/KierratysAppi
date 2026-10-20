import { describe, expect, it } from "vitest";
import {
  CollectionDirectorySchema,
  type CollectionPoint,
  CollectionPointSchema,
  collectionPointMapUrl,
  collectionPointUrl,
  directoryAgeDays,
  nearestCollectionPoint,
  nearestCollectionPoints,
  nearestCollectionPointsAccepting,
} from "../collection-points";

const point: CollectionPoint = {
  id: "node/1",
  coordinates: { latitude: 60, longitude: 25 },
  name: null,
  operator: null,
  address: null,
  access: "unknown",
  kind: "unknown",
  reportedMaterials: [],
  reportedExclusions: [],
};
const directory = {
  version: 2,
  source: "OpenStreetMap contributors",
  attributionUrl: "https://www.openstreetmap.org/copyright",
  license: "ODbL-1.0",
  licenseUrl: "https://opendatacommons.org/licenses/odbl/1-0/",
  retrievedAt: "2026-10-06T00:00:00Z",
  dataTimestamp: "2026-10-05T23:00:00Z",
  coverage: "FI",
  points: [point],
};

describe("local collection directory contract", () => {
  it("filters exact reported materials before limiting, without broad-category inference or exclusion overrides", () => {
    const points = [
      {
        ...point,
        reportedMaterials: ["plastic"] as const,
        reportedExclusions: ["plasticPackaging"] as const,
      },
      ...Array.from({ length: 5 }, (_, index) => ({ ...point, id: `node/${index + 2}` })),
      {
        ...point,
        id: "node/9",
        coordinates: { latitude: 60.1, longitude: 25 },
        reportedMaterials: ["plasticPackaging"],
      },
    ] as CollectionPoint[];
    expect(
      nearestCollectionPointsAccepting(points, point.coordinates, ["plasticPackaging"], 1).map(
        (p) => p.point.id,
      ),
    ).toEqual(["node/9"]);
    expect(
      nearestCollectionPointsAccepting(
        [{ ...point, reportedMaterials: ["paper"], reportedExclusions: ["paper"] }],
        point.coordinates,
        ["paper"],
      ),
    ).toEqual([]);
    expect(() => nearestCollectionPointsAccepting(points, point.coordinates, [])).toThrow();
  });
  it("ranks five nearby alternatives by distance, without promoting a named or material-tagged point", () => {
    const list = Object.freeze(
      Array.from({ length: 7 }, (_, i) => ({
        ...point,
        id: `node/${i + 1}`,
        coordinates: { latitude: 60 + i / 100, longitude: 25 },
      })),
    );
    expect(nearestCollectionPoints(list, point.coordinates).map((p) => p.point.id)).toEqual([
      "node/1",
      "node/2",
      "node/3",
      "node/4",
      "node/5",
    ]);
    expect(list[0]).toEqual(point);
    expect(
      nearestCollectionPoints([{ ...point, id: "node/3" }, point], point.coordinates).map(
        (p) => p.point.id,
      ),
    ).toEqual(["node/1", "node/3"]);
  });
  it("keeps empty/far lists empty and validates limits and coordinates", () => {
    expect(nearestCollectionPoints([], point.coordinates)).toEqual([]);
    expect(
      nearestCollectionPoints(
        [{ ...point, coordinates: { latitude: 65, longitude: 25 } }],
        point.coordinates,
      ),
    ).toEqual([]);
    for (const limit of [0, 21, 1.5, NaN])
      expect(() => nearestCollectionPoints([point], point.coordinates, limit)).toThrow();
    expect(() => nearestCollectionPoints([point], { latitude: NaN, longitude: 25 })).toThrow();
  });
  it("retains exact material reports and explicit exclusions without inference", () => {
    const parsed = CollectionPointSchema.parse({
      ...point,
      reportedMaterials: ["plastic"],
      reportedExclusions: ["plasticBottles"],
    });
    expect(parsed.reportedMaterials).toEqual(["plastic"]);
    expect(parsed.reportedExclusions).toEqual(["plasticBottles"]);
  });
  it("rejects legacy, unknown, duplicate and conflicting material reports", () => {
    expect(CollectionDirectorySchema.safeParse({ ...directory, version: 1 }).success).toBe(false);
    for (const reportedMaterials of [["madeUp"], ["glass", "glass"], undefined])
      expect(CollectionPointSchema.safeParse({ ...point, reportedMaterials }).success).toBe(false);
    expect(
      CollectionPointSchema.safeParse({
        ...point,
        reportedMaterials: ["paper"],
        reportedExclusions: ["paper"],
      }).success,
    ).toBe(false);
  });
  it("opens a marked map at the public point, including when its address is missing", () => {
    expect(collectionPointMapUrl(point)).toBe(
      "https://www.openstreetmap.org/?mlat=60&mlon=25#map=18/60/25",
    );
    expect(() =>
      collectionPointMapUrl({
        ...point,
        coordinates: { latitude: 999, longitude: 25 },
      }),
    ).toThrow();
  });
  it("does not make old upstream data fresh by downloading it again", () => {
    const parsed = CollectionDirectorySchema.parse({
      ...directory,
      dataTimestamp: "2026-01-01T00:00:00Z",
    });
    expect(directoryAgeDays(parsed, Date.parse("2026-10-06T00:00:00Z"))).toBeGreaterThan(30);
  });
  it("preserves unknown access and unnamed points without fabricating metadata", () => {
    expect(CollectionDirectorySchema.parse(directory).points[0]).toEqual(point);
  });
  it("rejects missing licence, foreign source URLs and malformed positions", () => {
    expect(CollectionDirectorySchema.safeParse({ ...directory, license: undefined }).success).toBe(
      false,
    );
    expect(
      CollectionDirectorySchema.safeParse({ ...directory, attributionUrl: "https://evil.invalid" })
        .success,
    ).toBe(false);
    expect(
      CollectionDirectorySchema.safeParse({
        ...directory,
        points: [{ ...point, coordinates: { latitude: 999, longitude: 25 } }],
      }).success,
    ).toBe(false);
  });
  it("chooses nearest by actual distance without mutating data and resolves ties stably", () => {
    const far = { ...point, id: "node/2", coordinates: { latitude: 61, longitude: 25 } };
    const list = Object.freeze([far, point]);
    expect(nearestCollectionPoint(list, point.coordinates)?.point.id).toBe("node/1");
    expect(
      nearestCollectionPoint([{ ...point, id: "node/3" }, point], point.coordinates)?.point.id,
    ).toBe("node/1");
    expect(list[0]).toBe(far);
  });
  it("does not invent a point for an empty directory", () => {
    expect(nearestCollectionPoint([], point.coordinates)).toBeNull();
  });
  it("only constructs allowlisted source links without user location", () => {
    expect(collectionPointUrl(point)).toBe("https://www.openstreetmap.org/node/1");
    expect(() => collectionPointUrl({ ...point, id: "../evil" })).toThrow();
  });
  it("distinguishes data age from a physical verification date", () => {
    expect(
      directoryAgeDays(
        CollectionDirectorySchema.parse(directory),
        Date.parse("2026-11-06T00:00:00Z"),
      ),
    ).toBe(31);
  });
});
