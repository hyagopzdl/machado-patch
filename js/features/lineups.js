(() => {
  const presets = {
    "4-3-3": [
      ["LW",18,22,"LWF"],["CF",50,13,"CF"],["RW",82,22,"RWF"],
      ["CM1",31,47,"CMF"],["CM2",69,47,"CMF"],["DM",50,62,"DMF"],
      ["LB",14,78,"LB"],["CB1",38,82,"CB"],["CB2",62,82,"CB"],["RB",86,78,"RB"],["GK",50,94,"GK"]
    ],
    "4-2-3-1": [
      ["CF",50,13,"CF"],["LM",18,35,"LMF"],["AM",50,34,"AMF"],["RM",82,35,"RMF"],
      ["DM1",36,59,"DMF"],["DM2",64,59,"DMF"],
      ["LB",14,78,"LB"],["CB1",38,82,"CB"],["CB2",62,82,"CB"],["RB",86,78,"RB"],["GK",50,94,"GK"]
    ],
    "4-4-2": [
      ["CF1",37,17,"CF"],["CF2",63,17,"CF"],["LM",15,48,"LMF"],["CM1",39,51,"CMF"],["CM2",61,51,"CMF"],["RM",85,48,"RMF"],
      ["LB",14,78,"LB"],["CB1",38,82,"CB"],["CB2",62,82,"CB"],["RB",86,78,"RB"],["GK",50,94,"GK"]
    ],
    "4-1-2-1-2": [
      ["CF1",37,15,"CF"],["CF2",63,15,"CF"],["AM",50,34,"AMF"],["CM1",30,52,"CMF"],["CM2",70,52,"CMF"],["DM",50,65,"DMF"],
      ["LB",14,79,"LB"],["CB1",38,83,"CB"],["CB2",62,83,"CB"],["RB",86,79,"RB"],["GK",50,94,"GK"]
    ],
    "3-5-2": [
      ["CF1",37,15,"CF"],["CF2",63,15,"CF"],["LM",12,47,"LMF"],["CM1",34,47,"CMF"],["AM",50,36,"AMF"],["CM2",66,47,"CMF"],["RM",88,47,"RMF"],
      ["CB1",28,80,"CB"],["CB2",50,84,"CB"],["CB3",72,80,"CB"],["GK",50,94,"GK"]
    ],
    "5-4-1": [
      ["CF",50,15,"CF"],["LM",17,48,"LMF"],["CM1",39,51,"CMF"],["CM2",61,51,"CMF"],["RM",83,48,"RMF"],
      ["LWB",9,76,"LWB"],["CB1",29,82,"CB"],["CB2",50,84,"CB"],["CB3",71,82,"CB"],["RWB",91,76,"RWB"],["GK",50,94,"GK"]
    ],
    "5-3-2": [
      ["CF1",37,16,"CF"],["CF2",63,16,"CF"],["CM1",30,50,"CMF"],["DM",50,60,"DMF"],["CM2",70,50,"CMF"],
      ["LWB",9,76,"LWB"],["CB1",29,82,"CB"],["CB2",50,84,"CB"],["CB3",71,82,"CB"],["RWB",91,76,"RWB"],["GK",50,94,"GK"]
    ],
    "3-4-3": [
      ["LW",18,22,"LWF"],["CF",50,13,"CF"],["RW",82,22,"RWF"],["LM",14,50,"LMF"],["CM1",39,53,"CMF"],["CM2",61,53,"CMF"],["RM",86,50,"RMF"],
      ["CB1",28,80,"CB"],["CB2",50,84,"CB"],["CB3",72,80,"CB"],["GK",50,94,"GK"]
    ]
  };

  const aliases = {
    GK:["GK"], CB:["CB","CBT","CWP","SW"], LB:["LB","SB","WB","SB_E"], RB:["RB","SB","WB","SB_D"], LWB:["WB","LB","SB","LMF","SMF"], RWB:["WB","RB","SB","RMF","SMF"],
    DMF:["DMF","DM","CMF","CM"], CMF:["CMF","CM","DMF","DM","AMF","AM","SMF","SM"], AMF:["AMF","AM","CMF","CM","SS"],
    LMF:["LMF","SMF","SM","LWF","WF","WG","AMF"], RMF:["RMF","SMF","SM","RWF","WF","WG","AMF"],
    LWF:["LWF","WF","WG","SS","CF","SMF"], RWF:["RWF","WF","WG","SS","CF","SMF"], CF:["CF","SS","WF","WG","AMF"]
  };

  function slots(name) {
    return (presets[name] || presets["4-3-3"]).map(([id,x,y,position]) => ({ id,x,y,position }));
  }
  function score(player, slotPosition) {
    const position = String(player && player.position || "").toUpperCase();
    const order = aliases[slotPosition] || [slotPosition];
    const index = order.indexOf(position);
    const fit = index < 0 ? 0 : Math.max(1, 8 - index);
    return fit * 1000 + (Number(player && player.overall) || 0);
  }
  function autoAssign(players, formation) {
    const available = (Array.isArray(players) ? players : []).slice();
    const result = {};
    slots(formation).forEach((slot) => {
      const ranked = available.slice().sort((a,b) => score(b,slot.position)-score(a,slot.position));
      const player = ranked[0];
      if (!player) return;
      result[slot.id] = String(player.id);
      const index = available.findIndex((item) => String(item.id) === String(player.id));
      if (index >= 0) available.splice(index,1);
    });
    return result;
  }
  window.PESLineups = { presets, slots, autoAssign, score };
})();
