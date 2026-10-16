\set ON_ERROR_STOP on
-- Private test schema only; transaction rolls back all schema/data changes.
-- Requires Prisma-generated DDL via -v schema_ddl=/absolute/path.sql.
BEGIN;
CREATE SCHEMA task08_validation;
SET LOCAL search_path = task08_validation, public;
\i :schema_ddl
\ir ../sql/MVP_CONSTRAINTS.sql

INSERT INTO users (id,email,password_hash,full_name,updated_at)
VALUES ('00000000-0000-0000-0000-000000000001','constraint-test@example.invalid','not-a-real-password-hash','SQL fixture',now());
INSERT INTO organizations (id,name,industry,company_size,primary_region,primary_language,updated_at)
VALUES ('00000000-0000-0000-0000-000000000002','SQL fixture','SAAS_TECHNOLOGY','SIZE_1_5','test','en',now());
INSERT INTO brands (id,organization_id,name,mission_statement,updated_at)
VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002','SQL fixture','Test mission',now());
INSERT INTO artifacts (id,artifact_type,correlation_id,organization_id,producing_service,producing_stage,schema_version,payload)
VALUES ('00000000-0000-0000-0000-000000000005','APPROVED_KNOWLEDGE','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002','KNOWLEDGE_MANAGEMENT','sql_fixture','test','{}');
-- Fixture JSON bypasses application-only fact validation deliberately: these
-- probes verify PostgreSQL rules, not runtime provenance or approval semantics.
INSERT INTO brand_brain_revisions (id,brand_id,revision_number,artifact_id,approved_by_user_id,approved_at,change_reason,ontology_version,calculation_version,calculated_at,completeness_score,missing_mandatory_fields,ready_for_generation,readiness_reasons)
VALUES ('00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000003',1,'00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','2026-10-13 00:00:00','SQL fixture','test','2','2026-10-13 00:00:00',80,ARRAY[]::text[],true,ARRAY[]::text[]);
INSERT INTO brand_voices (id,brand_id,tone_attributes,updated_at)
VALUES ('00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000003',ARRAY['PROFESSIONAL','FRIENDLY']::"ToneAttribute"[],now());
INSERT INTO knowledge_index (id,organization_id,brand_id,describes_entity_type,describes_entity_id,knowledge_confidence,ontology_version,latest_artifact_id,updated_at)
VALUES ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003','BRAND','00000000-0000-0000-0000-000000000003',80,'test','00000000-0000-0000-0000-000000000005',now());
INSERT INTO auth_sessions (id,user_id,refresh_token_hash,created_at,expires_at)
VALUES ('00000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000001',repeat('a',64),'2026-10-13 00:00:00','2026-10-20 00:00:00');
INSERT INTO conversation_purges (id,organization_id,conversation_id,requested_at,target_purge_at,updated_at)
VALUES ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000011','2026-10-13 00:00:00','2026-11-12 00:00:00',now());

CREATE FUNCTION pg_temp.expect_statement(probe_label text, statement text, expected_state text)
RETURNS text LANGUAGE plpgsql AS $function$
DECLARE observed_state text;
BEGIN
  BEGIN
    EXECUTE statement;
    -- Roll back even successful probes, preserving fixtures for each test.
    RAISE EXCEPTION 'rollback successful probe' USING ERRCODE='PZ001';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS observed_state = RETURNED_SQLSTATE;
    IF observed_state = 'PZ001' THEN observed_state := NULL; END IF;
  END;
  IF observed_state IS DISTINCT FROM expected_state THEN
    RAISE EXCEPTION 'Probe % expected %, observed %', probe_label,
      coalesce(expected_state,'accepted'), coalesce(observed_state,'accepted');
  END IF;
  RETURN probe_label || ': ' || coalesce('rejected (' || observed_state || ')','accepted') || ' [PASS]';
END
$function$;

