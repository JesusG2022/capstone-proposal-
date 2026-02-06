
import React from 'react';
import { Suit, CardData } from './types';

export const WINNING_SCORE = 3;

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const getSuitIcon = (suit: Suit) => {
  switch (suit) {
    case 'spades': return <span className="text-slate-900">♠</span>;
    case 'hearts': return <span className="text-red-600">♥</span>;
    case 'diamonds': return <span className="text-red-600">♦</span>;
    case 'clubs': return <span className="text-slate-900">♣</span>;
  }
};

export const generateDeck = (): CardData[] => {
  const deck: CardData[] = [];
  const labels = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  SUITS.forEach(suit => {
    labels.forEach((label, index) => {
      deck.push({
        value: index + 1,
        suit,
        label
      });
    });
  });
  
  return shuffle(deck);
};

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
