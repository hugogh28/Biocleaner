import Phaser from 'phaser';

export class Login extends Phaser.Scene {

    constructor() {
        super('Login');
    }

     preload(){
        this.load.image('botonJugar', 'assets/Botones/empezar.png');
        this.load.image('botonAtras', 'assets/Botones/volver.png');
        this.load.image('login', 'assets/Botones/login.png');
    }


    create(data) {

        const brightness = this.plugins.get("Brightness");
        brightness.applyToScene(this);

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7); 
        this.add.image(400,250,'login').setOrigin(0.5).setScale(1.5);

        this.add.text(400, 150, 'Login', {  
            fontFamily: "aaaaa",
            fontSize: '64px',
            color: '#e1e674'
        }).setOrigin(0.5);

       
        const empezar = this.add.image(500, 400, 'botonJugar',).setOrigin(0.5)
        .setInteractive({ useHandCursor: true }) 
        .on('pointerdown', async () => {  
            const nickname = this.nicknameInput.value.trim();
            if (!nickname) return;
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nickname })
                });

                const data = await res.json();

                window.sessionId = data.sessionId;
                window.nickname = data.nickname;
                const statsRes = await fetch(`/api/game/stats?sessionId=${window.sessionId}`);
                const stats = await statsRes.json();

                if (typeof stats.gamesPlayed === 'number') {
                    window.gamesPlayed = stats.gamesPlayed;
                }

                // Limpiar input
                this.nicknameInput.remove();

                // Cerrar login y empezar juego
                this.scene.stop();
                this.scene.stop('LocaloOnlineSeleccion');
                this.scene.start('LobbyScene');

            } catch (e) {
                console.error('Login error', e);
            }
        });

        const volver = this.add.image(300, 400, 'botonAtras',).setOrigin(0.5)
        .setInteractive({ useHandCursor: true }) 
        .on('pointerdown', async () => {  
            this.scene.stop();   
            this.scene.resume('LocaloOnlineSeleccion');
        });

        // Input HTML
        this.nicknameInput = document.createElement('input');
        this.nicknameInput.type = 'text';
        this.nicknameInput.placeholder = 'Nickname';
        this.nicknameInput.maxLength = 12;

        this.nicknameInput.style.position = 'absolute';
        this.nicknameInput.style.top = '45%';
        this.nicknameInput.style.left = '50%';
        this.nicknameInput.style.transform = 'translateX(-50%)';
        this.nicknameInput.style.padding = '10px';
        this.nicknameInput.style.fontFamily = 'aaaaa';
        this.nicknameInput.style.fontSize = '16px';

        document.body.appendChild(this.nicknameInput);

        this.events.on('shutdown', () => {
            if (this.nicknameInput) {
                this.nicknameInput.remove();
            }
        });
    }
    
    update() { //Actualiza el brillo en función del slider de ajustes
        const brightness = this.plugins.get("Brightness");
        brightness.updateOverlay(this);
    }
}