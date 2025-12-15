/**
 * Initializes touch controls after DOM is ready.
 */
document.addEventListener("DOMContentLoaded", () => {
    if (!shouldUseTouchControls()) return;

    const controls = document.getElementById("mobile-controls");
    const fsBtn = document.getElementById("fullscreen-btn-html");
    if (!controls) return;

    document.addEventListener("gameStart", () => {
        document.body.classList.add("game-running");

        controls.style.pointerEvents = "auto";

        if (fsBtn && shouldEnableMobileFullscreen()) {
            document.body.classList.add("mobile-fullscreen-enabled");
        }

        updatePauseButtonIcon();
        updateMuteButtonIcon();
    });

    bindControlButtons();
    bindPauseButton();
    bindMuteButton();
    bindFullscreenButton(fsBtn);
});

/**
 * Determines whether touch controls should be enabled.
 * @returns {boolean}
 */
function shouldUseTouchControls() {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(max-width: 1024px)").matches
    );
}

/**
 * Returns true if fullscreen should be enabled (smartphones only).
 * @returns {boolean}
 */
function shouldEnableMobileFullscreen() {
    return (
        navigator.maxTouchPoints > 0 &&
        window.matchMedia("(max-width: 768px)").matches
    );
}

/**
 * Binds movement buttons.
 */
function bindControlButtons() {
    document.querySelectorAll(".btn-control").forEach(btn => {
        const key = btn.dataset.key;
        if (!key) return;

        const press = e => {
            e.preventDefault();
            keyboard[key] = true;
        };

        const release = e => {
            e.preventDefault();
            keyboard[key] = false;
        };

        btn.addEventListener("touchstart", press, { passive: false });
        btn.addEventListener("mousedown", press);

        btn.addEventListener("touchend", release, { passive: false });
        btn.addEventListener("touchcancel", release);
        btn.addEventListener("mouseup", release);
        btn.addEventListener("mouseleave", release);
    });
}

/**
 * Binds pause button.
 */
function bindPauseButton() {
    document.querySelectorAll('[data-action="pause"]').forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            world?.togglePause();
            updatePauseButtonIcon();
        });
    });
}

/**
 * Updates pause button icon.
 */
function updatePauseButtonIcon() {
    document.querySelectorAll('[data-action="pause"]').forEach(btn => {
        btn.textContent = world?.isPaused ? '▶️' : '⏸';
    });
}

/**
 * Binds mute button.
 */
function bindMuteButton() {
    document.querySelectorAll('[data-action="mute"]').forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            world?.handleSoundToggle();
            world?.showSoundToggleIcon?.();
            updateMuteButtonIcon();
        });
    });
}

/**
 * Updates mute button icon.
 */
function updateMuteButtonIcon() {
    document.querySelectorAll('[data-action="mute"]').forEach(btn => {
        btn.textContent = world?.soundManager?.muted ? '🔇' : '🔊';
    });
}

/**
 * Binds mobile fullscreen toggle.
 * @param {HTMLElement} btn
 */
function bindFullscreenButton(btn) {
    if (!btn) return;

    btn.addEventListener("click", e => {
        e.preventDefault();
        window.toggleMobileExpandedMode?.();
    });
}
