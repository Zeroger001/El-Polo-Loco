/**
 * Provides collision detection and hit handling for the World.
 */

/**
 * Checks whether two entities are colliding based on hitboxes.
 * @param {Object} a - First entity.
 * @param {Object} b - Second entity.
 * @returns {boolean} True if entities intersect.
 */
World.prototype.isColliding = function (a, b) {
    const aX = a.x + (a.hitboxOffsetX || 0);
    const aY = a.y + (a.hitboxOffsetY || 0);
    const aW = a.hitboxWidth || a.width;
    const aH = a.hitboxHeight || a.height;
    const bX = b.x + (b.hitboxOffsetX || 0);
    const bY = b.y + (b.hitboxOffsetY || 0);
    const bW = b.hitboxWidth || b.width;
    const bH = b.hitboxHeight || b.height;
    return aX < bX + bW && aX + aW > bX && aY < bY + bH && aY + aH > bY;
};

/**
 * Checks if the character collects any coins.
 */
World.prototype.checkCoinHit = function () {
    this.level.coins = this.level.coins.filter(coin => {
        if (!this.isColliding(coin, this.character)) return true;
        this.handleCoinCollected();
        return false;
    });
};

/**
 * Applies effects of collecting a coin.
 */
World.prototype.handleCoinCollected = function () {
    const c = this.character;
    this.soundManager.play('coin');
    c.coinCounter++;
    if (c.coinCounter !== 10) return;
    if (c.health < 100) {
        c.health = Math.min(c.health + 25, 100);
        this.soundManager.play('getCoinLife');
    }
    c.coinCounter = 0;
};

/**
 * Checks if the character collects bottles.
 */
World.prototype.checkBottleCollection = function () {
    this.level.bottles = this.level.bottles.filter(bottle => {
        if (!this.isColliding(this.character, bottle)) return true;
        this.handleBottleCollected();
        return false;
    });
};

/**
 * Applies effects of collecting a bottle.
 */
World.prototype.handleBottleCollected = function () {
    this.character.bottles++;
    this.soundManager.play('collectBottle');
};

/**
 * Checks if thrown bottles hit enemies or ground.
 */
World.prototype.checkBottleHit = function () {
    this.throwables.forEach(bottle => {
        this.handleBottleGroundHit(bottle);
        this.handleBottleEnemyHits(bottle);
    });
    this.throwables = this.throwables.filter(b => !b.removeAfterSplash);
};

/**
 * Handles bottle impact with the ground.
 * @param {Object} bottle - Thrown bottle.
 */
World.prototype.handleBottleGroundHit = function (bottle) {
    if (bottle.y < bottle.groundLevel || bottle.isSplashing) return;
    bottle.y = bottle.groundLevel;
    bottle.splash();
    this.soundManager.play('hitBottle');
};

/**
 * Handles bottle impacts with enemies.
 * @param {Object} bottle - Thrown bottle.
 */
World.prototype.handleBottleEnemyHits = function (bottle) {
    if (bottle.isSplashing) return;
    this.level.enemies.forEach(enemy => {
        if (!this.shouldBottleHitEnemy(bottle, enemy)) return;
        this.applyBottleImpactOnEnemy(bottle, enemy);
    });
};

/**
 * Determines whether a bottle should hit an enemy.
 * @param {Object} bottle - Bottle instance.
 * @param {Object} enemy - Enemy instance.
 * @returns {boolean} True if hit should be processed.
 */
World.prototype.shouldBottleHitEnemy = function (bottle, enemy) {
    return this.isColliding(bottle, enemy) &&
        !bottle.isSplashing &&
        !enemy.isDead;
};

/**
 * Applies bottle hit effects on an enemy.
 * @param {Object} bottle - Bottle instance.
 * @param {Object} enemy - Enemy instance.
 */
World.prototype.applyBottleImpactOnEnemy = function (bottle, enemy) {
    bottle.splash();
    this.soundManager.play('hitBottle');
    if (enemy instanceof Chicken || enemy instanceof ChickenSmall || enemy instanceof ChickenHelmet) {
        this.soundManager.play('chickenDead');
        enemy.die();
    } else if (enemy instanceof Endboss) {
        enemy.takeDamage(15, 'bottle');
        this.soundManager.play('endbossHurt');
        this.soundManager.play('burnSalsa');
    }
};

/**
 * Checks if the character jumps on enemies.
 */
World.prototype.checkJumpHit = function () {
    this.level.enemies.forEach(enemy => this.handleJumpHitOnEnemy(enemy));
};

/**
 * Handles jump hit on a specific enemy.
 * @param {Object} enemy - Enemy instance.
 */
World.prototype.handleJumpHitOnEnemy = function (enemy) {
    if (!this.shouldProcessJumpHit(enemy)) return;
    if (enemy.constructor.name === 'Chicken') this.handleStandardChickenJump(enemy);
    else if (enemy.constructor.name === 'ChickenHelmet') this.handleHelmetChickenJump(enemy);
    else if (enemy.constructor.name === 'ChickenSmall') this.handleSmallChickenJump(enemy);
    else if (enemy instanceof Endboss) this.handleBossJump(enemy);
    this.applyTemporaryInvulnerability();
};

/**
 * Determines if a jump hit should be processed.
 * @param {Object} enemy - Enemy instance.
 * @returns {boolean} True if valid stomp.
 */
World.prototype.shouldProcessJumpHit = function (enemy) {
    if (!this.isColliding(this.character, enemy)) return false;
    if (enemy.isDead || this.character.isDead) return false;
    const charBottom = this.character.y + this.character.height;
    const isFalling = this.character.speedY < 0;
    return isFalling && charBottom >= enemy.y && charBottom <= enemy.y + 40;
};

