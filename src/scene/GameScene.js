import Phaser from "phaser";
import { Personajes } from "../entities/Personajes.js";

export class GameScene extends Phaser.Scene{
    constructor() {
        super('GameScene')
    }

    preload() {
        //Quokka
        this.load.image('quokaFrente', 'assets/quokka_front_view.png');
        this.load.image('quokaAtras', 'assets/quokka_back_view.png');
        

        //Narval
        this.load.image('narvalFrente', 'assets/narval_top_view.png');
        this.load.image('narvalAtras', 'assets/narval_down_view.png');
        this.load.image('narvalIzquierda', 'assets/narval_izquierda_view.png');
        this.load.image('narvalDerecha', 'assets/narval_derecha_view.png');
    }

    init() {
        this.players = new Map();
        this.inputsMapping = [];
        this.isPaused = false;
        this.escWasDown = false;
        this.moving = false;
    } 

    create() {
       
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


        //Temporizador de 2 minutos
        this.timeLeft = 120; // 2 minutos
        this.timerText = this.add.text(300, 20, "Tiempo: 120", {
            fontSize: "32px",
            color: "#ffffffff"
        });

        // Evento que se ejecuta cada segundo
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }


    updateTimer() {
        this.timeLeft--;

        this.timerText.setText("Tiempo: " + this.timeLeft);

        if (this.timeLeft <= 0) {
            this.timerEvent.remove(false);
            this.endGame();
        }
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
                Personajes.sprite.setVelocityX(0);
                Personajes.setSprite("up");
            }else if(mapping.downKeyObj.isDown){
                Personajes.sprite.setVelocityY(+Personajes.baseSpeed);
                Personajes.sprite.setVelocityX(0);
                Personajes.setSprite("down");
            }else if(mapping.leftKeyObj.isDown){
                Personajes.sprite.setVelocityX(-Personajes.baseSpeed);
                Personajes.sprite.setVelocityY(0);
                Personajes.setSprite("left");
            }else if(mapping.rightKeyObj.isDown){
                Personajes.sprite.setVelocityX(+Personajes.baseSpeed);
                Personajes.sprite.setVelocityY(0);
                Personajes.setSprite("right");
            }else{
                Personajes.sprite.setVelocity(0,0);
                Personajes.setSprite("down");
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
