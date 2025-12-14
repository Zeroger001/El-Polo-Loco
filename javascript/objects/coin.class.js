class Coin extends MovableObject {
    hitboxWidth = 30;
    hitboxHeight = 30;
    hitboxOffsetX = 25;
    hitboxOffsetY = 25;

    /**
     * Creates a collectible coin.
     * @param {number} maxJumpHeight 
     */
    constructor(maxJumpHeight = 120) {
        super();
        this.width = 80;
        this.height = 80;
        this.y = 150 + Math.random() * (maxJumpHeight - 50);
        this.x = 200 + Math.random() * 4700;
    }

    IMAGES_COIN = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png'
    ];

    /**
     * Loads coin images and starts animation.
     */
    async init() {
        await this.loadImage(this.IMAGES_COIN[0]);
        await this.loadImages(this.IMAGES_COIN);
        this.startCoinAnimation();
    }

    /**
     * Starts coin rotation animation.
     */
    startCoinAnimation() {
        this.coinInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_COIN);
        }, 400);
    }
}
