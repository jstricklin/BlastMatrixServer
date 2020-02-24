const Color = require("./Color")
module.exports = class Tank {
    constructor(Body = "DEFAULT", Cannon = "DEFAULT", Barrel = "DEFAULT", PrimaryColor = new Color()) {
        this.body = Body;
        this.cannon = Cannon;
        this.barrel = Barrel;
        this.primaryColor = PrimaryColor;
    }
}