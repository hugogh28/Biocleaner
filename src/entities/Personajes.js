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

    setSprite(direction){
        let texture;

        if(this.id === "player1"){
            if(direction === "up"){
                texture = "quokaAtras";
            }
            else if(direction === "down"){
                texture = "quokaFrente";
            }
            else if(direction === "left"){
                texture = "quokaIzquierda";
            }
            else if(direction === "right"){
                texture = "quokaDerecha";
            }
            else {
                texture = "quokaFrente";
            }
        } else {
            if(direction === "up"){
                texture = "narvalFrente";
            }
            else if(direction === "down"){
                texture = "narvalAtras";
            }
            else if(direction === "left"){
                texture = "narvalIzquierda";
            }
            else if(direction === "right"){
                texture = "narvalDerecha";
            }
            else {
                texture = "narvalFrente";
            }
        }

        this.sprite.setTexture(texture);
        this.sprite.setScale(0.5);
        this.updateHitbox();
    }
}
