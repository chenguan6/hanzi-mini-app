const HINT_PACKS = {
  hints_10: {
    id: "hints_10",
    title: "10 hints",
    description: "Add 10 hints to your Hanzi Mini App account.",
    stars: 10,
    hints: 10
  },
  hints_30: {
    id: "hints_30",
    title: "30 hints",
    description: "Add 30 hints to your Hanzi Mini App account.",
    stars: 25,
    hints: 30
  },
  unlock_all: {
    id: "unlock_all",
    title: "Unlock all levels",
    description: "Unlock all current and future puzzle levels.",
    stars: 50,
    hints: 20,
    unlockAll: true
  }
};

function getPack(packId) {
  return HINT_PACKS[packId] || null;
}

module.exports = {
  HINT_PACKS,
  getPack
};
