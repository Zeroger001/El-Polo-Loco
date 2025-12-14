/**
 * Extends the World prototype with core game loop and game state logic.
 */

/**
 * Starts the main game loop checking collisions and game state.
 */
World.prototype.run = function () {
    this.registerLoop(setInterval(() => {
        this.checkCollisions();
        this.updateStatusBars();
        this.checkGameEndConditions();
    }, 1000 / 60));
};

/**
 * Updates all status bars based on current game state.
 */
World.prototype.updateStatusBars = function () {
    this.statusBarHealth.setPercentage(this.character.health);
    this.statusBarCoins.setPercentage(this.character.coinCounter * 10);
    this.statusBarBottles.setPercentage(this.character.bottles * 20);
    if (this.level.endboss && this.statusBarBoss.isVisible) {
        this.statusBarBoss.setPercentage(this.level.endboss.health);
    }
};

/**
 * Checks whether win or lose conditions are met.
 */
World.prototype.checkGameEndConditions = function () {
    if (this.deathHandled || this.fadeActive || this.screenShowing) return;
    if (!this.showGameOver && this.character.isDead) this.onPlayerDeath();
    if (!this.showGameOver && this.level.endboss?.isDead) this.onBossDefeated();
};

/**
 * Handles player death game over state.
 */
World.prototype.onPlayerDeath = function () {
    if (this.deathHandled) return;
    this.deathHandled = true;
    this.gameOverMode = 'lost';
    this.soundManager.stopBackgroundMusic();
    this.soundManager.play('gameOver');
    const id = setTimeout(() => {
        this.showGameOver = true;
        this.triggerGameOverScreen('lost');
        this.character?.stopAllSounds();
    }, 2500);
    this.registerLoop(id);
};

/**
 * Handles endboss defeat victory state.
 */
World.prototype.onBossDefeated = function () {
    if (this.deathHandled) return;
    this.deathHandled = true;
    this.gameOverMode = 'win';
    this.soundManager.stopBackgroundMusic();
    const id = setTimeout(() => {
        this.showGameOver = true;
        this.triggerGameOverScreen('win');
        this.character?.stopAllSounds();
    }, 2500);
    this.registerLoop(id);
};

/**
 * Triggers fade-in of the game over or victory screen.
 * @param {string} mode - Either "lost" or "win".
 */
World.prototype.triggerGameOverScreen = function (mode) {
    if (this.fadeActive || this.screenShowing) return;
    this.prepareGameOverState();
    this.disableRestartClickTemporarily();
    this.fadeGameOverScreen(this.selectGameOverScreen(mode));
};

/**
 * Prepares internal flags before showing game over screen.
 */
World.prototype.prepareGameOverState = function () {
    this.fadeActive = true;
    this.screenShowing = true;
    this.stopAllLoops();
    this.soundManager?.stopAll();
};

/**
 * Temporarily disables restart during fade animation.
 */
World.prototype.disableRestartClickTemporarily = function () {
    this.disableRestartClick = true;
    const id = setTimeout(() => this.disableRestartClick = false, 2000);
    this.registerLoop(id);
};

/**
 * Returns the correct screen based on game over mode.
 * @param {string} mode - Game over mode.
 * @returns {Object} Screen instance.
 */
World.prototype.selectGameOverScreen = function (mode) {
    if (mode === 'lost') return this.youLostScreen;
    this.soundManager.play('victory');
    return this.youWonScreen;
};

/**
 * Fades in the selected game over screen.
 * @param {Object} screen - Screen to render.
 */
World.prototype.fadeGameOverScreen = function (screen) {
    let opacity = 0;
    const step = () => {
        if (!this.fadeActive) return;
        this.drawGameOverBackground();
        this.ctx.globalAlpha = opacity;
        this.ctx.drawImage(screen.img, screen.x, screen.y, screen.width, screen.height);
        this.ctx.globalAlpha = 1;
        opacity += 0.02;
        opacity < 1
            ? this.registerAnimationFrame(requestAnimationFrame(step))
            : this.finishGameOverFade();
    };
    step();
};

/**
 * Draws the dimmed background behind game over screens.
 */
World.prototype.drawGameOverBackground = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * Finalizes game over fade and shows HTML UI.
 */
World.prototype.finishGameOverFade = function () {
    this.fadeActive = false;
    this.disableRestartClick = false;
    this.gameOverUI?.show();
};

/**
 * Restarts the current level.
 */
