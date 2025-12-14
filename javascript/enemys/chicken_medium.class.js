/**
 * Simple chicken enemy that walks left across the level.
 * Plays walk animation, reacts to pause, and disappears when dead.
 */
class Chicken extends MovableObject {
    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

    constructor() {
        super();
        this.isDead = false;
        this.walkInterval = null;
    }

    /** Initializes chicken, loads images, configures random stats. */
    async init() {
        await this.loadImage(this.IMAGES_WALKING[0]);
        this.x = 200 + Math.random() * 4600;
        this.speed = 0.9 + Math.random() * 0.65;
        this.y = 360;
        this.height = 70;
        this.width = 50;

        await this.loadImages(this.IMAGES_WALKING);
        await this.loadImages(this.IMAGES_DEAD);
        this.animate();
    }

    /** Starts animation + movement loops. */
    animate() {
        this.startWalkAnimation();
        this.startMovementLoop();
    }

    /** Walk animation loop with pause + death handling. */
    startWalkAnimation() {
        if (this.walkInterval) clearInterval(this.walkInterval);
        this.walkInterval = setInterval(() => {
            if (this.world?.isPaused || this.isDead) return;
            this.playAnimation(this.IMAGES_WALKING);
        }, 1000 / 10);
    }

    /** Horizontal movement loop to the left. */
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

    /** Kills chicken, stops animation and schedules removal. */
    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.speed = 0;
        if (this.walkInterval) clearInterval(this.walkInterval);
        this.img = this.imageCache[this.IMAGES_DEAD[0]];
        setTimeout(() => this.removeFromWorld(), 1500);
    }

    /** Removes enemy from the world enemy list. */
    removeFromWorld() {
        const enemies = this.world?.level?.enemies;
        if (!enemies) return;
        const idx = enemies.indexOf(this);
        if (idx !== -1) enemies.splice(idx, 1);
    }
}
