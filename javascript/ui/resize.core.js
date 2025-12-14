/**
 * Provides core viewport and scaling utilities for the game.
 */

const GAME_WIDTH = 720;
const GAME_HEIGHT = 480;

let resizeCanvasInitialized = false;

/**
 * Returns whether the device is likely mobile.
 * @returns {boolean}
 */
function isTrueMobileDeviceResize() {
    const mq = window.matchMedia("(max-width: 768px)").matches;
    const ua = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    const touch = navigator.maxTouchPoints > 1;
    return mq || ua || touch;
}

/**
 * Returns true if the device is currently in landscape orientation.
 * @returns {boolean}
 */
function isLandscape() {
    const o = window.screen?.orientation?.type;
    if (o) return o.startsWith("landscape");
    return window.innerWidth > window.innerHeight;
}

/**
 * Returns current viewport size considering iOS visualViewport.
 * @returns {{width:number,height:number}}
 */
function getViewportSize() {
    const v = window.visualViewport;
    return v
        ? { width: v.width, height: v.height }
        : { width: window.innerWidth, height: window.innerHeight };
}

/**
 * Initializes responsive canvas scaling.
 */
function setupResponsiveCanvas() {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!resizeCanvasInitialized) {
        resizeCanvasInitialized = true;
        window.addEventListener("resize", () => resizeCanvas(canvas, ctx));
        window.visualViewport?.addEventListener("resize", () => resizeCanvas(canvas, ctx));
    }

    resizeCanvas(canvas, ctx);
}

/**
 * Applies responsive scaling to the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 */
function resizeCanvas(canvas, ctx) {
    const vp = getViewportSize();

    const scaleX = vp.width / GAME_WIDTH;
    const scaleY = vp.height / GAME_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    canvas.style.width = GAME_WIDTH * scale + "px";
    canvas.style.height = GAME_HEIGHT * scale + "px";
    canvas.style.display = "block";
    canvas.style.margin = "auto";

    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Toggles mobile expanded game mode (pseudo fullscreen).
 */
function toggleMobileExpandedMode() {
    if (!isTrueMobileDeviceResize()) return;
    document.body.classList.toggle("game-expanded");
    setupResponsiveCanvas();
}

/**
 * Handles orientation logic before game start.
 * @param {Function} callback
 */
function windowSizeCheck(callback) {
    if (!isTrueMobileDeviceResize()) return callback?.();
    if (isLandscape()) return callback?.();

    showRotateOverlay();
    let waiting = true;

    function tryStart() {
        if (!waiting || !isLandscape()) return;
        waiting = false;
        hideRotateOverlay();
        window.removeEventListener("orientationchange", tryStart);
        window.removeEventListener("resize", tryStart);
        callback?.();
    }

    window.addEventListener("orientationchange", tryStart);
    window.addEventListener("resize", tryStart);
}

/**
 * Handles orientation changes during gameplay.
 */
function handleOrientationDuringGame() {
    if (!isTrueMobileDeviceResize() || !window.isGameRunning) return;
    isLandscape() ? hideRotateOverlay() : showRotateOverlay();
}

window.addEventListener("orientationchange", handleOrientationDuringGame);
window.addEventListener("resize", handleOrientationDuringGame);

window.setupResponsiveCanvas = setupResponsiveCanvas;
window.windowSizeCheck = windowSizeCheck;
window.toggleMobileExpandedMode = toggleMobileExpandedMode;
