import Phaser from "phaser";

export class Creditos extends Phaser.Scene {

    constructor(){
        super('Creditos');
    }
     create() {
        
        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.text(400,100, 'Créditos',
        {   fontSize: '64px',
            color: '#903e00ff'
        }).setOrigin(0.5);
        
        const volverMenu = this.add.text(400, 400, 'Volver al menú ', {
            fontSize: '24px', 
            color: '#903e00ff'
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => volverMenu.setColor('#05ff1aff'))
        .on('pointerout', () => volverMenu.setColor('#434ddeff'))
        .on('pointerdown', () =>{
            this.scene.start('MenuScene');
        });

    }

    update() {
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}
