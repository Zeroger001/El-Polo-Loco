/**
 * Handles all rendering operations for the World class.
 */

/**
 * Draws the complete game frame including world and HUD.
 */
World.prototype.draw = function () {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isPaused) {
        this.drawPauseOverlay();
        return;
    }

    ctx.save();
    ctx.translate(this.camera_x + 120, 0);

    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.bottles);
    this.addObjectsToMap(this.throwables);
    this.addObjectsToMap(this.level.enemies);

    if (this.level.endboss) this.addToMap(this.level.endboss);
    this.addToMap(this.character);

    ctx.restore();
    this.drawHudElements();

    if (!this.showGameOver && !this.isPaused) {
        this.animationFrameId = requestAnimationFrame(this.draw);
    }
};

/**
 * Draws all visible HUD elements.
 */
World.prototype.drawHudElements = function () {
    if (this.statusBarHealth) this.addToMap(this.statusBarHealth);
    if (this.statusBarCoins) this.addToMap(this.statusBarCoins);
    if (this.statusBarBottles) this.addToMap(this.statusBarBottles);
    if (this.statusBarBoss?.isVisible) this.addToMap(this.statusBarBoss);
};
