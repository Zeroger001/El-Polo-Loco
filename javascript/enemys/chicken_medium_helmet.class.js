/**
 * Stronger chicken enemy with a helmet. Requires two Jump hits or one Bottle hit.
 * Moves in an orbital pattern around the player and reacts to pause state.
 */
class ChickenHelmet extends MovableObject {
    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_helmet/1_walk/1_w_helmet.png',
        'img/3_enemies_chicken/chicken_helmet/1_walk/2_w_helmet.png',
        'img/3_enemies_chicken/chicken_helmet/1_walk/3_w_helmet.png'
    ];

    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_helmet/2_dead/dead.png'
    ];

    constructor() {
        super();
        this.isDead = false;
        this.walkInterval = null;
        this.hitCount = 0;
        this.health = 2;
        this.orbitSide = 'right';
        this.orbitOffset = 120;
        this.reachTolerance = 2;
    }

    /**
     * Initializes enemy, loads images and starts animation.
     */
    async init() {
        await this.loadImage(this.IMAGES_WALKING[0]);
        this.x = 200 + Math.random() * 4600;
        this.speed = 1.6 + Math.random() * 0.65;
        this.y = 360;
        this.height = 70;
        this.width = 50;
        await this.loadImages(this.IMAGES_WALKING);
        await this.loadImages(this.IMAGES_DEAD);
        this.animate();
    }

    /**
     * Starts walking animation and movement loop.
     */
    animate() {
        this.startWalkAnimation();
        this.startOrbitMovement();
    }

    /**
     * Starts the walking animation loop.
     */
    startWalkAnimation() {
        if (this.walkInterval) clearInterval(this.walkInterval);
        this.walkInterval = setInterval(() => {
            if (this.world?.isPaused || this.isDead) return;
            this.playAnimation(this.IMAGES_WALKING);
        }, 1000 / 10);
    }

    /**
     * Starts orbital AI movement loop.
     */
    startOrbitMovement() {
        const step = () => {
            if (this.world?.isPaused || this.isDead || this.isHurt) {
                return requestAnimationFrame(step);
            }
            this.updateOrbitMovement();
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    /**
     * Updates movement toward orbit target.
     */
    updateOrbitMovement() {
        const targetX = this.getOrbitTargetX();
        const dx = targetX - this.x;
        if (Math.abs(dx) > this.reachTolerance) {
            this.otherDirection = dx > 0;
            this.x += Math.sign(dx) * this.speed;
        } else {
            this.flipOrbitSide();
        }
    }

    /**
     * Returns X position where enemy should move next.
     */
    getOrbitTargetX() {
        const playerX = this.world?.character?.x ?? 0;
        return this.orbitSide === 'right'
            ? playerX + this.orbitOffset
            : playerX - this.orbitOffset;
    }

    /**
     * Switches orbit side after reaching target.
     */
    flipOrbitSide() {
        this.orbitSide = this.orbitSide === 'right' ? 'left' : 'right';
    }

    /**
     * Handles taking a hit from player or object.
     */
    takeHit() {
        this.hitCount++;
        if (this.hitCount < this.health) {
            this.isHurt = true;
            this.world?.soundManager?.play('hitHelmet');
            return setTimeout(() => (this.isHurt = false), 200);
        }
        this.world?.soundManager?.play('chickenDead');
        this.die();
    }

    /**
     * Kills the enemy and schedules removal.
     */
    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.speed = 0;
        if (this.walkInterval) clearInterval(this.walkInterval);
        this.img = this.imageCache[this.IMAGES_DEAD[0]];
        setTimeout(() => this.removeFromWorld(), 1500);
    }

    /**
     * Removes enemy from world array.
     */
    removeFromWorld() {
        const enemies = this.world?.level?.enemies;
        if (!enemies) return;
        const index = enemies.indexOf(this);
        if (index !== -1) enemies.splice(index, 1);
    }
}
