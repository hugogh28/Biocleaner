import Phaser from 'phaser';
export class PauseScene extends Phaser.Scene{
    constructor(){
        super('PauseScene');
    }
    create(date){
        this.add.rectangle(400,300,800,600, 0xc945a8, 0.7);
    }
}