import { Leaderboard, GameStats, Player } from "@/types/game";

const LEADERBOARD_KEY = 'four-elements-run-leaderboard';

export function getLeaderboard(): Leaderboard {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return {};
  }
}

export function updateLeaderboard(player: Player, stats: GameStats): Leaderboard {
  const leaderboard = getLeaderboard();
  
  if (!leaderboard[player.name]) {
    leaderboard[player.name] = {
      bestDistance: 0,
      totalCoins: 0,
      bestScore: 0,
      avatarStateReached: 0
    };
  }

  const playerData = leaderboard[player.name];
  
  // Update best distance if this run was better
  if (stats.distance > playerData.bestDistance) {
    playerData.bestDistance = stats.distance;
  }
  
  // Update best score if this run was better
  if (stats.score > playerData.bestScore) {
    playerData.bestScore = stats.score;
  }
  
  // Add coins to total
  playerData.totalCoins += stats.coins;
  
  // Increment avatar state count if reached
  if (stats.avatarStateActive || 
      (stats.airTokens > 0 && stats.waterTokens > 0 && 
       stats.earthTokens > 0 && stats.fireTokens > 0)) {
    playerData.avatarStateReached += 1;
  }

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch (error) {
    console.error('Failed to save leaderboard:', error);
  }

  return leaderboard;
}

export function getPlayerRankings(): Array<{
  name: string;
  bestDistance: number;
  totalCoins: number;
  bestScore: number;
  avatarStateReached: number;
}> {
  const leaderboard = getLeaderboard();
  
  return Object.entries(leaderboard)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.bestScore - a.bestScore);
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error('Failed to clear leaderboard:', error);
  }
}