World.prototype.restartLevel = async function () {
    if (this.restarting) return;
    this.beginRestart();
    this.resetLoopsAudioAndScreen();
    this.createLevelForActiveIndex();
    this.resetWorldEntities();
    this.resetGameOverState();
    this.recreateScreens();
    this.resetWorldBindingsAndStatusBars();
    await this.initLevelEntitiesAsync();
    await this.initEndbossAsync();
    this.startMainLoopsAfterRestart();
    this.restarting = false;
};

/**
 * Loads the next level if available.
 */
World.prototype.loadNextLevel = async function () {
    this.prepareNextLevelFlags();
    if (!this.advanceToNextLevel()) return;
    this.resetLoopsAudioAndScreen();
    this.resetWorldEntities();
    this.resetGameOverStateForNext();
    this.resetWorldBindingsAndStatusBars();
    await this.initLevelEntitiesAsync();
    await this.initEndbossAsync();
    this.startMainLoopsAfterRestart();
};

/**
 * Marks restart initialization.
 */
World.prototype.beginRestart = function () {
    this.restarting = true;
    this.deathHandled = false;
};

/**
 * Stops all loops, audio and hides game over UI.
 */
World.prototype.resetLoopsAudioAndScreen = function () {
    this.stopAllLoops();
    this.soundManager.stopBackgroundMusic();
    this.fadeActive = false;
    this.showGameOver = false;
    this.screenShowing = false;
    this.gameOverUI?.hide();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * Creates a new level based on the active index.
 */
World.prototype.createLevelForActiveIndex = function () {
    if (this.activeLevelIndex === 2) this.level = createLevel2();
    else if (this.activeLevelIndex === 3) this.level = createLevel3();
    else this.level = createLevel1();
};

/**
 * Resets core world entities.
 */
World.prototype.resetWorldEntities = function () {
    this.character = new Character();
    this.throwables = [];
    this.camera_x = 0;
};

/**
 * Resets game over related flags.
 */
World.prototype.resetGameOverState = function () {
    this.gameOverMode = null;
    this.fadeActive = false;
    this.showGameOver = false;
};

/**
 * Recreates win and lose screens.
 */
World.prototype.recreateScreens = function () {
    this.youLostScreen = new YouLost();
    this.youWonScreen = new YouWon();
};

/**
 * Rebinds world references and resets status bars.
 */
World.prototype.resetWorldBindingsAndStatusBars = function () {
    this.setWorld();
    this.statusBarHealth.setPercentage(100);
    this.statusBarCoins.setPercentage(0);
    this.statusBarBottles.setPercentage(0);
    this.statusBarBoss.setPercentage(100);
    this.statusBarBoss.isVisible = false;
};

/**
 * Initializes level entities asynchronously.
 */
World.prototype.initLevelEntitiesAsync = async function () {
    await Promise.all([
        this.character.init(),
        ...this.level.enemies.map(e => (e.world = this, e.init())),
        ...this.level.clouds.map(c => c.init()),
        ...this.level.backgroundObjects.map(b => b.init()),
        ...this.level.coins.map(c => c.init()),
        ...this.level.bottles.map(b => b.init())
    ]);
};

/**
 * Initializes the endboss asynchronously.
 */
World.prototype.initEndbossAsync = async function () {
    if (!this.level.endboss) return;
    this.level.endboss.world = this;
    await this.level.endboss.init();
};

/**
 * Starts loops, drawing and music after restart.
 */
World.prototype.startMainLoopsAfterRestart = function () {
    this.run();
    this.registerAnimationFrame(requestAnimationFrame(this.draw));
    this.startBackgroundMusic();
};

/**
 * Prepares flags before advancing to the next level.
 */
World.prototype.prepareNextLevelFlags = function () {
    this.deathHandled = false;
    this.screenShowing = false;
};

/**
 * Advances to the next level or returns to menu.
 * @returns {boolean} Whether a new level was loaded.
 */
World.prototype.advanceToNextLevel = function () {
    if (this.activeLevelIndex >= 3) {
        window.location.href = 'index.html';
        return false;
    }
    this.activeLevelIndex++;
    this.createLevelForActiveIndex();
    return true;
};

/**
 * Resets game over flags for level transitions.
 */
World.prototype.resetGameOverStateForNext = function () {
    this.deathHandled = false;
    this.fadeActive = false;
    this.showGameOver = false;
    this.gameOverMode = null;
};
