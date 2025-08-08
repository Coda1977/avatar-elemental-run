export type Element = 'air' | 'water' | 'earth' | 'fire';

export type Player = {
  id: string;
  name: string;
  portrait: string;
};

export type GameState = 'menu' | 'character-select' | 'playing' | 'game-over';

export type TouchAction = 'swipe-up' | 'swipe-down' | 'tap-hold' | 'double-tap';

export type Obstacle = {
  id: string;
  type: string;
  element: Element;
  position: { x: number; y: number };
  width: number;
  height: number;
};

export type GameStats = {
  distance: number;
  coins: number;
  airTokens: number;
  waterTokens: number;
  earthTokens: number;
  fireTokens: number;
  health: number;
  score: number;
  avatarStateActive: boolean;
};

export type Leaderboard = {
  [playerName: string]: {
    bestDistance: number;
    totalCoins: number;
    bestScore: number;
    avatarStateReached: number;
  };
};