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


        this.load.image('w', 'assets/Botones/W.png');
        this.load.image('a', 'assets/Botones/A.png');
        this.load.image('s', 'assets/Botones/S.png');
        this.load.image('d', 'assets/Botones/D.png');

        this.load.image('flecha1', 'assets/Botones/Flecha_Arr.png');
        this.load.image('flecha2', 'assets/Botones/Flecha_Aba.png');
        this.load.image('flecha3', 'assets/Botones/Flecha_Der.png');
        this.load.image('flecha4', 'assets/Botones/Flecha_Izq.png');
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
            
            this.add.text(250, 200, 'Quokka',
                {
                    fontFamily: "aaaaa",
                    fontSize: '20px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),
            
            this.add.image(250, 275, 'w').setOrigin(0.5),
            this.add.image(170, 350, 'a').setOrigin(0.5),
            this.add.image(250, 350, 's').setOrigin(0.5),
            this.add.image(330, 350, 'd').setOrigin(0.5),
            

            this.add.text(575, 200, '    Narval/ \nversión online',
                {
                    fontFamily: "aaaaa",
                    fontSize: '20px',
                    color: '#e1e674'
                }
            ).setOrigin(0.5),
            
            
            this.add.image(575, 275, 'flecha1').setOrigin(0.5),
            this.add.image(495, 350, 'flecha4').setOrigin(0.5),
            this.add.image(575, 350, 'flecha2').setOrigin(0.5),
            this.add.image(655, 350, 'flecha3').setOrigin(0.5),
            
        ]);

        //botón para volver
        const botonCambiar = this.add.image(575, 500, 'botonExplicacion')
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
            botonCambiar.setTexture(
                this.mostrandoControles ? 'botonExplicacion' : 'botonControles'
            );
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

        this.add.image(250, 500, "botonVolver",)
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
