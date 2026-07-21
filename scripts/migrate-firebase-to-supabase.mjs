#!/usr/bin/env node
import { analyze, env, parseArgs, readBackup } from "./migration-lib.mjs";

const args = parseArgs(process.argv);
if (!args.input) throw new Error("Use --input /caminho/backup.json");
const snapshot = readBackup(args.input);
const totals = analyze(snapshot);
console.log("Entidades encontradas:");
console.table(totals);

if (args.dryRun) {
  console.log("Dry-run concluído: JSON válido, estrutura reconhecida e nenhuma escrita executada.");
  process.exit(0);
}

const url = env("SUPABASE_URL");
const serviceRole = env("SUPABASE_SERVICE_ROLE_KEY");
const authHeaders = { apikey: serviceRole, authorization: `Bearer ${serviceRole}`, "content-type": "application/json" };
const currentResponse = await fetch(`${url}/rest/v1/rpc/get_legacy_snapshot`, { method: "POST", headers: authHeaders, body: "{}" });
if (!currentResponse.ok) throw new Error(`Falha ao ler revisão atual: ${currentResponse.status} ${await currentResponse.text()}`);
const current = await currentResponse.json();
const response = await fetch(`${url}/rest/v1/rpc/commit_legacy_snapshot`, {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    p_snapshot: snapshot,
    p_expected_revision: Number(current?.revision || 0),
    p_actor_profile_id: null,
    p_event_type: "firebase_initial_import",
    p_tournament_id: snapshot.pes?.meta?.currentTournamentId || null
  })
});
const text = await response.text();
if (!response.ok) throw new Error(`Falha na importação (${response.status}): ${text}`);
const result = JSON.parse(text);
if (!result.committed) throw new Error(`Importação não confirmada: ${JSON.stringify(result)}`);
console.log("Importação concluída:", result);
console.log("Entidades migradas:");
console.table(totals);
