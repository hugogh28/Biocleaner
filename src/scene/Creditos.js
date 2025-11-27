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
        {   fontSize: '64px',
            color: '#903e00ff'
        }).setOrigin(0.5);
        
        const volverMenu = this.add.image(400, 400, 'botonVolver',).setOrigin(0.5)
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
