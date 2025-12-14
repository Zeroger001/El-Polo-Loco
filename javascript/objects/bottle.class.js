class Bottle extends MovableObject {

    /**
     * Creates a throwable bottle.
     * @param {number} x 
     * @param {number} y 
     * @param {boolean} otherDirection 
     */
    constructor(x, y, otherDirection) {
        super();
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
        this.speedY = 20;
        this.speedX = otherDirection ? -10 : 10;
        this.otherDirection = otherDirection;
        this.isSplashing = false;
        this.removeAfterSplash = false;
        this.groundLevel = 360;
        this.applyGravity();
    }

    IMAGES_BOTTLE_SPIN = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];

    IMAGES_BOTTLE_SPLASH = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    IMAGES_BOTTLE_ON_GROUND = [
        'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
    ];

    /**
     * Loads all bottle images.
     */
    async init() {
        await this.loadImage(this.IMAGES_BOTTLE_SPIN[0]);
        await this.loadImages(this.IMAGES_BOTTLE_SPIN);
        await this.loadImages(this.IMAGES_BOTTLE_SPLASH);
        await this.loadImages(this.IMAGES_BOTTLE_ON_GROUND);
        this.startAnimationLoop();
    }

    /**
     * Starts spin movement loop.
     */
    startAnimationLoop() {
        this.moveInterval = setInterval(() => this.updateFlight(), 50);
    }

    /**
     * Updates flight movement each frame.
     */
    updateFlight() {
        if (this.isSplashing) return;
        this.x += this.speedX;
        this.playAnimation(this.IMAGES_BOTTLE_SPIN);
        if (this.y >= this.groundLevel) this.triggerSplash();
    }

    /**
     * Triggers splash effect.
     */
    triggerSplash() {
        this.y = this.groundLevel;
        this.splash();
    }

    /**
     * Starts splash animation.
     */
    splash() {
        this.isSplashing = true;
        clearInterval(this.moveInterval);
        this.speedX = 0;
        this.speedY = 0;
        this.startSplashFrames();
    }

    /**
     * Displays each splash frame.
     */
    startSplashFrames() {
        let i = 0;
        this.splashInterval = setInterval(() => {
            this.updateSplashFrame(i);
            i++;
        }, 66);
    }

    /**
     * Updates one splash frame step.
     * @param {number} i 
     */
    updateSplashFrame(i) {
        if (!this.IMAGES_BOTTLE_SPLASH[i]) {
            clearInterval(this.splashInterval);
            this.removeAfterSplash = true;
            return;
        }
        this.img = this.imageCache[this.IMAGES_BOTTLE_SPLASH[i]];
    }
}
