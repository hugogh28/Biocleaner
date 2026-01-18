import Phaser from 'phaser';
import { connectionManager } from '../services/ConnectionManager';
import { Personajes } from '../entities/Personajes';

/**
 * Multiplayer Game Scene - Online pong game
 * Ball physics run on both clients (deterministic)
 * Server only tracks scores and relays paddle positions
 */
export class MultiplayerGameScene extends Phaser.Scene {
    
    constructor() {
        super('MultiplayerGameScene');
        
    }
    
    preload() {
        // Fondo
        this.load.image('fondo', 'assets/Fondos/fondo_juego.png'); 

        // Items
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

        // Efectos de sonido
        this.load.audio('recogerBasura', 'assets/Sonido/recogerBasura.mp3');
        this.load.audio('pleugh1', 'assets/Sonido/pleugh.mp3');
        this.load.audio('pleugh2', 'assets/Sonido/pluh.mp3');
        this.load.audio('powerUpSound', 'assets/Sonido/powerUp.mp3');
        this.load.audio('finTemporizador', 'assets/Sonido/temp2.mp3');
        this.load.audio('gaviota', 'assets/Sonido/gaviota.mp3');
        this.load.audio('musica_juego', 'assets/Sonido/Audio Juego.m4a');
    }

    init(data) {
        this.ws = data.ws;
        this.playerRole = data.playerRole; // 'player1' or 'player2'
        this.roomId = data.roomId;

        this.isPaused = false;
        this.gameEnded = false;

        this.localJugador = null;
        this.remoteJugador = null;
        this.localScore = 0;
        this.remoteScore = 0;

        // Initialize properties
        this.players = null;
        this.powerUpActive = null;
        this.stickyActive = null;
        this.powerUpTimers = null;
        this.trashGroup = null;
        this.powerUpGroup = null;
        this.stickyGroup = null;
        this.spillGroup = null;

        this.stickySpawnTimer = {
            'player1': null,
            'player2': null
        };

        this.endAt = data.endAt || null;
    }

