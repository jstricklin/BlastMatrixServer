const Connection = require('./Connection');
const Player = require('./Player');
const LobbyState = require('./Utility/LobbyState');
const Message = require('./Message');

// lobbies
const LobbyBase = require('./Abstract/LobbyBase');
const GameLobby = require('./Lobbies/GameLobby');
const GameLobbySettings = require('./Lobbies/GameLobbySettings');

const shortid = require('shortid');

const NameGenerator = require('./Utility/NameGenerator');
const name = new NameGenerator();

module.exports = class Server {
    constructor() {
        this.connections = [];
        this.lobbies = [];
        this.messages = [];
        this.lobbies[0] = new LobbyBase(0);
    }

    // interval update every 100 ms
    OnUpdate() {
        let server = this;
        // update each lobby
        server.lobbies.map(lobby => {
            lobby.OnUpdate()
            if (lobby.connections.length < 1 && lobby != server.lobbies[0] && lobby.GetMatchTime() > 5) {

            console.log("empty lobby... " + lobby.id);

            var index = server.lobbies.indexOf(lobby);
            if (index > -1) {
                server.lobbies.splice(index, 1);
            }

                // delete server.lobbies.filter(l => {
                //     return l.id == lobby.id;
                // })[0];
            }
        });
        // for (let id in server.lobbies) {
        //     server.lobbies[id].OnUpdate();
        //     if (server.lobbies[id].connections.length < 1 && server.lobbies[id] != server.lobbies[0] && server.lobbies[id].GetMatchTime() > 5)
        //     {

        //         // delete server.lobbies[id];
                
        //         // server.lobbies.splice(id, 1);
        //     }
        // }
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
        // let i = 100;
        // while (i--) {
        //     console.log(name.GenerateName());
        // }
        return connection;
    }

    OnDisconnected(connection = Connection) {
        let server = this;
        let id = connection.player.id;

        delete server.connections[id];
        console.log('player ' + connection.player.DisplayPlayerInformation() + ' has disconnected');

        // if server host and server not empty, set new host
        let lobby = server.lobbies.filter(lobby => {
            return lobby.id == connection.player.lobby;
        })[0];
        // if (lobby.host == connection && lobby.connections.length > 1) {
        //     console.log("setting new host... " + connection.player.username);
        //     lobby.SetHost(lobby.connections.filter(c => c != connection)[0]);
        // }
        // tell other players in lobby that we disconnected
        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            id: id,
        });
        // cleanup lobby
        // server.lobbies[connection.player.lobby].OnLeaveLobby(connection);
        lobby.OnLeaveLobby(connection);

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
        // all lobbies are full or we have not create one yet --- encapsulate below
        if (!lobbyFound) {
            // console.log('making new game lobby');
            let gameLobby = new GameLobby(shortid.generate(), new GameLobbySettings(`GameLobby ${gameLobbies.length + 1}`, 'FFA', 6));
            server.lobbies.push(gameLobby);
            console.log("made lobby " + gameLobby.settings.maxPlayers);
            server.OnSwitchLobby(connection, gameLobby.id);
            gameLobby.SetHost(connection);
        }
    }

    OnCreateLobby(connection = Connection, settings) {
        let server = this;
        let gameLobbies = server.lobbies.filter(lobby => {
            return lobby instanceof GameLobby;
        });
        // console.log('making new game lobby');
        let gameLobby = new GameLobby(shortid.generate(), new GameLobbySettings(settings.name, 'FFA', 6));
        server.lobbies.push(gameLobby);
        console.log("made lobby " + gameLobby.id);
        server.OnSwitchLobby(connection, gameLobby.id);
        gameLobby.SetHost(connection);
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

        lobbies.filter(lobby => {
            return lobby.id == connection.player.lobby;
        })[0].OnLeaveLobby(connection);
        // lobbies[connection.player.lobby].OnLeaveLobby(connection);

        connection.socket.join(lobbyId); // join new lobby's socket channel
        connection.lobby = lobbies[lobbyId]; // assign ref to new lobby

        console.log(lobbies[lobbyId] + " lobby ID " + lobbyId);
        lobbies.filter(lobby => {
            return lobby.id == lobbyId;
        })[0].OnEnterLobby(connection);
        // lobbies[lobbyId].OnEnterLobby(connection);
    }

    OnMessageReceived(connection = Connection, data) {
        let server = this;
        let lobbies = server.lobbies;
        let message = new Message(connection.player, data);
        this.messages.push(message);

        lobbies.filter(lobby => {
            return lobby.id == connection.player.lobby;
        })[0].OnMessageReceived(message);
        // lobbies[connection.player.lobby].OnMessageReceived(message);
    }

    BroadcastServerMessage(data) {
        let server = this;
        let lobbies = server.lobbies;
        let serv = new Player('server');
        serv.username = "server";
        let message = new Message(serv, data);
        message.serverMessage = true;

        this.messages.push(message);

        lobbies.forEach(lobby => {
            lobby.OnMessageReceived(message)
        });

    }

    BroadcastToLobbies(connection = Connection, data) {
        let server = this;
        let lobbies = server.lobbies;
        let message = new Message(connection.player, data);

        this.messages.push(message);

        lobbies.forEach(lobby => {
            lobby.OnMessageReceived(message)
        });
    }
}
