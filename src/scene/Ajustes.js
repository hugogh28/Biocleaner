import Phaser from "phaser";

export class Ajustes extends Phaser.Scene {
    constructor() {
        super("Ajustes");
    }

    preload(){
            this.load.image('botonVolver', 'assets/volver.png');
        }

    init(data) {
        this.previousScene = data?.previousScene || "MenuScene";
    }

    create() {

        const settings = this.plugins.get("GlobalSettings");
        const brightnessPlugin = this.plugins.get("Brightness");

        brightnessPlugin.applyToScene(this);

        this.add.text(300, 40, "AJUSTES", {
            fontFamily: "aaaaa",
            fontSize: "40px",
            color: "#ffffff"
        });

        this.add.text(100, 150, "Brillo", {
            fontFamily: "aaaaa",
            fontSize: "24px",
            color: "#ffffff"
        });

        const brilloMin = 0.2;
        const brilloMax = 1.5;
        const trackX = 100;
        const trackYBrillo = 200;
        const trackWidth = 600;

        this.brilloTrack = this.add.rectangle(
            trackX,
            trackYBrillo,
            trackWidth,
            8,
            0x444444
        ).setOrigin(0, 0.5);

        let currentBr = Phaser.Math.Clamp(
            brightnessPlugin.getBrightness(),
            brilloMin,
            brilloMax
        );
        let tBr = (currentBr - brilloMin) / (brilloMax - brilloMin);
        let handleBrX = trackX + tBr * trackWidth;

        this.brilloHandle = this.add.circle(
            handleBrX,
            trackYBrillo,
            12,
            0xffff00
        ).setInteractive({ draggable: true });

        this.input.setDraggable(this.brilloHandle);

        this.add.text(100, 300, "Volumen música", {
            fontFamily: "aaaaa",
            fontSize: "24px",
            color: "#ffffff"
        });

        const trackYVol = 350;

        this.volumenTrack = this.add.rectangle(
            trackX,
            trackYVol,
            trackWidth,
            8,
            0x444444
        ).setOrigin(0, 0.5);

        let currentVol = Phaser.Math.Clamp(settings.getMusicVolume(), 0, 1);
        let tVol = currentVol; 
        let handleVolX = trackX + tVol * trackWidth;

        this.volumenHandle = this.add.circle(
            handleVolX,
            trackYVol,
            12,
            0x00ff00
        ).setInteractive({ draggable: true });

        this.input.setDraggable(this.volumenHandle);

        this.input.on("drag", (pointer, obj, dragX, dragY) => {

            if (obj === this.brilloHandle) {
                dragX = Phaser.Math.Clamp(dragX, trackX, trackX + trackWidth);
                obj.x = dragX;

                let t = (dragX - trackX) / trackWidth; // 0–1
                let value = brilloMin + t * (brilloMax - brilloMin);

                brightnessPlugin.setBrightness(value);
                brightnessPlugin.updateOverlay(this);
            }
            if (obj === this.volumenHandle) {
                dragX = Phaser.Math.Clamp(dragX, trackX, trackX + trackWidth);
                obj.x = dragX;

                let t = (dragX - trackX) / trackWidth; // 0–1
                let value = t;

                settings.setMusicVolume(value);

                const music = this.sound.get("musica_fondo");
                if (music) {
                    music.setVolume(value);
                }
            }
        });


        this.add.image(400, 400, "botonVolver",)
        .setInteractive()
        .on("pointerdown", () => {
             this.scene.stop();

            if (this.previousScene === "PauseScene") {
                this.scene.setVisible(true, "GameScene");
                this.scene.setVisible(true, "PauseScene");
            } 
            else {
                this.scene.start("MenuScene");
            }
        });
    }

    update() {
        const brightnessPlugin = this.plugins.get("Brightness");
        brightnessPlugin.updateOverlay(this);
    }
}
