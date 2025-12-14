/**
 * Cloud object that moves slowly across the level.
 * Uses requestAnimationFrame and respects world pause state.
 */
class Cloud extends MovableObject {
    height = 500;
    width = 500;

    /**
     * @param {string} imagePath - path to the cloud image
     */
    constructor(imagePath) {
        super();
        this.imagePath = imagePath;
        this.animationFrameId = null;
    }

    /**
     * Loads cloud image and initializes movement.
     * @returns {Promise<void>}
     */
    async init() {
        await this.loadImage(this.imagePath);
        this.y = 0;
        this.x = Math.random() * 3000;
        this.speed = 0.1 + Math.random() * 0.25;
        this.startAnimation();
    }

    /**
     * Starts continuous cloud movement using rAF.
     */
    startAnimation() {
        const loop = () => {
            if (!this.world?.isPaused) {
                this.x -= this.speed;
                if (this.x + this.width < 0) {
                    const offset = 200 + Math.random() * 300;
                    const end = this.world?.level?.level_end_x || 720;
                    this.x = end + offset;
                }
            }
            this.animationFrameId = this.world?.registerAnimationFrame?.(
                requestAnimationFrame(loop)
            ) || requestAnimationFrame(loop);
        };
        loop();
    }

    /**
     * Stops cloud animation, used when world resets.
     */
    stopAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}
