const GameLobby = require('./Lobbies/GameLobby')

module.exports = class Connection {
    constructor() {
        this.socket;
        this.player;
        this.server;
        this.lobby;
        this.messages = [];
    }
    //handles all our io events and where we should route them to be handled
    CreateEvents() {
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;

        socket.on('registerUsername', (data) => {
            server.OnRegisterUsername(connection, data);
        });
        socket.on('sendMessage', (data) => {
            let message = data.message;
            this.messages.push(message);
            // check commands here
            console.log("message received: " + message);
            let servTest = new RegExp('bserv ')
            let lobbTest = new RegExp('blobby ')
            if (servTest.test(message)) {
                server.BroadcastServerAlert(message.replace('bserv ', ''));
            } else if (lobbTest.test(message)) {
                server.BroadcastLobbyMessage(message.replace('blobby ', ''));
            } else {
                server.OnMessageReceived(connection, message);
            }
        });
        socket.on("levelLoaded", () => {
            connection.lobby.OnLevelLoaded(connection);
        })
        socket.on('queryLobbies', () => {
            let lobbies = {};
            server.lobbies.map(lobby => {
                if (lobby instanceof GameLobby) {
                    lobbies[lobby.id] = { settings: lobby.settings, playerCount: lobby.connections.length };
                }
            });
            connection.socket.emit("lobbyQuery", lobbies);
        })
        socket.on('queryPlayerTank', (data) => {
            server.OnGetPlayerTank(connection, data);
        });
        socket.on('savePlayerTank', (data) => {
            server.OnSavePlayerTank(connection, data);
        });
        socket.on('disconnect', () => {
            server.OnDisconnected(connection);
        });
        socket.on('quickPlay', () => {
            server.OnAttemptToJoinGame(connection);
        });
        socket.on('createLobby', (data) => {
            server.OnCreateLobby(connection, data);
        });
        socket.on('joinGame', (data) => {
            // console.log("attempting join game...");
            // console.log("join game: " + data.lobbyId);
            server.OnSwitchLobby(connection, data.lobbyId);
        });
        socket.on('exitGame', () => {
            // connection.socket.emit("exitGame", {});
            // let id = connection.player.id;
            // connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            //     id: id,
            // });
            server.OnSwitchLobby(connection, 0);
        });
        socket.on('updateSpawnPoints', (data) => {
            // console.log("spawn points... " + data);
            // console.log("spawn connetion data... " + connection.lobby.id);
            connection.lobby.SetSpawnPoints(data);
        });
        socket.on('fireProjectile', (data) => {
            // console.log('projectile fired from... ' + connection.lobby.id);
            connection.lobby.OnFireProjectile(connection, data);
        });
        socket.on('collisionDestroy', (data) => {
            connection.lobby.OnCollisionDestroy(connection, data);
        });
        socket.on('updatePosition', (data) => {
            player.position.x = data.position.x;
            player.position.y = data.position.y;
            player.position.z = data.position.z;

            socket.broadcast.to(connection.lobby.id).emit('updatePosition', player);
        });
        
        socket.on('updateRotation', (data) => {
            
            player.weaponRotation = data.rotation.weaponRotation;
            player.barrelRotation = data.rotation.barrelRotation;
            player.rotation = data.rotation.rotation;
            // console.log("updating rotation");
            socket.broadcast.to(connection.lobby.id).emit('updateRotation', player);
        });
        socket.on('updateBotPosition', (data) => {
            if (typeof connection.lobby.bots == 'undefined') return;
            let bot = connection.lobby.bots.filter(b => {
                // console.log("checking bot " + b.id + " data id: " + data.id);
                return b.id == data.id;
            })[0];
            // if (typeof bot === 'undefined') return;
            // console.log(bot.username + " moving... " + bot.position);
            bot.position.x = data.position.x;
            bot.position.y = data.position.y;
            bot.position.z = data.position.z;

            socket.broadcast.to(connection.lobby.id).emit('updatePosition', bot);
        });
        
        socket.on('updateBotRotation', (data) => {
            if (typeof connection.lobby.bots == 'undefined') return;
            let bot = connection.lobby.bots.filter(b => {
                return b.id == data.id;
            })[0];
            if (typeof bot === 'undefined') return;
            bot.weaponRotation = data.rotation.weaponRotation;
            bot.barrelRotation = data.rotation.barrelRotation;
            bot.rotation = data.rotation.rotation;
            socket.broadcast.to(connection.lobby.id).emit('updateRotation', bot);
        });
        socket.on('updateProjectile', (data) => {
            connection.lobby.OnUpdateProjectile(connection, data);
        });
    }
}