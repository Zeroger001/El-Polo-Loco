/** World is the central game controller that manages level and game state. */
class World {
    character = new Character();
    level;
    ctx;
    canvas;
    keyboard;
    camera_x = 0;
    throwables = [];
    soundManager = new SoundManager();
    youLostScreen = new YouLost();
    youWonScreen = new YouWon();
    showGameOver = false;
    gameOverMode = null;
    gameOverUI;
    fadeActive = false;
    isPaused = false;
    intervalIds = [];
    animationFrameId = 0;

    /** Creates a new world instance and prepares core systems. */
    constructor(canvas, keyboard, level, levelIndex = null) {
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.level = level;
        this.activeLevelIndex = levelIndex ?? this.detectCurrentLevelIndex(level);
        this.currentLevelClass = this.level.constructor;
        this.ctx = canvas.getContext('2d');
        this.draw = this.draw.bind(this);
        this.setWorld();
        this.initStatusBars();
        this.unlockSoundOnInteraction();
        this.registerMouseMoveListener();
        this.draw();
    }

    /** Registers an interval or timeout for later cleanup. */
    registerLoop(id) {
        this.intervalIds.push(id);
        return id;
    }

    /** Stores the current animation frame id. */
    registerAnimationFrame(id) {
        this.animationFrameId = id;
        return id;
    }

    /** Detects the numeric index for the given level instance. */
    detectCurrentLevelIndex(level) {
        if (level.name === 'Level 1') return 1;
        if (level.name === 'Level 2') return 2;
        if (level.name === 'Level 3') return 3;
        return 1;
    }

    /** Binds this world instance to the main character. */
    setWorld() {
        this.character.world = this;
    }

    /** Unlocks sound playback after first user interaction. */
    unlockSoundOnInteraction() {
        let unlocked = false;
        const unlock = () => {
            if (unlocked) return;
            unlocked = true;
            this.soundManager.play('menu');
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
    }

    /** Initializes entities and starts the main game loop. */
    async init() {
        this.gameOverUI = new GameOverUI(this);

        this.level.enemies.forEach(e => e.world = this);
        if (this.level.endboss) this.level.endboss.world = this;

        await Promise.all([
            this.character.init(),
            ...this.level.enemies.map(e => e.init()),
            ...this.level.clouds.map(c => c.init()),
            ...this.level.backgroundObjects.map(b => b.init()),
            ...this.level.coins.map(c => c.init()),
            ...this.level.bottles.map(b => b.init())
        ]);

        this.run();
        this.registerAnimationFrame(requestAnimationFrame(this.draw));
    }

    /** Starts background music if available. */
    startBackgroundMusic() {
        this.soundManager?.startBackgroundMusic();
    }

    /** Stops background music playback. */
    stopBackgroundMusic() {
        this.soundManager?.stopBackgroundMusic();
    }

    /** Toggles sound mute state and music playback. */
    handleSoundToggle() {
        const canStartMusic = !this.showGameOver && !this.fadeActive && !this.isPaused;
        this.soundManager.toggleMute({ canStartMusic });
    }

    /** Displays a short fading sound toggle icon. */
    showSoundToggleIcon() {
        if (this.showingSoundIcon) return;
        this.showingSoundIcon = true;
        const icon = this.soundManager.muted ? '🔇' : '🔊';
        const config = this.createSoundIconConfig(this.ctx, icon);
        const step = now => this.updateAndDrawSoundIcon(now, config, step);
        requestAnimationFrame(step);
    }

    /** Toggles the paused state of the game. */
    togglePause() {
        if (this.showGameOver || this.fadeActive) return;
        this.isPaused ? this.resumeGame() : this.pauseGame();
        this.isPaused = !this.isPaused;
    }

    /** Pauses all gameplay, sounds and animations. */
    pauseGame() {
        if (this.character.isDead || this.level.endboss?.isDead) return;
        this.stopAllLoops();
        this.soundManager?.backgroundMusic?.pause();
        this.soundManager?.endbossBattleMusic?.pause();
        this.character.isPaused = true;
        this.level.enemies.forEach(e => e.isPaused = true);
        this.character.stopAllSounds();
        this.level.endboss?.clearAllLoops();
        if (this.level.endboss) this.level.endboss.isPaused = true;
        this.drawPauseOverlay();
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame(() => this.drawPauseOverlay());
    }

    /** Resumes the game after being paused. */
    resumeGame() {
        this.resumeCharacter();
        this.resumeEnemies();
        this.resumeEndboss();
        this.run();
        this.registerAnimationFrame(requestAnimationFrame(this.draw));
        this.resumeMusic();
        this.resetKeyboardState();
    }

    /**
   * Draws a semi-transparent pause overlay inside the canvas.
   */
    drawPauseOverlay() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '80px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⏸️ PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText("Press 'P' or 'ESC' to resume", canvas.width / 2, canvas.height / 2 + 70);
        ctx.restore();
    }

