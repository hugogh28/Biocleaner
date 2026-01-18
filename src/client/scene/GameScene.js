import Phaser from "phaser";
import { Personajes } from "../entities/Personajes.js";
import { connectionManager } from '../services/ConnectionManager';


export class GameScene extends Phaser.Scene{
    constructor() {
        super('GameScene')
    }

    preload() {

        //Fondo
        this.load.image('fondo', 'assets/Fondos/fondo_juego.png'); 

        //Items
        this.load.image('basura', 'assets/Items/basura.png');
        this.load.image('vertido', 'assets/Items/basura_tierra1.png');
        this.load.image('vertido1', 'assets/Items/residuo_toxico_agua.png');
        this.load.image('pringue', 'assets/Items/cubo.png');
        this.load.image('powerQuoka', 'assets/Items/bayas.png');
        this.load.image('powerNarval', 'assets/Items/pez.png');
        this.load.image('toxicAgua', 'assets/Items/residuo_toxico_agua.png');
        this.load.image('toxicoTierra', 'assets/Items/basura_tierra1.png');

        //Quokka
        this.load.spritesheet('quokkaFrente', 'assets/Quokka/quokka_front_view_animation.png', {
            frameWidth:256,
            frameHeight: 256
        });
        this.load.spritesheet('quokkaAtras', 'assets/Quokka/quokka_back_view_animation.png', {
            frameWidth:256,
            frameHeight: 256
        });
        this.load.spritesheet('quokkaIzquierda', 'assets/Quokka/quokka_side2_view-animation.png', {
            frameWidth:256,
            frameHeight: 256
        });
        this.load.spritesheet('quokkaDerecha', 'assets/Quokka/quokka_side1_view-animation.png', {
            frameWidth:256,
            frameHeight: 256
        });

        //Con PowerUps
        this.load.image('quokaFrenteP', 'assets/Quokka/quokka_front_viewG.png');
        this.load.image('quokaAtrasP', 'assets/Quokka/quokka_back_viewG.png');
        this.load.image('quokaIzquierdaP', 'assets/Quokka/quokka_side1_viewG.png');
        this.load.image('quokaDerechaP', 'assets/Quokka/quokka_side_viewG.png');

        //Afectado por el pringue
        this.load.image('pringueQuokka', 'assets/Quokka/basura_tierra3.png');
                

        //Narval
        this.load.spritesheet('narvalFrente', 'assets/Narval/narval_down_view-animation.png', {
            frameWidth:256,
            frameHeight: 256
        });
        this.load.spritesheet('narvalAtras', 'assets/Narval/narval_top_view-animation.png', {
            frameWidth:256,
            frameHeight: 256
        });
        this.load.spritesheet('narvalIzquierda', 'assets/Narval/narval_side2_view-animation.png', {
            frameWidth:256,
            frameHeight: 256
        });
        this.load.spritesheet('narvalDerecha', 'assets/Narval/narval_side1_view-animation.png', {
            frameWidth:256,
            frameHeight: 256
        });

        //Con PowerUps
        this.load.image('narvalFrenteP', 'assets/Narval/narval_top_viewG.png');
        this.load.image('narvalAtrasP', 'assets/Narval/narval_down_viewG.png');
        this.load.image('narvalIzquierdaP', 'assets/Narval/narval_izquierda_viewG.png');
        this.load.image('narvalDerechaP', 'assets/Narval/narval_derecha_viewG.png');

        //Afectado por el pringue
        this.load.image('pringueNarval', 'assets/Narval/residuo_toxico_aguaS.png');

        //Efectos de sonido
        this.load.audio('recogerBasura', 'assets/Sonido/recogerBasura.mp3');
        this.load.audio('pleugh1', 'assets/Sonido/pleugh.mp3');
        this.load.audio('pleugh2', 'assets/Sonido/pluh.mp3');
        this.load.audio('powerUpSound', 'assets/Sonido/powerUp.mp3');
        this.load.audio('finTemporizador', 'assets/Sonido/temp2.mp3');
        this.load.audio('gaviota', 'assets/Sonido/gaviota.mp3');
        this.load.audio('musica_juego', 'assets/Sonido/Audio Juego.m4a');
    }

    init() {
        //Iniciar variables
        this.players = new Map();
        this.inputsMapping = [];
        this.isPaused = false;
        this.escWasDown = false;
        this.moving = false;
        this.spillGroup = null;
        this.spillSpawnTimer = null;
        this.trashGroup = null;
        this.trashSpawnTimer = null;
        this.stickySpawnTimer = {
            player1: null,
            player2: null
        };
        this.stickyGroup = null;
        this.stickyActive = {
            player1: false,
            player2: false
        };
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
        //añadir fondo y su brillo
        this.add.image(400, 300, 'fondo').setOrigin(0.5);
       const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.createAnimations();
        // Texto Puntuacion
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

        //crear limites de los jugadores y preparar dichos jugadores
        this.createBounds();
        this.setUpPLayers();


        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);


