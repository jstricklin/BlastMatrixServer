var ServerObject = require('./Abstract/ServerObject.js');
var Vector3 = require('./Vector3.js');

module.exports = class Projectile extends ServerObject {
    constructor() {
        super();
        this.name = "Shell";
        this.direction = new Vector3();
        this.speed = 25;
        this.isDestroyed = false;
        this.activator = '';
    }

    OnUpdate() {
        // this.position.x += this.direction.x * this.speed;
        // this.position.y += this.direction.y * this.speed;
        // this.position.z += this.direction.z * this.speed;
        return this.isDestroyed;
    }
}
