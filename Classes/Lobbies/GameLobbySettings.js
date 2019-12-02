module.exports = class GameLobbySettings {
    constructor(gameMode, maxPlayers) {
        this.gameMode = 'No GameMode Defined';
        this.maxPlayers = maxPlayers;
        this.blastRadius = 5;
        this.baseDamage = 35;
        this.gameLength = 180;
    }
}
