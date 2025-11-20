import Phaser, { Physics } from 'phaser';

import { MenuScene } from './scene/MenuScene.js';
import { GameScene } from './scene/GameScene.js';
import { PauseScene} from './scene/PauseScene.js';
import { Creditos} from './scene/Creditos.js';
import { Ajustes} from './scene/Ajustes.js';


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: false
        } 
    },

    scene: [MenuScene, GameScene, PauseScene, Creditos, Ajustes],
    backgroundColor: '#876f00ff'
}

const game = new Phaser.Game(config);