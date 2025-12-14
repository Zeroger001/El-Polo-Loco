/**
 * Small fast chicken enemy moving left across the world.
 * Reacts to pause, plays walk animation, and removes itself when dead.
 */
class ChickenSmall extends MovableObject {
    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_small/2_dead/dead.png'
    ];

    constructor() {
        super();
        this.isDead = false;
        this.walkInterval = null;
    }

    /** Loads images and initializes random stats. */
    async init() {
        await this.loadImage(this.IMAGES_WALKING[0]);
        this.x = 200 + Math.random() * 4600;
        this.speed = 1.5 + Math.random() * 0.65;
        this.y = 378;
        this.height = 50;
        this.width = 30;

        await this.loadImages(this.IMAGES_WALKING);
        await this.loadImages(this.IMAGES_DEAD);
        this.animate();
    }

    /** Starts all animations and movement. */
    animate() {
        this.startWalkAnimation();
        this.startMovementLoop();
    }

    /** Loop for walk animation with pause and death check. */
    startWalkAnimation() {
        if (this.walkInterval) clearInterval(this.walkInterval);
        this.walkInterval = setInterval(() => {
            if (this.world?.isPaused || this.isDead) return;
            this.playAnimation(this.IMAGES_WALKING);
        }, 1000 / 10);
    }

    /** Movement loop with auto-removal when out of bounds. */
    startMovementLoop() {
        const step = () => {
            if (this.world?.isPaused) return requestAnimationFrame(step);
            if (!this.isDead) {
                this.x -= this.speed;
                if (this.x + this.width < -300) return this.removeFromWorld();
            }
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    /** Kills the chicken and schedules its removal. */
    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.speed = 0;
        if (this.walkInterval) clearInterval(this.walkInterval);
        this.img = this.imageCache[this.IMAGES_DEAD[0]];
        setTimeout(() => this.removeFromWorld(), 1500);
    }

    /** Removes instance from the world's enemy array. */
    removeFromWorld() {
        const enemies = this.world?.level?.enemies;
        if (!enemies) return;
        const idx = enemies.indexOf(this);
        if (idx !== -1) enemies.splice(idx, 1);
    }
}
