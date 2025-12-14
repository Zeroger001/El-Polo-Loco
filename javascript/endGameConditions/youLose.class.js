/**
 * Represents the "You Lost" screen displayed after the player dies.
 */
class YouLost extends DrawableObjects {
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
     * Loads the loss screen image.
     */
    async init() {
        await this.loadImage('img/9_intro_outro_screens/game_over/game over.png');
    }
}
