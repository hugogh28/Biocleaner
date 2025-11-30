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
        this.load.image('draw_b', 'assets/fondo.png'); 
        this.load.image('quokka_loser_b', 'assets/quokka_looser.png'); 
        this.load.image('narval_loser_b', 'assets/narval_looser.png'); 
        this.load.image('botonVolver', 'assets/volver.png');
        this.load.image('quoka_loser', 'assets/basura_tierra2.png');
        this.load.image('narval_loser', 'assets/residuo_toxico_aguaN.png');
        this.load.image('draw', 'assets/quokka_narval.png');
        this.load.image('botonMenu', 'assets/menu.png');
    }
    create(){

        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        const bakcgroundWinner = 
        this.winnerID === 'player1' ? 'narval_loser_b' :
        this.winnerID === 'player2' ? 'quokka_loser_b' :
        'draw_b';
        
        this.add.image(400, 300, bakcgroundWinner).setOrigin(0.5);
        
        const winnerText = 
        this.winnerID === 'player1' ? '¡Gana Quokka!' : 
        this.winnerID === 'player2' ? '¡Gana Narval!' : 
        '¡Empate!';

        const winner = 
        this.winnerID === 'player1' ? 'narval_loser' : 
        this.winnerID === 'player2' ? 'quoka_loser' :
        'draw';

        this.add.image(400, 450, winner).setOrigin(0.5);

        this.add.text(400,50, winnerText, {
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#e1e674',
        }).setOrigin(0.5);

        const volverMenu = this.add.image(420, 150, 'botonMenu',).setOrigin(0.5)
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