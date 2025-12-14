/**
 * Represents a game level containing enemies, objects and metadata.
 */
class Level {
    enemies = [];
    coins = [];
    clouds = [];
    backgroundObjects = [];
    bottles = [];
    level_end_x = 5700;
    name = 'Level';

    /**
     * Creates a new level.
     * @param {Object[]} enemies
     * @param {Object[]} coins
     * @param {Object[]} clouds
     * @param {Object[]} backgroundObjects
     * @param {Object[]} bottles
     * @param {string} name
     */
    constructor(enemies, coins, clouds, backgroundObjects, bottles, name = 'Level 1') {
        this.enemies = this.ensureArray(enemies);
        this.coins = this.ensureArray(coins);
        this.clouds = this.ensureArray(clouds);
        this.backgroundObjects = this.ensureArray(backgroundObjects);
        this.bottles = this.ensureArray(bottles);
        this.name = name;
        this.endboss = this.findEndboss();
    }

    /**
     * Ensures the input is an array.
     * @param {any} value
     * @returns {Array}
     */
    ensureArray(value) {
        return Array.isArray(value) ? value : [];
    }

    /**
     * Searches for the endboss instance in enemy list.
     * @returns {Endboss|null}
     */
    findEndboss() {
        return this.enemies.find(e => e instanceof Endboss) || null;
    }
}
