class BottleOnGround extends MovableObject {
    /**
     * Creates a bottle placed on the ground.
     */
    constructor() {
        super();
        this.width = 50;
        this.height = 60;
    }

    IMAGES_BOTTLE_ON_GROUND = [
        'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
    ];

    /**
     * Initializes bottle position and animation.
     */
    async init() {
        this.x = 200 + Math.random() * 4700;
        this.y = 360;
        await this.loadImage(this.IMAGES_BOTTLE_ON_GROUND[0]);
        await this.loadImages(this.IMAGES_BOTTLE_ON_GROUND);
        this.startFlickerAnimation();
    }

    /**
     * Starts flicker animation.
     */
    startFlickerAnimation() {
        this.flickerInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_BOTTLE_ON_GROUND);
        }, 500);
    }
}
