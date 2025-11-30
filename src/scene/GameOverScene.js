import Phaser from "phaser";


export class GameOverScene extends Phaser.Scene{

    constructor(){
        super('GameOverScene');
    }

    preload(){
        this.load.image('fondo', 'assets/fondo.png'); 
        this.load.image('botonVolver', 'assets/volver.png');
    }

    create(){

        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.image(400, 300, 'fondo').setOrigin(0.5);

        this.add.text(400, 23, 'Fin del Juego', {
            fontFamily: "aaaaa",
            fontSize: '22px',
            color: '#e1e674'
        }).setOrigin(0.5);

        const volverMenu = this.add.image(400, 400, 'botonVolver',).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () =>{
            this.scene.start('MenuScene');
        });
    }

    update() {
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}