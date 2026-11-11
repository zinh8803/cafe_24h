import * as Phaser from 'phaser';
import { CafeMainScene } from './scenes/CafeMainScene';

export function createCafePhaserGame(parentElement: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,
    parent: parentElement,
    width: 1200,
    height: 780,
    backgroundColor: '#2e1e16',
    preserveDrawingBuffer: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [CafeMainScene],
  };

  return new Phaser.Game(config);
}

