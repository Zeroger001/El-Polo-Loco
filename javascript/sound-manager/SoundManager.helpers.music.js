/**
 * Creates the registry of all audio assets.
 * @returns {Object<string, HTMLAudioElement>}
 */
function createSoundRegistry() {
    return {
        menu: new Audio('audio/menu-buttom-modern-sound-190017.mp3'),
        background: new Audio('audio/desert-rose-loop-180328.mp3'),
        coin: new Audio('audio/get_coin.mp3'),
        getCoinLife: new Audio('audio/bonus-points-190035.mp3'),
        hit: new Audio('audio/pepe_hurting.mp3'),
        jump: new Audio('audio/character_jumping.mp3'),
        walk: new Audio('audio/character_walk_on_sand.mp3'),
        chickenDead: new Audio('audio/dying_chicken.mp3'),
        gameOver: new Audio('audio/game_over.mp3'),
        victory: new Audio('audio/victory.mp3'),
        snooring: new Audio('audio/pepe_snoring.mp3'),
        collectBottle: new Audio('audio/bottle-clink.mp3'),
        throwBottle: new Audio('audio/rotate-movement-whoosh-1-185335.mp3'),
        hitBottle: new Audio('audio/bottle_splash.mp3'),
        hitHelmet: new Audio('audio/helmet-hit.mp3'),
        endbossAlert: new Audio('audio/boss_entry.mp3'),
        endbossAttack: new Audio('audio/endboss_angry.mp3'),
        endbossHurt: new Audio('audio/endboss_hurting.mp3'),
        endbossDead: new Audio('audio/endboss_dying.mp3'),
        endbossIntro: new Audio('audio/boss-intro.mp3'),
        endbossBattle: new Audio('audio/endboss_sound.mp3'),
        burnSalsa: new Audio('audio/bar-bq-chicken-drumpsticks-129354.mp3')
    };
}

/**
 * Sets initial volume for all provided sounds.
 */
function applyInitialVolume(sounds, level) {
    Object.values(sounds).forEach(a => a.volume = level);
}

/**
 * Applies mute state to all sounds.
 */
function applyMuteState(sounds, muted) {
    Object.values(sounds).forEach(a => a.muted = muted);
}

/**
 * Saves mute state to storage.
 */
function saveMuteState(muted) {
    localStorage.setItem("soundMuted", muted);
}

/**
 * Updates UI mute button label if present.
 */
function updateMuteButtonUI(muted) {
    const btn = document.getElementById("sound-toggle");
    if (btn) btn.textContent = muted ? "🔇 Sound OFF" : "🔊 Sound ON";
}

/**
 * Starts looping background music.
 */
function playMusicLoop(manager, audio) {
    manager.musicLoopActive = true;
    audio.currentTime = 0;
    audio.play?.();
    audio.onended = () => {
        if (manager.musicLoopActive) {
            audio.currentTime = 0;
            audio.play?.();
        }
    };
}

/**
 * Stops a music track instantly.
 */
function stopMusicInstant(audio) {
    audio.pause?.();
    audio.currentTime = 0;
    audio.onended = null;
}

/**
 * Starts looping boss music.
 */
function startBossMusic(manager) {
    const audio = manager.endbossBattleMusic;
    audio.loop = true;
    audio.volume = manager.masterVolume * 0.5;
    audio.currentTime = 0;
    audio.play?.();
}

/**
 * Gradually fades out boss music.
 */
function fadeOutMusic(manager) {
    const audio = manager.endbossBattleMusic;
    const id = setInterval(() => {
        if (audio.volume > 0.02) {
            audio.volume -= 0.02;
        } else {
            clearInterval(id);
            stopBossMusicInstant(manager);
        }
    }, 80);
}

/**
 * Stops boss music instantly.
 */
function stopBossMusicInstant(manager) {
    const audio = manager.endbossBattleMusic;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    audio.volume = manager.masterVolume * 0.5;
    manager.endbossBattleMusic = null;
}

/**
 * Stops all music including boss tracks and current endboss sounds.
 */
function stopAllMusic(manager) {
    stopMusicInstant(manager.backgroundMusic);
    stopBossMusicInstant(manager);
    if (manager.currentEndbossSound) {
        const s = manager.currentEndbossSound;
        s.pause();
        s.currentTime = 0;
        manager.currentEndbossSound = null;
    }
}
