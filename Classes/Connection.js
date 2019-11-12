module.exports = class Connection {
    constructor() {
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }
    //handles all our io events and where we should route them to be handled
    CreateEvents() {
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;

        socket.on('disconnect', () => {
            server.OnDisconnected(connection);
        });
        socket.on('joinGame', () => {
            server.OnAttemptToJoinGame(connection);
        });
        socket.on('fireProjectile', (data) => {
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
        socket.on('updateProjectile', (data) => {
            connection.lobby.OnUpdateProjectile(connection, data);
        });
    }
}
//custom classes

// var Player = require('./Classes/Player.js');
// var Projectile = require('./Classes/Projectile.js');
// var players = [];
// var sockets = [];
// var projectiles = [];

//Updates

// setInterval(() => {
//     projectiles.forEach(projectile => {
//         var isDestroyed = projectile.onUpdate();
//         // REMOVE
//         if (isDestroyed)
//         {
//             DespawnProjectile(projectile);
//         } else {
//             var returnData = {
//                 id: projectile.id,
//                 speed: projectile.speed,
//                 position: {
//                     x: projectile.position.x,
//                     y: projectile.position.y,
//                 }
//             }
//             for (var playerId in players)
//             {
//                 sockets[playerId].emit('updatePosition', returnData);
//             }
//         }
//     })

//     // handle dead players
//     for (var playerID in players) {
//         let player = players[playerID];
//         if (player.isDead) {
//             let isRespawn = player.RespawnCounter();

//             if (isRespawn) {
//                 let returnData = {
//                     id: player.id,
//                     position: {
//                         x: player.position.x,
//                         y: player.position.y
//                     }
//                 }
//                 sockets[playerID].emit('playerRespawn', returnData);
//                 sockets[playerID].broadcast.emit('playerRespawn', returnData);
//             }
//         }
//     }
// }, 100, 0)


// function DespawnProjectile(projectile = Projectile) {
//     console.log('Destroying Projectile');
//     var index = projectiles.indexOf(projectile);
//     if (index > -1)
//     {
//         projectiles.splice(index, 1);

//         var returnData = {
//             id: projectile.id,
//         }
//         for (var playerId in players)
//         {
//             sockets[playerId].emit('serverDespawn', returnData);
//         }
//     }
// }

// io.on('connection', (socket)=> {
//     console.log('Connection Made!');

//     var player = new Player();
//     var thisPlayerId = player.id;

//     players[thisPlayerId] = player;
//     sockets[thisPlayerId] = socket;

//     // Tell client that this is our ID for the server
//     socket.emit('register', {id: thisPlayerId});
//     socket.emit('spawn', player); // tell myself it has spawned
//     socket.broadcast.emit('spawn', player); // tell other sockets of new spawn

//     // tell myself about everyone else in the game
//     for (var playerId in players) {
//         if (playerId != thisPlayerId) {
//             socket.emit('spawn', players[playerId]);
//         }
//     };
//     // positional data from client
//     socket.on('updatePosition', (data) => {
//         player.position.x = data.position.x;
//         player.position.y = data.position.y;

//         socket.broadcast.emit('updatePosition', player);
//     });

//     socket.on('updateRotation', (data) => {
//         player.weaponRotation = data.rotation.weaponRotation;
//         player.playerFlipped = data.rotation.playerFlipped;

//         socket.broadcast.emit('updateRotation', player);
//     });

//     socket.on('fireProjectile', (data) => {
//         var projectile = new Projectile();
//         projectile.name = 'Arrow_Regular';
//         projectile.activator = data.activator;
//         projectile.position.x = data.position.x;
//         projectile.position.y = data.position.y;
//         projectile.direction.y = data.direction.y;
//         projectile.direction.x = data.direction.x;

//         projectiles.push(projectile);

//         var returnData = {
//             name: projectile.name,
//             id: projectile.id,
//             activator: data.activator,
//             position: {
//                 x: projectile.position.x,
//                 y: projectile.position.y,
//             },
//             direction: {
//                 x: projectile.direction.x,
//                 y: projectile.direction.y,
//             }
//         }
//         // broadcast emits to all except socket, so we emit to socket as well
//         socket.emit('serverSpawn', returnData)
//         socket.broadcast.emit('serverSpawn', returnData)
//     })

//     socket.on("collisionDestroy", (e) => {
//         console.log('collision with projectile id: ' + e.id);
//         let returnProjectiles = projectiles.filter(projectile => {
//             return projectile.id == e.id;
//         })

//         // will likely only deal with one entry, but iterate through array in case multiple returned
//         returnProjectiles.forEach(projectile => {

//             let playerHit = false;
//             // check if hit someone that is not us
//             for (var playerID in players) {
//                 if (projectile.activator != playerID) {
//                     let player = players[playerID];
//                     let distance = projectile.position.Distance(player.position);

//                     if (distance < 2) {
//                         playerHit = true;
//                         let isDead = player.DealDamage(50); // half health
//                         if (isDead) {
//                             console.log("Player with id " + player.id + " has died");
//                             let returnData = {
//                                 id: player.id
//                             }
//                             sockets[playerID].emit('playerDied', returnData);
//                             sockets[playerID].broadcast.emit('playerDied', returnData);
//                         } else {
//                             console.log("player with id " + player.id + " has ( " + player.health + " ) health left.");
//                         }
//                         DespawnProjectile(projectile);
//                     }
//                 }
//             }
//             if (!playerHit)
//             projectile.isDestroyed = true;
//         });
//     });

//     socket.on('disconnect', (e) => {
//         console.log('Client Disconnected');
//         delete players[thisPlayerId];
//         delete sockets[thisPlayerId];
//         socket.broadcast.emit('disconnected', player);
//     });
// });
