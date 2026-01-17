import Phaser from 'phaser';
import { connectionManager } from '../services/ConnectionManager';


export class LocaloOnlineSeleccion extends Phaser.Scene {
    constructor() {
        super('LocaloOnlineSeleccion');
    }

     preload(){
        this.load.image('botonJugar', 'assets/Botones/empezar.png');
        this.load.image('botonAtras', 'assets/Botones/volver.png');
        this.load.image('fondoMenu', 'assets/Fondos/fondo.png');
    }


    create(data) {

        const settings = this.plugins.get("GlobalSettings");   //Los scripts para controlar el brillo y la música
        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.image(400, 300, 'fondoMenu').setOrigin(0.5);
        this.add.text(400,50, 'Selección modo de juego',    //Nombre del juego
        {   
            fontFamily: "aaaaa",
            fontSize: '32px',
            color: '#e1e674'
        }).setOrigin(0.5);

        const localBtn = this.add.image(300, 300, 'botonJugar').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', async () => {
            this.scene.start('GameScene');
        });
        this.add.text(300, 200, 'Local');
        this.add.text(500, 200, 'Online');
        const onlineBtn = this.add.image(500, 300, 'botonJugar').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', async () => {
            if (window.sessionId) {
                try {
                    const res = await fetch('/api/game/start', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId: window.sessionId })
                    });

                    const data = await res.json();
                    window.gamesPlayed = data.gamesPlayed;

                    console.log('Partidas jugadas:', window.gamesPlayed);

                } catch (e) {
                    console.error('Error iniciando partida', e);
                }

                this.scene.start('LobbyScene');
                return;
            }
            this.scene.launch('Login');
            this.scene.pause();
        });
         const volverBtn = this.add.image(400, 450, 'botonAtras').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', async () => {
            this.scene.start('MenuScene');
        });
    }
    
    update() { //Actualiza el brillo en función del slider de ajustes
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}