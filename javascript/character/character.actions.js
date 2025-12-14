/**
 * Character class extended with actions.
 */
class Character extends window.CharacterBase {

    jump() {
        if (!this.isAboveGround()) {
            this.speedY = 30;
            this.currentImage = 0;
            if (this.world?.soundManager) this.world.soundManager.play('jump');
        }
    }

    throwBottle() {
        const now = Date.now();
        if (now - this.lastThrow < 50 || this.bottles <= 0) return;
        this.lastThrow = now;
        this.bottles--;
        if (this.world?.soundManager) this.world.soundManager.play('throwBottle');
        const b = new Bottle(this.x + this.width / 2, this.y + 50, this.otherDirection);
        b.world = this.world;
        b.init();
        this.world.throwables.push(b);
        if (this.world.statusBarBottles) this.world.statusBarBottles.setPercentage(this.bottles * 20);
    }

    takeDamage(dmg) {
        if (this.isInvulnerable || this.isDead) return;
        this.health = Math.max(this.health - dmg, 0);
        if (this.world.statusBarHealth) this.world.statusBarHealth.setPercentage(this.health);
        this.isHurt = true;
        this.isInvulnerable = true;
        this.playHurtAnimation();
        setTimeout(() => { this.isInvulnerable = false; this.isHurt = false; }, 850);
        if (this.health <= 0) this.die();
    }

    playHurtAnimation() {
        if (this.isSnooring && this.snooringAudio) {
            this.snooringAudio.pause();
            this.snooringAudio.currentTime = 0;
            this.isSnooring = false;
        }
        let f = 0;
        const int = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_HURT[f]];
            f++;
            if (f >= this.IMAGES_HURT.length) {
                clearInterval(int);
                this.img = this.imageCache[this.IMAGES_IDLE[0]];
                this.resetIdle();
            }
        }, 1000 / 20);
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.world.soundManager.stopBackgroundMusic();
        this.world.soundManager.stopEndbossBattleMusic();
        this.stopAllSounds();
        this.speedY = 25;
        this.isInvulnerable = true;
        let f = 0;
        const max = this.IMAGES_DEAD.length;
        const int = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_DEAD[f]];
            f++;
            this.y += this.speedY;
            this.speedY += this.acceleration;
            this.groundLevel = 600;
            if (f >= max) {
                clearInterval(int);
                this.img = this.imageCache[this.IMAGES_DEAD[max - 1]];
            }
        }, 1000 / 12);
    }

    clampPosition() {
        if (!this.world?.level) return;
        const max = this.world.level.level_end_x - this.width;
        if (this.x < 0) this.x = 0;
        if (this.x > max) this.x = max;
    }

    stopAllSounds() {
        if (this.snooringAudio) {
            this.snooringAudio.pause();
            this.snooringAudio.currentTime = 0;
            this.isSnooring = false;
        }
    }

    playWalkSound() {
        if (!this.world?.soundManager) return;
        const now = Date.now();
        if (this.lastWalkSound && now - this.lastWalkSound < 500) return;
        this.lastWalkSound = now;
        this.world.soundManager.play('walk');
    }

    stopWalkSound() {
        if (this.walkAudio) {
            this.walkAudio.pause();
            this.walkAudio.currentTime = 0;
            this.walkAudio = null;
        }
    }
}

window.Character = Character;
