/**
 * Initializes mobile controls after DOM is ready.
 */
document.addEventListener("DOMContentLoaded", () => {
    if (!isMobileDeviceControls()) return;

    const controls = document.getElementById("mobile-controls");
    const fsBtn = document.getElementById("fullscreen-btn-html");
    if (!controls) return;

    document.addEventListener("gameStart", () => {
        controls.style.display = "block";
        updatePauseButtonIcon();
        updateMuteButtonIcon();
    });

    bindControlButtons();
    bindPauseButton();
    bindMuteButton();
    bindFullscreenButton(fsBtn);
});

/**
 * Returns true if device should use mobile controls.
 * @returns {boolean}
 */
function isMobileDeviceControls() {
    const mq = window.matchMedia("(max-width: 1024px)").matches;
    const ua = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    const touch = navigator.maxTouchPoints > 1;
    return mq || ua || touch;
}

/**
 * Binds movement and action buttons.
 */
function bindControlButtons() {
    document.querySelectorAll(".btn-control").forEach(btn => {
        const key = btn.dataset.key;
        if (!key) return;
        bindPressEvents(btn, key);
        bindReleaseEvents(btn, key);
    });
}

/**
 * Binds press events for a control button.
 */
function bindPressEvents(btn, key) {
    const handler = e => {
        e.preventDefault();
        pressKeyControl(key);
    };
    btn.addEventListener("touchstart", handler, { passive: false });
    btn.addEventListener("mousedown", handler);
}

/**
 * Binds release events for a control button.
 */
function bindReleaseEvents(btn, key) {
    const handler = e => {
        e.preventDefault();
        releaseKeyControl(key);
    };
    btn.addEventListener("touchend", handler, { passive: false });
    btn.addEventListener("touchcancel", () => releaseKeyControl(key));
    btn.addEventListener("mouseup", handler);
    btn.addEventListener("mouseleave", () => releaseKeyControl(key));
}

/**
 * Sets a keyboard key to active.
 * @param {string} key
 */
function pressKeyControl(key) {
    if (!window.keyboard || !(key in keyboard)) return;
    keyboard[key] = true;
}

/**
 * Resets a keyboard key state.
 * @param {string} key
 */
function releaseKeyControl(key) {
    if (!window.keyboard || !(key in keyboard)) return;
    keyboard[key] = false;
}

/**
 * Binds pause toggle button.
 */
function bindPauseButton() {
    const btn = document.querySelector('[data-action="pause"]');
    if (!btn) return;

    const handler = e => {
        e.preventDefault();
        if (!window.world?.togglePause) return;
        world.togglePause();
        updatePauseButtonIcon();
    };

    btn.addEventListener("touchstart", handler, { passive: false });
    btn.addEventListener("click", handler);
}

/**
 * Updates pause button icon based on pause state.
 */
function updatePauseButtonIcon() {
    const btn = document.querySelector('[data-action="pause"]');
    if (!btn || !window.world) return;
    btn.textContent = world.isPaused ? '▶️' : '⏸';
}

/**
 * Binds mute toggle button.
 */
function bindMuteButton() {
    const btn = document.querySelector('[data-action="mute"]');
    if (!btn) return;

    const handler = e => {
        e.preventDefault();
        if (!window.world?.handleSoundToggle) return;
        world.handleSoundToggle();
        world.showSoundToggleIcon?.();
        updateMuteButtonIcon();
    };

    btn.addEventListener("touchstart", handler, { passive: false });
    btn.addEventListener("click", handler);
}

/**
 * Updates mute button icon based on sound state.
 */
function updateMuteButtonIcon() {
    const btn = document.querySelector('[data-action="mute"]');
    if (!btn || !window.world) return;
    btn.textContent = world.soundManager.muted ? '🔇' : '🔊';
}

/**
 * Binds mobile expand (pseudo fullscreen) button.
 * @param {HTMLElement} btn
 */
function bindFullscreenButton(btn) {
    if (!btn) return;

    const handler = e => {
        e.preventDefault();
        if (window.toggleMobileExpandedMode) {
            toggleMobileExpandedMode();
        }
    };

    btn.addEventListener("touchstart", handler, { passive: false });
    btn.addEventListener("click", handler);
}
