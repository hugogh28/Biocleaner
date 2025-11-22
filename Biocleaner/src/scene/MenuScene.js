import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }
    preload() {
        this.load.image('fondoMenu', 'assets/pez.png');
    }
    create() {

         this.add.image(400, 300, 'fondoMenu').setOrigin(0.5);
        this.add.text(400,100, 'Biocleaner',
        {   fontSize: '64px',
            color: '#903e00ff'
        }).setOrigin(0.5);

        const localBtn = this.add.text(200, 250, 'Jugar', {
            fontSize: '30px', 
            color: '#903e00ff'
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => localBtn.setColor('#05ff1aff'))
        .on('pointerout', () => localBtn.setColor('#903e00ff'))
        .on('pointerdown', () =>{
            this.scene.start('GameScene');
        });

        const creditos = this.add.text(400, 400, 'Créditos', {
            fontSize: '24px', 
            color: '#903e00ff'
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => creditos.setColor('#05ff1aff'))
        .on('pointerout', () => creditos.setColor('#903e00ff'))
        .on('pointerdown', () =>{
            this.scene.start('Creditos');
        });

        const ajustes = this.add.text(600, 300, 'Ajustes', {
            fontSize: '24px', 
            color: '#903e00ff'
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => ajustes.setColor('#05ff1aff'))
        .on('pointerout', () => ajustes.setColor('#903e00ff'))
        .on('pointerdown', () =>{
            this.scene.start('Ajustes');
        });

    }
}