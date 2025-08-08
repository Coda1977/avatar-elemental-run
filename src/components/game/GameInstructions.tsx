import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Wind, Droplets, Mountain, Flame } from "lucide-react";

interface GameInstructionsProps {
  onClose: () => void;
}

export function GameInstructions({ onClose }: GameInstructionsProps) {
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm animate-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">How to Play</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Master the four elements to survive! Use the correct bending technique when obstacles approach.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-semibold text-blue-400 mb-2">🏃‍♂️ Movement Controls</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>← → <strong>Swipe Left/Right:</strong> Change lanes</div>
                  <div>↑ <strong>Swipe Up:</strong> Jump over barriers</div>
                  <div>↓ <strong>Swipe Down:</strong> Slide under obstacles</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-red-500/10 rounded border border-red-500/20">
                  <div className="text-2xl">🚂</div>
                  <div className="text-sm">
                    <strong>Trains:</strong> Change lanes to dodge!
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-orange-500/10 rounded border border-orange-500/20">
                  <div className="text-2xl">🚧</div>
                  <div className="text-sm">
                    <strong>Barriers:</strong> Jump over them!
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-green-500/10 rounded border border-green-500/20">
                  <div className="text-2xl">⬜</div>
                  <div className="text-sm">
                    <strong>Low barriers:</strong> Slide under!
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/20 p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">🎯 Objectives:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Collect element tokens (💨💧🗿🔥) to unlock Avatar State</li>
                <li>• Use the correct bending for each obstacle type</li>
                <li>• Survive as long as possible to beat family scores</li>
                <li>• Gather coins 💰 for future upgrades</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-air-primary/20 via-water-primary/20 to-fire-primary/20 p-4 rounded-lg border border-air-primary/30">
              <h3 className="font-semibold text-foreground mb-2">⭐ Avatar State</h3>
              <p className="text-sm text-muted-foreground">
                Collect all 4 element tokens to become invincible for 10 seconds!
              </p>
            </div>

            <Button onClick={onClose} className="w-full bg-air-primary hover:bg-air-accent text-background">
              Start Playing!
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}