import Phaser from "phaser";

export class StartScreen extends Phaser.Scene{
    constructor() {
        super('StartScreen')
    }

    create()
    {
        const {width, height} = this.scale;

        const textoStart = this.add.text(width/2, height/ 2 + 10, 'Haz Click para empezar',
            {
                fontFamily: "aaaaa",
                fontSize: '38px',
                color: '#ffffff'
            }).setOrigin(0.5);

        textoStart.setInteractive({ useHandCursor: true })

        const startGame = () => {
            this.input.enabled = false;
            this.scene.start('MenuScene');
        }

        this.input.once('pointerdown', startGame);
    }
}
