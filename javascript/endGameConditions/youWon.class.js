/**
 * Represents the "You Won" screen displayed after defeating the endboss.
 */
class YouWon extends DrawableObjects {
    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;
        this.opacity = 0;
        this.init();
    }

    /**
     * Loads the victory screen image.
     */
    async init() {
        await this.loadImage('img/You won, you lost/You won A.png');
    }
}
