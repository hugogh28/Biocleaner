import Phaser from "phaser";
//import { Personajes } from "entities/Personajes";
//import { GameScene } from "./GameScene";

export class GameOverScene extends Phaser.Scene{

    constructor(){
        super('GameOverScene');
    }
    //Inicializamos los datos que pasamos desde GameScene
    init(data){
        this.winnerID = data.winnerID;
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
        
        const winnerText = 
        this.winnerID === 'player1' ? '¡Gana Quokka!' : 
        this.winnerID === 'player2' ? '¡Gana Narval!' : 
        '¡Empate!';

        this.add.text(400,250, winnerText, {
            fontSize: '64px',
            color: '#9f6e04ff',
        }).setOrigin(0.5);

        const menuBtn = this.add.text(400,300, 'Volver al menu', {
            fontSize: '32px',
            color: '#9f6e04ff',
        }).setOrigin(0.5)
        .setInteractive({useHandCursor : true})
        .on('pointerover', () => menuBtn.setColor('#05ff1aff'))
        .on('pointerout', () => menuBtn.setColor('#434ddeff'))
        .on('pointerdown', () =>{
            this.scene.start('MenuScene');
        });
    }

    update() {
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}