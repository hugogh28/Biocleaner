import Phaser from "phaser";

export class StartScreen extends Phaser.Scene{
    constructor() {
        super('StartScreen')
    }

    preload(){
        this.load.image('fondoS', 'assets/Fondos/fondo.png');
        this.load.image('botonClick', 'assets/Botones/click.png');
    }
    create()
    {
        this.add.image(400, 300, 'fondoS').setOrigin(0.5); //Añadimos un fondo

        this.add.text(400, 310, 'a',
        {
            fontFamily: "aaaaa", 
            fontSize: '38px',
            color: '#e1e674'
        }).setOrigin(0.5)
        const textoStart = this.add.image(400, 310, 'botonClick').setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        
        const empezarJuego  = () => {
            this.input.enabled = false;
            this.scene.start("MenuScene");
        }
        this.input.once('pointerdown', empezarJuego);
    }
}
