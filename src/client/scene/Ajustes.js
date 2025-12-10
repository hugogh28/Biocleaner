import Phaser from "phaser";

export class Ajustes extends Phaser.Scene {
    constructor() {
        super("Ajustes");
    }

    preload() {
        // Se cargan las imágenes necesarias
        this.load.image('botonVolver', 'assets/Botones/volver.png');
        this.load.image('fondo_Ajustes', 'assets/Fondos/quokka_perdedor.png');
        this.load.image('pez', 'assets/Items/pez.png');     
        this.load.image('bayas', 'assets/Items/bayas.png'); 
    }

    init(data) {
        // Se guarda la escena previa
        this.previousScene = data?.previousScene || "MenuScene";
    }

    create() {
        const settings = this.plugins.get("GlobalSettings");
        const brightnessPlugin = this.plugins.get("Brightness");

        brightnessPlugin.applyToScene(this); // Se aplica el brillo

        // Se dibuja el fondo y panel central
        this.add.image(400, 300, 'fondo_Ajustes').setOrigin(0.5);
        this.add.rectangle(400, 300, 700, 500, 0x444b3c, 0.7);

        // Se muestra el título
        this.add.text(275, 100, "AJUSTES", {
            fontFamily: "aaaaa",
            fontSize: "40px",
            color: "#e1e674"
        });

        const trackX = 100;
        const trackWidth = 600;

        //Brillo
        this.add.text(100, 150, "Brillo", {
            fontFamily: "aaaaa",
            fontSize: "24px",
            color: "#e1e674"
        });

        const brilloMin = 0.2;
        const brilloMax = 1.5;
        const trackYBrillo = 200;

        this.brilloTrack = this.add.rectangle(trackX, trackYBrillo, trackWidth, 18, 0x46546e).setOrigin(0, 0.5);

        let currentBr = Phaser.Math.Clamp(brightnessPlugin.getBrightness(), brilloMin, brilloMax);
        let tBr = (currentBr - brilloMin) / (brilloMax - brilloMin);
        let handleBrX = trackX + tBr * trackWidth;

        this.brilloHandle = this.add.image(handleBrX, trackYBrillo, 'pez').setInteractive({ draggable: true });
        this.brilloHandle.setDisplaySize(140,140);

        //Musica
        this.add.text(100, 250, "Volumen música", {
            fontFamily: "aaaaa",
            fontSize: "24px",
            color: "#e1e674"
        });

        const trackYVol = 300;

        this.volumenTrack = this.add.rectangle(trackX, trackYVol, trackWidth, 18, 0x7e1313).setOrigin(0, 0.5);

        let currentVol = Phaser.Math.Clamp(settings.getMusicVolume(), 0, 1);
        let handleVolX = trackX + currentVol * trackWidth;

        this.volumenHandle = this.add.image(handleVolX, trackYVol, 'bayas').setInteractive({ draggable: true });
        this.volumenHandle.setDisplaySize(140,140);

        //Sfx
        this.add.text(100, 350, "Volumen SFX", {
            fontFamily: "aaaaa",
            fontSize: "24px",
            color: "#e1e674"
        });

        const trackYSfx = 400;

        this.sfxTrack = this.add.rectangle(trackX, trackYSfx, trackWidth, 18, 0x7e1313).setOrigin(0, 0.5);

        let currentSfx = Phaser.Math.Clamp(settings.getSfxVolume(), 0, 1);
        let handleSfxX = trackX + currentSfx * trackWidth;

        this.sfxHandle = this.add.image(handleSfxX, trackYSfx, 'bayas').setInteractive({ draggable: true });
        this.sfxHandle.setDisplaySize(140,140);

        // Se activa arrastrar en los controles
        this.input.setDraggable(this.brilloHandle);
        this.input.setDraggable(this.volumenHandle);
        this.input.setDraggable(this.sfxHandle);

        // Se gestionan los sliders
        this.input.on("drag", (pointer, obj, dragX) => {

            //Brillo
            if (obj === this.brilloHandle) {
                dragX = Phaser.Math.Clamp(dragX, trackX, trackX + trackWidth);
                obj.x = dragX;

                let t = (dragX - trackX) / trackWidth;
                brightnessPlugin.setBrightness(brilloMin + t * (brilloMax - brilloMin));
                brightnessPlugin.updateOverlay(this);
            }

            //Musica
            if (obj === this.volumenHandle) {
                dragX = Phaser.Math.Clamp(dragX, trackX, trackX + trackWidth);
                obj.x = dragX;

                let t = (dragX - trackX) / trackWidth;
                settings.setMusicVolume(t);

                this.sound.sounds.forEach(sound => {
                    if (sound.key.includes("musica")) {
                        sound.setVolume(t);
                    }
                });
            }

            //Sfx
            if (obj === this.sfxHandle) {
                dragX = Phaser.Math.Clamp(dragX, trackX, trackX + trackWidth);
                obj.x = dragX;

                let t = (dragX - trackX) / trackWidth;
                settings.setSfxVolume(t);

                const test = this.sound.get("test_sfx");
                if (test) test.setVolume(t);
            }
        });

        // Se crea el botón de volver
        this.add.image(400, 500, "botonVolver")
            .setInteractive()
            .on("pointerdown", () => {
                this.scene.stop();

                if (this.previousScene === "PauseScene") {
                    this.scene.setVisible(true, "GameScene");
                    this.scene.setVisible(true, "PauseScene");
                } else {
                    this.scene.start("MenuScene");
                }
            });
    }

    update() {
        // Se actualiza el brillo
        const brightnessPlugin = this.plugins.get("Brightness");
        brightnessPlugin.updateOverlay(this);
    }
}
