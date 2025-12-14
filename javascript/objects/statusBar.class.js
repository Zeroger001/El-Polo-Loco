class StatusBar extends DrawableObjects {
    /**
     * Creates a status bar.
     * @param {string} type 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(type, x = 20, y = 20) {
        super();
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 50;
        this.percentage = 100;
        this.isVisible = true;
        this.IMAGES = this.createImageMap();
        this.validateType(type);
        this.initImages();
    }

    /**
     * Loads images and applies initial state.
     */
    async initImages() {
        await this.loadImages(this.IMAGES[this.type]);
        this.setPercentage(this.percentage);
    }

    /**
     * Creates mapping for bar image sets.
     * @returns {Object<string,string[]>}
     */
    createImageMap() {
        return {
            coin: [
                'img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png',
                'img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png',
                'img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png',
                'img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png',
                'img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png',
                'img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png'
            ],
            health: [
                'img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png',
                'img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png',
                'img/7_statusbars/1_statusbar/2_statusbar_health/orange/40.png',
                'img/7_statusbars/1_statusbar/2_statusbar_health/orange/60.png',
                'img/7_statusbars/1_statusbar/2_statusbar_health/orange/80.png',
                'img/7_statusbars/1_statusbar/2_statusbar_health/orange/100.png'
            ],
            bottle: [
                'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
                'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
                'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
                'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
                'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
                'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
            ],
            boss: [
                'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
                'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
                'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
                'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
                'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
                'img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
            ]
        };
    }

    /**
     * Validates status bar type.
     * @param {string} type 
     */
    validateType(type) {
        if (!this.IMAGES[type]) {
            throw new Error(`Invalid StatusBar type: ${type}`);
        }
    }

    /**
     * Sets percentage and updates displayed image.
     * @param {number} percentage 
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(percentage, 100));
        const index = this.resolveImageIndex(this.percentage);
        const path = this.IMAGES[this.type][index];
        this.img = this.imageCache[path];
    }

    /**
     * Returns image index based on percentage.
     * @param {number} percentage 
     * @returns {number}
     */
    resolveImageIndex(percentage) {
        if (percentage >= 100) return 5;
        if (percentage >= 80) return 4;
        if (percentage >= 60) return 3;
        if (percentage >= 40) return 2;
        if (percentage >= 20) return 1;
        return 0;
    }
}
