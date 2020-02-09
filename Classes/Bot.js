const Player = require('./Player');
const NameGenerator = require('./Utility/NameGenerator');
const name = new NameGenerator();

module.exports = class Bot extends Player {
    constructor() {
        super(name.GenerateName());
    }
}