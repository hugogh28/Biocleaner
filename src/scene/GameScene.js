import Phaser from "phaser";
import { Personajes } from "../entities/Personajes.js";

export class GameScene extends Phaser.Scene{
    constructor() {
        super('GameScene')
    }

    preload() {

        //Fondo
        this.load.image('fondo', 'assets/fondo_juego.png'); 

        //Items
        this.load.image('basura', 'assets/basura.png');
        this.load.image('powerQuoka', 'assets/bayas.png');
        this.load.image('powerNarval', 'assets/pez.png');
        this.load.image('toxicAgua', 'assets/residuo_toxico_agua.png');
        this.load.image('toxicoTierra', 'basura_tierra1.png');

        //Quokka
        this.load.image('quokaFrente', 'assets/quokka_front_view.png');
        this.load.image('quokaAtras', 'assets/quokka_back_view.png');
        this.load.image('quokaIzquierda', 'assets/quokka_side1_view.png');
        this.load.image('quokaDerecha', 'assets/quokka_side_view.png');

        //Con PowerUps
        this.load.image('quokaFrenteP', 'assets/quokka_front_viewG.png');
        this.load.image('quokaAtrasP', 'assets/quokka_back_viewG.png');
        this.load.image('quokaIzquierdaP', 'assets/quokka_side1_viewG.png');
        this.load.image('quokaDerechaP', 'assets/quokka_side_viewG.png');
        
        

        //Narval
        this.load.image('narvalFrente', 'assets/narval_top_view.png');
        this.load.image('narvalAtras', 'assets/narval_down_view.png');
        this.load.image('narvalIzquierda', 'assets/narval_izquierda_view.png');
        this.load.image('narvalDerecha', 'assets/narval_derecha_view.png');
        //Con PowerUps
        this.load.image('narvalFrenteP', 'assets/narval_top_viewG.png');
        this.load.image('narvalAtrasP', 'assets/narval_down_viewG.png');
        this.load.image('narvalIzquierdaP', 'assets/narval_izquierda_viewG.png');
        this.load.image('narvalDerechaP', 'assets/narval_derecha_viewG.png');


        
    }

    init() {
        this.players = new Map();
        this.inputsMapping = [];
        this.isPaused = false;
        this.escWasDown = false;
        this.moving = false;
        this.trashGroup = null;
        this.trashSpawnTimer = null;
        this.powerUpActive = {
            player1: false,
            player2: false
        };

        this.powerUpTimers = {
            player1: null,
            player2: null
        };
        this.powerUpGroup = null;

    } 

    create() {
        this.add.image(400, 300, 'fondo').setOrigin(0.5);
       const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        // Score texts
        this.scoreQuoka = this.add.text(100, 30, '0', {
            fontFamily: "aaaaa",
            fontSize: '38px',
            color: '#d9df5dff',
            fixedWidth: 120,
            align: 'left'
        }).setOrigin(0, 0.5);

        this.scoreNarval = this.add.text(700, 30, '0', {
            fontFamily: "aaaaa",
            fontSize: '38px',
            color: '#d9df5dff',
            fixedWidth: 120,
            align: 'right'
        }).setOrigin(1, 0.5);

        this.createBounds();
        this.setUpPLayers();


        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);


        //Temporizador de 2 minutos
        this.timeLeft = 5; // 2 minutos
        this.timerText = this.add.text(278, 17, "Tiempo: 120", {
            fontFamily: "aaaaa",
            fontSize: "24px",
            color: "#9da23cff"
        });

        // Evento que se ejecuta cada segundo
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        
        this.trashGroup = this.physics.add.group();

        this.trashSpawnTimer = this.time.addEvent({
            delay: 700,
            callback: this.spawnTrash,
            callbackScope: this,
            loop: true
        });

        this.powerUpGroup = this.physics.add.group();

