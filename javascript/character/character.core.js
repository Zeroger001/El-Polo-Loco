/**
 * Core character class definition.
 */
class CharacterCore extends MovableObject {
  width = 120;
  height = 180;
  y = 230;
  hitboxWidth = 80;
  hitboxHeight = 120;
  hitboxOffsetX = 20;
  hitboxOffsetY = 60;
  speed = 5;
  idleRepeatCount = 0;
  health = 100;
  isInvulnerable = false;
  isHurt = false;
  isDead = false;
  bottles = 1;
  coinCounter = 0;
  lastThrow = 0;
  isSnooring = false;
  snooringAudio = null;

  animIndex = { walk: 0, jump: 0, idle: 0, longIdle: 0 };

  IMAGES_WALKING = [
    'img/2_character_pepe/2_walk/W-21.png', 'img/2_character_pepe/2_walk/W-22.png',
    'img/2_character_pepe/2_walk/W-23.png', 'img/2_character_pepe/2_walk/W-24.png',
    'img/2_character_pepe/2_walk/W-25.png', 'img/2_character_pepe/2_walk/W-26.png'
  ];

  IMAGES_JUMPING = [
    'img/2_character_pepe/3_jump/J-33.png', 'img/2_character_pepe/3_jump/J-34.png',
    'img/2_character_pepe/3_jump/J-35.png', 'img/2_character_pepe/3_jump/J-36.png',
    'img/2_character_pepe/3_jump/J-37.png', 'img/2_character_pepe/3_jump/J-38.png',
    'img/2_character_pepe/3_jump/J-39.png'
  ];

  IMAGES_IDLE = [
    'img/2_character_pepe/1_idle/idle/I-1.png', 'img/2_character_pepe/1_idle/idle/I-2.png',
    'img/2_character_pepe/1_idle/idle/I-3.png', 'img/2_character_pepe/1_idle/idle/I-4.png',
    'img/2_character_pepe/1_idle/idle/I-5.png', 'img/2_character_pepe/1_idle/idle/I-6.png',
    'img/2_character_pepe/1_idle/idle/I-7.png', 'img/2_character_pepe/1_idle/idle/I-8.png',
    'img/2_character_pepe/1_idle/idle/I-9.png', 'img/2_character_pepe/1_idle/idle/I-10.png'
  ];

  IMAGES_LONG_IDLE = [
    'img/2_character_pepe/1_idle/long_idle/I-11.png', 'img/2_character_pepe/1_idle/long_idle/I-12.png',
    'img/2_character_pepe/1_idle/long_idle/I-13.png', 'img/2_character_pepe/1_idle/long_idle/I-14.png',
    'img/2_character_pepe/1_idle/long_idle/I-15.png', 'img/2_character_pepe/1_idle/long_idle/I-16.png',
    'img/2_character_pepe/1_idle/long_idle/I-17.png', 'img/2_character_pepe/1_idle/long_idle/I-18.png',
    'img/2_character_pepe/1_idle/long_idle/I-19.png', 'img/2_character_pepe/1_idle/long_idle/I-20.png'
  ];

  IMAGES_HURT = [
    'img/2_character_pepe/4_hurt/H-41.png',
    'img/2_character_pepe/4_hurt/H-42.png',
    'img/2_character_pepe/4_hurt/H-43.png'
  ];

  IMAGES_DEAD = [
    'img/2_character_pepe/5_dead/D-51.png', 'img/2_character_pepe/5_dead/D-52.png',
    'img/2_character_pepe/5_dead/D-53.png', 'img/2_character_pepe/5_dead/D-54.png',
    'img/2_character_pepe/5_dead/D-55.png', 'img/2_character_pepe/5_dead/D-56.png'
  ];

  constructor() {
    super();
    this.applyGravity();
  }

