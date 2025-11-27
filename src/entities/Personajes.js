export class Personajes {

    constructor(scene, id, x, y) {
        this.id = id;
        this.scene = scene;
        this.score = 0;

        this.baseHeight = 40;
        this.baseWidth = 40;
        this.baseSpeed = 300;

        // Sprite inicial
        const texture = (id === "player1") ? "quoka_down" : "narval_down";

        this.sprite = this.scene.physics.add.sprite(x, y, texture);
        this.sprite.setScale(0.5)
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.allowGravity = false;
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
    }
}
