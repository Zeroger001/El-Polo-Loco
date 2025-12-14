/**
 * Endboss enemy controlling all states, animations and behavior.
 */
class Endboss extends MovableObject {
    hitboxWidth = 145;
    hitboxHeight = 215;
    hitboxOffsetX = 5;
    hitboxOffsetY = 28;

    soundManager = new SoundManager();
    isActive = false;

    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    health = 100;
    speedY = 0;
    acceleration = 30;
    isHurt = false;
    isAttacking = false;
    isAlerting = false;
    alertTriggered = false;
    groundY = 190;
    isPaused = false;

    constructor() {
        super();
        this.walkInterval = null;
        this.attackInterval = null;
        this.animationFrameId = 0;
    }

    /**
     * Loads all boss images and sets base stats.
     */
    async init() {
        this.x = 5000;
        this.y = this.groundY;
        this.width = 150;
        this.height = 250;
        this.speed = 2.5;
        await this.loadImages(this.IMAGES_WALKING);
        await this.loadImages(this.IMAGES_ALERT);
        await this.loadImages(this.IMAGES_ATTACK);
        await this.loadImages(this.IMAGES_HURT);
        await this.loadImages(this.IMAGES_DEAD);
    }

    /**
     * Activates the boss when player is close.
     */
    activate() {
        this.isActive = true;
        this.loadImage(this.IMAGES_WALKING[0]);
        this.animate();
    }

