# Final audit validation results

Executed **2026-10-16** from the documentation repository. These are documentation/schema/isolated SQL checks, not application acceptance, deployment approval or customer evidence. See [final consistency audit](../FINAL_CONSISTENCY_AUDIT.md) for findings and limits. Final audit changes Prisma comments only; SQL semantics are unchanged.

## Documentation checks

```sh
python3 validation/check_documentation_links.py
python3 validation/check_documentation_contracts.py
git diff --check
```

Result: PASS. Final local-destination count is recorded below after all output/index links are present. The structural checker verifies nine MessageStatus values against PRD table/diagram, one-Brand uniqueness, absent export storage, four actual source-pointer relations, revision/purge models, tone SQL reference, 14 mandatory weights totaling80 plus two optional weights totaling20, key metric events and balanced Markdown fences. These are focused static checks, not complete API/JSON-schema/authorization validation. Initial checker development assumed a nonexistent BrandVoice source pointer and exact table spacing; those assumptions were corrected to the actual manual Voice contract and padded tables before the passing run.

Local links/headings are checked; external URLs, fenced examples and images are excluded by the existing checker. Plain references were reviewed manually and unambiguous standalone local references converted to links. No markdownlint, markdownlint-cli2 or mmdc executable was found in PATH; no Markdown lint or rendered Mermaid pass is claimed. Diagrams were reviewed as source. No documentation build configuration/package exists in this repository.

A local Decimal recomputation also matched all12 pricing sensitivity cells/margins in PRICING_EXPERIMENTS.md and the 0/70/80/95/100 weighted-score examples. This checks illustrative arithmetic only, not observed economics or runtime readiness.

## Exact schema and DDL

Installed CLI: Prisma **7.8.0**. PostgreSQL binaries: **15.17**. Adjacent backend configuration/tooling was used read-only; application implementation was not audited.

```sh
../backend/node_modules/.bin/prisma validate --schema schema.prisma

DATABASE_URL=postgresql://localhost:64329/final_validation \
  ../backend/node_modules/.bin/prisma migrate diff \
  --config ../backend/prisma.config.ts \
  --from-empty --to-schema schema.prisma --script \
  --output /private/tmp/ai-brand-os-final-schema.sql
```

Result: PASS on exact schema; PASS generating DDL from empty. The dummy datasource URL supplies configuration only; no application DB connection/migration was performed. All18 models/16 enums validate. JSON reference integrity, approval gates and custom SQL require separate validation.

## Disposable PostgreSQL run

Fresh owner-only temporary directory: `/private/tmp/ai-brand-os-final-pg-B4qzpo`. A reproducer must create a fresh directory, not assume this one is reusable. TCP disabled; private Unix socket only. Commands actually used:

```sh
mktemp -d /private/tmp/ai-brand-os-final-pg-XXXXXX
initdb -D /private/tmp/ai-brand-os-final-pg-B4qzpo/data \
  --auth=trust --no-locale --encoding=UTF8
pg_ctl -D /private/tmp/ai-brand-os-final-pg-B4qzpo/data \
  -l /private/tmp/ai-brand-os-final-pg-B4qzpo/postgres.log \
  -o "-F -k /private/tmp/ai-brand-os-final-pg-B4qzpo -c listen_addresses='' -p 64329" \
  -w start
psql -h /private/tmp/ai-brand-os-final-pg-B4qzpo -p 64329 \
  -U pejman -d postgres -v ON_ERROR_STOP=1 \
  -v schema_ddl=/private/tmp/ai-brand-os-final-schema.sql \
  -f validation/POSTGRES_CONSTRAINT_TESTS.sql
pg_ctl -D /private/tmp/ai-brand-os-final-pg-B4qzpo/data -m fast -w stop
```

Initial sandboxed initdb failed shared-memory creation; retried with explicit escalation and passed. Sandboxed psql could not access the Unix socket; approved retry passed. Startup/client/shutdown used approved tools; existing DB services were not touched. Harness applies generated DDL and [supplement](../sql/MVP_CONSTRAINTS.sql), tests in a transaction and ends with **ROLLBACK**; cluster shutdown succeeded.

Result: **46/46 SQL behavior probes PASS**, plus **ten required lists NOT NULL + Prisma GIN index PASS**. Covers tone cardinality/shape/enum, NULL and bounds, score/revision/calculation/readiness lists, ancestry self-reference/optional NULL, mission/vision length, confidence, purge receipt metadata and AuthSession hash/expiry/revocation.

| Tone input | Observed |
| --- | --- |
| Empty, one item, five items | CHECK rejection 23514 |
| Two items, four items | Accepted |
| Whole-column NULL | NOT NULL rejection 23502 |
| NULL element or multidimensional array | CHECK rejection 23514 |
| Invalid enum member | Input rejection 22P02 |
| Two identical valid tones | Accepted by SQL; distinctness remains mandatory service validation |

Constraints do not prove all mandatory facts approved, tenant equality, JSON evidence ownership, token cryptography, safe provider calls or physical purge completion. No application JWT/CSRF/SSRF/parser/tenant/revision/restore/SSE/deletion test, load test, migration rehearsal, backup restore or customer experiment was run. Required runtime scenarios remain unexecuted specifications.

## Final recorded counts

Final run: **851 local Markdown destinations checked; 0 errors** across 48 Markdown files (46 reviewed inputs plus audit/report outputs). Structural checker PASS; exact Prisma validation PASS; `git diff --check` PASS. No application/runtime checks are inferred.