    /**
    * Stops all active loops, intervals and animations.
    */
    stopAllLoops() {
        this.intervalIds.forEach(id => { clearInterval(id); clearTimeout(id); });
        this.intervalIds = [];

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = 0;

        if (this.character?.animationFrameId) cancelAnimationFrame(this.character.animationFrameId);
        if (this.character) this.character.animationFrameId = 0;

        if (!this.level?.endboss) return;
        if (this.level.endboss.animationFrameId) cancelAnimationFrame(this.level.endboss.animationFrameId);
        this.level.endboss.animationFrameId = 0;
        this.level.endboss.clearAllLoops?.();
    }

    /** Initializes all HUD status bars. */
    initStatusBars() {
        this.statusBarHealth = new StatusBar('health', 10, 20);
        this.statusBarCoins = new StatusBar('coin', 10, 60);
        this.statusBarBottles = new StatusBar('bottle', 10, 100);
        this.statusBarBoss = new StatusBar('boss', 280, 410);
        this.statusBarBoss.isVisible = false;
        this.statusBarHealth.setPercentage(100);
        this.statusBarCoins.setPercentage(0);
        this.statusBarBottles.setPercentage(0);
        this.statusBarBoss.setPercentage(100);
    }

    /** Tracks mouse position over the canvas. */
    registerMouseMoveListener() {
        this.canvas.addEventListener('mousemove', e => {
            const r = this.canvas.getBoundingClientRect();
            this.mousePosition = { x: e.clientX - r.left, y: e.clientY - r.top };
        });
    }

    /** Creates configuration data for sound icon animation. */
    createSoundIconConfig(ctx, icon) {
        return {
            ctx,
            icon,
            opacity: 1,
            x: this.canvas.width - 80,
            y: 60,
            duration: 1000,
            startTime: performance.now()
        };
    }

    /** Updates and renders the fading sound icon. */
    updateAndDrawSoundIcon(now, config, step) {
        const elapsed = now - config.startTime;
        config.opacity = 1 - elapsed / config.duration;
        if (config.opacity <= 0) {
            this.showingSoundIcon = false;
            return;
        }
        this.drawSoundIconFrame(config);
        requestAnimationFrame(step);
    }

    /** Draws a single sound icon frame. */
    drawSoundIconFrame(config) {
        const ctx = config.ctx;
        ctx.save();
        ctx.globalAlpha = config.opacity;
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(config.x - 35, config.y - 35, 70, 70);
        ctx.fillStyle = '#fff';
        ctx.fillText(config.icon, config.x, config.y);
        ctx.restore();
    }

    /** Resumes the main character state. */
    resumeCharacter() {
        if (this.character.isSnooring && this.character.snooringAudio) {
            this.character.snooringAudio.play();
        }
        this.character.isPaused = false;
        if (!this.character.animationFrameId) this.character.animate();
    }

    /** Resumes all normal enemies. */
    resumeEnemies() {
        this.level.enemies.forEach(enemy => {
            enemy.isPaused = false;
            if (enemy.onResume) enemy.onResume();
            else if (enemy.animate && !enemy.isDead && !enemy.walkInterval) enemy.animate();
        });
    }

    /** Resumes the endboss if present. */
    resumeEndboss() {
        if (!this.level.endboss) return;
        this.level.endboss.isPaused = false;
        if (this.level.endboss.onResume) this.level.endboss.onResume();
        else if (!this.level.endboss.animationFrameId && this.level.endboss.isActive) {
            this.level.endboss.animate();
        }
    }

    /** Resumes background or battle music. */
    resumeMusic() {
        if (this.soundManager.muted) return;
        this.soundManager.endbossBattleMusic
            ? this.soundManager.endbossBattleMusic.play().catch(() => { })
            : this.soundManager.startBackgroundMusic();
    }

    /** Resets all keyboard input flags. */
    resetKeyboardState() {
        this.keyboard.LEFT = false;
        this.keyboard.RIGHT = false;
        this.keyboard.UP = false;
        this.keyboard.DOWN = false;
        this.keyboard.SPACE = false;
    }
}