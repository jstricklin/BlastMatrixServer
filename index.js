const port = process.env.PORT || 5280;
const io = require('socket.io')(port);
const Player = require('./Classes/Player');
const Vector3 = require('./Classes/Vector3');
const Projectile = require('./Classes/Projectile');
const Server = require('./Classes/Server')

console.log('Server has started.');

let server = new Server();

// var projectiles = []
// var players = []
// var sockets = []

// divide by ten for unity server update time
setInterval(() => {
    server.OnUpdate();
    // projectiles.forEach(projectile => {
    //     var isDestroyed = projectile.OnUpdate();
    //     // REMOVE
    //     if (isDestroyed)
    //     {
    //         DespawnProjectile(projectile);
    //     } else {
            // var returnData = {
            //     id: projectile.id,
            //     speed: projectile.speed,
            //     position: {
            //         x: projectile.position.x,
            //         y: projectile.position.y,/console

            //         z: projectile.position.z,
            //     }
            // }
            // for (var playerId in players)
            // {
            //     sockets[playerId].emit('updatePosition', returnData);
            // }
        // }
    // })
    // handle dead players
    // for (var playerID in players) {
    //     let player = players[playerID];
    //     if (player.isDead) {
    //         let isRespawn = player.RespawnCounter();
    //         if (isRespawn) {
    //             let returnData = {
    //                 id: player.id,
    //                 position: {
    //                     x: player.position.x,
    //                     y: player.position.y,
    //                     z: player.position.z,
    //                 }
    //             }
    //             console.log("respawn player: " + playerID);
    //             sockets[playerID].emit('playerRespawn', returnData);
    //             sockets[playerID].broadcast.emit('playerRespawn', returnData);
    //         }
    //     }
    // }
}, 100, 0)

// function DespawnProjectile(projectile = Projectile) {
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

io.on('connection', (socket) => {
    // let connection = server.OnConnected(socket); 
    // connection.CreateEvents();
    // connection.socket.emit('register', { 'id': connection.player.id });
    console.log("player connected");
    let connection = server.OnConnected(socket);
    connection.CreateEvents();
    connection.socket.emit('register', {
        'id': connection.player.id
    });
    // let newPlayer = new Player();
    // socket.emit('register', { 'id': newPlayer.id });
    // newPlayer.position = new Vector3(5, 0.25, 15)
    // socket.emit('spawn', newPlayer);
    // socket.broadcast.emit('spawn', newPlayer);
    // for (var playerId in players)
    // {
    //     if (playerId != newPlayer.id) 
    //     {
    //         socket.emit("spawn", players[playerId]);
    //     }
    // }
    // players[newPlayer.id] = newPlayer;
    // sockets[newPlayer.id] = socket;
    // socket.on('fireProjectile', (e) => {
    //     let projectile = new Projectile();

    //     projectile.activator = e.activator;

    //     projectile.position.x = e.position.x;
    //     projectile.position.y = e.position.y;
    //     projectile.position.z = e.position.z;

    //     projectile.direction.x = e.direction.x;
    //     projectile.direction.y = e.direction.y;
    //     projectile.direction.z = e.direction.z;

    //     projectiles.push(projectile);

    //     var returnData = {
    //         name: projectile.name,
    //         id: projectile.id,
    //         activator: e.activator,
    //         position: {
    //             x: projectile.position.x,
    //             y: projectile.position.y,
    //             z: projectile.position.z,
    //         },
    //         direction: {
    //             x: projectile.direction.x,
    //             y: projectile.direction.y,
    //             z: projectile.direction.z,
    //         },
    //         speed: projectile.speed,
    //     }
    //     socket.emit('serverSpawn', returnData);
    //     socket.broadcast.emit('serverSpawn', returnData);
    // })
    // socket.on('collisionDestroy', (e) => {
    //     // connection.lobby.OnCollisionDestroy(connection, data);
    //     let returnProjectiles = projectiles.filter(projectile => {
    //         return projectile.id == e.id;
    //     })
    //     // console.log(`found projectiles: ${returnProjectiles.length}`);
    //     // will likely only deal with one entry, but iterate through array in case multiple returned
    //     returnProjectiles.forEach(projectile => {

    //         let playerHit = false;
    //         // check if hit someone that is not us
    //         for (var playerID in players) {
    //             if (projectile.activator != playerID) {
    //                 let player = players[playerID];
    //                 // console.log(`projectile position: ${projectile.position.x}, ${projectile.position.y}, ${projectile.position.z} player position ${player.position.x}, ${player.position.y}, ${player.position.z}`);
    //                 let distance = projectile.position.Distance(player.position);
    //                 console.log("distance to player " + playerID + " - " + distance);
    //                 if (distance < 5) {
    //                     console.log("player hit");
    //                     playerHit = true;
    //                     let isDead = player.DealDamage(50); // half health
    //                     if (isDead) {
    //                         console.log("Player with id " + player.id + " has died");
    //                         let returnData = {
    //                             id: player.id
    //                         }
    //                         sockets[playerID].emit('playerDied', returnData);
    //                         sockets[playerID].broadcast.emit('playerDied', returnData);
    //                     } else {
    //                         console.log("player with id " + player.id + " has ( " + player.health + " ) health left.");
    //                     }
    //                     // projectile.isDestroyed = true;
                        
    //                     DespawnProjectile(projectile);
    //                 }
    //             }
    //         }
    //         if (!playerHit)
    //         projectile.isDestroyed = true;
    //     });
    // });
    // socket.on('updatePosition', (data) => {
    //    newPlayer.position.x = data.position.x;
    //    newPlayer.position.y = data.position.y;
    //    newPlayer.position.z = data.position.z;

    //     console.log("updating position");
    //     socket.broadcast.emit('updatePosition', newPlayer);
    // });
    // socket.on('updateProjectile', (data) => {
    //     let returnProjectiles = projectiles.filter(projectile => {
    //         return projectile.id == data.id;
    //     })
    //     returnProjectiles.forEach(projectile => {
    //         projectile.position.x = data.position.x
    //         projectile.position.y = data.position.y
    //         projectile.position.z = data.position.z
    //         let returnData = {
    //             id: data.id,
    //             isProjectile: true,
    //             position: {
    //                 x: data.position.x,
    //                 y: data.position.y,
    //                 z: data.position.z,
    //             }
    //         }
    //         // console.log("projectile id: " + data.id);
    //         socket.broadcast.emit('updatePosition', returnData)
    //     });
    // });
    // socket.on('updateRotation', (data) => {
    //    newPlayer.weaponRotation = data.rotation.weaponRotation;
    //    newPlayer.barrelRotation = data.rotation.barrelRotation;
    //    newPlayer.rotation = data.rotation.rotation;
    //     // console.log("updating rotation");
    //     socket.broadcast.emit('updateRotation', newPlayer);
    // });
    // socket.on('joinGame', (data) => {
    //     console.log("player has joined the game");
    //     socket.broadcast.emit('joinedGame', {'id': data.id});
    // })
    // socket.on('disconnect', (data) => {
    //     console.log('Client Disconnected');
    //     delete players[newPlayer.id];
    //     delete sockets[newPlayer.id];
    //     socket.broadcast.emit('disconnected', newPlayer);
    // })
})
function Interval(func, wait, times) {
    var interv = function (w, t) {
        return () => {
            if (typeof t === "undefined" || t-- > 0) {
                setTimeout(interv, w);
                try {
                    func.call(null);
                } catch (e) {
                    t = 0;
                    throw e.toString();
                }
            }
        };
    }(wait, times);
    setTimeout(interv, wait);
}
