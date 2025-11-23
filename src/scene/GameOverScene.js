import Phaser from "phaser";


export class GameOverScene extends Phaser.Scene{

    constructor(){
        super('GameOverScene');
    }

    preload(){
        this.load.image('fondo', 'assets/fondo.png');
    }

    create(){
        this.add.image(200, 150, 'fondo').setOrigin(0.5);

        const volverMenu = this.add.text(400, 400, 'Volver al menú ', {
            fontSize: '24px', 
            color: '#903e00ff'
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => volverMenu.setColor('#05ff1aff'))
        .on('pointerout', () => volverMenu.setColor('#434ddeff'))
        .on('pointerdown', () =>{
            this.scene.start('MenuScene');
        });
    }
}