/**
 * Handles jump on a standard chicken.
 * @param {Object} enemy - Chicken instance.
 */
World.prototype.handleStandardChickenJump = function (enemy) {
    this.soundManager.play('chickenDead');
    enemy.die();
    this.character.speedY = 10;
};

/**
 * Handles jump on a helmet chicken.
 * @param {Object} enemy - Helmet chicken.
 */
World.prototype.handleHelmetChickenJump = function (enemy) {
    enemy.takeHit();
    this.character.speedY = 10;
};

/**
 * Handles jump on a small chicken.
 * @param {Object} enemy - Small chicken.
 */
World.prototype.handleSmallChickenJump = function (enemy) {
    this.soundManager.play('chickenDead');
    enemy.die();
    this.character.speedY = 0;
};

/**
 * Handles jump on the endboss.
 * @param {Object} enemy - Endboss instance.
 */
World.prototype.handleBossJump = function (enemy) {
    enemy.takeDamage(15, 'jump');
    this.soundManager.play('endbossHurt');
    this.character.speedY = 8;
    this.startBossKnockback(enemy);
};

/**
 * Starts boss knockback animation.
 * @param {Object} enemy - Endboss instance.
 */
World.prototype.startBossKnockback = function (enemy) {
    const direction = this.character.x < enemy.x ? -1 : 1;
    const startX = this.character.x;
    const targetX = startX + direction * 180;
    const startTime = performance.now();
    const step = time => this.updateBossKnockback(time, startTime, 350, startX, targetX);
    this.registerAnimationFrame(requestAnimationFrame(step));
};

/**
 * Updates boss knockback animation.
 */
World.prototype.updateBossKnockback = function (time, start, duration, x0, x1) {
    const p = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    this.character.x = x0 + (x1 - x0) * ease;
    this.character.clampPosition();
    if (p < 1) this.registerAnimationFrame(
        requestAnimationFrame(t => this.updateBossKnockback(t, start, duration, x0, x1))
    );
};

/**
 * Applies short invulnerability after a jump hit.
 */
World.prototype.applyTemporaryInvulnerability = function () {
    this.character.isInvulnerable = true;
    setTimeout(() => this.character.isInvulnerable = false, 300);
};

/**
 * Checks if enemies damage the character.
 */
World.prototype.checkEnemyHit = function () {
    if (this.character.isInvulnerable || this.character.isDead) return;
    for (const enemy of this.level.enemies) {
        if (!this.shouldEnemyDamageCharacter(enemy)) continue;
        this.applyEnemyDamageToCharacter(enemy);
        break;
    }
};

/**
 * Determines if an enemy damages the character.
 * @param {Object} enemy - Enemy instance.
 * @returns {boolean} True if damage applies.
 */
World.prototype.shouldEnemyDamageCharacter = function (enemy) {
    if (enemy.isDead) return false;
    if (!this.isColliding(this.character, enemy)) return false;
    return !this.isStompOnEnemy(enemy);
};

/**
 * Checks if the character stomps an enemy.
 * @param {Object} enemy - Enemy instance.
 * @returns {boolean} True if stomp.
 */
World.prototype.isStompOnEnemy = function (enemy) {
    const charBottom = this.character.y + this.character.height;
    return this.character.speedY < 0 && charBottom <= enemy.y + 40;
};

/**
 * Applies enemy damage effects.
 * @param {Object} enemy - Enemy instance.
 */
World.prototype.applyEnemyDamageToCharacter = function (enemy) {
    this.character.takeDamage(10);
    this.soundManager.play('hit');
    this.character.isHurt = true;
    this.startEnemyKnockback(enemy);
    this.resetHurtFlagAfterDelay();
};

/**
 * Resets hurt flag after delay.
 */
World.prototype.resetHurtFlagAfterDelay = function () {
    setTimeout(() => this.character.isHurt = false, 250);
};

/**
 * Starts knockback when hit by an enemy.
 * @param {Object} enemy - Enemy instance.
 */
World.prototype.startEnemyKnockback = function (enemy) {
    const dir = enemy.x < this.character.x ? 1 : -1;
    const startX = this.character.x;
    const endX = startX + dir * 60;
    const start = performance.now();
    const step = t => this.updateEnemyKnockback(t, start, 250, startX, endX);
    requestAnimationFrame(step);
};

/**
 * Updates enemy knockback animation.
 */
World.prototype.updateEnemyKnockback = function (time, start, duration, x0, x1) {
    const p = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 2);
    this.character.x = x0 + (x1 - x0) * ease;
    this.character.clampPosition();
    if (p < 1 && !this.character.isDead) {
        requestAnimationFrame(t => this.updateEnemyKnockback(t, start, duration, x0, x1));
    }
};

/**
 * Activates the endboss when close enough.
 */
World.prototype.checkEndbossActivation = function () {
    if (!this.level.endboss) return;
    const boss = this.level.endboss;
    if (!boss.isActive && Math.abs(boss.x - this.character.x) < 750) {
        boss.world = this;
        boss.activate();
        this.statusBarBoss.isVisible = true;
    }
};

/**
 * Runs all collision checks.
 */
World.prototype.checkCollisions = function () {
    this.checkCoinHit();
    this.checkBottleCollection();
    this.checkBottleHit();
    this.checkJumpHit();
    this.checkEnemyHit();
    this.checkEndbossActivation();
};
