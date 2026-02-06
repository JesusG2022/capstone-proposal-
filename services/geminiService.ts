
import { GoogleGenAI } from "@google/genai";
import { CardData, Guess } from "../types";

export const getDealerCommentary = async (
  currentCard: CardData,
  nextCard: CardData | null,
  guess: Guess | null,
  result: 'correct' | 'wrong' | 'start',
  score: number
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = result === 'start' 
    ? `You are a slick, mysterious casino dealer in a high-stakes card game called "Ace High". 
       The game is simple: the user must guess if the next card is Higher or Lower than the current one.
       They need ${3 - score} more correct guesses to win.
       The first card drawn is the ${currentCard.label} of ${currentCard.suit}. 
       Give a short (under 15 words) welcoming but slightly intimidating remark to start the game.`
    : `You are a slick casino dealer. 
       The current card was the ${currentCard.label} of ${currentCard.suit}.
       The user guessed ${guess}.
       The actual next card was the ${nextCard?.label} of ${nextCard?.suit}.
       The user was ${result}.
       The user's current win streak is ${score}.
       Give a very short (under 15 words) witty remark about this outcome. If they won the whole game (streak of 3), be begrudgingly impressed. If they lost, be mockingly sympathetic.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    return response.text || "Place your bets...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return result === 'correct' ? "Impressive. Again?" : "The house always wins.";
  }
};
