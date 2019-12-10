const Vector3 = require('./Vector3');
const Rotation = require('./Rotation');

module.exports = class SpawnPoint {
    constructor()
    {
        this.position = new Vector3();
        this.rotation = new Rotation();
    }
}