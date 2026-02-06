
import React from 'react';
import { CardData } from '../types';
import { getSuitIcon } from '../constants';

interface PlayingCardProps {
  card: CardData | null;
  isFlipped?: boolean;
  className?: string;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card, isFlipped = false, className = "" }) => {
  // Standard card dimensions (reduced slightly from w-48 to w-40 for better spacing)
  const baseClasses = `w-40 h-60 md:w-44 md:h-64 rounded-xl shadow-2xl relative select-none transition-all duration-300 ${className}`;

  if (!card && !isFlipped) {
    return (
      <div className={`${baseClasses} bg-slate-800 border-2 border-slate-700 flex items-center justify-center`}>
        <div className="w-full h-full rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-center">
          <span className="text-slate-800 text-4xl font-bold">?</span>
        </div>
      </div>
    );
  }

  if (isFlipped) {
    return (
      <div className={`${baseClasses} bg-blue-900 border-4 border-white overflow-hidden flex items-center justify-center`}>
        {/* Card Back Pattern */}
        <div className="absolute inset-2 border-2 border-blue-400 rounded-lg opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-800 to-transparent opacity-50"></div>
        <div className="text-white text-5xl font-serif z-10 opacity-80">A</div>
      </div>
    );
  }

  const isRed = card?.suit === 'hearts' || card?.suit === 'diamonds';

  return (
    <div className={`${baseClasses} bg-white border-2 border-slate-200 flex flex-col p-4`}>
      <div className={`text-2xl font-black self-start leading-none ${isRed ? 'text-red-600' : 'text-slate-950'}`}>
        {card?.label}
        <div className="text-xl mt-1">{getSuitIcon(card!.suit)}</div>
      </div>
      
      <div className="flex-1 flex items-center justify-center text-6xl">
        {getSuitIcon(card!.suit)}
      </div>
      
      <div className={`text-2xl font-black self-end rotate-180 leading-none ${isRed ? 'text-red-600' : 'text-slate-950'}`}>
        {card?.label}
        <div className="text-xl mt-1">{getSuitIcon(card!.suit)}</div>
      </div>
    </div>
  );
};

export default PlayingCard;
