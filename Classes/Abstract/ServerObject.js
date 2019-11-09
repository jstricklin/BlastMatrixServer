var shortId = require('shortid');
var Vector3 = require('../Vector3.js');


module.exports = class ServerObject {
    constructor() {
        this.id = shortId.generate();
        this.name = 'ServerObject';
        this.position = new Vector3();
    }
}
