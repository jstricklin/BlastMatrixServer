const LobbyBase = require('../Abstract/LobbyBase');
const GameLobbySettings = require('./GameLobbySettings');
const Connection = require('../Connection');
const Projectile = require('../Projectile');
const LobbyState = require('../Utility/LobbyState');
const Vector3 = require('../Vector3');

module.exports = class GameLobby extends LobbyBase {
    constructor(id, settings = GameLobbySettings) {
        super(id);
        this.settings = settings;
        this.LobbyState = new LobbyState();
        this.projectiles = [];
    }

    OnUpdate() {
        let lobby = this;
        lobby.UpdateProjectiles();
        lobby.UpdateDeadPlayers();
    }

    CanEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;
        console.log('connections in lobby... ' + currentPlayerCount + " - " + "max players: " + maxPlayerCount);

        // written to check as a new player joining a full server
        if (currentPlayerCount + 1 > maxPlayerCount) {
            return false;
        }
        return true;
    }

    OnEnterLobby(connection = Connection) {
        let lobby = this;
        let socket = connection.socket;

        super.OnEnterLobby(connection);
        lobby.AddPlayer(connection);
        socket.emit('loadGame', connection.player.name);
        //handle spawning any server spawned objects here
        //example: loot, or flying bullets, etc

    }

    OnLeaveLobby(connection = Connection) {
        let lobby = this;

        super.OnLeaveLobby(connection);
        lobby.RemovePlayer(connection);

        //handle despawning any server spawned objects here
        //example: loot, or flying bullets, etc

    }

    UpdateProjectiles() {
        let lobby = this;
        let projectiles = lobby.projectiles;
        let connections = lobby.connections;

        projectiles.forEach(projectile => {
            let isDestroyed = projectile.OnUpdate();
            if (isDestroyed) {
                lobby.DespawnProjectile(projectile);
            } else {
                // DEPRECATED BELOW
                // var returnData = {
                //     id: projectile.id,
                //     position: {
                //         x: projectile.position.x,
                //         y: projectile.position.y
                //     }
                // }
                // connections.forEach(connection => {
                //     connection.socket.emit('updatePosition', returnData);

                // });
            }
        });
    }

    UpdateDeadPlayers() {
        let lobby = this;
        let connections = lobby.connections;

        connections.forEach(connection => {
            let player = connection.player;
            if (player.isDead) {
                let isRespawn = player.RespawnCounter();
                if (isRespawn) {
                    let socket = connection.socket;
                    let returnData = {
                        id: player.id,
                        position: {
                            x: player.position.x,
                            y: player.position.y,
                            z: player.position.z,
                        }
                    }
                    socket.emit('playerRespawn', returnData);
                    socket.broadcast.to(lobby.id).emit('playerRespawn', returnData);
                }
            }
        });
    }

    OnFireProjectile(connection = Connection, data) {
        let lobby = this;
        let projectile = new Projectile();

        projectile.activator = data.activator;

        projectile.position.x = data.position.x;
        projectile.position.y = data.position.y;
        projectile.position.z = data.position.z;

        projectile.direction.x = data.direction.x;
        projectile.direction.y = data.direction.y;
        projectile.direction.z = data.direction.z;

        lobby.projectiles.push(projectile);

        var returnData = {
            name: projectile.name,
            id: projectile.id,
            activator: data.activator,
            position: {
                x: projectile.position.x,
                y: projectile.position.y,
                z: projectile.position.z,
            },
            direction: {
                x: projectile.direction.x,
                y: projectile.direction.y,
                z: projectile.direction.z,
            },
            speed: projectile.speed,
        }
        connection.socket.emit('serverSpawn', returnData);
        connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
    }

    DespawnProjectile(projectile = Projectile) {
        let lobby = this;
        let projectiles = lobby.projectiles;
        let connections = lobby.connections;
        var index = lobby.projectiles.indexOf(projectile);
        if (index > -1) {
            projectiles.splice(index, 1);

            var returnData = {
                id: projectile.id,
            }
            lobby.connections.forEach(connection => {
                connection.socket.emit('serverDespawn', returnData);
            });
        }
    }

    OnUpdateProjectile(connection = Connection, data)
    {
        let lobby = this;
        let projectiles = lobby.projectiles;
        let returnProjectiles = projectiles.filter(projectile => {
            return projectile.id == data.id;
        })
        returnProjectiles.forEach(projectile => {
            projectile.position.x = data.position.x
            projectile.position.y = data.position.y
            projectile.position.z = data.position.z
            let returnData = {
                id: data.id,
                isProjectile: true,
                position: {
                    x: data.position.x,
                    y: data.position.y,
                    z: data.position.z,
                }
            }
            // console.log("projectile id: " + data.id);
            connection.socket.broadcast.to(lobby.id).emit('updatePosition', returnData)
        });

    }
    OnCollisionDestroy(connection = Connection, data) {
        let lobby = this;
        let returnProjectiles = lobby.projectiles.filter(projectile => {
            return projectile.id == data.id;
        })
        // console.log(`found projectiles: ${returnProjectiles.length}`);
        // will likely only deal with one entry, but iterate through array in case multiple returned
        returnProjectiles.forEach(projectile => {

            let playerHit = false;
            // check if hit someone that is not us
            lobby.connections.forEach( c => {
                let player = c.player;
                if (projectile.activator != player.id) {
                    // console.log(`projectile position: ${projectile.position.x}, ${projectile.position.y}, ${projectile.position.z} player position ${player.position.x}, ${player.position.y}, ${player.position.z}`);
                    let distance = projectile.position.Distance(player.position);
                    console.log("distance to player " + player.id + " - " + distance);
                    if (distance < 5) {
                        console.log("player hit");
                        playerHit = true;
                        let isDead = player.DealDamage(50); // half health
                        if (isDead) {
                            console.log("Player with id " + player.id + " has died");
                            let returnData = {
                                id: player.id
                            }
                            c.socket.emit('playerDied', returnData);
                            c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        } else {
                            console.log("player with id " + player.id + " has ( " + player.health + " ) health left.");
                        }
                        // projectile.isDestroyed = true;
                        
                        lobby.DespawnProjectile(projectile);
                    }
                }
            });
            if (!playerHit)
            projectile.isDestroyed = true;
        });
    }

    AddPlayer(connection = Connection, data) {
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;
        let player = connection.player;

        player.position = new Vector3(5, 0.25, 15)
        // let returnData = {
        //     id: connection.player.id,
        // }
        console.log('spawning player...');
        socket.emit('spawn', player); // tell myself it has spawned
        socket.broadcast.to(lobby.id).emit('spawn', player); // tell other sockets of new spawn

        // tell myself about everyone else in the game
        connections.forEach(c => {
            if (c.player.id != connection.player.id) {
                socket.emit('spawn', c.player);
            }
        });
    }

    RemovePlayer(connection = Connection) {
        let lobby = this;
        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id,
        });
    }
}
