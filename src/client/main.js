import Phaser, { Physics } from 'phaser';

import { MenuScene } from './scene/MenuScene.js';
import { GameScene } from './scene/GameScene.js';
import { PauseScene} from './scene/PauseScene.js';
import { Creditos} from './scene/Creditos.js';
import { Ajustes} from './scene/Ajustes.js';
import { GameOverScene } from './scene/GameOverScene.js';
import { Controles } from './scene/Controles.js';
import { ConnectionLostScene } from './scene/ConnectionLostScene.js';
import { Login} from './scene/Login.js';


import GlobalSettingsPlugin from "./GlobalSettingPlugin.js";
import BrightnessPlugin  from "./BrightnessPlugin.js";

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
    plugins: {
        global: [
            { key: "GlobalSettings", plugin: GlobalSettingsPlugin, start: true },
            { key: "Brightness", plugin: BrightnessPlugin, start: true }
        ]
    },


        scene: [ MenuScene, GameScene, PauseScene, Creditos, Ajustes, GameOverScene, Controles, ConnectionLostScene, Login],
        backgroundColor: '#876f00'
    }

const game = new Phaser.Game(config);



export { game };