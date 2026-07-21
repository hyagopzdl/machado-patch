(() => {
  window.ManchaApp = window.ManchaApp || {};
  const { _ } = window.ManchaApp;
        function economySettingsOf(tournament) {
          let raw = tournament && tournament.economySettings && typeof tournament.economySettings === "object" ? tournament.economySettings : {}, settings = Number(raw.version) >= 2 ? raw : {};
          return {
            version: 2,
            winReward: Math.max(0, Number(settings.winReward != null ? settings.winReward : 5) || 0),
            scoringDrawReward: Math.max(0, Number(settings.scoringDrawReward != null ? settings.scoringDrawReward : 3) || 0),
            scorelessDrawReward: Math.max(0, Number(settings.scorelessDrawReward != null ? settings.scorelessDrawReward : 2) || 0),
            lossReward: Math.max(0, Number(settings.lossReward != null ? settings.lossReward : 1) || 0),
            goalReward: Math.max(0, Number(settings.goalReward != null ? settings.goalReward : 1) || 0),
            redCardPenalty: Math.max(0, Number(settings.redCardPenalty != null ? settings.redCardPenalty : 1) || 0),
          };
        }

        function balanceLoanSettingsOf(tournament) {
          let economy=tournament&&tournament.economySettings&&typeof tournament.economySettings==="object"?tournament.economySettings:{};
          let raw=economy.balanceLoanSettings&&typeof economy.balanceLoanSettings==="object"?economy.balanceLoanSettings:{};
          return {
            enabled: raw.enabled===true,
            referenceMethod: raw.referenceMethod||"top_half_median",
            toleranceGames: Math.max(0,Math.round(Number(raw.toleranceGames!=null?raw.toleranceGames:5)||0)),
            compensationPercentage: Math.min(100,Math.max(0,Math.round(Number(raw.compensationPercentage!=null?raw.compensationPercentage:60)||0))),
            minimumAmount: Math.max(0,Math.round(Number(raw.minimumAmount!=null?raw.minimumAmount:0)||0)),
            maximumAmount: Math.max(0,Math.round(Number(raw.maximumAmount!=null?raw.maximumAmount:0)||0)),
            repaymentPercentage: Math.min(100,Math.max(0,Math.round(Number(raw.repaymentPercentage!=null?raw.repaymentPercentage:40)||0))),
            allowTopUps: raw.allowTopUps!==false,
            minimumTopUpAmount: Math.max(0,Math.round(Number(raw.minimumTopUpAmount!=null?raw.minimumTopUpAmount:0)||0)),
            maximumTopUpAmount: Math.max(0,Math.round(Number(raw.maximumTopUpAmount!=null?raw.maximumTopUpAmount:0)||0)),
            maximumTotalAmount: Math.max(0,Math.round(Number(raw.maximumTotalAmount!=null?raw.maximumTotalAmount:0)||0)),
          };
        }
        function balanceLoansOf(tournament) {
          let economy=tournament&&tournament.economySettings&&typeof tournament.economySettings==="object"?tournament.economySettings:{};
          return economy.balanceLoans&&typeof economy.balanceLoans==="object"?economy.balanceLoans:{};
        }
        function balanceLoanAnalysis(tournament, teams, teamId) {
          let settings=balanceLoanSettingsOf(tournament), active=(Array.isArray(teams)?teams:[]).filter(team=>team&&team.active!==false), matches=(Array.isArray(tournament&&tournament.matches)?tournament.matches:[]).filter(match=>match&&match.played&&match.status!=="voided"&&!match.bye), economy=economySettingsOf(tournament);
          let rows=active.map(team=>{
            let teamMatches=matches.filter(match=>String(match.homeId)===String(team.id)||String(match.awayId)===String(team.id));
            let rewardTotal=teamMatches.reduce((sum,match)=>{
              let stored=match.economyRewards&&match.economyRewards[team.id];
              if(stored!=null&&Number.isFinite(Number(stored)))return sum+Number(stored);
              return sum+matchEconomyForTeam(match,team.id,economy).total;
            },0);
            let played=teamMatches.length;
            return{team,played,rewardTotal,rewardPerMatch:played?rewardTotal/played:0};
          }).sort((a,b)=>b.played-a.played);
          let leaders=rows.slice(0,Math.max(1,Math.ceil(rows.length/2))), counts=leaders.map(row=>row.played).sort((a,b)=>a-b), middle=Math.floor(counts.length/2), referenceGames=counts.length%2?counts[middle]:Math.round(((counts[middle-1]||0)+(counts[middle]||0))/2);
          let rates=leaders.filter(row=>row.played>0).map(row=>row.rewardPerMatch).sort((a,b)=>a-b);if(rates.length>=4)rates=rates.slice(1,-1);let averageReward=rates.length?Math.round(rates.reduce((sum,value)=>sum+value,0)/rates.length):0;
          let row=rows.find(entry=>String(entry.team.id)===String(teamId)), played=row?row.played:0, rawGap=Math.max(0,referenceGames-played), compensableGames=Math.max(0,rawGap-settings.toleranceGames);
          let calculated=Math.round(compensableGames*averageReward*(settings.compensationPercentage/100));
          let hasEnoughData=referenceGames>0&&averageReward>0;
          let eligible=settings.enabled&&hasEnoughData&&compensableGames>0;
          let passesMinimum=settings.minimumAmount<=0||calculated>=settings.minimumAmount;
          let suggested=eligible&&passesMinimum?calculated:0;
          if(suggested>0&&settings.maximumAmount>0)suggested=Math.min(suggested,settings.maximumAmount);
          let loans=balanceLoansOf(tournament), loan=loans[String(teamId)]||null,totalGranted=Math.round(Number(loan&&loan.totalGranted)||0), topUpBase=Math.max(0,Math.round(calculated-totalGranted));
          let lastGrant=loan&&Array.isArray(loan.grants)&&loan.grants.length?loan.grants[loan.grants.length-1]:null, lastSnapshot=lastGrant&&lastGrant.snapshot&&typeof lastGrant.snapshot==="object"?lastGrant.snapshot:{};
          let referenceIncrease=Math.max(0,referenceGames-Math.round(Number(lastSnapshot.referenceGames)||0)), playerGamesSinceGrant=Math.max(0,played-Math.round(Number(lastSnapshot.played)||0));
          let missedSinceGrant=Math.max(0,referenceIncrease-playerGamesSinceGrant);
          let topUpSuggested=settings.allowTopUps&&loan&&eligible?topUpBase:0;
          if(topUpSuggested>0&&settings.minimumTopUpAmount>0&&topUpSuggested<settings.minimumTopUpAmount)topUpSuggested=0;
          if(topUpSuggested>0&&settings.maximumTopUpAmount>0)topUpSuggested=Math.min(topUpSuggested,settings.maximumTopUpAmount);
          if(topUpSuggested>0&&settings.maximumTotalAmount>0)topUpSuggested=Math.min(topUpSuggested,Math.max(0,settings.maximumTotalAmount-totalGranted));
          return {settings,referenceGames,played,rawGap,compensableGames,averageReward,calculated,suggested,loan,totalGranted,topUpBase,topUpSuggested,lastGrant,referenceIncrease,playerGamesSinceGrant,missedSinceGrant,eligible:loan?topUpSuggested>0:eligible&&passesMinimum,hasEnoughData,rows};
        }
        function matchEconomyForTeam(match, teamId, settings) {
          let home = String(match && match.homeId) === String(teamId), score = home ? Number(match.homeScore)||0 : Number(match.awayScore)||0, opponentScore = home ? Number(match.awayScore)||0 : Number(match.homeScore)||0;
          let resultReward = score > opponentScore ? settings.winReward : score < opponentScore ? settings.lossReward : score > 0 ? settings.scoringDrawReward : settings.scorelessDrawReward;
          let eligibleGoals = (Array.isArray(match && match.scorers) ? match.scorers : []).filter((event) => event && String(event.teamId) === String(teamId) && event.playerId && event.type !== "own_goal").length;
          let redCards = (Array.isArray(match && match.redCards) ? match.redCards : []).filter((event) => event && String(event.teamId) === String(teamId)).length;
          return { resultReward, eligibleGoals, redCards, goalAmount: eligibleGoals * settings.goalReward, redCardAmount: redCards * settings.redCardPenalty, total: resultReward + eligibleGoals * settings.goalReward - redCards * settings.redCardPenalty };
        }
        function prizeSettingsOf(tournament) {
          let raw=tournament && tournament.finalPrizeSettings && typeof tournament.finalPrizeSettings === "object" ? tournament.finalPrizeSettings : {};
          let championPrize=Math.max(0,Number(raw.championPrize!=null?raw.championPrize:raw.firstPlacePrize!=null?raw.firstPlacePrize:20)||0);
          return {
            championPrize,
            firstPlacePrize:championPrize,
            topScorerPrize:Math.max(0,Number(raw.topScorerPrize!=null?raw.topScorerPrize:0)||0),
            lastPlacePercentage:50,
          };
        }
        function championshipPrizeLadder(championPrize, participantCount) {
          let total=Math.max(0,Math.floor(Number(participantCount)||0)), first=Math.max(0,Number(championPrize)||0);
          if (!total) return [];
          if (total===1) return [Math.ceil(first)];
          let last=first/2, step=(first-last)/(total-1);
          return Array.from({length:total},(_,index)=>Math.ceil(first-(step*index)));
        }
        function financeEntry(type, teamId, amount, label, referenceId, balanceBefore, createdAt = Date.now()) {
          return { id: _(), type, teamId, amount: Number(amount) || 0, label, referenceId: referenceId || null, balanceBefore: Number(balanceBefore) || 0, balanceAfter: (Number(balanceBefore) || 0) + (Number(amount) || 0), createdAt };
        }

  Object.assign(window.ManchaApp, { economySettingsOf, balanceLoanSettingsOf, balanceLoansOf, balanceLoanAnalysis, matchEconomyForTeam, prizeSettingsOf, championshipPrizeLadder, financeEntry });
})();
