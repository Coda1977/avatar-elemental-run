import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player, GameStats } from "@/types/game";
import { Trophy, RotateCcw, Home, Star } from "lucide-react";

interface GameOverScreenProps {
  player: Player;
  stats: GameStats;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function GameOverScreen({ player, stats, onRestart, onBackToMenu }: GameOverScreenProps) {
  const totalTokens = stats.airTokens + stats.waterTokens + stats.earthTokens + stats.fireTokens;
  const avatarStateReached = stats.avatarStateActive || totalTokens >= 4;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border border-border/50 animate-fade-in">
        <div className="p-6 text-center">
          <div className="mb-6">
            <img 
              src={player.portrait} 
              alt={player.name}
              className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-primary mb-4"
            />
            <h2 className="text-2xl font-bold text-foreground mb-2">Game Over</h2>
            <p className="text-muted-foreground">{player.name}'s Journey Ends</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-lg font-bold text-foreground">{Math.floor(stats.distance)}m</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-lg font-bold text-foreground">{stats.score}</p>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Element Mastery</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-air-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-background">{stats.airTokens}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Air</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-water-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-background">{stats.waterTokens}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Water</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-earth-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-background">{stats.earthTokens}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Earth</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-fire-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-background">{stats.fireTokens}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Fire</p>
                </div>
              </div>
            </div>

            {avatarStateReached && (
              <div className="bg-gradient-to-r from-air-primary/20 via-water-primary/20 to-fire-primary/20 rounded-lg p-4 border border-air-primary/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-fire-primary" />
                  <span className="font-bold text-foreground">Avatar State Reached!</span>
                  <Star className="w-5 h-5 text-fire-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  You mastered all four elements in this run!
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onRestart}
              className="w-full bg-air-primary hover:bg-air-accent text-background font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onBackToMenu}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Keep training to master all elements and achieve Avatar State!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}