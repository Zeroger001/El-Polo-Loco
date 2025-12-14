/**
 * Returns true if the sound name belongs to the endboss sound group.
 * @param {string} name 
 */
function isEndbossSound(name) {
    return [
        "endbossAlert",
        "endbossAttack",
        "endbossHurt",
        "endbossDead"
    ].includes(name);
}

/**
 * Plays an endboss sound and replaces any active one.
 * @param {SoundManager} manager 
 * @param {HTMLAudioElement} audio 
 */
function playEndbossEffect(manager, audio) {
    if (manager.currentEndbossSound) {
        const old = manager.currentEndbossSound;
        old.pause();
        old.currentTime = 0;
    }
    manager.currentEndbossSound = audio;
    audio.currentTime = 0;
    audio.play?.();
}

/**
 * Plays a cloned one-shot sound effect.
 * @param {HTMLAudioElement} audio 
 * @param {boolean} muted 
 * @param {?number} duration 
 */
function playClonedEffect(audio, muted, duration) {
    const clone = audio.cloneNode(true);
    clone.volume = audio.volume;
    clone.muted = muted;
    clone.currentTime = 0;
    clone.play?.();

    clone.onended = () => {
        clone.src = "";
    };
    if (duration) {
        setTimeout(() => {
            clone.pause();
            clone.currentTime = 0;
        }, duration);
    }
}

/**
 * Stops all one-shot sound effects.
 * @param {Object<string, HTMLAudioElement>} sounds 
 */
function stopAllEffects(sounds) {
    Object.values(sounds).forEach(a => {
        if (!a.paused) {
            a.pause();
            a.currentTime = 0;
        }
    });
}