        //Temporizador de 2 minutos
        this.timeLeft = 120; // 2 minutos
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

        //Generación de pringue
        this.stickyGroup = this.physics.add.group();

        this.stickySpawnTimer = this.time.addEvent({
            delay: 10000,
            callback: this.spawnSticky,
            callbackScope: this,
            loop: true
        })
        
        //Generación de basura
        this.trashGroup = this.physics.add.group();

        this.trashSpawnTimer = this.time.addEvent({
            delay: 700,
            callback: this.spawnTrash,
            callbackScope: this,
            loop: true
        });

        //Generación de Power Ups
        this.powerUpGroup = this.physics.add.group();

        this.time.addEvent({
            delay: 5000, 
            callback: this.trySpawnPowerUp,
            callbackScope: this,
            loop: true
        }); 

        //Generación de vertidos
        this.spillGroup = this.physics.add.group();

        this.spillSpawnTimer = this.time.addEvent({
            delay: 5000,
            callback: this.spawnSpill,
            callbackScope: this,
            loop: true
        });

        //Sonido de gaviota
        this.seagullSoundTimer = this.time.addEvent({
            delay: 15000,
            callback: this.tryPlaySound,
            callbackScope: this,
            loop: true
        })


        /// Efectos de sonido
        const settings = this.plugins.get("GlobalSettings");
        const sfxVol = settings.getSfxVolume();

        this.recogerBasura = this.sound.add('recogerBasura', {
            volume: sfxVol,
            loop: false
        });
        this.pleugh1 = this.sound.add('pleugh1', {
            volume: sfxVol,
            loop: false
        });
        this.pleugh2 = this.sound.add('pleugh2', {
            volume: sfxVol,
            loop: false
        });
        this.powerUpSound = this.sound.add('powerUpSound', {
            volume: sfxVol,
            loop: false
        });
        this.tiempoMuerto = this.sound.add('finTemporizador', {
            volume: sfxVol,
            loop: false
        });
        this.gaviota = this.sound.add('gaviota',{
            volume: sfxVol/20,
            loop: false
        });


        
        this.events.on("resume", () => {
            const settings = this.plugins.get("GlobalSettings");
            const v = settings.getSfxVolume();

            this.recogerBasura.setVolume(v);
            this.pleugh1.setVolume(v);
            this.pleugh2.setVolume(v);
            this.powerUpSound.setVolume(v);
            this.tiempoMuerto.setVolume(v);
            this.gaviota.setVolume(v/20);
        });

        //Musica de fondo

        this.musica = this.sound.add("musica_juego", {
            volume: settings.getMusicVolume(),
            loop: false
        });
        this.musica.play();  
        this.events.on("resume", () => {
        const settings = this.plugins.get("GlobalSettings");
        const v = settings.getMusicVolume();

        // Busca TODAS las músicas en la escena
        this.sound.sounds.forEach(sound => {
                if (sound.key.includes("musica")) {
                    sound.setVolume(v);
                }
            });
        });

        this.events.on('shutdown', () => {
            if (this.musica) {
                this.musica.stop();
                this.musica.destroy();
            }
        });


