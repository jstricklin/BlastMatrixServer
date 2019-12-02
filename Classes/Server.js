const Connection = require('./Connection');
const Player = require('./Player');
const LobbyState = require('./Utility/LobbyState');

// lobbies
const LobbyBase = require('./Abstract/LobbyBase');
const GameLobby = require('./Lobbies/GameLobby');
const GameLobbySettings = require('./Lobbies/GameLobbySettings');

module.exports = class Server {
    constructor() {
        this.connections = [];
        this.lobbies = [];

        this.lobbies[0] = new LobbyBase(0);
    }

    // interval update every 100 ms
    OnUpdate() {
        let server = this;
        // update each lobby
        for (let id in server.lobbies) {
            if (server.lobbies[id].LobbyState.currentState == LobbyState.GAME) {
                console.log("updating server");
                server.lobbies[id].OnUpdate();
            }
        }
    }

    // handle connection from server
    OnConnected(socket) {
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.server = server;

        let player = connection.player;
        let lobbies = server.lobbies;

        console.log('Added new player to server: (' + player.id + ')');
        server.connections[player.id] = connection

        socket.join(player.lobby);
        connection.lobby = lobbies[player.lobby];
        connection.lobby.OnEnterLobby(connection);
        return connection;
    }

    OnDisconnected(connection = Connection) {
        let server = this;
        let id = connection.player.id;

        delete server.connections[id];
        console.log('player ' + connection.player.DisplayPlayerInformation() + ' has disconnected');

        // tell other players in lobby that we disconnected
        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            id: id,
        });
        // cleanup lobby
        server.lobbies[connection.player.lobby].OnLeaveLobby(connection);
    }

    OnAttemptToJoinGame(connection = Connection) {
        // look through lobbies for game lobby
        // check if joinable
        // if not make new game
        let server = this;
        let lobbyFound = false;

        let gameLobbies = server.lobbies.filter(lobby => {
            return lobby instanceof GameLobby;
        });
        console.log('found (' + gameLobbies.length + ') lobbies on the server')
        gameLobbies.forEach(lobby => {
            if (!lobbyFound) {
                let canJoin = lobby.CanEnterLobby(connection);

                if (canJoin) {
                    lobbyFound = true;
                    server.OnSwitchLobby(connection, lobby.id);
                }
            }
        });
        // all lobbies are full or we have not create one yet
        if (!lobbyFound) {
            console.log('making new game lobby');
            let gameLobby = new GameLobby(gameLobbies.length + 1, new GameLobbySettings('FFA', 4));
            server.lobbies.push(gameLobby);
            server.OnSwitchLobby(connection, gameLobby.id);
        }
    }

    OnRegisterUsername(connection = Connection, data)
    {
        console.log("register username: " + data.username);
        // TODO add username validation logic
        if (data.username != "") {
            connection.player.username = data.username;
        } else {
            // blank names here - random names, etc
        }
        connection.socket.emit("usernameRegistered", {
            username: connection.player.username,
        });
    }

    OnSwitchLobby(connection = Connection, lobbyId) {
        let server = this;
        let lobbies = server.lobbies;

        connection.socket.join(lobbyId); // join new lobby's socket channel
        connection.lobby = lobbies[lobbyId]; // assign ref to new lobby

        lobbies[connection.player.lobby].OnLeaveLobby(connection);
        lobbies[lobbyId].OnEnterLobby(connection);
        if (lobbies[connection.player.lobby].connections.length < 1)
        {
            console.log("removing empty lobby");
            delete lobbies[connection.player.lobby];
        }
    }
}