    create() {
        // Añadir fondo y su brillo
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

        // Role indicator
        const roleText = this.playerRole === 'player1' ? 'Eres el Quokka' : 'Eres el Narval';
        this.add.text(400, 20, roleText, {
            fontSize: '16px',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Crear límites de los jugadores y preparar dichos jugadores
        this.createBounds();
        this.setUpPlayers();

        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Temporizador de 2 minutos
        this.timerText = this.add.text(278, 17, "Tiempo: --", {
            fontFamily: "aaaaa",
            fontSize: "24px",
            color: "#9da23cff"
        });


        //Grupos de objetos
        this.stickyGroup = this.physics.add.group();
        this.trashGroup = this.physics.add.group();
        this.powerUpGroup = this.physics.add.group();
        this.spillGroup = this.physics.add.group();

        if(this.playerRole === 'player1'){
            this.stickyGenerationTimer = this.time.addEvent({
                delay: 10000,
                callback: this.spawnSticky,
                callbackScope: this,
                loop: true
            });
        
        // Generación de basura
        
            this.trashSpawnTimer = this.time.addEvent({
                delay: 700,
                callback: this.spawnTrash,
                callbackScope: this,
                loop: true
            });

        // Generación de Power Ups
        
            this.time.addEvent({
                delay: 5000, 
                callback: this.trySpawnPowerUp,
                callbackScope: this,
                loop: true
            }); 

        // Generación de vertidos
        
            this.spillSpawnTimer = this.time.addEvent({
                delay: 5000,
                callback: this.spawnSpill,
                callbackScope: this,
                loop: true
            });
        }
        
        // Sonido de gaviota
        this.seagullSoundTimer = this.time.addEvent({
            delay: 15000,
            callback: this.tryPlaySound,
            callbackScope: this,
            loop: true
        });

        // Efectos de sonido
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
        this.gaviota = this.sound.add('gaviota', {
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

        // Música de fondo
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

        // Set up WebSocket listeners
        this.setupWebSocketListeners();

        // Set up input - ambos jugadores usan flechas
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    onConnectionLost() {
        this.scene.pause();
        this.scene.launch('ConnectionLostScene', { previousScene: 'GameScene'});
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

    setUpPlayers() {
        // Create players based on player role
        if (this.playerRole === 'player1') {
            this.localJugador = new Personajes(this, 'player1', 50, 300);
            this.remoteJugador = new Personajes(this, 'player2', 750, 300);
        } else {
            this.localJugador = new Personajes(this, 'player2', 750, 300);
            this.remoteJugador = new Personajes(this, 'player1', 50, 300);
        }
        
        // Initialize player tracking
        this.players = new Map();
        this.players.set('player1', this.playerRole === 'player1' ? this.localJugador : this.remoteJugador);
        this.players.set('player2', this.playerRole === 'player2' ? this.localJugador : this.remoteJugador);
        
        // Initialize state tracking
        this.powerUpActive = {
            'player1': false,
            'player2': false
        };
        
        this.stickyActive = {
            'player1': false,
            'player2': false
        };
        
        this.powerUpTimers = {
            'player1': null,
            'player2': null
        };
        
        // Initialize scores
        this.localJugador.score = 0;
        this.remoteJugador.score = 0;
    }

    setupWebSocketListeners() {
        if (!this.ws) {
            console.error('[MultiplayerGameScene] No hay WebSocket. ¿Entraste sin pasar por LobbyScene?');
            this.handleDisconnection(); 
            return;
        }
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            } catch (error) {
                console.error('Error parsing server message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            if (!this.gameEnded) {
                this.handleDisconnection();
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (!this.gameEnded) {
                this.handleDisconnection();
            }
        };
    }

    tryPlaySound() {
        let chance = 20;
        const roll = Phaser.Math.Between(1, 100);
        if(roll <= chance){
            this.gaviota.play();
        }
    }
    
    overlapVar(x, y, grupo) {
        var overlap = grupo.getChildren().some(child => {
            return (
                Math.abs(child.x - x) < 40 &&
                Math.abs(child.y - y) < 40
            );
        });
        return overlap;
    }
    
    antiOverlap(x1, y1, x2, y2, p1, p2) {
        let x, y;
        let iteration = 0;
        do {
            x = Phaser.Math.Between(x1, y1);
            y = Phaser.Math.Between(x2, y2);
            
            var overlapTrash = this.overlapVar(x, y, this.trashGroup);
            var overlapPowerUp = this.overlapVar(x, y, this.stickyGroup);
            var overlapSticky = this.overlapVar(x, y, this.powerUpGroup);
            var overlapSpill = this.overlapVar(x, y, this.spillGroup);
                
            var overlapNarval = Math.abs(p2.x - x) < 60 && Math.abs(p2.y - y) < 60;
            var overlapQuokka = Math.abs(p1.x - x) < 60 && Math.abs(p1.y - y) < 60;
    
            iteration++;
        } while((overlapTrash || overlapPowerUp || overlapSticky || overlapSpill || overlapNarval || overlapQuokka) && iteration < 4);
        return {x, y};
    }
    
    handleServerMessage(data) {
        switch (data.type) {
            case 'playerUpdate':
                // Update opponent's player position
                if (this.remoteJugador) {
                    this.remoteJugador.sprite.x = data.x;
                    this.remoteJugador.sprite.y = data.y;
                    if (data.direction && this.remoteJugador.setSprite) {
                        this.remoteJugador.setSprite(data.direction);
                    }
                }
                break;

            case 'scoreUpdate':
                // Update scores from server
                //this.localScore = this.playerRole === 'player1' ? data.player1Score : data.player2Score;
                //this.remoteScore = this.playerRole === 'player1' ? data.player2Score : data.player1Score;
                console.log('Puntuación recibida del servidor:', data);

                this.localScore = data.player1Score;
                this.remoteScore = data.player2Score;

                this.scoreQuoka.setText(data.player1Score.toString());
                this.scoreNarval.setText(data.player2Score.toString());
                break;

            case 'syncObjects':
                this.createSyncedObjects(data);
                break;

            case 'delObjects':
                this.deleteObjectById(data.objectType, data.id);
                break;

            case 'gameOver':
                this.endGame(data.winner, data.player1Score, data.player2Score);
                break;

            case 'playerDisconnected':
                this.handleDisconnection();
                break;

            case 'timerSync':
                console.log('[TIMER SYNC RECIBIDO]', data);
                this.endAt = data.endAt;
                break;

            case 'gameOverTime':
                this.endGame(null, data.player1Score, data.player2Score);
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    }

    createSyncedObjects(data){
        data.stickyGroup.forEach(obj => {
            const exists = this.stickyGroup.getChildren().some(child => 
                child.objectId === obj.id
            );
            
            if (!exists) {
                const key = 'pringue';
                const sprite = this.physics.add.sprite(obj.x, obj.y, key);
                sprite.setDisplaySize(obj.size, obj.size);
                sprite.objectId = obj.id;
                sprite.objectType = 'sticky';
                this.stickyGroup.add(sprite);
                this.addCollisionsForObject(sprite, 'sticky');
                
                console.log(`[P2 SYNC] Creado powerUp con ID ${obj.id}`);
            }
        });

        data.trashGroup.forEach(obj => {
            const exists = this.trashGroup.getChildren().some(child => 
                child.objectId === obj.id
            );
            
            if (!exists) {
                const key = 'basura';
                const sprite = this.physics.add.sprite(obj.x, obj.y, key);
                sprite.setDisplaySize(obj.size, obj.size);
                sprite.objectId = obj.id;
                sprite.objectType = 'trash';
                this.trashGroup.add(sprite);
                this.addCollisionsForObject(sprite, 'trash');
                
                console.log(`[P2 SYNC] Creado powerUp con ID ${obj.id}`);
            }
        });

        // PowerUps necesitan lógica especial por las diferentes imágenes
        data.powerUpGroup.forEach(obj => {
            const exists = this.powerUpGroup.getChildren().some(child => 
                child.objectId === obj.id
            );
            
            if (!exists) {
                const key = obj.x <= 400 ? 'powerQuoka' : 'powerNarval';
                const sprite = this.physics.add.sprite(obj.x, obj.y, key);
                sprite.setDisplaySize(obj.size, obj.size);
                sprite.objectId = obj.id;
                sprite.objectType = 'powerUp';
                this.powerUpGroup.add(sprite);
                this.addCollisionsForObject(sprite, 'powerUp');
                
                console.log(`[P2 SYNC] Creado powerUp con ID ${obj.id}`);
            }
        });

        data.spillGroup.forEach(obj => {
            const exists = this.spillGroup.getChildren().some(child => 
                child.objectId === obj.id
            );
        
            if (!exists) {
                // x <= 400 = lado izquierdo (Quokka/Tierra) = vertido (tierra)
                // x > 400 = lado derecho (Narval/Agua) = vertido1 (agua)
                const key = obj.x <= 400 ? 'vertido' : 'vertido1';
                const sprite = this.physics.add.sprite(obj.x, obj.y, key);
                sprite.setDisplaySize(obj.size, obj.size);
                sprite.objectId = obj.id;
                sprite.objectType = 'spill';
                this.spillGroup.add(sprite);
                this.addCollisionsForObject(sprite, 'spill');
            
            console.log(`[P2 SYNC] Creado spill con sprite ${key} en x=${obj.x}, ID ${obj.id}`);
            }
        });
    }

    addCollisionsForObject(sprite, objectType) {
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;
        
        switch(objectType) {
            case 'sticky':
                this.physics.add.overlap(p1, sprite, () => this.throwSticky(sprite, 2, 10));
                this.physics.add.overlap(p2, sprite, () => this.throwSticky(sprite, 1, 10));
                break;
            case 'trash':
                this.physics.add.overlap(p1, sprite, () => this.collect(sprite, 1, 5));
                this.physics.add.overlap(p2, sprite, () => this.collect(sprite, 2, 5));
                break;
            case 'spill':
                this.physics.add.overlap(p1, sprite, () => this.collect(sprite, 1, 10));
                this.physics.add.overlap(p2, sprite, () => this.collect(sprite, 2, 10));
                break;
            case 'powerUp':
                this.physics.add.overlap(p1, sprite, () => this.pickPowerUp(sprite, "player1"));
                this.physics.add.overlap(p2, sprite, () => this.pickPowerUp(sprite, "player2"));
                break;
        }
    }

    deleteObjectById(objectType, id) {
        let group;
        switch(objectType) {
            case 'sticky': group = this.stickyGroup; break;
            case 'trash': group = this.trashGroup; break;
            case 'powerUp': group = this.powerUpGroup; break;
            case 'spill': group = this.spillGroup; break;
        }
        
        if (group) {
            const sprite = group.getChildren().find(child => child.objectId === id);
            if (sprite) {
                console.log(`[DELETE LOCAL] Destruyendo ${objectType} con ID ${id}`);
                sprite.destroy();
            } else {
                console.log(`[DELETE LOCAL] No se encontró ${objectType} con ID ${id}`);
            }
        }
    }

    sendObjectsToServer(objectType, x,y,size,id){
        //if(this.ws && this.ws.readyState === WebSocket.OPEN)
        this.ws.send(JSON.stringify({
            type: 'syncObjects',
            roomId: this.roomId,
            objectType : objectType,
            x: x,
            y: y,
            size:size,
            id: id
        }));
    }

    trySpawn(chance, effectActive) {
        const p1 = this.players.get('player1').score;
        const p2 = this.players.get('player2').score;
        let target = null;
        
        if(p1 < p2 - 1) {
            target = 1;
        } else if(p2 < p1 - 1) {
            target = 2;
        } else {
            chance = 10;
            target = Phaser.Math.Between(0, 1) === 0 ? 1 : 2;
        }
        
        if(effectActive[target]) { 
            return null;
        }
        
        const roll = Phaser.Math.Between(1, 100);
        if(roll <= chance) {
            return target;
        }
        return null;
    }
    
    trySpawnSticky() {
        let target = this.trySpawn(50, this.stickyActive);
        if(target != null) {
            this.spawnSticky();
        }
    }
    
    trySpawnPowerUp() {
        let target = this.trySpawn(70, this.powerUpActive);
        if(target != null) {
            this.spawnPowerUp(target);
        }
    }
    
    spawn(objectType, targetPlayer, x11, y11, x21, y21, x12, y12, x22, y22, key1, key2, spriteSize, objectGroup, tiempoEnPantalla, p1, p2) {
        let x, y;
        let object;
        
        if(targetPlayer === 1) {
            ({x, y} = this.antiOverlap(x11, y11, x21, y21, p1, p2));
            object = this.physics.add.sprite(x, y, key1);
        } else {
            ({x, y} = this.antiOverlap(x12, y12, x22, y22, p1, p2));
            object = this.physics.add.sprite(x, y, key2);
        }
    
        const id = Date.now() + '-' + Math.random();
        object.objectId = id;
        object.objectType = objectType;
        object.setDisplaySize(spriteSize, spriteSize);
        objectGroup.add(object);
    
        this.sendObjectsToServer(objectType, x, y, spriteSize, id);

        this.time.delayedCall(tiempoEnPantalla, () => {
            if(object.active) {
                // Enviar mensaje de eliminación
                this.sendMessage({
                    type: 'delObjects',
                    objectType: objectType,
                    id: id,
                    roomId: this.roomId
                });
                object.destroy();
            }
        });

    
        return object;
    }
    
    spawnSticky(targetPlayer = null) {
        if (!targetPlayer) {
            targetPlayer = Phaser.Math.Between(1, 2);
        }
        
        // Colisión del pringue con cada jugador
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;
        
        let sticky = this.spawn('sticky',targetPlayer, 400, 400, 150, 550, 400, 400, 150, 550, "pringue", "pringue", 40, this.stickyGroup, 7000, p1, p2);
    
        this.physics.add.overlap(p1, sticky, () => this.throwSticky(sticky, 2, 10));
        this.physics.add.overlap(p2, sticky, () => this.throwSticky(sticky, 1, 10));
    }
    
    spawnTrash() {
        // Selección aleatoria de jugador (1 o 2)
        const targetPlayer = Phaser.Math.Between(1, 2);
    
        // Colisión basura con cada jugador
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;
    
        let trash = this.spawn('trash',targetPlayer, 30, 340, 150, 550, 460, 770, 150, 550, "basura", "basura", 40, this.trashGroup, 7000, p1, p2);
    
        this.physics.add.overlap(p1, trash, () => this.collect(trash, 1, 5));
        this.physics.add.overlap(p2, trash, () => this.collect(trash, 2, 5));
    }
    
    spawnSpill() {
        // Selección aleatoria de jugador (1 o 2)
        const targetPlayer = Phaser.Math.Between(1, 2);
    
        // Colisión basura con cada jugador
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;
    
        let spill = this.spawn('spill',targetPlayer, 30, 340, 150, 550, 460, 770, 150, 550, "vertido", "vertido1", 80, this.spillGroup, 7000, p1, p2);
    
        this.physics.add.overlap(p1, spill, () => this.collect(spill, 1, 10));
        this.physics.add.overlap(p2, spill, () => this.collect(spill, 2, 10));
    }
    
    spawnPowerUp(playerId) {
        // Colisiones
        const p1 = this.players.get("player1").sprite;
        const p2 = this.players.get("player2").sprite;
    
        let powerUp = this.spawn('powerUp',playerId, 50, 340, 150, 550, 460, 750, 150, 550, "powerQuoka", "powerNarval", 120, this.powerUpGroup, 15000, p1, p2);
    
        this.physics.add.overlap(p1, powerUp, () => this.pickPowerUp(powerUp, "player1"));
        this.physics.add.overlap(p2, powerUp, () => this.pickPowerUp(powerUp, "player2"));
    }
    
    throwSticky(sticky, playerNumber, score){
        if(!sticky.active) return;

        this.pleugh2.play();

        this.sendMessage({
            type: 'delObjects',
            objectType: 'sticky',
            id: sticky.objectId,
            roomId: this.roomId
        });

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
            this.players.get(id).setSprite("down");
        });
        this.players.get(id).setSprite("down");
    }
        
    // Recoge el residuo y da la puntuación correcta
    collect(object, playerNumber, score) {
        if(!object.active) return;
        
        this.sendMessage({
            type: 'delObjects',
            objectType: object.objectType,
            id: object.objectId,
            roomId: this.roomId
        });
        
        this.recogerBasura.play();
        object.destroy();
    
        const player = playerNumber === 1 ? this.players.get('player1') : this.players.get('player2');
        const id = playerNumber === 1 ? "player1" : "player2";
    
        const multiplier = this.powerUpActive[id] ? 2 : 1;
    
        player.score += score * multiplier;
    
        if(id === "player1") {
            this.scoreQuoka.setText(player.score.toString());
        } else {
            this.scoreNarval.setText(player.score.toString());
        }
        
        console.log(`Enviando puntuación al servidor: ${player.score}`);

        this.sendMessage({
            type: 'scoreUpdate',
            playerRole: this.playerRole,
            score: player.score,
            roomId: this.roomId
        });

    }
    
    pickPowerUp(powerUp, playerId) {
        if (!powerUp.active) return;
    
        this.powerUpSound.play();

        this.sendMessage({
            type: 'delObjects',
            objectType: 'powerUp',
            id: powerUp.objectId,
            roomId: this.roomId
        });

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
    
    getWinner() {
        const p1Score = this.players.get("player1").score;
        const p2Score = this.players.get("player2").score;
        
        if(p1Score > p2Score) return "player1";
        else if(p2Score > p1Score) return "player2";
        return "draw";
    }

    endGame(winner = null, player1Score = null, player2Score = null) {
        if (this.gameEnded) return;
        
        this.gameEnded = true;
        
        // Determine winner if not provided
        if (!winner) {
            winner = this.getWinner();
            player1Score = this.players.get("player1").score;
            player2Score = this.players.get("player2").score;
        }
        
        // Stop physics and movement
        if (this.localJugador && this.localJugador.sprite) {
            this.localJugador.sprite.setVelocity(0, 0);
        }
        if (this.remoteJugador && this.remoteJugador.sprite) {
            this.remoteJugador.sprite.setVelocity(0, 0);
        }
        
        this.physics.pause();

        const isWinner = (winner === 'player1' && this.playerRole === 'player1') ||
                        (winner === 'player2' && this.playerRole === 'player2') ||
                        (winner === 'draw');

        let winnerText, color;
        if (winner === 'draw') {
            winnerText = '¡Empate!';
            color = '#ffff00';
        } else {
            winnerText = isWinner ? '¡Ganaste!' : '¡Perdiste!';
            color = isWinner ? '#00ff00' : '#ff0000';
        }

        this.add.text(400, 200, winnerText, {
            fontSize: '64px',
            color: color
        }).setOrigin(0.5);

        this.add.text(400, 280, `Puntuación Final: ${player1Score} - ${player2Score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.createMenuButton();
    }

    handleDisconnection() {
        this.gameEnded = true;
        this.localJugador.sprite.setVelocity(0, 0);
        this.remoteJugador.sprite.setVelocity(0, 0);
        this.physics.pause();

        this.add.text(400, 250, 'Opponent Disconnected', {
            fontFamily:'aaaaa',
            fontSize: '48px',
            color: '#ff0000'
        }).setOrigin(0.5);

        this.createMenuButton();
    }

    createMenuButton() {
        const menuBtn = this.add.text(400, 400, 'Volver al Menú Principal', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => menuBtn.setColor('#cccccc'))
        .on('pointerout', () => menuBtn.setColor('#ffffff'))
        .on('pointerdown', () => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
            }
            this.scene.start('MenuScene');
        });
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

    update() {
        if (this.endAt && this.timerText) {
            const remaining = Math.max(
                0,
                Math.ceil((this.endAt - Date.now()) / 1000)
            );
            this.timerText.setText("Tiempo: " + remaining);
        }
        if (this.gameEnded || this.isPaused) return;
        
        const player = this.localJugador;
        if (!player || !player.sprite) return;
        
        player.sprite.setVelocity(0, 0);
        
        let currentDirection = null;
        let isMoving = false;
        
        if (this.cursors.up.isDown) {
            player.sprite.setVelocityY(-player.baseSpeed);
            player.sprite.setVelocityX(0);
            currentDirection = "up";
            isMoving = true;
        } else if (this.cursors.down.isDown) {
            player.sprite.setVelocityY(player.baseSpeed);
            player.sprite.setVelocityX(0);
            currentDirection = "down";
            isMoving = true;
        } else if (this.cursors.left.isDown) {
            player.sprite.setVelocityX(-player.baseSpeed);
            player.sprite.setVelocityY(0);
            currentDirection = "left";
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            player.sprite.setVelocityX(player.baseSpeed);
            player.sprite.setVelocityY(0);
            currentDirection = "right";
            isMoving = true;
        } else {
            currentDirection = this.lastDirection || "down";
            isMoving = false;
        }
        
        // Aplicar sprite con el estado de movimiento
        player.setSprite(currentDirection, isMoving);
        
        // Guardar la dirección actual Y el estado de movimiento
        this.lastDirection = currentDirection;
        this.lastIsMoving = isMoving;  // NUEVO: Guardar isMoving
        
        if (this.playerRole === 'player1') {
            player.sprite.x = Phaser.Math.Clamp(player.sprite.x, 0, 400);
        } else {
            player.sprite.x = Phaser.Math.Clamp(player.sprite.x, 400, 800);
        }
        
        player.sprite.y = Phaser.Math.Clamp(player.sprite.y, 115, 555);
        
        this.sendPlayerPosition();
        
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
    sendPlayerPosition() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.localJugador) {
            const message = {
                type: 'playerMove',
                roomId: this.roomId,
                playerRole: this.playerRole,
                x: this.localJugador.sprite.x,
                y: this.localJugador.sprite.y,
                direction: this.lastDirection || 'down',
                isMoving: this.lastIsMoving !== undefined ? this.lastIsMoving : false  // USAR la variable guardada
            };
            this.ws.send(JSON.stringify(message));
        }
    }
    
    sendMessage(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(data));
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }

    shutdown() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendMessage({
                type: 'playerLeft',
                roomId: this.roomId
            });
            this.ws.close();
        }
        
        if (this.connectionListener) {
            connectionManager.removeListener(this.connectionListener);
        }
        
        if (this.trashSpawnTimer) this.trashSpawnTimer.remove();
        if (this.stickySpawnTimer) this.stickySpawnTimer.remove();
        if (this.spillSpawnTimer) this.spillSpawnTimer.remove();
        if (this.seagullSoundTimer) this.seagullSoundTimer.remove();
        
        if (this.musica && this.musica.isPlaying) {
            this.musica.stop();
        }
    }
}