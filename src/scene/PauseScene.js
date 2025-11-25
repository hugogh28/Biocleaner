import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {

    constructor() {
        super('PauseScene');
    }

    create(data) {

        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

        this.add.text(400, 200, 'Pausa', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const resumeBtn = this.add.text(400, 320, 'Continuar', {
            fontSize: '32px',
            color: '#00ff00',
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointover', () => resumeBtn.setColor('#00ff88'))
        .on('pointerout', () => resumeBtn.setColor('#00ff00'))
        .on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume(data.originalScene);
            this.scene.get(data.originalScene).resume();
        });

        const ajustesBtn = this.add.text(400, 360, 'Ajustes', {
            fontSize: '32px',
            color: '#00ffff'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => ajustesBtn.setColor('#55ffff'))
        .on('pointerout', () => ajustesBtn.setColor('#00ffff'))
        .on('pointerdown', () => {

            this.scene.setVisible(false);
            this.scene.setVisible(false, "GameScene");
            this.scene.launch("Ajustes", { previousScene: "PauseScene" });
        });

        const menuBtn = this.add.text(400, 400, 'Volver al menú principal', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => menuBtn.setColor('#ff8888'))
        .on('pointerout', () => menuBtn.setColor('#ffffff'))
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