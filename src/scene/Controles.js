import Phaser from "phaser";

export class Controles extends Phaser.Scene {

    constructor(){
        super('Controles');
    }

    preload(){
        this.load.image('botonVolver', 'assets/Botones/volver.png');
        this.load.image('fondoControles', 'assets/Fondos/narval_perdedor.png');
    }

    init(data) {
        this.previousScene = data?.previousScene || "MenuScene";
    }

    create() {
        
        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.image(400, 300, 'fondoControles').setOrigin(0.5);

        this.add.rectangle(400, 300, 700, 500, 0xaa99b0, 0.7 );

        this.add.text(400,100, 'Controles',
        {   
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#e1e674'
        }).setOrigin(0.5);
        
        this.add.text(200, 175, 'Quokka',
            {
                fontFamily: "aaaaa",
                fontSize: '20px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(200, 225, 'Izquierda: "A"',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(200, 275, 'Derecha: "D"',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(200, 325, 'Arriba: "W"',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(200, 375, 'Abajo: "S"',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(600, 175, 'Narval',
            {
                fontFamily: "aaaaa",
                fontSize: '20px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);
        
        this.add.text(600, 225, 'Izquierda: "←"',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);
        
        this.add.text(600, 275, 'Derecha: "→"',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(600, 325, 'Arriba: "↑"',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(600, 375, 'Abajo: "↓"',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

       

        this.add.image(400, 500, "botonVolver",)
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
