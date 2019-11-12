let Connection = require('../Connection')

module.exports = class LobbyBase {
    constructor(id) {
        this.id = id;
        this.connections = [];
    }

    OnUpdate() {}

    OnEnterLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.DisplayPlayerInformation() + ' has entered  the Lobby (' + lobby.id + ')');

        lobby.connections.push(connection);

        player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    OnLeaveLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.DisplayPlayerInformation() + ' has left the Lobby (' + lobby.id + ')');

        connection.lobby = undefined;
        let index = lobby.connections.indexOf(connection);

        if (index > -1) {
            lobby.connections.splice(index, 1);
        }

    }
}
