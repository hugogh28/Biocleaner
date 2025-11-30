import Phaser from "phaser";

export class Creditos extends Phaser.Scene {

    constructor(){
        super('Creditos');
    }

    preload(){
        this.load.image('botonVolver', 'assets/volver.png');
    }

     create() {
        
        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.text(400,100, 'Créditos',
        {   
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#e1e674'
        }).setOrigin(0.5);
        
        this.add.text(200, 175, 'Programación',
            {
                fontFamily: "aaaaa",
                fontSize: '20px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(200, 225, 'Lucía Andrés',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(200, 275, 'Hugo García',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(200, 325, 'Lucas Joglar',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(200, 375, 'Sergio Ponce',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(600, 175, 'Arte y Sonido',
            {
                fontFamily: "aaaaa",
                fontSize: '20px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);
        
        this.add.text(600, 225, 'Sergio Ponce',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);
        
        this.add.text(600, 300, 'Diseño',
            {
                fontFamily: "aaaaa",
                fontSize: '20px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(600, 350, 'Lucía Andrés',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(600, 400, 'Hugo García',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        this.add.text(600, 450, 'Sergio Ponce',
            {
                fontFamily: "aaaaa",
                fontSize: '12px',
                color: '#e1e674'
            }
        ).setOrigin(0.5);

        const volverMenu = this.add.image(400, 530, 'botonVolver',).setOrigin(0.5)
        .setDisplaySize(300, 150)
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
