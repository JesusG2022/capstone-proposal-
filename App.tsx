
import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus, Guess, GameState, CardData } from './types';
import { generateDeck, WINNING_SCORE } from './constants';
import PlayingCard from './components/PlayingCard';
import { getDealerCommentary } from './services/geminiService';

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>({
    deck: [],
    history: [],
    currentCard: null,
    score: 0,
    status: GameStatus.IDLE,
    dealerComment: "Welcome to my table. Care to test your luck?",
    isThinking: false
  });

  // State for the card that was just drawn to compare against
  const [revealedCard, setRevealedCard] = useState<CardData | null>(null);

  const initGame = useCallback(async () => {
    const newDeck = generateDeck();
    const firstCard = newDeck.pop()!;
    
    setRevealedCard(null);
    setGame({
      deck: newDeck,
      history: [firstCard],
      currentCard: firstCard,
      score: 0,
      status: GameStatus.PLAYING,
      dealerComment: "Dealing the first card...",
      isThinking: true
    });

    const welcome = await getDealerCommentary(firstCard, null, null, 'start', 0);
    setGame(prev => ({ ...prev, dealerComment: welcome, isThinking: false }));
  }, []);

  const handleGuess = async (guess: Guess) => {
    if (game.status !== GameStatus.PLAYING || game.isThinking || !game.currentCard) return;

    const nextDeck = [...game.deck];
    const nextCard = nextDeck.pop();
    if (!nextCard) return;

    setGame(prev => ({ ...prev, isThinking: true }));
    setRevealedCard(nextCard); // Show the new card immediately

    const isCorrect = guess === Guess.HIGHER 
      ? nextCard.value >= game.currentCard.value 
      : nextCard.value <= game.currentCard.value;

    const newScore = isCorrect ? game.score + 1 : game.score;
    const newStatus = !isCorrect 
      ? GameStatus.LOST 
      : newScore >= WINNING_SCORE 
        ? GameStatus.WON 
        : GameStatus.PLAYING;

    const comment = await getDealerCommentary(
      game.currentCard, 
      nextCard, 
      guess, 
      isCorrect ? 'correct' : 'wrong', 
      newScore
    );

    // Wait briefly so the user can see the revealed card before it shifts
    setTimeout(() => {
      setGame(prev => ({
        ...prev,
        deck: nextDeck,
        currentCard: nextCard,
        history: [...prev.history, nextCard],
        score: newScore,
        status: newStatus,
        dealerComment: comment,
        isThinking: false
      }));
      setRevealedCard(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-8 px-4 overflow-y-auto">
      {/* Header & Dealer Section */}
      <div className="max-w-2xl w-full text-center z-10">
        <div className="inline-block px-4 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-blue-500/30">
          The Dealer's Gambit
        </div>
        <h1 className="text-4xl md:text-5xl font-serif mb-6 text-white tracking-tight">Ace High</h1>
        
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-2xl min-h-[80px] flex items-center justify-center relative transition-all">
          {game.isThinking && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 animate-[loading_1.5s_infinite_linear]"></div>
          )}
          <p className="text-lg md:text-xl italic font-serif text-slate-300">
            "{game.dealerComment}"
          </p>
        </div>
      </div>

      {/* Main Game Arena */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center gap-12 py-10 relative">
        
        {/* Comparison View */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
          {/* Reference Card (The one to beat) */}
          <div className={`relative transition-all duration-500 ${revealedCard ? 'opacity-40 scale-90 grayscale-[0.5]' : 'scale-100'}`}>
            <span className="absolute -top-6 left-0 right-0 text-center text-[10px] font-black uppercase text-slate-500 tracking-widest">Target</span>
            <PlayingCard card={game.currentCard} />
          </div>

          {/* Reveal Slot */}
          {revealedCard && (
            <div className="flex flex-col items-center animate-in zoom-in-95 slide-in-from-right-10 duration-300">
               <span className="text-4xl font-black text-blue-500 mb-4 animate-bounce">VS</span>
               <div className="relative">
                 <span className="absolute -top-6 left-0 right-0 text-center text-[10px] font-black uppercase text-blue-400 tracking-widest">Drawn</span>
                 <PlayingCard card={revealedCard} className="ring-4 ring-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.4)]" />
               </div>
            </div>
          )}

          {/* Hidden Deck (The House) */}
          {!revealedCard && game.status === GameStatus.PLAYING && (
            <div className="relative opacity-20 hidden md:block">
              <span className="absolute -top-6 left-0 right-0 text-center text-[10px] font-black uppercase text-slate-700 tracking-widest">Next</span>
              <PlayingCard card={null} isFlipped={true} />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col items-center gap-8">
          {game.status === GameStatus.PLAYING ? (
            <div className="space-y-6 w-full flex flex-col items-center">
               <div className="flex gap-4 md:gap-8">
                <button 
                  onClick={() => handleGuess(Guess.HIGHER)}
                  disabled={game.isThinking}
                  className="group relative px-10 py-5 bg-white text-slate-950 font-black text-sm rounded-2xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  HIGHER
                  <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button 
                  onClick={() => handleGuess(Guess.LOWER)}
                  disabled={game.isThinking}
                  className="group relative px-10 py-5 bg-slate-900 text-slate-100 border-2 border-slate-800 font-black text-sm rounded-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30"
                >
                  LOWER
                </button>
              </div>

              {/* Minimal Progress */}
              <div className="flex gap-3">
                {[...Array(WINNING_SCORE)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 w-12 rounded-full border transition-all duration-500 ${
                      i < game.score ? 'bg-blue-500 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-90 duration-500">
              <h2 className={`text-4xl font-black tracking-tighter uppercase ${game.status === GameStatus.WON ? 'text-yellow-500' : 'text-red-500'}`}>
                {game.status === GameStatus.WON ? 'Fortune Found' : 'Busted'}
              </h2>
              <p className="text-slate-400 font-serif text-center max-w-xs">
                {game.status === GameStatus.WON 
                  ? "You beat the house odds. Take your winnings and run." 
                  : "The cards don't lie. Better luck next time, high roller."}
              </p>
              <button 
                onClick={initGame}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/40 transition-all active:scale-95"
              >
                {game.status === GameStatus.IDLE ? 'STEP TO THE TABLE' : 'TRY AGAIN'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* History Shelf - Now explicitly styled and clear of main content */}
      <section className="w-full max-w-5xl mt-auto pt-10">
        <div className="border-t border-slate-900 pt-6">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Hand History</h3>
            <span className="text-[10px] text-slate-800 font-mono">STREAK: {game.score}</span>
          </div>
          <div className="flex justify-center md:justify-start gap-4 overflow-x-auto pb-8 px-4 scrollbar-hide">
            {game.history.length === 0 ? (
              <div className="h-32 w-full flex items-center justify-center border-2 border-dashed border-slate-900 rounded-2xl">
                <span className="text-slate-800 text-[10px] font-bold uppercase tracking-widest">No cards played</span>
              </div>
            ) : (
              game.history.map((card, idx) => (
                <div key={idx} className="shrink-0 scale-75 origin-top transition-all duration-700 opacity-60 hover:opacity-100 hover:scale-90 grayscale-[0.3] hover:grayscale-0">
                  <PlayingCard card={card} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="w-full mt-4 flex justify-between items-center text-[9px] text-slate-800 font-mono uppercase tracking-[0.2em] px-4">
        <div>CAPSTONE: AC-H V1.1</div>
        <div className="hidden sm:block">GOAL: {WINNING_SCORE} CONSECUTIVE WINS</div>
      </footer>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); width: 30%; }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(300%); width: 30%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
