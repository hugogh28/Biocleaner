import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {

    constructor() {
        super('PauseScene');
    }

     preload(){
        this.load.image('botonAjustes', 'assets/ajustes.png');
        this.load.image('botonContinuar', 'assets/continuar.png');
        this.load.image('botonMenu', 'assets/menu.png');
    }


    create(data) {

        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

        this.add.text(400, 200, 'Pausa', {
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const resumeBtn = this.add.image(400, 320, 'botonContinuar',).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume(data.originalScene);
            this.scene.get(data.originalScene).resume();
        });

        const ajustesBtn = this.add.image(400, 360, 'botonAjustes', ).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {

            this.scene.setVisible(false);
            this.scene.setVisible(false, "GameScene");
            this.scene.launch("Ajustes", { previousScene: "PauseScene" });
        });

        const menuBtn = this.add.image(400, 400, 'botonMenu',).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.stop(data.originalScene);
            this.scene.start('MenuScene');
        });
    }

    update() {
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}