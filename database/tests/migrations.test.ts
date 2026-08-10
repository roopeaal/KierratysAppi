import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const databases: PGlite[] = [];
const migrationPath = fileURLToPath(new URL("../migrations/0001_initial.sql", import.meta.url));
const seedPath = fileURLToPath(new URL("../seeds/0001_reference_data.sql", import.meta.url));

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.close()));
});

async function migratedDatabase() {
  const database = new PGlite();
  databases.push(database);
  await database.exec(await readFile(migrationPath, "utf8"));
  return database;
}

describe("database migrations", () => {
  it("executes from an empty PostgreSQL database and creates the required model", async () => {
    const database = await migratedDatabase();
    const result = await database.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const tables = result.rows.map((row) => row.table_name);

    expect(tables).toEqual(
      expect.arrayContaining([
        "products",
        "gtins",
        "brands",
        "product_images",
        "packaging_components",
        "materials",
        "material_codes",
        "provider_records",
        "field_observations",
        "sorting_destinations",
        "sorting_rules",
        "regions",
        "rule_sources",
        "sorting_rule_versions",
        "product_resolutions",
        "confidence_assessments",
        "scans",
        "anonymous_installations",
        "feedback",
        "corrections",
        "evidence_images",
        "moderation_decisions",
        "feature_flags",
        "audit_events",
      ]),
    );
    expect(tables).toHaveLength(26);
  });

  it("enables and forces row security for sensitive records", async () => {
    const database = await migratedDatabase();
    const result = await database.query<{
      relname: string;
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }>(`
      SELECT relname, relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE relname IN (
        'anonymous_installations', 'scans', 'feedback', 'corrections',
        'evidence_images', 'moderation_decisions', 'feature_flags', 'audit_events'
      )
      ORDER BY relname
    `);

    expect(result.rows).toHaveLength(8);
    expect(result.rows.every((row) => row.relrowsecurity && row.relforcerowsecurity)).toBe(true);
  });

  it("rejects invalid GTIN storage and mutation of a published rule version", async () => {
    const database = await migratedDatabase();
    const product = await database.query<{ id: string }>(
      "INSERT INTO products DEFAULT VALUES RETURNING id",
    );
    const productId = product.rows[0]?.id;
    await expect(
      database.query("INSERT INTO gtins (gtin, product_id) VALUES ($1, $2)", ["ABC", productId]),
    ).rejects.toThrow();

    await database.exec(`
      INSERT INTO regions (id, country_code, name_fi, name_en)
      VALUES ('FI', 'FI', 'Suomi', 'Finland');
      INSERT INTO sorting_destinations (id, name_fi, name_en, category)
      VALUES ('glass_packaging', 'Lasipakkaus', 'Glass packaging', 'packaging');
      INSERT INTO rule_sources (id, organization, title, source_url, checked_at, verification_status)
      VALUES ('00000000-0000-4000-8000-000000000001', 'Rinki', 'Lasipakkaukset', 'https://rinkiin.fi/', '2026-08-10', 'verified');
      INSERT INTO sorting_rules (id, region_id, destination_id, lifecycle_status)
      VALUES ('fi.packaging.glass', 'FI', 'glass_packaging', 'published');
      INSERT INTO sorting_rule_versions (
        id, sorting_rule_id, version, rule_source_id, rule_definition, effective_from, published_at
      ) VALUES (
        '00000000-0000-4000-8000-000000000002', 'fi.packaging.glass', '1',
        '00000000-0000-4000-8000-000000000001', '{}', '2026-08-10', now()
      );
    `);

    await expect(
      database.exec(`
      UPDATE sorting_rule_versions
      SET version = '2'
      WHERE id = '00000000-0000-4000-8000-000000000002'
    `),
    ).rejects.toThrow("immutable");
  });

  it("loads the reviewed Finnish reference seed idempotently", async () => {
    const database = await migratedDatabase();
    const seed = await readFile(seedPath, "utf8");
    await database.exec(seed);
    await database.exec(seed);

    const result = await database.query<{ rules: number; versions: number }>(`
      SELECT
        (SELECT count(*)::integer FROM sorting_rules) AS rules,
        (SELECT count(*)::integer FROM sorting_rule_versions) AS versions
    `);
    expect(result.rows[0]).toEqual({ rules: 5, versions: 5 });
  });
});
