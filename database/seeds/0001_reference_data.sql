BEGIN;

INSERT INTO regions (id, country_code, name_fi, name_en)
VALUES ('FI', 'FI', 'Suomi', 'Finland')
ON CONFLICT (id) DO NOTHING;

INSERT INTO materials (id, family, name_fi, name_en) VALUES
  ('plastic', 'plastic', 'Muovi', 'Plastic'),
  ('carton', 'carton', 'Kartonki', 'Carton'),
  ('paper', 'paper', 'Paperi', 'Paper'),
  ('glass', 'glass', 'Lasi', 'Glass'),
  ('metal', 'metal', 'Metalli', 'Metal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sorting_destinations (id, name_fi, name_en, category) VALUES
  ('deposit_return', 'Kaupan palautusautomaatti', 'Retail return point', 'deposit'),
  ('plastic_packaging', 'Muovipakkausten keräys', 'Plastic packaging collection', 'packaging'),
  ('carton_packaging', 'Kartonkipakkausten keräys', 'Carton packaging collection', 'packaging'),
  ('glass_packaging', 'Lasipakkausten keräys', 'Glass packaging collection', 'packaging'),
  ('metal_collection', 'Metallinkeräys', 'Metal collection', 'packaging')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rule_sources (
  id, organization, title, source_url, checked_at, verification_status, license_snapshot
) VALUES
  (
    '00000000-0000-4000-8000-000000000101',
    'Suomen Pakkauskierrätys RINKI Oy',
    'Sorting instructions',
    'https://rinkiin.fi/en/sorting-instructions/',
    '2026-08-10',
    'verified',
    '{"reuse":"link-and-paraphrase","legal_review_required":true}'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'Suomen Palautuspakkaus Oy (Palpa)',
    'Deposit system',
    'https://www.palpa.fi/beverage-container-recycling/deposit-refund-system/',
    '2026-08-10',
    'verified',
    '{"reuse":"link-and-paraphrase","legal_review_required":true}'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO sorting_rules (id, region_id, destination_id, lifecycle_status) VALUES
  ('fi.deposit.palpa', 'FI', 'deposit_return', 'published'),
  ('fi.packaging.plastic', 'FI', 'plastic_packaging', 'published'),
  ('fi.packaging.carton', 'FI', 'carton_packaging', 'published'),
  ('fi.packaging.glass', 'FI', 'glass_packaging', 'published'),
  ('fi.packaging.metal', 'FI', 'metal_collection', 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sorting_rule_versions (
  id, sorting_rule_id, version, rule_source_id, rule_definition, effective_from, published_at
) VALUES
  (
    '00000000-0000-4000-8000-000000000201',
    'fi.deposit.palpa',
    'fi-palpa-2026-08-10.1',
    '00000000-0000-4000-8000-000000000102',
    '{"precedence":1,"when":{"deposit_return_status":"yes"},"requires_user_check_when_unknown":true}',
    '2026-08-10',
    '2026-08-10T00:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    'fi.packaging.plastic',
    'fi-rinki-2026-08-10.1',
    '00000000-0000-4000-8000-000000000101',
    '{"materials":["plastic"],"requires_packaging":true}',
    '2026-08-10',
    '2026-08-10T00:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    'fi.packaging.carton',
    'fi-rinki-2026-08-10.1',
    '00000000-0000-4000-8000-000000000101',
    '{"materials":["carton","paper"],"requires_packaging":true}',
    '2026-08-10',
    '2026-08-10T00:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000204',
    'fi.packaging.glass',
    'fi-rinki-2026-08-10.1',
    '00000000-0000-4000-8000-000000000101',
    '{"materials":["glass"],"shapes":["bottle","jar"],"requires_packaging":true}',
    '2026-08-10',
    '2026-08-10T00:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000205',
    'fi.packaging.metal',
    'fi-rinki-2026-08-10.1',
    '00000000-0000-4000-8000-000000000101',
    '{"materials":["metal"],"requires_packaging":true,"rejects_pressurized_or_hazardous":true}',
    '2026-08-10',
    '2026-08-10T00:00:00Z'
  )
ON CONFLICT (sorting_rule_id, version) DO NOTHING;

COMMIT;
