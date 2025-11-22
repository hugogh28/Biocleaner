import Phaser from "phaser";

export class Ajustes extends Phaser.Scene {

    constructor(){
        super('Ajustes');
    }
     create() {
        this.add.text(400,100, 'Ajustes',
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
}