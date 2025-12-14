/**
 * Represents keyboard input state for the game.
 */
class Keyboard {
    constructor() {
        this.LEFT = false;
        this.RIGHT = false;
        this.UP = false;
        this.DOWN = false;
        this.SPACE = false;
        this.P = false;
        this.M = false;
    }

    /**
     * Resets all keys to false.
     */
    reset() {
        this.LEFT = false;
        this.RIGHT = false;
        this.UP = false;
        this.DOWN = false;
        this.SPACE = false;
        this.P = false;
        this.M = false;
    }
}
