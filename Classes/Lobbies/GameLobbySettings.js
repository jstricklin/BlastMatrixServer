module.exports = class GameLobbySettings {
    constructor(name = "BaseLobby", gameMode = "No GameMode Defined", maxPlayers, gameLength = 120) {
        this.name = name;
        this.gameMode = gameMode;
        this.maxPlayers = maxPlayers;
        this.blastRadius = 5;
        this.baseDamage = 35;
        this.gameLength = gameLength;
    }
}