        this.time.addEvent({
            delay: 5000, 
            callback: this.trySpawnPowerUp,
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

    spawnTrash() {
        // Selección aleatoria de jugador (1 o 2)
        const targetPlayer = Phaser.Math.Between(1, 2);

        // Zona del jugador
        let x, y;
        if (targetPlayer === 1) {
            x = Phaser.Math.Between(30, 350);   // Zona izquierda
        } else {
            x = Phaser.Math.Between(450, 770);  // Zona derecha
        }
        y = Phaser.Math.Between(150, 550);

        // Crear basura
        const trash = this.physics.add.sprite(x, y, 'basura');
        
        trash.setDisplaySize(40, 40);
        trash.targetPlayer = targetPlayer;

        this.trashGroup.add(trash);

        this.time.delayedCall(7000, () => {
            if (trash.active) trash.destroy();
        });

        // Colisión basura con cada jugador
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;

        this.physics.add.overlap(p1, trash, () => this.collectTrash(trash, 1));
        this.physics.add.overlap(p2, trash, () => this.collectTrash(trash, 2));
    }

    collectTrash(trash, playerNumber) {
        if (!trash.active) return;

        trash.destroy();

        const player = playerNumber === 1
            ? this.players.get('player1')
            : this.players.get('player2');

        const id = playerNumber === 1 ? "player1" : "player2";

        const multiplier = this.powerUpActive[id] ? 2 : 1;

        player.score += 5 * multiplier;

        if (id === "player1") this.scoreQuoka.setText(player.score);
        else this.scoreNarval.setText(player.score);
    }

    trySpawnPowerUp() {
        const p1 = this.players.get('player1').score;
        const p2 = this.players.get('player2').score;

        let target = null; 
        let chance = 10; 

        if (p1 < p2 - 1) {
            target = "player1";
            chance = 70; 
        } 
        else if (p2 < p1 - 1) {
            target = "player2";
            chance = 70; 
        } 
        else {
            chance = 10; 
            target = Phaser.Math.Between(0, 1) === 0 ? "player1" : "player2";
        }
        if (this.powerUpActive[target]) {
            return;
        }
        const exists = this.powerUpGroup.getChildren().some(obj => obj.targetPlayer === target);
        if (exists) {
            return;
        }

        const roll = Phaser.Math.Between(1, 100);
        if (roll <= chance) {
            this.spawnPowerUp(target);
        }
    }

    spawnPowerUp(playerId) {

        const exists = this.powerUpGroup.getChildren().some(obj => obj.targetPlayer === playerId);
        if (exists) {
            return;
        }

        let x, y, key;

        if (playerId === "player1") {
            key = "powerQuoka"; 
            x = Phaser.Math.Between(50, 350);
        } else {
            key = "powerNarval";
            x = Phaser.Math.Between(450, 750);
        }

        y = Phaser.Math.Between(150, 550);

        const item = this.physics.add.sprite(x, y, key);

        // Escala visual
        item.setScale(0.6);
        item.targetPlayer = playerId;

        this.powerUpGroup.add(item);

        // Escala física 
        item.body.setSize(item.displayWidth, item.displayHeight, true);


        // Tiempo en pantalla SIN recoger
        item.lifetime = this.time.delayedCall(15000, () => {
            if (item.active) item.destroy();
        });

        // Colisiones
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;

        this.physics.add.overlap(p1, item, () => this.pickPowerUp(item, "player1"));
        this.physics.add.overlap(p2, item, () => this.pickPowerUp(item, "player2"));
    }

    pickPowerUp(powerUp, playerId) {
        if (!powerUp.active) return;

        powerUp.destroy();

        // Activar el efecto
        this.powerUpActive[playerId] = true;

        // Cancelar un efecto previo si ya tenía uno
        if (this.powerUpTimers[playerId]) {
            this.powerUpTimers[playerId].remove(false);
        }

        this.powerUpTimers[playerId] = this.time.delayedCall(10000, () => {
            this.powerUpActive[playerId] = false;
            this.players.get(playerId).setSprite("down");
        });
        this.players.get(playerId).setSprite("down");
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

    getWinner(){
        if(this.players.get("player1").score > this.players.get("player2").score) return "player1";
        else if(this.players.get("player2").score > this.players.get("player1").score) return "player2";
        return "draw";
    }

    endGame(){
        const winnerID = this.getWinner();
        this.players.forEach(Personajes =>{
            Personajes.sprite.setVelocity(0,0);
        });
        this.physics.pause();
        if (this.trashSpawnTimer) this.trashSpawnTimer.remove(false);
        this.trashGroup.clear(true, true);
        this.scene.start('GameOverScene', {winnerID});
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
                if (Personajes.sprite.x < -2) {
                    Personajes.sprite.x = -2;
                }
                if (Personajes.sprite.x > 400) {
                    Personajes.sprite.x = 400;
                }
                if (Personajes.sprite.y < 115) {
                    Personajes.sprite.y = 115;
                }
                if (Personajes.sprite.y > 555) {
                    Personajes.sprite.y = 555;
                }
            }

            if (mapping.playerId === "player2") {
                if (Personajes.sprite.x < 400 ) {
                    Personajes.sprite.x = 400;
                }
                if (Personajes.sprite.x > 755) {
                    Personajes.sprite.x = 755;
                }
                if (Personajes.sprite.y < 115 ) {
                    Personajes.sprite.y = 115;
                }
                if (Personajes.sprite.y > 555) {
                    Personajes.sprite.y = 555;
                }
            }
        });

        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}