  /**
   * Loads all required images.
   */
  async init() {
    await this.loadImage(this.IMAGES_IDLE[0]);
    await this.loadImages(this.IMAGES_WALKING);
    await this.loadImages(this.IMAGES_JUMPING);
    await this.loadImages(this.IMAGES_IDLE);
    await this.loadImages(this.IMAGES_LONG_IDLE);
    await this.loadImages(this.IMAGES_HURT);
    await this.loadImages(this.IMAGES_DEAD);
    this.animate();
  }

  /**
   * Plays an animation frame by index.
   */
  playAnimationWithIndex(images, key) {
    const i = this.animIndex[key] % images.length;
    this.img = this.imageCache[images[i]];
    this.animIndex[key]++;
  }

  /**
   * Main animation loop.
   */
  animate() {
    let last = performance.now();
    const loop = (t) => {
      if (this.world?.isPaused) {
        this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(loop));
        return;
      }
      if (!this.world || this.isDead || this.world.showGameOver) return;
      const delta = (t - last) / 1000;
      last = t;
      this.updateMovement(delta);
      this.updateAnimations(t);
      this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(loop));
    };
    this.clampPosition();
    this.animationFrameId = this.world.registerAnimationFrame(requestAnimationFrame(loop));
  }

  /**
   * Updates movement & input.
   */
  updateMovement(delta) {
    if (this.isHurt) return;
    const K = this.world.keyboard;
    if (K.SPACE && !this.isAboveGround()) {
      this.jump();
      this.animIndex.jump = 0;
    }
    if (K.RIGHT && this.x < this.world.level.level_end_x) {
      this.x += this.speed;
      this.otherDirection = false;
      if (!this.isAboveGround() && !this.isDead) this.playWalkSound();
    } else if (K.LEFT && this.x > 0) {
      this.x -= this.speed;
      this.otherDirection = true;
      if (!this.isAboveGround() && !this.isDead) this.playWalkSound();
    } else {
      this.stopWalkSound();
    }
    if (K.UP) {
      this.throwBottle();
      K.UP = false;
    }
    this.world.camera_x = -this.x + 100;
  }

  /**
   * Updates animation state.
   */
  updateAnimations(t) {
    const K = this.world.keyboard;
    const noMove = !K.RIGHT && !K.LEFT && !K.SPACE;
    const move = K.RIGHT || K.LEFT || K.SPACE;
    if ((this.isHurt || move) && this.isSnooring && this.snooringAudio) {
      this.snooringAudio.pause();
      this.snooringAudio.currentTime = 0;
      this.isSnooring = false;
    }
    if (this.isHurt) return;
    if (this.isAboveGround() || this.speedY > 0) {
      if (t % (1000 / 6) < 16) this.playAnimationWithIndex(this.IMAGES_JUMPING, "jump");
      this.resetIdle();
    } else if (move) {
      if (t % (1000 / 12) < 16) this.playAnimationWithIndex(this.IMAGES_WALKING, "walk");
      this.resetIdle();
    } else if (noMove) {
      if (t % (1000 / 6) < 16) {
        if (this.idleRepeatCount < 1) {
          this.playAnimationWithIndex(this.IMAGES_IDLE, "idle");
          if (this.animIndex.idle % this.IMAGES_IDLE.length === 0)
            this.idleRepeatCount++;
        } else {
          this.playAnimationWithIndex(this.IMAGES_LONG_IDLE, "longIdle");
          if (!this.isSnooring && this.world?.soundManager) {
            this.startSnore();
          }
        }
      }
    }
  }

  /**
   * Resets idle animation state.
   */
  resetIdle() {
    this.idleRepeatCount = 0;
    this.animIndex.idle = 0;
    this.animIndex.longIdle = 0;
  }

  /**
   * Starts snoring audio.
   */
  startSnore() {
    this.isSnooring = true;
    this.snooringAudio = this.world.soundManager.sounds.snooring;
    if (this.snooringAudio) {
      this.snooringAudio.loop = true;
      this.snooringAudio.currentTime = 0;
      this.snooringAudio.play();
    }
  }
}

window.CharacterBase = CharacterCore;
