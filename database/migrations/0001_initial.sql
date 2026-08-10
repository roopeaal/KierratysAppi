BEGIN;

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lifecycle_status text NOT NULL DEFAULT 'active'
    CHECK (lifecycle_status IN ('active', 'superseded', 'withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE gtins (
  gtin varchar(14) PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (gtin ~ '^[0-9]+$' AND length(gtin) IN (8, 12, 13, 14))
);
CREATE INDEX gtins_product_id_idx ON gtins(product_id);

CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL CHECK (length(canonical_name) BETWEEN 1 AND 300),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX brands_canonical_name_lower_idx ON brands(lower(canonical_name));

CREATE TABLE product_brands (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  PRIMARY KEY (product_id, brand_id)
);

CREATE TABLE provider_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id text NOT NULL CHECK (length(provider_id) BETWEEN 1 AND 100),
  source_record_id text NOT NULL CHECK (length(source_record_id) BETWEEN 1 AND 500),
  source_url text NOT NULL CHECK (source_url ~ '^https://'),
  retrieved_at timestamptz NOT NULL,
  last_confirmed_at timestamptz,
  stale_at timestamptz,
  license_id text NOT NULL,
  license_name text NOT NULL,
  license_url text CHECK (license_url IS NULL OR license_url ~ '^https://'),
  attribution_text text NOT NULL,
  share_alike boolean NOT NULL DEFAULT false,
  raw_content_sha256 char(64) CHECK (raw_content_sha256 IS NULL OR raw_content_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, source_record_id)
);

