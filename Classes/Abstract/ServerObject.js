var shortId = require('shortid');
var Vector3 = require('../Vector3.js');
var Rotation = require('../Rotation');


module.exports = class ServerObject {
    constructor() {
        this.id = shortId.generate();
        this.name = 'ServerObject';
        this.position = new Vector3();
        this.rotation = new Rotation();
    }
}
