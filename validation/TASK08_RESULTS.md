# Task 08 Validation Commands and Results

Executed: 2026-10-13. Working directory: ai-brand-os/docs. These are tooling/PostgreSQL constraint results, not authentication application tests or deployment approval. No application database or adjacent-backend migration was modified.

## Prisma 7.8.0 — exact repository schema

```sh
../backend/node_modules/.bin/prisma validate --schema schema.prisma
```

Result: PASS — “The schema at schema.prisma is valid.” The actual schema now omits the legacy datasource URL and declares the Artifact payload GIN index and planned AuthSession relations. No normalized/temporary schema copy was needed. Prisma validation does not validate supplemental CHECK SQL or runtime authentication.

## Prisma-generated PostgreSQL DDL

```sh
DATABASE_URL=postgresql://localhost:64328/task08_validation \
  ../backend/node_modules/.bin/prisma migrate diff \
  --config ../backend/prisma.config.ts \
  --from-empty --to-schema schema.prisma --script \
  --output /private/tmp/ai-brand-os-task08-schema.sql
```

Result: PASS — generated DDL, not an applied migration. The URL is a dummy configuration value; this from-empty/to-schema operation does not connect to an application datasource. Inspected DDL confirms required scalar Int/DateTime columns use NOT NULL, but all ten scalar-list columns, including tone_attributes, are nullable before the SQL supplement. It also generates the declared GIN jsonb_path_ops index. The existing adjacent config was read-only. An initial attempt without config produced no DDL and was not treated as a successful DDL check.

## Private PostgreSQL 15.17 test cluster

PostgreSQL binaries were available but no default server responded. Initialized a new owner-only temporary cluster, listening only on its private Unix socket (no TCP). Sandbox shared-memory/socket restrictions required tool approval; no existing PostgreSQL service was restarted or touched.

```sh
/opt/homebrew/opt/postgresql@15/bin/initdb \
  -D /private/tmp/ai-brand-os-pg-ASMSy7/data \
  --auth=trust --no-locale --encoding=UTF8

/opt/homebrew/opt/postgresql@15/bin/pg_ctl \
  -D /private/tmp/ai-brand-os-pg-ASMSy7/data \
  -l /private/tmp/ai-brand-os-pg-ASMSy7/postgres.log \
  -o "-F -k /private/tmp/ai-brand-os-pg-ASMSy7 -c listen_addresses='' -p 64328" \
  -w start

/opt/homebrew/opt/postgresql@15/bin/psql \
  -h /private/tmp/ai-brand-os-pg-ASMSy7 -p 64328 \
  -U pejman -d postgres -v ON_ERROR_STOP=1 \
  -v schema_ddl=/private/tmp/ai-brand-os-task08-schema.sql \
  -f validation/POSTGRES_CONSTRAINT_TESTS.sql
```

Result: PASS — all **46 SQL behavior probes** plus assertions that all ten list columns are NOT NULL and the Prisma GIN index exists. The harness applies generated DDL and [MVP_CONSTRAINTS.sql](../sql/MVP_CONSTRAINTS.sql) in a test schema, catches expected rejection SQLSTATEs, rolls back each probe and finishes with ROLLBACK for all schema/data. The initial test fixture lacked required purge updated_at; that failed (23502), was corrected, and the full rerun passed. Fixtures deliberately do not validate application-only approval/provenance/cryptographic behavior.

| Requested / related tone input | Observed result |
| --- | --- |
| Empty array | Rejected, CHECK violation 23514 |
| One item | Rejected, CHECK violation 23514 |
| Two distinct valid items | Accepted |
| Four distinct valid items | Accepted |
| Five items | Rejected, CHECK violation 23514 |
| Whole-column NULL | Rejected, NOT NULL violation 23502 |
| NULL array element / multidimensional array | Rejected, CHECK violation 23514 |
| Invalid enum item | Rejected, invalid enum input 22P02 |
| Two duplicate valid tones | SQL cardinality accepts two elements; distinct-tone enforcement remains a required service check, not claimed as a database guarantee |

Other passing probes cover NULL/negative/out-of-range completeness, revision number, calculation timestamps, missing/readiness lists, optional/self ancestry links, mission/vision length, confidence, purge metadata and AuthSession hash/expiry/revocation timestamps. Intentional optional NULLs (vision, ancestry, unrotated/unrevoked session) remain accepted; required values cannot bypass checks with NULL. SQL readiness checks do not prove all material fields are human-approved.

Stop the private cluster after validation:

```sh
/opt/homebrew/opt/postgresql@15/bin/pg_ctl \
  -D /private/tmp/ai-brand-os-pg-ASMSy7/data -m fast -w stop
```

Result: PASS — the temporary cluster was stopped after the successful rollback.

The recorded path is specific to this run; create a fresh private temporary directory when reproducing it. Do not run the harness or migration supplement against an application database without migration/data-review authorization. No deployment or PostgreSQL backup/data erasure is claimed.

## Documentation checks and remaining work

`git diff --check` and repository Markdown path/heading checks validate the changed documentation. No current stack reference offers TypeORM or NestJS authentication through Laravel tooling. Historical rejected-framework notes remain clearly historical.

Runtime JWT signature/rotation/reuse/CSRF/authorization/SSE behavior, adapter connections, key/TTL/rate policies, existing-row reconciliation and reviewed production SQL migration are still required. SQL files are reproducible acceptance checks and a planned migration supplement; they do not prove a live authentication provider.