CREATE TABLE field_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('product', 'packaging_component', 'image')),
  entity_id uuid NOT NULL,
  field_name text NOT NULL CHECK (length(field_name) BETWEEN 1 AND 100),
  value_json jsonb NOT NULL,
  provider_record_id uuid NOT NULL REFERENCES provider_records(id) ON DELETE RESTRICT,
  confidence numeric(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  verification_status text NOT NULL
    CHECK (verification_status IN ('verified', 'manufacturer', 'community', 'user_confirmed', 'inferred', 'mock', 'unknown')),
  license_snapshot jsonb NOT NULL CHECK (jsonb_typeof(license_snapshot) = 'object'),
  observed_at timestamptz NOT NULL,
  last_confirmed_at timestamptz,
  stale_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX field_observations_entity_idx ON field_observations(entity_type, entity_id, field_name);
CREATE INDEX field_observations_provider_idx ON field_observations(provider_record_id);

CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  provider_record_id uuid REFERENCES provider_records(id) ON DELETE RESTRICT,
  purpose text NOT NULL CHECK (purpose IN ('front', 'packaging', 'recycling_label', 'evidence')),
  external_url text CHECK (external_url IS NULL OR external_url ~ '^https://'),
  storage_key text,
  width_px integer CHECK (width_px IS NULL OR width_px > 0),
  height_px integer CHECK (height_px IS NULL OR height_px > 0),
  mime_type text CHECK (mime_type IS NULL OR mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/heic')),
  content_sha256 char(64) CHECK (content_sha256 IS NULL OR content_sha256 ~ '^[0-9a-f]{64}$'),
  license_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(license_snapshot) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((external_url IS NOT NULL)::integer + (storage_key IS NOT NULL)::integer = 1)
);
CREATE INDEX product_images_product_id_idx ON product_images(product_id);

CREATE TABLE materials (
  id text PRIMARY KEY,
  family text NOT NULL CHECK (family IN ('plastic', 'carton', 'paper', 'glass', 'metal', 'wood', 'composite', 'other', 'unknown')),
  name_fi text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE material_codes (
  code text PRIMARY KEY,
  material_id text NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
  standard_name text NOT NULL,
  source_url text NOT NULL CHECK (source_url ~ '^https://'),
  effective_from date,
  effective_to date,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
);

CREATE TABLE packaging_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stable_key text NOT NULL CHECK (length(stable_key) BETWEEN 1 AND 200),
  packaging_status text NOT NULL DEFAULT 'unknown'
    CHECK (packaging_status IN ('packaging', 'non_packaging', 'unknown')),
  material_id text REFERENCES materials(id) ON DELETE RESTRICT,
  material_code text REFERENCES material_codes(code) ON DELETE RESTRICT,
  shape text CHECK (shape IS NULL OR shape IN ('bottle', 'can', 'jar', 'box', 'carton', 'bag', 'wrap', 'tray', 'cup', 'cap', 'lid', 'pump', 'tube', 'other', 'unknown')),
  deposit_return_status text NOT NULL DEFAULT 'unknown'
    CHECK (deposit_return_status IN ('yes', 'no', 'not_applicable', 'unknown')),
  detachable boolean,
  hazardous_residue text NOT NULL DEFAULT 'unknown' CHECK (hazardous_residue IN ('yes', 'no', 'unknown')),
  pressurized text NOT NULL DEFAULT 'unknown' CHECK (pressurized IN ('yes', 'no', 'unknown')),
  emptied text NOT NULL DEFAULT 'unknown' CHECK (emptied IN ('yes', 'no', 'unknown')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, stable_key)
);
CREATE INDEX packaging_components_product_id_idx ON packaging_components(product_id);

CREATE TABLE component_relationships (
  parent_component_id uuid NOT NULL REFERENCES packaging_components(id) ON DELETE CASCADE,
  child_component_id uuid NOT NULL REFERENCES packaging_components(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('contains', 'attached_to', 'separates_from')),
  PRIMARY KEY (parent_component_id, child_component_id, relationship),
  CHECK (parent_component_id <> child_component_id)
);

CREATE TABLE regions (
  id text PRIMARY KEY,
  country_code char(2) NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  parent_region_id text REFERENCES regions(id) ON DELETE RESTRICT,
  name_fi text NOT NULL,
  name_en text NOT NULL,
  municipality_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sorting_destinations (
  id text PRIMARY KEY,
  name_fi text NOT NULL,
  name_en text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rule_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL,
  title text NOT NULL,
  source_url text NOT NULL CHECK (source_url ~ '^https://'),
  checked_at date NOT NULL,
  verification_status text NOT NULL CHECK (verification_status IN ('verified', 'draft', 'retired')),
  license_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(license_snapshot) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sorting_rules (
  id text PRIMARY KEY,
  region_id text NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  destination_id text REFERENCES sorting_destinations(id) ON DELETE RESTRICT,
  lifecycle_status text NOT NULL DEFAULT 'draft' CHECK (lifecycle_status IN ('draft', 'published', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sorting_rule_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sorting_rule_id text NOT NULL REFERENCES sorting_rules(id) ON DELETE RESTRICT,
  version text NOT NULL,
  rule_source_id uuid NOT NULL REFERENCES rule_sources(id) ON DELETE RESTRICT,
  rule_definition jsonb NOT NULL CHECK (jsonb_typeof(rule_definition) = 'object'),
  effective_from date NOT NULL,
  effective_to date,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sorting_rule_id, version),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);
CREATE INDEX sorting_rule_versions_effective_idx
  ON sorting_rule_versions(sorting_rule_id, effective_from, effective_to);

CREATE FUNCTION reject_rule_version_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Published rule versions are immutable; insert a replacement version';
END;
$$;

CREATE TRIGGER sorting_rule_versions_immutable
BEFORE UPDATE OR DELETE ON sorting_rule_versions
FOR EACH ROW WHEN (OLD.published_at IS NOT NULL)
EXECUTE FUNCTION reject_rule_version_mutation();

CREATE TABLE product_resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  policy_id text NOT NULL,
  policy_version text NOT NULL,
  selected_observation_ids uuid[] NOT NULL DEFAULT '{}',
  resolved_snapshot jsonb NOT NULL CHECK (jsonb_typeof(resolved_snapshot) = 'object'),
  resolved_at timestamptz NOT NULL,
  stale_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_resolutions_product_id_idx ON product_resolutions(product_id, resolved_at DESC);

CREATE TABLE confidence_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('product_resolution', 'sorting_result', 'field_observation')),
  entity_id uuid NOT NULL,
  score numeric(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
  tier text NOT NULL CHECK (tier IN ('verified', 'high', 'medium', 'low', 'unknown')),
  decisive_observation_ids uuid[] NOT NULL DEFAULT '{}',
  rationale text[] NOT NULL DEFAULT '{}',
  assessed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX confidence_assessments_entity_idx ON confidence_assessments(entity_type, entity_id);

CREATE TABLE anonymous_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_token_hash char(64) NOT NULL UNIQUE CHECK (installation_token_hash ~ '^[0-9a-f]{64}$'),
  consent_version text,
  consented_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  deletion_requested_at timestamptz,
  deleted_at timestamptz
);

CREATE TABLE scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id uuid NOT NULL REFERENCES anonymous_installations(id) ON DELETE CASCADE,
  gtin varchar(14) REFERENCES gtins(gtin) ON DELETE SET NULL,
  save_reason text NOT NULL CHECK (save_reason IN ('explicit_history_sync', 'queued_feedback')),
  consent_version text NOT NULL,
  scanned_at timestamptz NOT NULL,
  retention_expires_at timestamptz NOT NULL,
  deleted_at timestamptz,
  CHECK (retention_expires_at > scanned_at)
);
CREATE INDEX scans_installation_time_idx ON scans(installation_id, scanned_at DESC);

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id uuid REFERENCES anonymous_installations(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('wrong_product', 'wrong_packaging', 'wrong_sorting', 'missing_data', 'other')),
  message text CHECK (message IS NULL OR length(message) <= 4000),
  consent_version text NOT NULL,
  moderation_status text NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'accepted', 'rejected', 'needs_evidence')),
  created_at timestamptz NOT NULL DEFAULT now(),
  retention_expires_at timestamptz NOT NULL,
  deleted_at timestamptz
);

