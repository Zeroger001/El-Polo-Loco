let canvas;
let world;
let keyboard = new Keyboard();
window.keyboard = keyboard;
let soundManager = new SoundManager();
let soundUnlocked = false;

const menu = document.getElementById("main-menu");
const startBtn = document.getElementById("start-btn");
const levelButtons = document.getElementById("level-buttons");
const level1Btn = document.getElementById("level1_btn");
const level2Btn = document.getElementById("level2_btn");
const level3Btn = document.getElementById("level3_btn");
const soundBtn = document.getElementById("sound-toggle");
const overlay = document.getElementById("loading-overlay");

canvas = document.getElementById("canvas");

/**
 * Detects whether current device is a mobile device.
 * @returns {boolean}
 */
function isTrueMobileDevice() {
    const mq = window.matchMedia("(max-width: 768px)").matches;
    const ua = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    const touch = navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    return mq || ua || touch;
}

/**
 * Sets up a fixed 720x480 canvas for desktop.
 */
function setupDesktopCanvas() {
    canvas.style.width = "720px";
    canvas.style.height = "480px";
    canvas.width = 720;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * Initializes all game-related DOM and bindings.
 */
function initializeGameDom() {
    hideLevelButtons();
    bindStartButton();
    bindLevelButtons();
    bindMenuSoundButton();
    bindKeyboardEvents();
    initSoundUnlock();
    bindMenuClickSounds();
}

/**
 * Hides the level selection buttons.
 */
function hideLevelButtons() {
    levelButtons.classList.add("hidden");
}

/**
 * Binds start menu button behavior.
 */
function bindStartButton() {
    startBtn.addEventListener("click", handleStartButtonClick);
}

/**
 * Handles the main start button click animation.
 */
function handleStartButtonClick() {
    startBtn.classList.add("fade-out");
    setTimeout(() => {
        startBtn.style.display = "none";
        levelButtons.classList.remove("hidden");
        levelButtons.classList.add("visible");
    }, 600);
}

/**
 * Binds level selection buttons.
 */
function bindLevelButtons() {
    level1Btn.addEventListener("click", () =>
        windowSizeCheck(() => startGame(createLevel1(), 1))
    );
    level2Btn.addEventListener("click", () =>
        windowSizeCheck(() => startGame(createLevel2(), 2))
    );
    level3Btn.addEventListener("click", () =>
        windowSizeCheck(() => startGame(createLevel3(), 3))
    );
}

/**
 * Binds the main menu sound toggle button.
 */
function bindMenuSoundButton() {
    soundBtn.addEventListener("click", () => {
        soundManager.toggleMute({ canStartMusic: false });
    });
}

/**
 * Enables expanded mobile game mode on game start.
 */
function enableMobileExpandedModeOnGameStart() {
    if (!isTrueMobileDevice()) return;
    document.body.classList.add("game-expanded");
    setupResponsiveCanvas?.();
}

/**
 * Starts the game with a given level configuration.
 * @param {Level} levelObj
 * @param {number} levelIndex
 */
async function startGame(levelObj, levelIndex) {
    prepareGameView();
    enableMobileExpandedModeOnGameStart();
    setupCanvasMode();
    createWorldInstance(levelObj, levelIndex);
    rebindWorldSoundButton();
    await runWorldInit();
    startGameAudio();
    notifyMobileStart();
}

/**
 * Hides menu and shows the canvas.
 */
function prepareGameView() {
    menu.style.display = "none";
    canvas.style.display = "block";
}

/**
 * Sets up canvas depending on device type.
 */
function setupCanvasMode() {
    if (isTrueMobileDevice()) setupResponsiveCanvas();
    else setupDesktopCanvas();
}

/**
 * Creates and configures the world instance.
 * @param {Level} levelObj
 * @param {number} levelIndex
 */
function createWorldInstance(levelObj, levelIndex) {
    world = new World(canvas, keyboard, levelObj, levelIndex);
    window.world = world;
    window.isGameRunning = true;
    world.soundManager = soundManager;
}

/**
 * Rebinds the sound toggle button to world handler.
 */
function rebindWorldSoundButton() {
    const oldBtn = document.getElementById("sound-toggle");
    const clone = oldBtn.cloneNode(true);
    oldBtn.replaceWith(clone);
    clone.addEventListener("click", () => world.handleSoundToggle());
}

/**
 * Runs world initialization with loading overlay.
 */
async function runWorldInit() {
    overlay.style.display = "flex";
    await world.init();
    overlay.style.display = "none";
    updateMuteButtonIcon();
    updatePauseButtonIcon();
}

/**
 * Starts background music after world init.
 */
function startGameAudio() {
    world.startBackgroundMusic();
}

/**
 * Notifies mobile listeners that the game has started.
 */
function notifyMobileStart() {
    if (isTrueMobileDevice()) {
        document.dispatchEvent(new Event("gameStart"));
    }
}

/**
 * Binds global keyboard events.
 */
function bindKeyboardEvents() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
}

/**
 * Returns true if key input should be blocked while paused.
 * @param {KeyboardEvent} e
 * @returns {boolean}
 */
function shouldBlockKeyInput(e) {
    if (!world || !world.isPaused) return false;
    return e.keyCode !== 80 && e.keyCode !== 27;
}

/**
 * Handles keydown events.
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
    if (shouldBlockKeyInput(e)) return;
    switch (e.keyCode) {
        case 37: keyboard.LEFT = true; break;
        case 39: keyboard.RIGHT = true; break;
        case 40: keyboard.DOWN = true; break;
        case 32: keyboard.SPACE = true; break;
        case 38: keyboard.UP = true; break;
        case 77: handleMuteKeyDown(); break;
        case 80:
        case 27: handlePauseKeyDown(); break;
    }
}

/**
 * Handles keyup events.
 * @param {KeyboardEvent} e
 */
function handleKeyUp(e) {
    if (shouldBlockKeyInput(e)) return;
    switch (e.keyCode) {
        case 37: keyboard.LEFT = false; break;
        case 39: keyboard.RIGHT = false; break;
        case 40: keyboard.DOWN = false; break;
        case 32: keyboard.SPACE = false; break;
        case 38: keyboard.UP = false; break;
    }
}

/**
 * Handles mute key behavior.
 */
function handleMuteKeyDown() {
    if (!world) return;
    world.handleSoundToggle();
    world.showSoundToggleIcon?.();
    updateMuteButtonIcon();
}

/**
 * Handles pause key behavior.
 */
function handlePauseKeyDown() {
    if (!world) return;
    world.togglePause();
    updatePauseButtonIcon();
}

/**
 * Initializes sound unlock on first user interaction.
 */
function initSoundUnlock() {
    const unlock = () => {
        if (soundUnlocked) return;
        soundUnlocked = true;
        soundManager.play("menu");
        document.removeEventListener("click", unlock);
        document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);
}

/**
 * Binds menu buttons to play click sounds.
 */
function bindMenuClickSounds() {
    menu.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            if (soundUnlocked) soundManager.play("menu");
        });
    });
}

/**
 * Starts game initialization when DOM is ready.
 */
document.addEventListener("DOMContentLoaded", () => {
    initializeGameDom();
});
