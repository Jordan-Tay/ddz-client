export const encodeCard = ({ rank, suit }) => {
  return rank < 14
    ? suit * 13 + rank
    : (rank < 16
      ? suit * 13 + rank - 13
      : suit + 53);
};

export const decodeCard = id => {
  let suit = Math.floor((id - 1) / 13);
  let rank = (id - 1) % 13 + 1;
  if (suit === 4) {
    suit = rank - 1;
    rank = 16;
  }
  return {
    rank: rank < 3 ? rank + 13 : rank,
    suit
  };
};

export const sortEncoded = encoded => {
  return encoded.sort((id_a, id_b) => {
    const { rank: ra, suit: sa } = decodeCard(id_a);
    const { rank: rb, suit: sb } = decodeCard(id_b);
    return ra - rb === 0 ? sb - sa : ra - rb;
  });
};

export const sortDecoded = decoded => {
  return decoded.sort(({ rank: ra, suit: sa }, { rank: rb, suit: sb }) =>
    ra - rb === 0 ? sb - sa : ra - rb
  );
};

export const combination = selected => {
  const rankEncoded = {}, rankDecoded = {};
  selected.forEach(id => {
    const key = decodeCard(id);
    (rankEncoded[key.rank] = rankEncoded[key.rank] || []).push(id);
    (rankDecoded[key.rank] = rankDecoded[key.rank] || []).push(key);
  });
  const rankCount = Object.keys(rankEncoded).reduce((acc, rank) => {
    acc[rank] = rankEncoded[rank].length;
    return acc;
  }, {})
  const primitives = Object.keys(rankCount).reduce((acc, rank) => {
    (acc[rankCount[rank]] = acc[rankCount[rank]] || []).push(parseInt(rank));
    return acc;
  }, {});
  const formatArgs = { selected, rankEncoded, rankDecoded, primitives };
  if (isSingle(primitives)) {
    return formatSingle(formatArgs);
  } else if (isRocket(primitives)) {
    return formatRocket(formatArgs);
  } else if (isPair(primitives)) {
    return formatPair(formatArgs);
  } else if (isTriplet(primitives)) {
    return formatTriplet(formatArgs);
  } else if (isBomb(primitives)) {
    return formatBomb(formatArgs);
  } else if (isTripletSingle(primitives)) {
    return formatTripletSingle(formatArgs);
  } else if (isTripletPair(primitives)) {
    return formatTripletPair(formatArgs);
  } else if (isSequenceSingle(primitives)) {
    return formatSequenceSingle(formatArgs);
  } else if (isSequencePair(primitives)) {
    return formatSequencePair(formatArgs);
  } else if (isSequenceTriplet(primitives)) {
    return formatSequenceTriplet(formatArgs);
  } else if (isSequenceTripletSingle(primitives)) {
    return formatSequenceTripleSingle(formatArgs);
  } else if (isSequenceTripletPair(primitives)) {
    return formatSequenceTriplePair(formatArgs);
  } else if (isQuadplexSingle(primitives)) {
    return formatQuadplexSingle(formatArgs);
  } else if (isQuadplexPair(primitives)) {
    return formatQuadplexPair(formatArgs);
  } else {
    return null;
  }
};

const isSingle = primitives => {
  return Object.keys(primitives).length === 1 && primitives[1] && primitives[1].length === 1;
};

const formatSingle = ({ selected, rankEncoded, rankDecoded, primitives }) => ({
  combi: 'single',
  play: rankEncoded[primitives[1][0]],
  repr: primitives[1][0]
});

const isPair = primitives => {
  return Object.keys(primitives).length === 1 && primitives[2] && primitives[2].length === 1;
};

const formatPair = ({ selected, rankEncoded, rankDecoded, primitives }) => ({
  combi: 'pair', 
  play: sortDecoded(rankDecoded[primitives[2][0]]).map(encodeCard),
  repr: primitives[2][0]
});

const isTriplet = primitives => {
  return Object.keys(primitives).length === 1 && primitives[3] && primitives[3].length === 1;
};

const formatTriplet = ({ selected, rankEncoded, rankDecoded, primitives }) => ({
  combi: 'triplet',
  play: sortDecoded(rankDecoded[primitives[3][0]]).map(encodeCard),
  repr: primitives[3][0]
});

const isBomb = primitives => {
  return Object.keys(primitives).length === 1 && primitives[4] && primitives[4].length === 1;
};

const formatBomb = ({ selected, rankEncoded, rankDecoded, primitives }) => ({
  combi: 'bomb',
  play: sortDecoded(rankDecoded[primitives[4][0]]).map(encodeCard),
  repr: primitives[4][0]
});

const isRocket = primitives => {
  return Object.keys(primitives).length === 1 && primitives[2] && primitives[2].length === 1 && primitives[2][0] === 16;
};

