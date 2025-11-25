import Phaser from "phaser";


export class GameOverScene extends Phaser.Scene{

    constructor(){
        super('GameOverScene');
    }

    preload(){
        this.load.image('fondo', 'assets/fondo.png');
    }

    create(){

        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.image(400, 300, 'fondo').setOrigin(0.5);

        this.add.text(200,100, 'Fin del Juego', {
            fontSize: '34px',
            color: '#61e03aff'
        }).setOrigin(0.5);

        const volverMenu = this.add.text(200, 250, 'Volver al menú ', {
            fontSize: '24px', 
            color: '#ca31c0ff'
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => volverMenu.setColor('#05ff1aff'))
        .on('pointerout', () => volverMenu.setColor('#434ddeff'))
        .on('pointerdown', () =>{
            this.scene.start('MenuScene');
        });
    }

    update() {
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}