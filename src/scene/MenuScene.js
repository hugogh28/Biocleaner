import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }
    preload() {
        this.load.image('fondoMenu', 'assets/Fondos/fondo.png');
        this.load.image('botonJugar', 'assets/Botones/empezar.png');
        this.load.image('botonAjustes', 'assets/Botones/ajustes.png');
        this.load.image('botonControles', 'assets/Botones/controles.png');
        this.load.image('botonCreditos', 'assets/Botones/creditos.png');

        //Música
        this.load.audio('musica_fondo', 'assets/Sonido/musica_fondo.ogg');

        this.add.text(400,100, 'Biocleaner',
        {   
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#e1e674'
        }).setOrigin(0.5);
    }
    create() {

        const settings = this.plugins.get("GlobalSettings");

        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        if (!this.sound.get("musica_fondo")) {
            // Solo crear la música si NO existe
            this.musica = this.sound.add("musica_fondo", {
                volume: settings.getMusicVolume(),
                loop: true
            });
            this.musica.play();
        } else {
            // Si ya existe, solo actualiza el volumen
            this.sound.get("musica_fondo").setVolume(settings.getMusicVolume());
        }

        this.add.image(400, 300, 'fondoMenu').setOrigin(0.5);
        this.add.text(400,100, 'Biocleaner',
        {   
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#e1e674'
        }).setOrigin(0.5);

        const localBtn = this.add.image(350, 200, 'botonJugar').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () =>{
            this.scene.start('GameScene');
        });

        const creditos = this.add.image(350, 400, 'botonCreditos').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () =>{
            this.scene.start('Creditos');
        });

        const ajustes = this.add.image(450, 300, 'botonAjustes').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
            this.scene.start("Ajustes", { previousScene: "MenuScene" });
        });

        const controles = this.add.image(450, 500, 'botonControles').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
            this.scene.start("Controles", { previousScene: "MenuScene" });
        });

    }

    update() {
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}