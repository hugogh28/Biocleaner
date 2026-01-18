import Phaser from "phaser";

export class Controles extends Phaser.Scene {

    constructor(){
        super('Controles');
    }

    preload(){
        this.load.image('botonVolver', 'assets/Botones/volver.png');
        this.load.image('botonExplicacion', 'assets/Botones/explicacion.png');
        this.load.image('botonControles', 'assets/Botones/controles.png');
        this.load.image('fondoControles', 'assets/Fondos/narval_perdedor.png');
    }

    init(data) {
        this.previousScene = data?.previousScene || "MenuScene";
    }

    create() {

        this.mostrandoControles = true; 

        const brightness = this.plugins.get("Brightness");  //Ajustes de brillo
        brightness.applyToScene(this);

        this.add.image(400, 300, 'fondoControles').setOrigin(0.5);

        this.add.rectangle(400, 300, 700, 500, 0xaa99b0, 0.7 ); //Fondo para que se vea la letra´

        this.controlesContainer = this.add.container();
        this.controlesContainer.add([            
            this.add.text(400,100, 'Controles',
            {   
                fontFamily: "aaaaa",
                fontSize: '64px',
                color: '#e1e674'
            }).setOrigin(0.5),
            
            this.add.text(200, 175, 'Quokka',
                {
                    fontFamily: "aaaaa",
                    fontSize: '20px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),

            this.add.text(200, 225, 'Izquierda: "A"',
                {
                    fontFamily: "aaaaa",
                    fontSize: '12px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),

            this.add.text(200, 275, 'Derecha: "D"',
                {
                    fontFamily: "aaaaa",
                    fontSize: '12px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),

            this.add.text(200, 325, 'Arriba: "W"',
                {
                    fontFamily: "aaaaa",
                    fontSize: '12px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),

            this.add.text(200, 375, 'Abajo: "S"',
                {
                    fontFamily: "aaaaa",
                    fontSize: '12px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),

            this.add.text(600, 175, 'Narval',
                {
                    fontFamily: "aaaaa",
                    fontSize: '20px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),
            
            this.add.text(600, 225, 'Izquierda: "←"',
                {
                    fontFamily: "aaaaa",
                    fontSize: '12px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),
            
            this.add.text(600, 275, 'Derecha: "→"',
                {
                    fontFamily: "aaaaa",
                    fontSize: '12px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),

            this.add.text(600, 325, 'Arriba: "↑"',
                {
                    fontFamily: "aaaaa",
                    fontSize: '12px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),

            this.add.text(600, 375, 'Abajo: "↓"',
                {
                    fontFamily: "aaaaa",
                    fontSize: '12px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),
        ]);

        //botón para volver
        const botonCambiar = this.add.image(600, 500, 'botonExplicacion')
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            if(this.mostrandoControles){
                this.mostrandoControles = false;

                this.controlesContainer.setVisible(false);
                this.explicacionContainer.setVisible(true);

            }
            else if(!this.mostrandoControles){
                this.mostrandoControles = true;

                this.controlesContainer.setVisible(true);
                this.explicacionContainer.setVisible(false);
            }
            /*
            botonCambiar.setText(
                this.mostrandoControles ? 'Ver explicación' : 'Ver controles'
            );*/
        });

        
        this.explicacionContainer = this.add.container();
        this.explicacionContainer.setVisible(false);
        this.explicacionContainer.add([
            this.add.text(400, 250, 
                'El objetivo de este juego es recoger más basura que el enemigo.\n\n' +
                'Cada uno tiene power ups (bayas o peces) que les dan más puntuación.\n\n' +
                'Los cubos de basura del centro perjudican al enemigo. Si este tiene un power up se lo quita\n' +
                'o de lo contrario se le inmovilizará.\n\n' +
                'Los vertidos dan 10 puntos.\n\n'+
                'Cuando terminen los 2 minutos del temporizador acabará el juego y el jugador con mayor puntuación ganará.',
                {
                    fontFamily: "aaaaa",
                    fontSize: '16px',
                    color: '#e1e674',
                    align: 'center',
                    wordWrap: { width: 500 }
                }
            ).setOrigin(0.5)
        ]);

        this.add.image(300, 500, "botonVolver",)
        .setInteractive()
        .on("pointerdown", () => {
             this.scene.stop();

            if (this.previousScene === "PauseScene") {
                this.scene.setVisible(true, "GameScene");
                this.scene.setVisible(true, "PauseScene");
            } 
            else {
                this.scene.start("MenuScene");
            }
        });

        
    }

    update() {
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}
