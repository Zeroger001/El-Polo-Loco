class MovableObject extends DrawableObjects {
  speed = 0.15;
  speedY = 0;
  otherDirection = false;
  acceleration = 2;
  groundLevel = 250;

  /**
   * Starts gravity simulation for the object.
   */
  applyGravity() {
    this.gravityInterval = setInterval(() => {
      this.updateVerticalMovement();
    }, 40);
  }

  /**
   * Updates vertical movement caused by gravity.
   */
  updateVerticalMovement() {
    this.y -= this.speedY;
    if (this.isAboveGround() || this.speedY > 0) {
      this.speedY -= this.acceleration;
    } else {
      this.speedY = 0;
      this.y = this.groundLevel;
    }
  }

  /**
   * Checks if the object is above the ground.
   * @returns {boolean}
   */
  isAboveGround() {
    return this.y < this.groundLevel;
  }

  /**
   * Plays next animation frame.
   * @param {string[]} images 
   */
  playAnimation(images) {
    if (!images?.length) return;
    const index = this.currentImage % images.length;
    this.img = this.imageCache[images[index]];
    this.currentImage++;
  }

  /**
   * Moves object right continuously.
   */
  moveRight() {
    this.moveRightInterval = setInterval(() => {
      this.x += this.speed;
    }, 16);
  }

  /**
   * Moves object left continuously.
   */
  moveLeft() {
    this.moveLeftInterval = setInterval(() => {
      this.x -= this.speed;
    }, 16);
  }

  /**
   * Causes the object to jump if grounded.
   */
  jump() {
    if (!this.isAboveGround()) {
      this.speedY = 30;
      this.currentImage = 0;
    }
  }

  /**
   * Returns true if current frame should be paused.
   * @returns {boolean}
   */
  shouldSkipFrame() {
    return this.world && this.world.isPaused;
  }
}
