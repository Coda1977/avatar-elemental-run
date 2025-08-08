import { useState } from "react";
import { GameState, Player, GameStats } from "@/types/game";
import { CharacterSelect } from "@/components/game/CharacterSelect";
import { GameScreen } from "@/components/game/GameScreen";
import { GameOverScreen } from "@/components/game/GameOverScreen";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('character-select');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setGameState('playing');
  };

  const handleGameOver = (stats: GameStats) => {
    setGameStats(stats);
    setGameState('game-over');
  };

  const handleRestart = () => {
    setGameStats(null);
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setSelectedPlayer(null);
    setGameStats(null);
    setGameState('character-select');
  };

  if (gameState === 'character-select') {
    return <CharacterSelect onSelectPlayer={handleSelectPlayer} />;
  }

  if (gameState === 'playing' && selectedPlayer) {
    return <GameScreen player={selectedPlayer} onGameOver={handleGameOver} />;
  }

  if (gameState === 'game-over' && selectedPlayer && gameStats) {
    return (
      <GameOverScreen 
        player={selectedPlayer}
        stats={gameStats}
        onRestart={handleRestart}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  return null;
};

export default Index;
