import Phaser from "phaser";

export class Ajustes extends Phaser.Scene {
    constructor() {
        super("Ajustes");
    }

    preload() {
        this.load.image('botonVolver', 'assets/Botones/volver.png');
        this.load.image('fondo_Ajustes', 'assets/Fondos/quokka_perdedor.png');
        this.load.image('pez', 'assets/Items/pez.png');     // brillo
        this.load.image('bayas', 'assets/Items/bayas.png'); // música y sfx
    }

    init(data) {
        this.previousScene = data?.previousScene || "MenuScene";
    }

    create() {
        const settings = this.plugins.get("GlobalSettings");
        const brightnessPlugin = this.plugins.get("Brightness");

        brightnessPlugin.applyToScene(this);

        this.add.image(400, 300, 'fondo_Ajustes').setOrigin(0.5);
        this.add.rectangle(400, 300, 700, 500, 0x444b3c, 0.7);

        this.add.text(275, 100, "AJUSTES", {
            fontFamily: "aaaaa",
            fontSize: "40px",
            color: "#e1e674"
        });


        // Slider brillo

        const trackX = 100;
        const trackWidth = 600;

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


        //Slider música

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


        //Slider Sfx

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


        
        this.input.setDraggable(this.brilloHandle);
        this.input.setDraggable(this.volumenHandle);
        this.input.setDraggable(this.sfxHandle);

        this.input.on("drag", (pointer, obj, dragX) => {

            // Brillo
            if (obj === this.brilloHandle) {
                dragX = Phaser.Math.Clamp(dragX, trackX, trackX + trackWidth);
                obj.x = dragX;

                let t = (dragX - trackX) / trackWidth;
                brightnessPlugin.setBrightness(brilloMin + t * (brilloMax - brilloMin));
                brightnessPlugin.updateOverlay(this);
            }

            // Musica
            if (obj === this.volumenHandle) {
                dragX = Phaser.Math.Clamp(dragX, trackX, trackX + trackWidth);
                obj.x = dragX;

                let t = (dragX - trackX) / trackWidth;
                settings.setMusicVolume(t);

                const music = this.sound.get("musica_fondo");
                if (music) music.setVolume(t);
            }

            // Sfx
            if (obj === this.sfxHandle) {
                dragX = Phaser.Math.Clamp(dragX, trackX, trackX + trackWidth);
                obj.x = dragX;

                let t = (dragX - trackX) / trackWidth;
                settings.setSfxVolume(t);

                // Sonido de test opcional
                const test = this.sound.get("test_sfx");
                if (test) test.setVolume(t);
            }
        });


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
        const brightnessPlugin = this.plugins.get("Brightness");
        brightnessPlugin.updateOverlay(this);
    }
}
