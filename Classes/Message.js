module.exports = class Message {
    constructor(player, message) {
        this.player = player;
        this.message = message;
        this.date = new Date();
        this.serverMessage = false;
    }
}