    /**
     * Clears all internal loops and animation frames.
     */
    clearAllLoops() {
        if (this.walkInterval) {
            clearInterval(this.walkInterval);
            this.walkInterval = null;
        }
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
            this.attackInterval = null;
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
        }
    }

    /**
     * Called by world when game resumes from pause.
     */
    onResume() {
        if (!this.isActive || this.isDead) return;
        this.clearAllLoops();
        this.isHurt = false;
        this.isAttacking = false;
        this.isAlerting = false;
        if (!this.world?.isPaused) this.animate();
    }

    /**
     * Starts all animation and logic loops.
     */
    animate() {
        if (!this.isActive || this.world?.isPaused) return;
        this.clearAllLoops();
        this.startWalkLoop();
        this.startMoveLoop();
        this.startAttackLoop();
        this.startMainLoop();
    }

    /**
     * Starts walk animation loop.
     */
    startWalkLoop() {
        if (this.walkInterval) return;
        const fn = () => {
            if (this.world?.isPaused) return;
            if (this.isDead || this.isHurt || this.isAttacking || this.isAlerting) {
                clearInterval(this.walkInterval);
                this.walkInterval = null;
                return;
            }
            this.playAnimation(this.IMAGES_WALKING);
        };
        this.walkInterval = this.world.registerLoop(setInterval(fn, 1000 / 8));
    }

    /**
     * Starts movement loop towards player.
     */
    startMoveLoop() {
        const step = () => {
            if (this.world?.isPaused) {
                this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(step));
                return;
            }
            if (this.isDead || this.isHurt || this.isAttacking || this.isAlerting) {
                this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(step));
                return;
            }
            this.updateHorizontalMovement();
            this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(step));
        };
        this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(step));
    }

    /**
     * Updates horizontal movement toward the player.
     */
    updateHorizontalMovement() {
        const playerX = this.world.character.x;
        const distance = this.x - playerX;
        const minDistance = 75;
        if (Math.abs(distance) > minDistance) {
            this.x -= Math.sign(distance) * this.speed;
            this.otherDirection = playerX > this.x;
        }
    }

    /**
     * Starts the main loop for alert and walk restart.
     */
    startMainLoop() {
        const loop = () => {
            if (!this.world?.isPaused) {
                this.checkAlertState();
                this.ensureWalkLoopActive();
            }
            this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(loop));
        };
        this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(loop));
    }

    /**
     * Ensures walk loop is running when idle.
     */
    ensureWalkLoopActive() {
        if (this.isDead || this.isHurt || this.isAttacking || this.isAlerting) return;
        if (!this.walkInterval) this.startWalkLoop();
    }

    /**
     * Checks whether alert state should be triggered.
     */
    checkAlertState() {
        if (this.world?.isPaused) return;
        if (this.isDead || this.isHurt || this.isAttacking || this.alertTriggered) return;
        const playerX = this.world.character.x;
        const distance = Math.abs(this.x - playerX);
        if (distance >= 500) return;
        this.isAlerting = true;
        this.alertTriggered = true;
        this.startAlertSequence();
    }

    /**
     * Starts alert animation and boss music.
     */
    startAlertSequence() {
        if (this.world?.soundManager && !this.isDead) {
            this.world.soundManager.play('endbossAlert');
            setTimeout(() => this.world?.soundManager?.startEndbossBattleMusic(), 500);
        }
        let frame = 0;
        const id = this.world.registerLoop(setInterval(() => {
            if (this.world?.isPaused) return;
            if (frame < this.IMAGES_ALERT.length) {
                this.img = this.imageCache[this.IMAGES_ALERT[frame]];
                frame++;
            } else {
                clearInterval(id);
                this.isAlerting = false;
                this.startWalkLoop();
            }
        }, 1000 / 6));
    }

    /**
     * Starts periodic attack loop.
     */
    startAttackLoop() {
        const handler = () => {
            if (this.world?.isPaused) return;
            if (this.isDead || this.isHurt || this.isAlerting) return;
            this.beginAttack();
        };
        this.attackInterval = this.world.registerLoop(setInterval(handler, 3000));
    }

    /**
     * Begins a single attack sequence.
     */
    beginAttack() {
        this.isAttacking = true;
        this.world?.soundManager?.play('endbossAttack');
        let frame = 0;
        this.speedY = -25;
        const playerX = this.world.character.x;
        const direction = Math.sign(playerX - this.x);
        const totalJumpDistance = 350;
        const jumpFrames = this.IMAGES_ATTACK.length - 4;
        const jumpStep = totalJumpDistance / jumpFrames;
        this.runAttackLoop(frame, direction, jumpStep, playerX);
    }

    /**
     * Runs the attack animation loop.
     */
    runAttackLoop(frame, direction, jumpStep, playerX) {
        const id = this.world.registerLoop(setInterval(() => {
            if (this.world?.isPaused) return;
            if (frame < this.IMAGES_ATTACK.length) {
                this.updateAttackFrame(frame, direction, jumpStep, playerX);
                frame++;
            } else {
                clearInterval(id);
                this.y = this.groundY;
                this.speedY = 0;
                this.isAttacking = false;
                this.startWalkLoop();
            }
        }, 1000 / 6));
    }

    /**
     * Updates one frame of the attack animation.
     */
    updateAttackFrame(frame, direction, jumpStep, playerX) {
        this.img = this.imageCache[this.IMAGES_ATTACK[frame]];
        this.otherDirection = playerX > this.x;
        const lastIndex = this.IMAGES_ATTACK.length - 1;
        if (frame >= 3 && frame < lastIndex) {
            this.y += this.speedY;
            this.speedY += this.acceleration / 12;
            this.x += direction * jumpStep;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.speedY = 0;
            }
        }
    }

    /**
     * Applies damage and triggers hurt logic.
     * @param {number} damage
     * @param {string} type
     */
    takeDamage(damage, type) {
        if (this.isDead || this.isHurt) return;
        this.health = Math.max(this.health - damage, 0);
        if (this.world?.soundManager && !this.isDead) {
            this.world.soundManager.play('endbossHurt');
        }
        this.isHurt = true;
        this.startHurtAnimation();
        if (this.health <= 0) this.die();
    }

    /**
     * Starts hurt animation sequence.
     */
    startHurtAnimation() {
        let frame = 0;
        const id = this.world.registerLoop(setInterval(() => {
            if (this.world?.isPaused) return;
            if (frame < this.IMAGES_HURT.length) {
                this.img = this.imageCache[this.IMAGES_HURT[frame]];
                frame++;
            } else {
                clearInterval(id);
                this.isHurt = false;
                if (!this.isDead) this.playAnimation(this.IMAGES_WALKING);
            }
        }, 1000 / 6));
    }

    /**
     * Kills the boss and triggers death animation.
     */
    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.speed = 0;
        this.speedY = -20;
        if (this.world?.soundManager) {
            this.world.soundManager.play('endbossDead');
            this.world.soundManager.stopEndbossBattleMusic();
        }
        this.clearAllLoops();
        this.startDeathFall();
    }

    /**
     * Starts the falling death animation.
     */
    startDeathFall() {
        let frame = 0;
        const id = this.world.registerLoop(setInterval(() => {
            if (this.world?.isPaused) return;
            if (frame < this.IMAGES_DEAD.length) {
                this.img = this.imageCache[this.IMAGES_DEAD[frame]];
                frame++;
            }
            this.y += this.speedY;
            this.speedY += this.acceleration;
            if (this.y > this.world.canvas.height + 100) {
                clearInterval(id);
                this.removeFromWorld();
            }
        }, 1000 / 6));
    }

    /**
     * Removes boss from world enemy list.
     */
    removeFromWorld() {
        const enemies = this.world?.level?.enemies;
        if (!enemies) return;
        const idx = enemies.indexOf(this);
        if (idx !== -1) enemies.splice(idx, 1);
    }
}
