class DrawableObjects {
    x = 20;
    y = 300;
    img;
    height = 150;
    width = 100;
    imageCache = {};
    currentImage = 0;

    /**
     * Loads a single image and assigns it as current sprite.
     * @param {string} path 
     * @returns {Promise<HTMLImageElement>}
     */
    async loadImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { this.img = img; resolve(img); };
            img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
            img.src = path;
        });
    }

    /**
     * Loads an array of images into the internal cache.
     * @param {string[]} arr 
     * @returns {Promise<void>}
     */
    async loadImages(arr) {
        const tasks = arr.map(path => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { this.imageCache[path] = img; resolve(img); };
            img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
            img.src = path;
        }));
        await Promise.all(tasks);
    }
}
