export class Personajes {

    constructor(scene, id, x, y) {
        this.id = id;
        this.scene = scene;
        this.score = 0;

        this.baseSpeed = 300;

        const texture = (id === "player1") ? "quokaFrente" : "narvalFrente";

        this.sprite = this.scene.physics.add.sprite(x, y, texture);

        this.sprite.setScale(0.5);

        this.updateHitbox();

        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.allowGravity = false;
    }

    updateHitbox() {
        const body = this.sprite.body;
        body.setSize(this.sprite.width, this.sprite.height, true); 
    }

    setSprite(direction) {
        let texture;

        const boosted = this.scene.powerUpActive[this.id];
        const rooted = this.scene.stickyActive[this.id];

        if (this.id === "player1") { 
            if (!boosted) {
                // SPRITES NORMALES
                if (direction === "up") texture = "quokaAtras";
                else if (direction === "down") texture = "quokaFrente";
                else if (direction === "left") texture = "quokaIzquierda";
                else if (direction === "right") texture = "quokaDerecha";
                else texture = "quokaFrente";
            } else if(boosted){
                // SPRITES DE POWER UP
                if (direction === "up") texture = "quokaAtrasP";
                else if (direction === "down") texture = "quokaFrenteP";
                else if (direction === "left") texture = "quokaIzquierdaP";
                else if (direction === "right") texture = "quokaDerechaP";
                else texture = "quokaFrenteP";
            }if(!rooted){
                this.baseSpeed = 300
            }else if(rooted){
                this.baseSpeed = 0;
            }
        } else { 
            if (!boosted) {
                // SPRITES NORMALES
                if (direction === "up") texture = "narvalFrente";
                else if (direction === "down") texture = "narvalAtras";
                else if (direction === "left") texture = "narvalIzquierda";
                else if (direction === "right") texture = "narvalDerecha";
                else texture = "narvalFrente";
            } else {
                // SPRITES DE POWER UP
                if (direction === "up") texture = "narvalFrenteP";
                else if (direction === "down") texture = "narvalAtrasP";
                else if (direction === "left") texture = "narvalIzquierdaP";
                else if (direction === "right") texture = "narvalDerechaP";
                else texture = "narvalFrenteP";
            }if(!rooted){
                this.baseSpeed = 300;
            }else if(rooted){
                this.baseSpeed = 0;
            }
        }

        this.sprite.setTexture(texture);
    }

}