CREATE TABLE corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('product', 'packaging_component', 'sorting_result')),
  entity_id uuid,
  field_name text NOT NULL,
  proposed_value jsonb NOT NULL,
  evidence_summary text CHECK (evidence_summary IS NULL OR length(evidence_summary) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE evidence_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  storage_key text NOT NULL UNIQUE,
  purpose text NOT NULL CHECK (purpose IN ('product_identity', 'packaging', 'recycling_text', 'material_code')),
  consent_version text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/heic')),
  width_px integer NOT NULL CHECK (width_px BETWEEN 1 AND 12000),
  height_px integer NOT NULL CHECK (height_px BETWEEN 1 AND 12000),
  byte_size integer NOT NULL CHECK (byte_size BETWEEN 1 AND 15000000),
  content_sha256 char(64) NOT NULL CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
  exif_removed boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  retention_expires_at timestamptz NOT NULL,
  deleted_at timestamptz
);

CREATE TABLE moderation_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES feedback(id) ON DELETE RESTRICT,
  actor_subject text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('accept', 'reject', 'request_evidence', 'escalate')),
  reason_code text NOT NULL,
  notes text CHECK (notes IS NULL OR length(notes) <= 4000),
  decided_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE feature_flags (
  key text PRIMARY KEY,
  description text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  environments text[] NOT NULL DEFAULT '{}',
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_subject text NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  request_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object')
);
CREATE INDEX audit_events_target_idx ON audit_events(target_type, target_id, occurred_at DESC);

ALTER TABLE anonymous_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_installations FORCE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans FORCE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback FORCE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections FORCE ROW LEVEL SECURITY;
ALTER TABLE evidence_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_images FORCE ROW LEVEL SECURITY;
ALTER TABLE moderation_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_decisions FORCE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;

COMMENT ON TABLE scans IS 'Server-side only after explicit save/sync or feedback consent; default scan history remains local.';
COMMENT ON TABLE evidence_images IS 'Object metadata only. Upload service must strip EXIF and enforce deletion deadlines.';
COMMENT ON TABLE field_observations IS 'Append-only source observations; application resolution must preserve provenance and licence.';

COMMIT;
