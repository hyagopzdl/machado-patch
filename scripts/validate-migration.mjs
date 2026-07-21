#!/usr/bin/env node
import { analyze, env, parseArgs, readBackup } from "./migration-lib.mjs";

const args = parseArgs(process.argv);
if (!args.input) throw new Error("Use --input /caminho/backup.json");
const expected = analyze(readBackup(args.input));
const url = env("SUPABASE_URL");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env("SUPABASE_ANON_KEY");
const headers = { apikey: key, authorization: `Bearer ${key}`, prefer: "count=exact", range: "0-0" };
const mapping = {
  profiles: "profiles", tournaments: "tournaments", participants: "tournament_participants", teams: "teams", matches: "matches",
  ownership: "player_ownership", playerStats: "player_stats", tradeOffers: "trade_offers", tradeOfferHistory: "trade_offer_history",
  transfers: "transfers", financialTransactions: "financial_transactions", adminImports: "admin_imports", playerReviews: "player_reviews",
  playerReviewVotes: "player_review_votes", favorites: "profile_favorites", presence: "presence", globalOwnership: "global_player_ownership",
  playerCatalogOverrides: "player_catalog_overrides"
};
const actual = {};
for (const [name, table] of Object.entries(mapping)) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*`, { headers });
  if (!response.ok) throw new Error(`Falha ao contar ${table}: ${response.status} ${await response.text()}`);
  const range = response.headers.get("content-range") || "0-0/0";
  actual[name] = Number(range.split("/")[1] || 0);
}
let failed = false;
const rows = Object.keys(mapping).map((name) => {
  const ok = expected[name] === actual[name];
  if (!ok) failed = true;
  return { entidade: name, firebase: expected[name], supabase: actual[name], status: ok ? "OK" : "DIVERGENTE" };
});
console.table(rows);
if (failed) process.exitCode = 1;
else console.log("Validação concluída sem divergências de quantidade.");
