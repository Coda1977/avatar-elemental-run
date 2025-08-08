import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Player } from "@/types/game";
import mikaPortrait from "@/assets/mika-portrait.jpg";
import yanaiPortrait from "@/assets/yanai-portrait.jpg";
import danielPortrait from "@/assets/daniel-portrait.jpg";

const players: Player[] = [
  { id: 'mika', name: 'Mika', portrait: mikaPortrait },
  { id: 'yanai', name: 'Yanai', portrait: yanaiPortrait },
  { id: 'daniel', name: 'Daniel', portrait: danielPortrait },
];

interface CharacterSelectProps {
  onSelectPlayer: (player: Player) => void;
}

export function CharacterSelect({ onSelectPlayer }: CharacterSelectProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-air-primary via-water-primary to-fire-primary bg-clip-text text-transparent mb-4">
          Four Elements Run
        </h1>
        <p className="text-lg text-muted-foreground mb-2">Choose Your Avatar</p>
        <p className="text-sm text-muted-foreground max-w-md">
          Master Air, Water, Earth, and Fire to restore balance to the world
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {players.map((player) => (
          <Card 
            key={player.id} 
            className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow-air bg-card/50 backdrop-blur border-border/50"
            onClick={() => onSelectPlayer(player)}
          >
            <div className="aspect-[3/4] relative">
              <img
                src={player.portrait}
                alt={player.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {player.name}
                </h3>
                <Button 
                  variant="secondary"
                  className="w-full group-hover:bg-air-primary group-hover:text-background transition-all duration-300"
                >
                  Choose {player.name}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Use swipe gestures to master the elements and overcome obstacles
        </p>
      </div>
    </div>
  );
}