const formatRocket = ({ selected, rankEncoded, rankDecoded, primitives }) => ({
  combi: 'rocket',
  play: sortDecoded(rankDecoded[primitives[2][0]]).map(encodeCard),
  repr: primitives[2][0]
});

const isTripletSingle = primitives => {
  return Object.keys(primitives).length === 2 && primitives[3] && primitives[3].length === 1 && primitives[1] && primitives[1].length === 1;
};

const formatTripletSingle = (args) => {
  const { play, repr } = formatTriplet(args);
  return {
    combi: 'triplet-single',
    play: [...play, ...formatSingle(args).play],
    repr
  }
};

const isTripletPair = primitives => {
  return Object.keys(primitives).length === 2 && primitives[3] && primitives[3].length === 1 && primitives[2] && primitives[2].length === 1;
};

const formatTripletPair = (args) => {
  const { play, repr } = formatTriplet(args);
  return {
    combi: 'triplet-pair',
    play: [...play, ...formatPair(args).play],
    repr
  }
};

const isSequence = (arr) => {
  let min = Math.min.apply(Math, arr);
  let num = 0;
  for (let i = 0; i < arr.length; ++i){
      num = num ^ min ^ arr[i];
      min += 1;
  }
  return num === 0;
};

const isSequenceSingle = primitives => {
  return Object.keys(primitives).length === 1 && primitives[1] && primitives[1].length >= 5 && isSequence(primitives[1]) && Math.max(...primitives[1]) < 15;
};

const formatSequenceSingle = ({ selected, rankEncoded, rankDecoded, primitives }) => {
  const ranks = primitives[1].sort()
  return {
    combi: 'sequence-single',
    play: ranks.flatMap(rank => rankEncoded[rank]),
    repr: ranks[ranks.length - 1]
  };
};

const isSequencePair = primitives => {
  return Object.keys(primitives).length === 1 && primitives[2] && primitives[2].length >= 3 && isSequence(primitives[2]) && Math.max(...primitives[2]) < 15;
};

const formatSequencePair = ({ selected, rankEncoded, rankDecoded, primitives }) => {
  const ranks = primitives[2].sort();
  return {
    combi: 'sequence-pair',
    play: ranks.flatMap(rank => sortEncoded(rankEncoded[rank])),
    repr: ranks[ranks.length - 1]
  };
};

const isSequenceTriplet = primitives => {
  return Object.keys(primitives).length === 1 && primitives[3] && primitives[3].length >= 2 && isSequence(primitives[3]) && Math.max(...primitives[3]) < 15;
};

const formatSequenceTriplet = ({ selected, rankEncoded, rankDecoded, primitives }) => {
  const ranks = primitives[3].sort();
  return {
    combi: 'sequence-triplet',
    play: ranks.flatMap(rank => sortEncoded(rankEncoded[rank])),
    repr: ranks[ranks.length - 1]
  }
};

const isSequenceTripletSingle = primitives => {
  return Object.keys(primitives).length === 2 && primitives[3] && primitives[3].length >= 2 && isSequence(primitives[3]) && Math.max(...primitives[3]) < 15 && primitives[1] && primitives[1].length === primitives[3].length;
};

const formatSequenceTripleSingle = (args) => {
  const { play, repr } = formatSequenceTriplet(args);
  return {
    combi: 'sequence-triplet-single',
    play: [...play, ...formatSequenceSingle(args).play],
    repr
  }
};

const isSequenceTripletPair = primitives => {
  return Object.keys(primitives).length === 2 && primitives[3] && primitives[3].length >= 2 && isSequence(primitives[3]) && Math.max(...primitives[3]) < 15 && primitives[2] && primitives[2].length === primitives[3].length;
};

const formatSequenceTriplePair = (args) => {
  const { play, repr } = formatSequenceTriplet(args);
  return {
    combi: 'sequence-triplet-pair',
    play: [...play, ...formatSequencePair(args).play],
    repr
  }
};

const isQuadplexSingle = primitives => {
  return Object.keys(primitives).length === 2 && primitives[4] && primitives[4].length === 1 && primitives[1] && primitives[1].length === 2;
};

const formatQuadplexSingle = (args) => {
  const { play, repr } = formatBomb(args);
  return {
    combi: 'quadplex-single',
    play: [...play, ...formatSequenceSingle(args).play],
    repr
  }
};

const isQuadplexPair = primitives => {
  return Object.keys(primitives).length === 2 && primitives[4] && primitives[4].length === 1 && primitives[2] && primitives[2].length === 2 && !primitives[2].includes(16);
};

const formatQuadplexPair = (args) => {
  const { play, repr } = formatBomb(args);
  return {
    combi: 'quadplex-pair',
    play: [...play, ...formatSequencePair(args).play],
    repr
  }
};
