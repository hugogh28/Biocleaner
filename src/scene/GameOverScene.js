import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {

    constructor() {
        super('GameOverScene');
    }

    // Se recibe el ganador desde GameScene
    init(data) {
        this.winnerID = data.winnerID;
    }

    preload() {
        this.load.image('empate_f', 'assets/Fondos/fondo.png'); 
        this.load.image('quokka_perdedor_f', 'assets/Fondos/quokka_perdedor.png'); 
        this.load.image('narval_perdedor_f', 'assets/Fondos/narval_perdedor.png'); 
        this.load.image('botonVolver', 'assets/Botones/volver.png');
        this.load.image('quokka_perdedor', 'assets/Quokka/basura_tierra2.png');
        this.load.image('narval_perdedor', 'assets/Narval/residuo_toxico_aguaN.png');
        this.load.image('empate', 'assets/quokka_narval.png');
        this.load.image('botonMenu', 'assets/Botones/menu.png');
    }

    create() {

        const brightness = this.plugins.get("Brightness");     
        brightness.applyToScene(this);   // Se aplica el brillo

        // Se elige el fondo según el ganador
        const bakcgroundWinner = 
            this.winnerID === 'player1' ? 'narval_perdedor_f' :
            this.winnerID === 'player2' ? 'quokka_perdedor_f' :
            'empate_f';
        
        this.add.image(400, 300, bakcgroundWinner).setOrigin(0.5);

        // Se elige el texto según el ganador
        const winnerText = 
            this.winnerID === 'player1' ? '¡Gana Quokka!' : 
            this.winnerID === 'player2' ? '¡Gana Narval!' : 
            '¡Empate!';

        // Se elige la imagen del resultado
        const winner = 
            this.winnerID === 'player1' ? 'narval_perdedor' : 
            this.winnerID === 'player2' ? 'quokka_perdedor' :
            'empate';

        // Se muestra la imagen del ganador/empate
        this.add.image(400, 450, winner).setOrigin(0.5);

        // Se muestra el texto del resultado
        this.add.text(400, 50, winnerText, {
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#e1e674',
        }).setOrigin(0.5);

        // Se crea el botón para volver al menú
        const volverMenu = this.add.image(420, 150, 'botonMenu')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MenuScene');  // Se cambia a la escena del menú
            });
    }

    update() {
        // Se actualiza el brillo si ha cambiado
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}
