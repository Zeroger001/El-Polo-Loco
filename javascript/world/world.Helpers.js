/** 
 * Extends World with helper methods for rendering.
 */

/**
 * Adds multiple renderable objects to the map.
 * @param {Object[]} objects - Renderable world objects.
 */
World.prototype.addObjectsToMap = function (objects) {
    if (!Array.isArray(objects)) return;
    objects.forEach(o => { if (o) this.addToMap(o); });
};

/**
 * Draws a single renderable object with optional mirroring.
 * Prevents subpixel rendering artifacts by rounding draw values.
 * @param {Object} e - Renderable entity.
 */
World.prototype.addToMap = function (e) {
    if (!e || !e.img?.complete) return;

    const ctx = this.ctx;
    const mirrored = e.otherDirection === true;

    let x = Math.round(e.x);
    let y = Math.round(e.y);
    let w = Math.round(e.width);
    let h = Math.round(e.height);

    if (mirrored) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        x *= -1;
    }

    ctx.drawImage(e.img, x, y, w, h);

    if (mirrored) {
        ctx.restore();
    }
};
