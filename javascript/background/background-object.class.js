/**
 * Represents a static background layer in the game world.
 */
class Background extends MovableObject {
    x = 0;
    y = 0;
    width;
    height;

    /**
     * @param {string} imagePath - path to background image
     * @param {number} x - horizontal position
     */
    constructor(imagePath, x = 0) {
        super();
        this.imagePath = imagePath;
        this.x = x;
    }

    /**
     * Loads background image and computes scaled width/height.
     * @returns {Promise<void>}
     */
    async init() {
        const img = await this.loadImage(this.imagePath);
        const targetWidth = 720;
        const targetHeight = 480;
        this.scaleToCanvas(img, targetWidth, targetHeight);
    }

    /**
     * Scales the background while keeping aspect ratio.
     * @param {HTMLImageElement} img
     * @param {number} targetWidth
     * @param {number} targetHeight
     */
    scaleToCanvas(img, targetWidth, targetHeight) {
        const aspect = img.width / img.height;
        if (targetWidth / targetHeight > aspect) {
            this.height = targetHeight;
            this.width = targetHeight * aspect;
        } else {
            this.width = targetWidth;
            this.height = targetWidth / aspect + 75;
        }
    }
}
