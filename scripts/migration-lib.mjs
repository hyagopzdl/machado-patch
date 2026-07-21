import fs from "node:fs";

export function readBackup(path) {
  const parsed = JSON.parse(fs.readFileSync(path, "utf8"));
  if (!parsed || typeof parsed !== "object" || !parsed.pes) throw new Error("Backup inválido: raiz pes não encontrada.");
  return parsed;
}

export function analyze(snapshot) {
  const pes = snapshot.pes || {};
  const tournaments = Array.isArray(pes.tournaments) ? pes.tournaments.filter(Boolean) : [];
  const profiles = Array.isArray(pes.profiles) ? pes.profiles.filter(Boolean) : [];
  const totals = {
    profiles: profiles.length,
    tournaments: tournaments.length,
    participants: 0,
    teams: 0,
    matches: 0,
    ownership: 0,
    playerStats: 0,
    tradeOffers: 0,
    tradeOfferHistory: 0,
    transfers: 0,
    financialTransactions: 0,
    adminImports: 0,
    playerReviews: Object.keys(pes.playerReviews || {}).length,
    playerReviewVotes: 0,
    favorites: 0,
    presence: Object.keys(pes.presence || {}).length,
    globalOwnership: Object.keys(pes.ownership || {}).length,
    playerCatalogOverrides: Object.keys(pes.playerCatalogOverrides || {}).length
  };
  for (const tournament of tournaments) {
    const context = tournament.context || {};
    totals.participants += Array.isArray(tournament.participants) ? tournament.participants.length : 0;
    totals.teams += Array.isArray(context.teams) ? context.teams.filter(Boolean).length : 0;
    totals.matches += Array.isArray(context.matches) ? context.matches.filter(Boolean).length : (Array.isArray(tournament.matches) ? tournament.matches.filter(Boolean).length : 0);
    totals.ownership += Object.keys(context.ownership || {}).length;
    totals.playerStats += Object.keys(context.playerStats || {}).length;
    const offers = Object.values(context.tradeOffers || {}).filter(Boolean);
    totals.tradeOffers += offers.length;
    totals.tradeOfferHistory += offers.reduce((sum, offer) => sum + (Array.isArray(offer.history) ? offer.history.filter(Boolean).length : 0), 0);
    totals.transfers += Array.isArray(context.transfers) ? context.transfers.filter(Boolean).length : 0;
    totals.financialTransactions += Array.isArray(context.financialTransactions) ? context.financialTransactions.filter(Boolean).length : 0;
    totals.adminImports += Array.isArray(context.adminImports) ? context.adminImports.filter(Boolean).length : 0;
  }
  for (const review of Object.values(pes.playerReviews || {})) totals.playerReviewVotes += Object.keys((review && review.votes) || {}).length;
  for (const tournamentPrefs of Object.values(pes.profileChampionshipPreferences || {})) {
    for (const profilePrefs of Object.values(tournamentPrefs || {})) totals.favorites += Object.values((profilePrefs && profilePrefs.favorites) || {}).filter(Boolean).length;
  }
  return totals;
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") args.dryRun = true;
    else if (token.startsWith("--")) args[token.slice(2)] = argv[++i];
  }
  return args;
}

export function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}`);
  return value.replace(/\/$/, "");
}