        this.connectionListener = (data) => {
            if(!data.connected && this.scene.isActive()){
                this.onConnectionLost();
            }
        };
        connectionManager.addListener(this.connectionListener);
                
    }

    onConnectionLost(){
        this.scene.pause();
        this.scene.launch('ConnectionLostScene', { previousScene: 'GameScene'});
    }

    updateTimer() {
        this.timeLeft--;

        this.timerText.setText("Tiempo: " + this.timeLeft);

        if (this.timeLeft <= 0) {
            this.timerEvent.remove(false);
            this.endGame();
        }
    }

    createAnimations(){
        //Quokka
        this.anims.create({
            key: 'quokka_walk_front',
            frames: this.anims.generateFrameNumbers('quokkaFrente', {start: 0, end:3}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'quokka_walk_back',
            frames: this.anims.generateFrameNumbers('quokkaAtras', {start: 0, end:3}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'quokka_walk_left',
            frames: this.anims.generateFrameNumbers('quokkaIzquierda', {start: 0, end:2}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'quokka_walk_right',
            frames: this.anims.generateFrameNumbers('quokkaDerecha', {start: 0, end:2}),
            frameRate: 10,
            repeat: -1
        });

        //Narval
        this.anims.create({
            key: 'narval_walk_front',
            frames: this.anims.generateFrameNumbers('narvalFrente', {start: 0, end:2}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'narval_walk_back',
            frames: this.anims.generateFrameNumbers('narvalAtras', {start: 0, end:2}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'narval_walk_left',
            frames: this.anims.generateFrameNumbers('narvalIzquierda', {start: 0, end:2}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'narval_walk_right',
            frames: this.anims.generateFrameNumbers('narvalDerecha', {start: 0, end:2}),
            frameRate: 10,
            repeat: -1
        })
    }

    setUpPLayers() {
        const quokka = new Personajes(this, 'player1', 50, 300);
        const narval = new Personajes(this, 'player2', 750, 300);
        this.players.set('player1', quokka);
        this.players.set('player2', narval);
        //Los inputs de cada jugador
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

    tryPlaySound(){
        let chance = 20;
        const roll = Phaser.Math.Between(1, 100);
        if(roll <= chance){
            this.gaviota.play();
        }
    }

    overlapVar(x,y,grupo){
        var overlap = grupo.getChildren().some(child =>{
            return(
                Math.abs(child.x-x) < 40 &&
                Math.abs(child.y-y) < 40
            );
        });
        return overlap;
    }

    antiOverlap(x1,y1,x2,y2,p1,p2){
        let x,y;
        let iteration = 0;
        do{
            x = Phaser.Math.Between(x1,y1);
            y = Phaser.Math.Between(x2,y2);
            
            var overlapTrash = this.overlapVar(x,y,this.trashGroup);
            var overlapPowerUp = this.overlapVar(x,y,this.stickyGroup);
            var overlapSticky = this.overlapVar(x,y,this.powerUpGroup);
            var overlapSpill = this.overlapVar(x,y,this.spillGroup);
            
            var overlapNarval = Math.abs(p2.x-x)<60 && Math.abs(p2.y-y)<60 === true ? true : false;
            var overlapQuokka = Math.abs(p1.x-x)<60 && Math.abs(p1.y-y)<60 === true ? true : false;

            iteration++;
        }while((overlapTrash || overlapPowerUp || overlapSticky || overlapSpill || overlapNarval || overlapQuokka) && iteration<4);
        return {x, y};
    }

    trySpawn(chance, effectActive){
        const p1 = this.players.get('player1').score;
        const p2 = this.players.get('player2').score;
        let target;
        target = null;
        //let chance;
        if(p1 < p2-1){
            target = 1;
            chance;
        }else if(p2 < p1-1){
            target = 2;
            chance;
        }else{
            chance = 10;
            target = Phaser.Math.Between(0, 1) === 0 ? 1 : 2;
        }
        if(effectActive[target]){ 
            return;
        }
        const roll = Phaser.Math.Between(1,100);
        if(roll <= chance){
            return target;
        }
    }

    trySpawnSticky() {
        let target;
        target = this.trySpawn(50, this.stickyActive);
        if(target!=null){
            this.spawnSticky();
        }
    }

    //Los trySpawn y los spawnPowerUp son iguales en base solo cambia el tipo de objeto
    trySpawnPowerUp() {
        let target;
        target=this.trySpawn(70, this.powerUpActive)
        if(target!=null){
            this.spawnPowerUp(target);
        }
    }

    spawn(targetPlayer,x11,y11,x21,y21, x12,y12,x22,y22, key1, key2, spriteSize, objectGroup, tiempoEnPantalla,p1,p2){
        let x,y;
        let object;
        if(targetPlayer === 1){
            ({x,y} = this.antiOverlap(x11,y11,x21,y21,p1,p2));
            object = this.physics.add.sprite(x,y,key1);
        }else {
            ({x,y} = this.antiOverlap(x12,y12,x22,y22,p1,p2));
            object = this.physics.add.sprite(x,y,key2);
        }

        object.setDisplaySize(spriteSize,spriteSize);
        objectGroup.add(object); 

        this.time.delayedCall(tiempoEnPantalla, () =>{
            if(object.active) object.destroy();
        });

        return object;
    }

    spawnSticky(targetPlayer){
        //Colisión del pringue con cada jugador
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;
        
        let sticky = this.spawn(targetPlayer, 400,400,150,550, 400,400,150,550, "pringue", "pringue", 40, this.stickyGroup, 7000,p1,p2);

        this.physics.add.overlap(p1, sticky, () => this.throwSticky(sticky, 2, 10));
        this.physics.add.overlap(p2, sticky, () => this.throwSticky(sticky, 1, 10));
    }

    spawnTrash() {
        // Selección aleatoria de jugador (1 o 2)
        const targetPlayer = Phaser.Math.Between(1, 2);

        // Colisión basura con cada jugador
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;

        let trash = this.spawn(targetPlayer, 30,340,150,550, 460,770,150,550, "basura","basura", 40, this.trashGroup, 7000,p1,p2);

        this.physics.add.overlap(p1, trash, () => this.collect(trash, 1, 5));
        this.physics.add.overlap(p2, trash, () => this.collect(trash, 2, 5));
    }

    spawnSpill() {
        // Selección aleatoria de jugador (1 o 2)
        const targetPlayer = Phaser.Math.Between(1, 2);

        // Colisión basura con cada jugador
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;

        let spill = this.spawn(targetPlayer, 30,340,150,550, 460,770,150,550, "vertido","vertido1", 80, this.spillGroup, 7000,p1,p2);

        this.physics.add.overlap(p1, spill, () => this.collect(spill, 1, 10));
        this.physics.add.overlap(p2, spill, () => this.collect(spill, 2, 10));
    }

    spawnPowerUp(playerId) {
        // Colisiones
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;

        let powerUp = this.spawn(playerId, 50,340,150,550, 460,750,150,550, "powerQuoka","powerNarval", 120, this.powerUpGroup, 15000,p1,p2);

        this.physics.add.overlap(p1, powerUp, () => this.pickPowerUp(powerUp, "player1"));
        this.physics.add.overlap(p2, powerUp, () => this.pickPowerUp(powerUp, "player2"));
    }

    throwSticky(sticky, playerNumber, score){
        if(!sticky.active) return;

        this.pleugh2.play();
        sticky.destroy();

        //Consigue que jugador la lanza
        const player = playerNumber === 1 ? this.players.get('player1') : this.players.get('player2');

        const id = playerNumber === 1 ? "player1" : "player2";

        this.stickyActive[id] = true;

        //Quita puntuacion
        if(player.score >= score){
        player.score -= score;
        }
        if(this.powerUpActive[id]){
            this.powerUpActive[id] = false;
            this.stickyActive[id] = false;
        }

        if(id === "player1") this.scoreQuoka.setText(player.score);
        else this.scoreNarval.setText(player.score);
        

        this.stickySpawnTimer[id] = this.time.delayedCall(2000, () => {
            this.stickyActive[id] = false;
            //this.inputsMapping.resume();
            this.players.get(id).setSprite("down");
        });
        this.players.get(id).setSprite("down");
    }
    
    //Recoge el residuo y da la puntuación correcta
    collect(object, playerNumber, score){
        if(!object.active) return;
        
        this.recogerBasura.play();
        object.destroy();

        const player = playerNumber === 1 ? this.players.get('player1') : this.players.get('player2');
        const id = playerNumber === 1 ? "player1" : "player2";

        const multiplier = this.powerUpActive[id] ? 2 : 1;

        player.score += score*multiplier;

        if(id === "player1") this.scoreQuoka.setText(player.score);
        else this.scoreNarval.setText(player.score);
    }

    pickPowerUp(powerUp, playerId) {
        if (!powerUp.active) return;

        this.powerUpSound.play();
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
    //Zona que puedan ir cada jugador
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
    //Finalizar el juego
    endGame(){

        this.tiempoMuerto.play();
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
            let isMoving = false;
            let currentDirection = null;

            if(mapping.upKeyObj.isDown){
                Personajes.sprite.setVelocityY(-Personajes.baseSpeed);
                Personajes.sprite.setVelocityX(0);
                currentDirection = "up";
                isMoving = true;
            }else if(mapping.downKeyObj.isDown){
                Personajes.sprite.setVelocityY(+Personajes.baseSpeed);
                Personajes.sprite.setVelocityX(0);
                currentDirection = "down";
                isMoving = true;
            }else if(mapping.leftKeyObj.isDown){
                Personajes.sprite.setVelocityX(-Personajes.baseSpeed);
                Personajes.sprite.setVelocityY(0);
                currentDirection = "left";
                isMoving = true;
            }else if(mapping.rightKeyObj.isDown){
                Personajes.sprite.setVelocityX(+Personajes.baseSpeed);
                Personajes.sprite.setVelocityY(0);
                currentDirection = "right";
                isMoving = true;
            }else{
                Personajes.sprite.setVelocity(0,0);
                currentDirection = Personajes.lastDirection || "down";
                isMoving = false;
            }

            // Aplicar sprite con el estado de movimiento
            Personajes.setSprite(currentDirection, isMoving);

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
