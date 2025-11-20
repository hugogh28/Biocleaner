import Phaser from "phaser";
import { Personajes } from "../entities/Personajes.js";

export class GameScene extends Phaser.Scene{
    constructor() {
        super('GameScene')
    }

    init() {
        this.players = new Map();
        this.inputsMapping = [];
        this.isPaused = false;
        this.escWasDown = false;
        this.moving = false;
    } 

    create() {
        for (let i = 0; i < 17;i++){
            this.add.rectangle(400, i * 50 + 25, 10, 50, 0xffffffff);
        }

        // Score texts
        this.scoreQuoka = this.add.text(100, 50, '0', {
            fontSize: '48px',
            color: '#ffffffff'
        })

        this.scoreNarval = this.add.text(700, 50, '0', {
            fontSize: '48px',
            color: '#ffffffff'
        })
        this.createBounds();
        this.setUpPLayers();


        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    setUpPLayers() {
        const quoka = new Personajes(this, 'player1', 50, 300);
        const narval = new Personajes(this, 'player2', 750, 300);
        this.players.set('player1', quoka);
        this.players.set('player2', narval);

        const InputConfig = [
            {
                playerId: 'player1',
                upKey: 'W',
                downKey: 'S',
                leftKey: 'A',
                rightKey: 'D',
            }, 
            {
                playerId: 'player2',
                upKey: 'UP',
                downKey: 'DOWN',
                leftKey: 'LEFT',
                rightKey: 'RIGHT',
            }
        ];
        this.inputsMapping = InputConfig;
        this.inputsMapping = this.inputsMapping.map(config => {
            return {
                playerId: config.playerId,
                upKeyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[config.upKey]),
                downKeyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[config.downKey]),
                leftKeyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[config.leftKey]),
                rightKeyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[config.rightKey]),
            }
        });
    }

    scoreNarvalGoal() {
        if(!this.moving){
            return;
        }
        const player2 = this.players.get('player2');
        player2.score += 1;
        this.scoreNarval.setText(player2.score.toString());
        this.moving=false;
        if(player2.score >= 2){
            this.endGame("player2");
        }
    }

    scoreQuokaGoal() {
        if(!this.moving){
            return;
        }
        const player1 = this.players.get('player1');
        player1.score += 1;
        this.scoreQuoka.setText(player1.score.toString());
        this.moving=false;
        if(player1.score >= 2){
            this.endGame("player1");
        }
    }


    createBounds() {
        this.QuokaGoal = this.physics.add.sprite(0, 300, null);
        this.QuokaGoal.setDisplaySize(10, 600);
        this.QuokaGoal.body.setSize(10, 600);
        this.QuokaGoal.setImmovable(false);
        this.QuokaGoal.setVisible(false);

        this.NarvalGoal = this.physics.add.sprite(800, 300, null);
        this.NarvalGoal.setDisplaySize(10, 600);
        this.NarvalGoal.body.setSize(10, 600);
        this.NarvalGoal.setImmovable(false);
        this.NarvalGoal.setVisible(false);
    }

   

    endGame(winnerID){
        this.players.forEach(Personajes =>{
            Personajes.sprite.setVelocity(0,0);
        });
        this.physics.pause();

        const winnerText = winnerID === 'player1' ? 'Gana Quoka!' : 'Gana Narval';

        this.add.text(400,250, winnerText, {
            fontSize: '64px',
            color: '#9f6e04ff',
        }).setOrigin(0.5);

        const menuBtn = this.add.text(400,300, 'Volver al menu', {
            fontSize: '32px',
            color: '#9f6e04ff',
        }).setOrigin(0.5)
        .setInteractive({useHandCursor : true})
        .on('pointerover', () => menuBtn.setColor('#05ff1aff'))
        .on('pointerout', () => menuBtn.setColor('#434ddeff'))
        .on('pointerdown', () =>{
            this.scene.start('MenuScene');
        });

    }

    setPauseState(isPaused){
        this.isPaused  = isPaused;

        if(this.isPaused){
            this.scene.launch('PauseScene', {originalScene: 'GameScene'});
            this.scene.pause();
        }
    }
    togglePause(){
        const newPausedState = ! this.isPaused;
        this.setPauseState(newPausedState);
    }
    resume(){
        this.isPaused = false;
    }

    update(){
        if(this.escKey.isDown){
            this.togglePause();
        }
        this.inputsMapping.forEach(mapping=>{
            const Personajes = this.players.get(mapping.playerId);
            if(mapping.upKeyObj.isDown){
                Personajes.sprite.setVelocityY(-Personajes.baseSpeed);
                Personajes.sprite.setVelocityX(0); //Bloquea el movimiento para evitar que el personaje vaya en diagonal
            }else if(mapping.downKeyObj.isDown){
                Personajes.sprite.setVelocityY(+Personajes.baseSpeed);
                Personajes.sprite.setVelocityX(0);
            }else if(mapping.leftKeyObj.isDown){
                Personajes.sprite.setVelocityX(-Personajes.baseSpeed);
                Personajes.sprite.setVelocityY(0);
            }else if(mapping.rightKeyObj.isDown){
                Personajes.sprite.setVelocityX(+Personajes.baseSpeed);
                Personajes.sprite.setVelocityY(0);
            }else{
                Personajes.sprite.setVelocityY(0);
                Personajes.sprite.setVelocityX(0);
            }

            //Limitamos el movimiento a la mitad de la pantalla para que no puedan pasar al otro lado
            if (mapping.playerId === "player1") {
                if (Personajes.sprite.x < 0) {
                    Personajes.sprite.x = 0;
                }
                if (Personajes.sprite.x > 400) {
                    Personajes.sprite.x = 400;
                }
            }

            if (mapping.playerId === "player2") {
                if (Personajes.sprite.x < 400) {
                    Personajes.sprite.x = 400;
                }
                if (Personajes.sprite.x > 800) {
                    Personajes.sprite.x = 800;
                }
            }
        
        });
    }
}
