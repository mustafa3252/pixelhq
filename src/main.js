import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config.js';
import { OfficeScene } from './OfficeScene.js';
import { UIScene } from './UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: GAME_W,
    height: GAME_H,
    pixelArt: true,
    backgroundColor: '#1a1a2e',
    scene: [OfficeScene, UIScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
        mouse: {
            preventDefaultWheel: true,
        },
    },
};

new Phaser.Game(config);
