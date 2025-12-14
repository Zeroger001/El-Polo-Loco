/**
 * Handles all HTML UI for game over and victory screens.
 */
class GameOverUI {
    /**
     * Creates a new GameOverUI instance.
     * @param {World} world - Active world instance.
     */
    constructor(world) {
        this.world = world;
        this.cacheElements();
        this.bindEvents();
        this.hide();
    }

    /**
     * Caches all required DOM elements.
     */
    cacheElements() {
        this.container = document.getElementById('gameover-ui');
        this.btnRestart = document.getElementById('btn-restart');
        this.btnMenu = document.getElementById('btn-menu');
        this.btnNext = document.getElementById('btn-next');
    }

    /**
     * Binds click events to UI buttons.
     */
    bindEvents() {
        if (!this.container) return;
        this.bindRestartButton();
        this.bindMenuButton();
        this.bindNextLevelButton();
    }

    /**
     * Binds restart button click.
     */
    bindRestartButton() {
        this.btnRestart?.addEventListener('click', () => {
            this.world.soundManager.play('click');
            this.hide();
            this.world.restartLevel();
        });
    }

    /**
     * Binds menu button click.
     */
    bindMenuButton() {
        this.btnMenu?.addEventListener('click', () => {
            this.world.soundManager.play('click');
            window.location.href = 'index.html';
        });
    }

    /**
     * Binds next level button click.
     */
    bindNextLevelButton() {
        this.btnNext?.addEventListener('click', () => {
            if (!this.canLoadNextLevel()) return;
            this.world.soundManager.play('click');
            this.hide();
            this.world.loadNextLevel();
        });
    }

    /**
     * Returns whether the next level can be loaded.
     * @returns {boolean}
     */
    canLoadNextLevel() {
        return this.world.gameOverMode === 'win'
            && this.world.activeLevelIndex < 3;
    }

    /**
     * Shows the game over UI after a short delay.
     */
    show() {
        if (!this.container) return;
        this.prepareButtons();
        setTimeout(() => this.showNow(), 750);
    }

    /**
     * Shows the game over UI immediately.
     */
    showNow() {
        this.container.classList.remove('hidden');
        this.updateNextLevelVisibility();
        this.animateButtonsStaggered();
    }

    /**
     * Hides the game over UI.
     */
    hide() {
        if (!this.container) return;
        this.container.classList.add('hidden');
        this.prepareButtons();
    }

    /**
     * Updates next level button visibility.
     */
    updateNextLevelVisibility() {
        if (!this.btnNext) return;
        this.btnNext.style.display = this.canLoadNextLevel()
            ? 'inline-block'
            : 'none';
    }

    /**
     * Resets button animation state.
     */
    prepareButtons() {
        this.getButtons().forEach(btn => {
            btn.classList.remove('show');
        });
    }

    /**
     * Animates buttons with staggered spin-fade effect.
     */
    animateButtonsStaggered() {
        const buttons = this.getButtons()
            .filter(b => b.style.display !== 'none');

        requestAnimationFrame(() => {
            buttons.forEach((btn, index) => {
                setTimeout(() => {
                    btn.classList.add('show');
                }, index * 150);
            });
        });
    }

    /**
     * Returns all game over buttons.
     * @returns {HTMLElement[]}
     */
    getButtons() {
        return [this.btnRestart, this.btnMenu, this.btnNext].filter(Boolean);
    }
}
