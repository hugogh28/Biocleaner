import Phaser from "phaser";

export class StartScreen extends Phaser.Scene{
    constructor() {
        super('StartScreen')
    }

    preload(){
        this.load.image('fondoS', 'assets/Fondos/fondo.png');
    }
    create()
    {
        this.add.image(400, 300, 'fondoS').setOrigin(0.5); //Añadimos un fondo

        const textoStart = this.add.text(400, 310, 'Haz Click para empezar',
        {
            fontFamily: "aaaaa", 
            fontSize: '38px',
            color: '#e1e674'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        
        const empezarJuego  = () => {
            this.input.enabled = false;
            this.scene.start("MenuScene");
        }
        this.input.once('pointerdown', empezarJuego);
    }
}
