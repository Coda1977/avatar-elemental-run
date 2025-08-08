import { Element, TouchAction } from "@/types/game";

interface AudioConfig {
  enabled: boolean;
  volume: number;
}

class AudioManager {
  private config: AudioConfig = {
    enabled: true,
    volume: 0.3
  };

  private audioContext?: AudioContext;
  private initialized = false;

  constructor() {
    // Initialize on first user interaction (required by browsers)
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      // Create audio context when user interacts
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  // Synthesized sound effects using Web Audio API
  private playTone(frequency: number, duration: number, waveType: OscillatorType = 'sine') {
    if (!this.config.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = waveType;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.config.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Element-specific ambient sounds
  playZoneMusic(element: Element) {
    if (!this.config.enabled) return;

    // Different background tones for each element
    const elementTones = {
      air: { freq: 220, wave: 'sine' as OscillatorType },
      water: { freq: 165, wave: 'sine' as OscillatorType },
      earth: { freq: 110, wave: 'sawtooth' as OscillatorType },
      fire: { freq: 277, wave: 'triangle' as OscillatorType }
    };

    const tone = elementTones[element];
    // Play a long, quiet ambient tone
    this.playTone(tone.freq * 0.5, 2, tone.wave);
  }

  // Touch action sound effects
  playActionSound(action: TouchAction, element: Element) {
    if (!this.config.enabled) return;

    const actionSounds = {
      'swipe-up': { freq: 440, duration: 0.1, wave: 'sine' as OscillatorType },
      'swipe-down': { freq: 220, duration: 0.2, wave: 'sine' as OscillatorType },
      'tap-hold': { freq: 165, duration: 0.5, wave: 'square' as OscillatorType },
      'double-tap': { freq: 660, duration: 0.15, wave: 'triangle' as OscillatorType }
    };

    const sound = actionSounds[action];
    this.playTone(sound.freq, sound.duration, sound.wave);
  }

  // Game event sounds
  playTokenCollected(element: Element) {
    const frequencies = {
      air: [440, 554, 659],
      water: [330, 415, 523],
      earth: [220, 277, 330],
      fire: [523, 659, 784]
    };

    // Play a quick ascending arpeggio
    frequencies[element].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.1), i * 50);
    });
  }

  playAvatarState() {
    // Epic ascending scale
    const notes = [261, 294, 329, 349, 392, 440, 493, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'triangle'), i * 100);
    });
  }

  playObstacleHit() {
    // Discordant crash sound
    this.playTone(150, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(100, 0.2, 'square'), 100);
  }

  playCoinCollected() {
    // Classic coin sound
    this.playTone(800, 0.1);
    setTimeout(() => this.playTone(1000, 0.1), 50);
  }

  playGameOver() {
    // Descending sad trombone effect
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.4, 'sawtooth'), i * 200);
    });
  }

  // Settings
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  getConfig() {
    return { ...this.config };
  }
}

// Export singleton instance
export const audioManager = new AudioManager();

// Convenience functions
export const playZoneMusic = (element: Element) => audioManager.playZoneMusic(element);
export const playActionSound = (action: TouchAction, element: Element) => audioManager.playActionSound(action, element);
export const playTokenCollected = (element: Element) => audioManager.playTokenCollected(element);
export const playAvatarState = () => audioManager.playAvatarState();
export const playObstacleHit = () => audioManager.playObstacleHit();
export const playCoinCollected = () => audioManager.playCoinCollected();
export const playGameOver = () => audioManager.playGameOver();