let Connection = require('../Connection');
const LobbyState = require('../Utility/LobbyState');
const Message = require('../Message');

module.exports = class LobbyBase {
    constructor(id) {
        this.id = id;
        this.connections = [];
        this.startTime = new Date();
        this.LobbyState = new LobbyState();
        this.messages = [];
    }

    OnUpdate() {}

    OnEnterLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.DisplayPlayerInformation() + ' has entered  the Lobby (' + lobby.id + ') ' + '(' + (this.connections.length + 1) + ' players)');

        lobby.connections.push(connection);

        player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    OnLeaveLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.DisplayPlayerInformation() + ' has left the Lobby (' + lobby.id + ')' + '(' + (this.connections.length - 1) + ' players)');

        connection.lobby = undefined;
        let index = lobby.connections.indexOf(connection);

        if (index > -1) {
            lobby.connections.splice(index, 1);
        }
    }
    OnMessageReceived(message = Message) {
        this.messages.push(message);
        this.connections.forEach(c => {
            c.socket.emit('messageReceived', message);
        });
    }
    GetMatchTime() {
        return Math.round((new Date() - this.startTime) * 0.001);
    }
}
