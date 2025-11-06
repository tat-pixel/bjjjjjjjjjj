import React, { useState, useMemo } from "react";

// Enhanced Solana-themed Blackjack Counter & Basic Strategy helper
export default function SolanaBlackjackCounter() {
  const [decks, setDecks] = useState(6);
  const [runningCount, setRunningCount] = useState(0);
  const [cardsSeen, setCardsSeen] = useState(0);
  const [baseUnit, setBaseUnit] = useState(1);

  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCard, setDealerCard] = useState(null);

  // Enhanced Hi-Lo values with better handling
  const hiLoValue = (card) => {
    if (!card) return 0;
    if (["A", "K", "Q", "J", "10"].includes(card)) return -1;
    const n = parseInt(card, 10);
    if (n >= 2 && n <= 6) return 1;
    return 0; // 7, 8, 9
  };

  const addSeenCard = (card) => {
    if (!card) return;
    setRunningCount((r) => r + hiLoValue(card));
    setCardsSeen((c) => c + 1);
  };

  // Fixed dealer card management
  const setDealerCardSafe = (card) => {
    // Remove current dealer card from count if exists
    if (dealerCard) {
      setRunningCount((r) => r - hiLoValue(dealerCard));
      setCardsSeen((c) => c - 1);
    }

    // Set new dealer card
    setDealerCard(card);

    // Add new card to count if not null
    if (card) {
      setRunningCount((r) => r + hiLoValue(card));
      setCardsSeen((c) => c + 1);
    }
  };

  const cardButtons = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];

  // Calculations
  const totalCards = decks * 52;
  const decksRemaining = Math.max(0.5, (totalCards - cardsSeen) / 52);
  const trueCount = useMemo(() => {
    const count = runningCount / decksRemaining;
    return isFinite(count) ? count : 0;
  }, [runningCount, decksRemaining]);

  const suggestedBet = useMemo(() => {
    const units = Math.max(1, Math.floor(trueCount - 1));
    return Math.max(baseUnit, units * baseUnit);
  }, [trueCount, baseUnit]);

  // Hand calculation functions
  const handValue = (hand) => {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
      if (card === "A") {
        total += 11;
        aces += 1;
      } else if (["K", "Q", "J", "10"].includes(card)) {
        total += 10;
      } else {
        total += parseInt(card, 10);
      }
    }

    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }

    const soft =
      hand.includes("A") &&
      total <= 21 &&
      total - 10 * (hand.filter((c) => c === "A").length - aces) <= 11;

    return { total, soft };
  };

  // Enhanced basic strategy
  const getBasicStrategy = (hand, dealerUp) => {
    if (!hand.length || !dealerUp) return "--";

    const dealerValue =
      dealerUp === "A"
        ? 11
        : ["K", "Q", "J", "10"].includes(dealerUp)
        ? 10
        : parseInt(dealerUp, 10);
    const { total, soft } = handValue(hand);

    // Pair splitting
    if (hand.length === 2 && hand[0] === hand[1]) {
      const pair = hand[0];
      const pairs = {
        A: "Split",
        8: "Split",
        9:
          dealerValue === 7 || dealerValue === 10 || dealerValue === 11
            ? "Stand"
            : "Split",
        7: dealerValue <= 7 ? "Split" : "Hit",
        6: dealerValue <= 6 ? "Split" : "Hit",
        5: dealerValue <= 9 ? "Double" : "Hit",
        4: dealerValue === 5 || dealerValue === 6 ? "Split" : "Hit",
        3: dealerValue <= 7 ? "Split" : "Hit",
        2: dealerValue <= 7 ? "Split" : "Hit",
      };
      return pairs[pair] || "Hit";
    }

    // Soft totals
    if (soft) {
      if (total >= 19) return "Stand";
      if (total === 18) {
        if (dealerValue >= 3 && dealerValue <= 6) return "Double";
        if (dealerValue <= 8) return "Stand";
        return "Hit";
      }
      if (total === 17)
        return dealerValue >= 3 && dealerValue <= 6 ? "Double" : "Hit";
      if (total === 16 || total === 15)
        return dealerValue >= 4 && dealerValue <= 6 ? "Double" : "Hit";
      if (total === 14 || total === 13)
        return dealerValue >= 5 && dealerValue <= 6 ? "Double" : "Hit";
    }

    // Hard totals
    if (total >= 17) return "Stand";
    if (total >= 13) return dealerValue <= 6 ? "Stand" : "Hit";
    if (total === 12)
      return dealerValue >= 4 && dealerValue <= 6 ? "Stand" : "Hit";
    if (total === 11) return "Double";
    if (total === 10) return dealerValue <= 9 ? "Double" : "Hit";
    if (total === 9)
      return dealerValue >= 3 && dealerValue <= 6 ? "Double" : "Hit";
    return "Hit";
  };

  const action = getBasicStrategy(playerCards, dealerCard);
  const playerHandValue = handValue(playerCards);

  // Player card management
  const addToPlayer = (card) => {
    setPlayerCards((p) => [...p, card]);
    addSeenCard(card);
  };

  const removeLastPlayerCard = () => {
    if (playerCards.length > 0) {
      const lastCard = playerCards[playerCards.length - 1];
      setRunningCount((r) => r - hiLoValue(lastCard));
      setCardsSeen((c) => c - 1);
      setPlayerCards((p) => p.slice(0, -1));
    }
  };

  const resetHands = () => {
    setPlayerCards([]);
    setDealerCardSafe(null);
  };

  const resetAll = () => {
    setRunningCount(0);
    setCardsSeen(0);
    resetHands();
  };

  // Count adjustment buttons
  const adjustCount = (value) => {
    setRunningCount((r) => r + value);
    setCardsSeen((c) => c + 1);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-600 via-green-400 to-yellow-400 text-slate-900">
      <div className="max-w-6xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text text-transparent">
            Blackjack Card Counter
          </h1>
          <p className="text-slate-600 mt-2">
            Hi-Lo Count • Multi-deck • Basic Strategy
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Count & Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h2 className="font-bold text-lg mb-4 text-purple-700">
                Settings & Count
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Number of Decks
                  </label>
                  <select
                    value={decks}
                    onChange={(e) => setDecks(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {[1, 2, 4, 6, 8].map((d) => (
                      <option key={d} value={d}>
                        {d} deck{d > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Base Unit ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cards Seen:</span>
                  <span className="font-bold">{cardsSeen}</span>
                </div>
                <div className="flex justify-between">
                  <span>Running Count:</span>
                  <span
                    className={`font-bold ${
                      runningCount > 0
                        ? "text-green-600"
                        : runningCount < 0
                        ? "text-red-600"
                        : "text-slate-800"
                    }`}
                  >
                    {runningCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Decks Remaining:</span>
                  <span className="font-bold">{decksRemaining.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>True Count:</span>
                  <span
                    className={`font-bold ${
                      trueCount > 0
                        ? "text-green-600"
                        : trueCount < 0
                        ? "text-red-600"
                        : "text-slate-800"
                    }`}
                  >
                    {trueCount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Suggested Bet:</span>
                  <span className="font-bold text-purple-700">
                    {suggestedBet} units
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2 flex-wrap">
                <button
                  onClick={resetAll}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={() => adjustCount(1)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  +1 Count
                </button>
                <button
                  onClick={() => adjustCount(-1)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  -1 Count
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Hand */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-purple-700">
                  Player Hand
                </h2>
                {playerCards.length > 0 && (
                  <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">
                    Total: {playerHandValue.total}{" "}
                    {playerHandValue.soft ? "Soft" : ""}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4 min-h-12">
                {playerCards.map((card, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow font-bold min-w-12 text-center"
                  >
                    {card}
                  </div>
                ))}
                {playerCards.length === 0 && (
                  <div className="text-slate-400 italic">No cards yet</div>
                )}
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {cardButtons.map((card) => (
                  <button
                    key={card}
                    onClick={() => addToPlayer(card)}
                    className="p-3 bg-slate-100 hover:bg-purple-100 border border-slate-300 rounded-lg transition-colors font-bold"
                  >
                    {card}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPlayerCards([])}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                >
                  Clear Hand
                </button>
                <button
                  onClick={removeLastPlayerCard}
                  disabled={playerCards.length === 0}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Undo Last Card
                </button>
              </div>
            </div>

            {/* Dealer Hand */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h2 className="font-bold text-lg text-purple-700 mb-4">
                Dealer Upcard
              </h2>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  {dealerCard ? (
                    <div className="px-6 py-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow font-bold text-xl text-center min-w-20">
                      {dealerCard}
                    </div>
                  ) : (
                    <div className="px-6 py-4 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-center">
                      —
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {cardButtons.map((card) => (
                    <button
                      key={card}
                      onClick={() => setDealerCardSafe(card)}
                      className="p-2 bg-slate-100 hover:bg-red-100 border border-slate-300 rounded transition-colors text-sm font-bold"
                    >
                      {card}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDealerCardSafe(null)}
                  disabled={!dealerCard}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Dealer
                </button>
                <button
                  onClick={resetHands}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Reset Both Hands
                </button>
              </div>
            </div>

            {/* Strategy Suggestion */}
            <div className="bg-gradient-to-r from-purple-500 to-green-500 rounded-xl p-4 shadow-lg">
              <div className="text-white">
                <div className="text-sm opacity-90">
                  Basic Strategy Suggestion
                </div>
                <div className="text-3xl font-bold mt-2">{action}</div>
                <div className="text-xs opacity-75 mt-2">
                  Based on multi-deck, dealer stands on soft 17 • Double/Split
                  when allowed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-slate-600">
          <p>
            🎯 Click card buttons to add seen cards • 📊 Bet spread: units =
            max(1, floor(trueCount - 1)) × base unit
          </p>
          <p className="mt-1">
            ⚠️ Educational tool - Use responsibly and gamble within your means
          </p>
        </footer>
      </div>
    </div>
  );
}
