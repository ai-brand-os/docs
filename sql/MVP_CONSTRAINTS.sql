-- Planned PostgreSQL constraints for schema.prisma. Not a deployed migration.
-- Run in a reviewed transaction after Prisma DDL and legacy-data reconciliation.
-- Do not silently coalesce NULL or invent approved tones to satisfy this script.

-- Prisma 7 generated DDL leaves scalar-list columns nullable. Required lists
-- need explicit NOT NULL; empty arrays remain allowed except tone_attributes.
DO $constraints$
DECLARE list_column record;
BEGIN
  FOR list_column IN
    SELECT * FROM (VALUES
      ('brands', 'core_values'),
      ('brand_voices', 'tone_attributes'),
      ('brand_voices', 'vocabulary_dos'),
      ('brand_voices', 'vocabulary_donts'),
      ('products', 'key_features'),
      ('services', 'key_features'),
      ('audiences', 'pain_points'),
      ('audiences', 'goals'),
      ('brand_brain_revisions', 'missing_mandatory_fields'),
      ('brand_brain_revisions', 'readiness_reasons')
    ) AS required_lists(table_name, column_name)
  LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL',
      list_column.table_name, list_column.column_name);
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (
      %I IS NOT NULL AND CASE
        WHEN cardinality(%I) = 0 THEN true
        WHEN array_ndims(%I) = 1 THEN array_position(%I, NULL) IS NULL
        ELSE false END)', list_column.table_name,
      list_column.table_name || '_' || list_column.column_name || '_valid_list',
      list_column.column_name, list_column.column_name,
      list_column.column_name, list_column.column_name);
  END LOOP;
END
$constraints$;

-- Replace the earlier empty-array-bypassing cardinality rule, if present.
ALTER TABLE brand_voices DROP CONSTRAINT IF EXISTS tone_attributes_cardinality;
ALTER TABLE brand_voices ADD CONSTRAINT tone_attributes_cardinality
  CHECK (tone_attributes IS NOT NULL AND cardinality(tone_attributes) BETWEEN 2 AND 4);

-- Nullable vision is intentional; mission may be empty in a draft projection,
-- but approved required facts must pass separate service nonempty checks.
ALTER TABLE brands
  ADD CONSTRAINT mission_statement_length CHECK (
    mission_statement IS NOT NULL AND char_length(mission_statement) <= 300),
  ADD CONSTRAINT vision_statement_length CHECK (
    vision_statement IS NULL OR char_length(vision_statement) <= 300);

ALTER TABLE knowledge_index ADD CONSTRAINT knowledge_confidence_range
  CHECK (knowledge_confidence IS NOT NULL AND knowledge_confidence BETWEEN 0 AND 100);

ALTER TABLE brand_brain_revisions
  ADD CONSTRAINT brain_revision_number_positive CHECK (
    revision_number IS NOT NULL AND revision_number > 0),
  ADD CONSTRAINT brain_completeness_range CHECK (
    completeness_score IS NOT NULL AND completeness_score BETWEEN 0 AND 100),
  ADD CONSTRAINT brain_calculation_time CHECK (
    approved_at IS NOT NULL AND calculated_at IS NOT NULL AND calculated_at >= approved_at),
  ADD CONSTRAINT brain_previous_not_self CHECK (
    previous_revision_id IS NULL OR previous_revision_id <> id),
  ADD CONSTRAINT brain_restore_not_self CHECK (
    restored_from_revision_id IS NULL OR restored_from_revision_id <> id),
  ADD CONSTRAINT brain_ready_requires_no_missing_fields CHECK (
    NOT ready_for_generation OR cardinality(missing_mandatory_fields) = 0),
  ADD CONSTRAINT brain_ready_requires_no_blockers CHECK (
    NOT ready_for_generation OR cardinality(readiness_reasons) = 0);

ALTER TABLE conversation_purges
  ADD CONSTRAINT purge_attempt_count_nonnegative CHECK (
    attempt_count IS NOT NULL AND attempt_count >= 0),
  ADD CONSTRAINT purge_target_not_before_request CHECK (
    requested_at IS NOT NULL AND target_purge_at IS NOT NULL AND target_purge_at >= requested_at),
  ADD CONSTRAINT purge_completed_requires_time CHECK (
    status <> 'COMPLETED'::"ConversationPurgeStatus" OR completed_at IS NOT NULL),
  ADD CONSTRAINT purge_exception_requires_reference_review CHECK (
    status <> 'EXCEPTION'::"ConversationPurgeStatus" OR
    (exception_ref IS NOT NULL AND char_length(btrim(exception_ref)) > 0 AND review_at IS NOT NULL));

ALTER TABLE auth_sessions
  ADD CONSTRAINT auth_refresh_hash_shape CHECK (
    refresh_token_hash IS NOT NULL AND refresh_token_hash ~ '^[0-9a-f]{64}$'),
  ADD CONSTRAINT auth_expiry_after_creation CHECK (
    created_at IS NOT NULL AND expires_at IS NOT NULL AND expires_at > created_at),
  ADD CONSTRAINT auth_rotation_time CHECK (
    last_rotated_at IS NULL OR last_rotated_at >= created_at),
  ADD CONSTRAINT auth_revocation_time CHECK (
    revoked_at IS NULL OR revoked_at >= created_at);

-- UUID FK/unique constraints come from Prisma; raw SQL does not implement
-- tenant/type/field-approval semantics or fixed 30-day legal policy proposals.
-- No raw payload GIN index here: Prisma declares it once on Artifact.payload.
