import Phaser from "phaser";
import { connectionManager } from '../services/ConnectionManager';


export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }
    preload() {

        //Música
        this.load.audio('musica_fondo', 'assets/Sonido/musicaMenu.mp3');

        //Assets
        this.load.image('fondoMenu', 'assets/Fondos/fondo.png');
        this.load.image('botonJugar', 'assets/Botones/empezar.png');
        this.load.image('botonAjustes', 'assets/Botones/ajustes.png');
        this.load.image('botonControles', 'assets/Botones/controles.png');
        this.load.image('botonCreditos', 'assets/Botones/creditos.png');
        this.load.image('quokka', 'assets/Quokka/quokka_front_view.png');
        this.load.image('narval', 'assets/Narval/narval_top_view.png');
        this.load.image('logo', 'assets/Items/logo.png')

    }
    create() {

        const settings = this.plugins.get("GlobalSettings");   //Los scripts para controlar el brillo y la música

        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.firstClickDone = false;

        //Música
        this.musica = this.sound.add("musica_fondo", {
            volume: settings.getMusicVolume(),
            loop: true
        });

        this.musica.play();
        this.events.on("shutdown", () => {
            if (this.musica) {
                this.musica.stop();
                this.musica.destroy();
            }
        });

        this.events.on("resume", () => {
            const v = settings.getMusicVolume();
            if (this.musica) this.musica.setVolume(v);
        });

        this.add.image(400, 300, 'fondoMenu').setOrigin(0.5); //Añadimos un fondo

        this.add.text(400,50, 'Biocleaner',    //Nombre del juego
        {   
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#e1e674'
        }).setOrigin(0.5);

        this.add.text(400,125, 'La carrera de Quokka VS Narval',        //Eslogan
        {   
            fontFamily: "aaaaa",
            fontSize: '18px',
            color: '#e1e674'
        }).setOrigin(0.5);

        const localBtn = this.add.image(350, 200, 'botonJugar').setOrigin(0.5)     //Botón que lleva a la pantalla de juego
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        

        const creditos = this.add.image(350, 400, 'botonCreditos').setOrigin(0.5)   //Botón que lleva a la pantalla de créditos
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
            this.scene.start('Creditos');
        });

        const ajustes = this.add.image(450, 300, 'botonAjustes').setOrigin(0.5)     //Botón que lleva a la pantalla de ajustes
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
            this.scene.start("Ajustes", { previousScene: "MenuScene" });
        });


        const controles = this.add.image(450, 500, 'botonControles').setOrigin(0.5)     //Botón que lleva a la pantalla de controles
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
            this.scene.start("Controles", { previousScene: "MenuScene" });
        });



        //Decoración
        this.add.image(10, 550, 'quokka').setOrigin(0.5).setDisplaySize(300,400);
        this.add.image(790, 450, 'narval').setOrigin(0.5).setDisplaySize(300,400);
        this.add.image(700, 200, 'logo');

        // Indicador de conexión al servidor
        this.connectionText = this.add.text(400, 570, 'Servidor: Comprobando...', {
            fontFamily: 'aaaaa',
            fontSize: '12px',
            color: '#ffff00'
        }).setOrigin(0.5);
        // Listener para cambios de conexión
        this.connectionListener = (data) => {
            this.updateConnectionDisplay(data);
        };
        connectionManager.addListener(this.connectionListener);
        
    }


    shutdown() {
        // Remover el listener
        if (this.connectionListener) {
            connectionManager.removeListener(this.connectionListener);
        }
    }

    update() { //En este update se actualiza el brillo
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }

    updateConnectionDisplay(data) {
        // Solo actualizar si el texto existe (la escena está creada)
        if (!this.connectionText || !this.scene || !this.scene.isActive('MenuScene')) {
            return;
        }

        try {
            if (data.connected) {
                this.connectionText.setText(`Servidor: ${data.count} usuario(s) conectado(s)`);
                this.connectionText.setFontFamily('aaaaa');
                this.connectionText.setColor('#00ff00');
            } else {
                this.connectionText.setText('Servidor: Desconectado');
                this.connectionText.setFontFamily('aaaaa');
                this.connectionText.setColor('#ff0000');
            }
        } catch (error) {
            console.error('[MenuScene] Error updating connection display:', error);
        }
    }

}