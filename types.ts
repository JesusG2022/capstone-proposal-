
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface CardData {
  value: number; // 1 (Ace) to 13 (King)
  suit: Suit;
  label: string;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}

export enum Guess {
  HIGHER = 'HIGHER',
  LOWER = 'LOWER'
}

export interface GameState {
  deck: CardData[];
  history: CardData[];
  currentCard: CardData | null;
  score: number;
  status: GameStatus;
  dealerComment: string;
  isThinking: boolean;
}
