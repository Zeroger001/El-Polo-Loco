/**
 * Core SoundManager class controlling high-level audio operations.
 */
class SoundManager {
    constructor() {
        this.masterVolume = 0.25;

        this.sounds = createSoundRegistry();
        this.backgroundMusic = this.sounds.background;
        this.endbossBattleMusic = null;
        this.currentEndbossSound = null;
        this.musicLoopActive = false;

        const stored = localStorage.getItem("soundMuted");
        this.muted = stored === "true";

        applyInitialVolume(this.sounds, this.masterVolume);
        applyMuteState(this.sounds, this.muted);

        updateMuteButtonUI(this.muted);
    }

    startBackgroundMusic() {
        if (this.muted || !this.backgroundMusic) return;
        stopMusicInstant(this.backgroundMusic);
        playMusicLoop(this, this.backgroundMusic);
    }

    stopBackgroundMusic() {
        if (!this.backgroundMusic) return;
        stopMusicInstant(this.backgroundMusic);
        this.musicLoopActive = false;
    }

    startEndbossBattleMusic() {
        if (this.muted) return;
        if (this.endbossBattleMusic && !this.endbossBattleMusic.paused) return;
        this.stopBackgroundMusic();
        this.endbossBattleMusic = this.sounds.endbossBattle;
        startBossMusic(this);
    }

    stopEndbossBattleMusic(fade = true) {
        if (!this.endbossBattleMusic) return;
        fade ? fadeOutMusic(this) : stopBossMusicInstant(this);
    }

    play(name, duration = null) {
        if (this.muted) return;
        const sound = this.sounds[name];
        if (!sound) return;
        if (isEndbossSound(name)) {
            playEndbossEffect(this, sound);
            return;
        }
        playClonedEffect(sound, this.muted, duration);
    }

    toggleMute({ canStartMusic = false } = {}) {
        this.muted = !this.muted;
        applyMuteState(this.sounds, this.muted);

        if (this.muted) {
            stopAllMusic(this);
        } else if (canStartMusic && !this.endbossBattleMusic) {
            this.startBackgroundMusic();
        }

        saveMuteState(this.muted);
        updateMuteButtonUI(this.muted);
    }

    stopAll() {
        stopAllMusic(this);
        stopAllEffects(this.sounds);
    }
}
