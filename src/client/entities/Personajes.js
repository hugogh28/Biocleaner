export class Personajes {

    constructor(scene, id, x, y) {
        this.id = id;
        this.scene = scene;
        this.score = 0;
        this.baseSpeed = 300;
        
        // NUEVO: Variables para controlar animaciones
        this.lastDirection = null;
        this.isAnimating = false;

        const texture = (id === "player1") ? "quokkaFrente" : "narvalFrente";

        this.sprite = this.scene.physics.add.sprite(x, y, texture, 0);

        this.sprite.setScale(0.5);

        this.updateHitbox();

        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.allowGravity = false;
    }

    updateHitbox() {
        const body = this.sprite.body;
        body.setSize(this.sprite.width, this.sprite.height, true); 
    }

    setSprite(direction, isMoving = true) {
        const boosted = this.scene.powerUpActive && this.scene.powerUpActive[this.id];
        const rooted = this.scene.stickyActive && this.scene.stickyActive[this.id];

        // Si está pegado (rooted), mostrar textura estática
        if(rooted){
            const texture = (this.id === "player1") ? 'pringueQuokka' : 'pringueNarval';
            if (this.sprite.texture.key !== texture) {
                this.sprite.setTexture(texture);
                this.sprite.anims.stop();
            }
            this.baseSpeed = 0;
            this.isAnimating = false;
            return;
        }

        // Si no está pegado, velocidad normal
        this.baseSpeed = 300;
        let animKey;

        if (this.id === "player1") { 
            if (!boosted) {
                // ANIMACIONES NORMALES
                if (direction === "up") animKey = "quokka_walk_back";
                else if (direction === "down") animKey = "quokka_walk_front";
                else if (direction === "left") animKey = "quokka_walk_left";
                else if (direction === "right") animKey = "quokka_walk_right";
                else animKey = "quokka_walk_front";
            } else {
                // TEXTURAS DE POWER UP (estáticas por ahora)
                let texture;
                if (direction === "up") texture = "quokaAtrasP";
                else if (direction === "down") texture = "quokaFrenteP";
                else if (direction === "left") texture = "quokaIzquierdaP";
                else if (direction === "right") texture = "quokaDerechaP";
                else texture = "quokaFrenteP";
                
                if (this.sprite.texture.key !== texture) {
                    this.sprite.setTexture(texture);
                    this.sprite.anims.stop();
                }
                this.isAnimating = false;
                return;
            }
        } else { 
            if (!boosted) {
                // ANIMACIONES NORMALES
                if (direction === "up") animKey = "narval_walk_back";
                else if (direction === "down") animKey = "narval_walk_front";
                else if (direction === "left") animKey = "narval_walk_left";
                else if (direction === "right") animKey = "narval_walk_right";
                else animKey = "narval_walk_front";
            } else {
                // TEXTURAS DE POWER UP (estáticas por ahora)
                let texture;
                if (direction === "up") texture = "narvalFrenteP";
                else if (direction === "down") texture = "narvalAtrasP";
                else if (direction === "left") texture = "narvalIzquierdaP";
                else if (direction === "right") texture = "narvalDerechaP";
                else texture = "narvalFrenteP";
                
                if (this.sprite.texture.key !== texture) {
                    this.sprite.setTexture(texture);
                    this.sprite.anims.stop();
                }
                this.isAnimating = false;
                return;
            }
        }

        // Manejar animaciones
        if (isMoving) {
            // Solo reproducir si cambió la dirección o no estaba animando
            if (this.lastDirection !== direction || !this.isAnimating) {
                this.sprite.play(animKey, true);
                this.isAnimating = true;
                this.lastDirection = direction;
            }
        } else {
            // Detener solo si estaba animando
            if (this.isAnimating) {
                this.sprite.anims.stop();
                this.sprite.setFrame(0);
                this.isAnimating = false;
            }
        }
    }
}