SELECT pg_temp.expect_statement(probe_label, statement, expected_state) AS result
FROM (VALUES
  ('tone empty','UPDATE brand_voices SET tone_attributes = ARRAY[]::"ToneAttribute"[]','23514'),
  ('tone one','UPDATE brand_voices SET tone_attributes = ARRAY[''PROFESSIONAL'']::"ToneAttribute"[]','23514'),
  ('tone two','UPDATE brand_voices SET tone_attributes = ARRAY[''PROFESSIONAL'',''FRIENDLY'']::"ToneAttribute"[]',NULL),
  ('tone four','UPDATE brand_voices SET tone_attributes = ARRAY[''PROFESSIONAL'',''FRIENDLY'',''BOLD'',''WARM'']::"ToneAttribute"[]',NULL),
  ('tone five','UPDATE brand_voices SET tone_attributes = ARRAY[''PROFESSIONAL'',''FRIENDLY'',''BOLD'',''WARM'',''PLAYFUL'']::"ToneAttribute"[]','23514'),
  ('tone whole NULL','UPDATE brand_voices SET tone_attributes = NULL','23502'),
  ('tone NULL element','UPDATE brand_voices SET tone_attributes = ARRAY[''PROFESSIONAL'',NULL]::"ToneAttribute"[]','23514'),
  ('tone multidimensional','UPDATE brand_voices SET tone_attributes = ARRAY[[''PROFESSIONAL'',''FRIENDLY''],[''BOLD'',''WARM'']]::"ToneAttribute"[]','23514'),
  ('tone duplicates need service guard','UPDATE brand_voices SET tone_attributes = ARRAY[''PROFESSIONAL'',''PROFESSIONAL'']::"ToneAttribute"[]',NULL),
  ('tone invalid enum','UPDATE brand_voices SET tone_attributes = ARRAY[''INVALID_TONE'',''FRIENDLY'']::"ToneAttribute"[]','22P02'),
  ('score NULL','UPDATE brand_brain_revisions SET completeness_score=NULL','23502'),
  ('score negative','UPDATE brand_brain_revisions SET completeness_score=-1','23514'),
  ('score over 100','UPDATE brand_brain_revisions SET completeness_score=101','23514'),
  ('score zero','UPDATE brand_brain_revisions SET completeness_score=0,ready_for_generation=false',NULL),
  ('score 100','UPDATE brand_brain_revisions SET completeness_score=100',NULL),
  ('revision zero','UPDATE brand_brain_revisions SET revision_number=0','23514'),
  ('revision NULL','UPDATE brand_brain_revisions SET revision_number=NULL','23502'),
  ('calculation time NULL','UPDATE brand_brain_revisions SET calculated_at=NULL','23502'),
  ('calculation before approval','UPDATE brand_brain_revisions SET calculated_at=''2026-10-12''','23514'),
  ('missing-fields NULL','UPDATE brand_brain_revisions SET missing_mandatory_fields=NULL','23502'),
  ('missing-fields empty','UPDATE brand_brain_revisions SET missing_mandatory_fields=ARRAY[]::text[]',NULL),
  ('ready with missing field','UPDATE brand_brain_revisions SET missing_mandatory_fields=ARRAY[''Brand.name'']','23514'),
  ('not ready with missing field','UPDATE brand_brain_revisions SET ready_for_generation=false,missing_mandatory_fields=ARRAY[''Brand.name''],readiness_reasons=ARRAY[''MISSING_FIELD'']',NULL),
  ('readiness-reasons NULL','UPDATE brand_brain_revisions SET readiness_reasons=NULL','23502'),
  ('ready with blocker','UPDATE brand_brain_revisions SET readiness_reasons=ARRAY[''ARCHIVED'']','23514'),
  ('previous self','UPDATE brand_brain_revisions SET previous_revision_id=id','23514'),
  ('restored self','UPDATE brand_brain_revisions SET restored_from_revision_id=id','23514'),
  ('optional previous NULL','UPDATE brand_brain_revisions SET previous_revision_id=NULL,restored_from_revision_id=NULL',NULL),
  ('optional vision NULL','UPDATE brands SET vision_statement=NULL',NULL),
  ('vision over length','UPDATE brands SET vision_statement=repeat(''v'',301)','23514'),
  ('mission over length','UPDATE brands SET mission_statement=repeat(''m'',301)','23514'),
  ('core values NULL','UPDATE brands SET core_values=NULL','23502'),
  ('core values NULL element','UPDATE brands SET core_values=ARRAY[''value'',NULL]','23514'),
  ('confidence NULL','UPDATE knowledge_index SET knowledge_confidence=NULL','23502'),
  ('confidence over 100','UPDATE knowledge_index SET knowledge_confidence=101','23514'),
  ('purge negative attempts','UPDATE conversation_purges SET attempt_count=-1','23514'),
  ('purge target before request','UPDATE conversation_purges SET target_purge_at=''2026-10-12''','23514'),
  ('purge complete without time','UPDATE conversation_purges SET status=''COMPLETED'',completed_at=NULL','23514'),
  ('purge exception without metadata','UPDATE conversation_purges SET status=''EXCEPTION'',exception_ref=NULL,review_at=NULL','23514'),
  ('purge valid exception','UPDATE conversation_purges SET status=''EXCEPTION'',exception_ref=''test-hold'',review_at=''2026-11-12''',NULL),
  ('auth expiry NULL','UPDATE auth_sessions SET expires_at=NULL','23502'),
  ('auth expiry before creation','UPDATE auth_sessions SET expires_at=''2026-10-12''','23514'),
  ('auth hash NULL','UPDATE auth_sessions SET refresh_token_hash=NULL','23502'),
  ('auth bad hash','UPDATE auth_sessions SET refresh_token_hash=''not-a-token-hash''','23514'),
  ('auth revoked before creation','UPDATE auth_sessions SET revoked_at=''2026-10-12''','23514'),
  ('auth optional timestamps NULL','UPDATE auth_sessions SET revoked_at=NULL,last_rotated_at=NULL',NULL)
) AS probes(probe_label,statement,expected_state);

DO $assertions$
BEGIN
  IF (SELECT count(*) FROM information_schema.columns WHERE table_schema='task08_validation' AND data_type='ARRAY' AND is_nullable='NO') <> 10 THEN
    RAISE EXCEPTION 'Required list NOT NULL mismatch';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='task08_validation' AND tablename='artifacts' AND indexdef LIKE '%USING gin%jsonb_path_ops%') THEN
    RAISE EXCEPTION 'Prisma GIN index missing';
  END IF;
END
$assertions$;
SELECT '10 required lists NOT NULL + Prisma GIN index [PASS]' AS result;
ROLLBACK;
