import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }
    preload() {
        this.load.image('fondoMenu', 'assets/fondo.png');
        this.load.image('botonJugar', 'assets/basura.png');
        this.load.image('botonAjustes', 'assets/bayas.png');
        this.load.image('botonCreditos', 'assets/logo.png');
    }
    create() {

        this.add.image(400, 300, 'fondoMenu').setOrigin(0.5);
        this.add.text(400,100, 'Biocleaner',
        {   fontSize: '64px',
            color: '#903e00ff'
        }).setOrigin(0.5);

        const localBtn = this.add.image(200, 250, 'botonJugar').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        /*.on('pointerover', () => localBtn.setImgae('#05ff1aff'))
        .on('pointerout', () => localBtn.setColor('#903e00ff'))*/
        .on('pointerdown', () =>{
            this.scene.start('GameScene');
        });

        const creditos = this.add.image(400, 400, 'botonCreditos').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        /*.on('pointerover', () => creditos.setColor('#05ff1aff'))
        .on('pointerout', () => creditos.setColor('#903e00ff'))*/
        .on('pointerdown', () =>{
            this.scene.start('Creditos');
        });

        const ajustes = this.add.image(600, 300, 'botonAjustes').setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        /*.on('pointerover', () => ajustes.setColor('#05ff1aff'))
        .on('pointerout', () => ajustes.setColor('#903e00ff'))*/
        .on('pointerdown', () =>{
            this.scene.start('Ajustes');
        });

    }
}