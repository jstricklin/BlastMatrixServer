const LobbyBase = require('../Abstract/LobbyBase');
const GameLobbySettings = require('./GameLobbySettings');
const Connection = require('../Connection');
const Projectile = require('../Projectile');
const LobbyState = require('../Utility/LobbyState');
const Vector3 = require('../Vector3');
const Rotation = require('../Rotation');
const Damage = require('../Utility/Damage');
const SpawnPoint = require('../SpawnPoint');
const Bot = require('../Bot');

module.exports = class GameLobby extends LobbyBase {


    constructor(id, settings = GameLobbySettings) {
        super(id);
        this.settings = settings; 
        this.projectiles = [];
        this.Damage = new Damage();
        this.timeRemaining = new Number(0);
        this.lastMatchEnd = new Date();
        this.spawnPoints = [];
        this.host;
        this.bots = [];
        this.LobbyState.currentState = this.LobbyState.GAME;
    }
    OnUpdate() {
        let lobby = this;
        if (this.LobbyState.currentState == this.LobbyState.GAME) {
            lobby.UpdateProjectiles();
            lobby.UpdateDeadPlayers();
            lobby.UpdateMatchTime();
            lobby.UpdateMatchScores();
            lobby.UpdateGameState();
        } else if (this.LobbyState.currentState == this.LobbyState.ENDGAME) {
            lobby.UpdateNextMatchTime();
        }
        // this.CleanupEmptyLobby()
    }

    // CleanupEmptyLobby()
    // {
    //     console.log("uptime... " + this.GetMatchTime());
    //     if (this.connections.length < 1 && this.GetMatchTime() > 5)
    //     {
    //         // delete this.server.lobbies
    //         // console.log("server empty... uptime: " + this.GetMatchTime());
    //     }
    // }

    CanEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;
        // console.log('connections in lobby... ' + currentPlayerCount + " - " + "max players: " + maxPlayerCount);

        // written to check as a new player joining a full server
        if (currentPlayerCount + 1 > maxPlayerCount && lobby.LobbyState.currentState != this.LobbyState.ENDGAME) {
            return false;
        }
        return true;
    }

    OnEnterLobby(connection = Connection) {
        let lobby = this;
        let socket = connection.socket;

        super.OnEnterLobby(connection);
        socket.emit('loadGame', connection.player.name);
        //handle spawning any server spawned objects here
        //example: loot, or flying bullets, etc

    }

    OnLeaveLobby(connection = Connection) {
        let lobby = this;
        connection.socket.leave(lobby.id);
        super.OnLeaveLobby(connection);
        lobby.RemovePlayer(connection);
        if (this.host == connection) {
            this.host = this.connections[0];
            // console.log("host has left the match. New host is: " + this.host);
        }
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
                    let pos = this.GetSpawnPoint();
                    player.position = pos.position;
                    player.rotation = pos.rotation;
                    let returnData = {
                        id: player.id,
                        position: {
                            x: player.position.x,
                            y: player.position.y,
                            z: player.position.z,
                        },
                        rotation: {
                            x: player.rotation.x,
                            y: player.rotation.y,
                            z: player.rotation.z,
                            w: player.rotation.w,
                        }
                    }
                    socket.emit('playerRespawn', returnData);
                    socket.broadcast.to(lobby.id).emit('playerRespawn', returnData);
                }
            }
        });
    }

    SetSpawnPoints(data)
    {
        // console.log("spawnPoints... " + data.spawnPoints);
        data.spawnPoints.map((point, i) => {
            // console.log("point data " + point);
            let newPos = new Vector3(point.x, point.y, point.z);
            let newRot = new Rotation(data.spawnRotations[i].rotation.x, data.spawnRotations[i].rotation.y, data.spawnRotations[i].rotation.z, data.spawnRotations[i].rotation.w);
            // console.log("new spawnpoint " + newPos);
            let newSpawn = new SpawnPoint();
            newSpawn.position = newPos;
            newSpawn.rotation = newRot;
            this.spawnPoints.push(newSpawn);
        });
    }

    OnLevelLoaded(connection = Connection)
    {
        let lobby = this;
        if (this.LobbyState != LobbyState.ENDGAME) {
            lobby.AddPlayer(connection);
            if (connection == lobby.host)
                lobby.InitializeGameBots();
        }  else {
            connection.socket.emit('endGame', {
                matchResults: resultString,
                countdownTime: 10,
            })
        }
    }
    
    GetSpawnPoint()
    {
        let lobby = this;
        let point = lobby.spawnPoints[Math.floor(Math.random() * lobby.spawnPoints.length)]
        let toCheck = lobby.GetActivePlayers();
        toCheck.forEach(player => {
            if (player.position.Distance(point) < 5) {
                lobby.GetSpawnPoint();
                return;
            }
        });
        // this.connections.forEach(c => {
        //     if (c.player.position.Distance(point) < 5) {
        //         this.GetSpawnPoint();
        //         return;
        //     }
        // });
        // this.bots.forEach(bot => {
        //     if (bot.position.Distance(point) < 5) {
        //         this.GetSpawnPoint();
        //         return;
        //     }
        // });
        return point;
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

    InitializeGameBots() {
        // minus one to account for standard update bot behavior
        for (let i = 0; i < this.settings.maxPlayers; i++) {
            // let newBot = new Bot();
            // this.bots.push(new Bot());
            this.AddBot()
        }
    }

    UpdateBots() {
        let lobby = this;
        if (this.currentPlayerCount + this.bots.length > this.maxPlayers)
        {
            this.RemoveBot();
        } else {
            this.AddBot();
        }
    }

    AddBot(newBot = new Bot()) {
        let lobby = this;
        let pos = lobby.GetSpawnPoint();
        newBot.position = pos.position;
        newBot.rotation = pos.rotation;

        this.bots.push(newBot);
        console.log("adding bot: " + newBot.username);
        lobby.connections.forEach(c => {
            c.socket.emit("spawnBot", newBot);
        });
    }

    RemoveBot(index = null)
    {
        if (index == null) {
            index = Math.floor(Math.random() * this.bots.length);
        }
        let toDespawn = bots.splice(index, 1);
        console.log("removing bot: " + toDespawn.username);
        lobby.connections.forEach(c => {
            c.socket.emit("despawnBot", {
                id: toDespawn.id
            });
        });

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
                    // console.log("distance to player " + player.id + " - " + distance);
                    if (distance < this.settings.blastRadius) {
                        // console.log("player hit");
                        playerHit = true;
                        let dmg = Math.floor(this.Damage.ScaleDamageByDistance(this.settings.baseDamage, distance, this.settings.blastRadius));
                        let score = Math.ceil(dmg * 10)
                        let isDead = player.DealDamage(dmg); // half health
                        connection.player.score += score;
                        if (isDead) {
                            // console.log("Player with id " + player.id + " has died");
                            let returnData = {
                                id: player.id,
                                attackerId: projectile.activator,
                                hitScore: score,
                                playerScore: connection.player.score,
                            }
                            c.socket.emit('playerDied', returnData);
                            c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        } else {
                            let returnData = {
                                id: player.id,
                                currentHealth: player.health,
                                damage: dmg,
                                hitScore: score,
                                playerScore: connection.player.score,
                                attackerId: projectile.activator,
                            }
                            c.socket.emit('playerHit', returnData);
                            c.socket.broadcast.to(lobby.id).emit('playerHit', returnData);
                            // console.log("player with id " + player.id + " has ( " + player.health + " ) health left.");
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

        let pos = this.GetSpawnPoint();

        player.position = pos.position;
        player.rotation = pos.rotation;
        // let returnData = {
        //     id: connection.player.id,
        // }
        // console.log('spawning player...');
        socket.emit('spawn', player); // tell myself it has spawned
        socket.broadcast.to(lobby.id).emit('spawn', player); // tell other sockets of new spawn

        this.UpdateBots();
        // tell myself about everyone else in the game
        // connections.forEach(c => {
        //     if (c.player.id != connection.player.id) {
        //         socket.emit('spawn', c.player);
        //     }
        // });
    }

    RemovePlayer(connection = Connection) {
        let lobby = this;
        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id,
        });
        this.UpdateBots();
    }

    UpdateGameState() {
        if (this.LobbyState.currentState == this.LobbyState.GAME && this.timeRemaining <= 0) {
            let lobby = this;
            // console.log("endGame - total players: " + lobby.connections.length);
            this.LobbyState.currentState = this.LobbyState.ENDGAME;
            this.lastMatchEnd = new Date();
            
            let resultsArr = this.GetActivePlayers().sort((a, b) => {
                return b.score - a.score;
            });
            let resultString = "";
            resultsArr.map((res, i) => {
                resultString += `${i+1}   ${res.username}    ${res.score}\n`
            });
            lobby.connections.forEach(c => {

                // c.socket.emit("serverDespawn", {
                //     id: c.player.id
                // });
                // c.socket.broadcast.to(lobby.id).emit("serverDespawn", {
                //     id: c.player.id
                // });

                c.socket.emit('endGame', {
                    matchResults: resultString,
                    countdownTime: 10,
                })
            });
        }
    }

    GetActivePlayers()
    {
        let playerArr = [];
        this.connections.forEach(c => {
            playerArr.push(c.player);
        });
        return playerArr.concat(this.bots);
    }

    UpdateNextMatchTime() {
        this.timeRemaining = (new Date() - this.lastMatchEnd);
        // console.log('time till next match: ' + this.timeRemaining);
        if (this.timeRemaining >= 10000)
        {
            this.ResetGame();
        }
        // console.log(`next match in: ${this.timeRemaining}`)
    }

    UpdateMatchTime() {
        let upTime = super.GetMatchTime();
        this.timeRemaining = (this.settings.gameLength + 5) - upTime;
        // console.log(`lobbyId: ${this.id} upTime: ${upTime} timeLeft: ${this.timeRemaining}`)
        this.connections.forEach(c => {
            c.socket.emit('updateGameClock', {
                timeRemaining: this.timeRemaining,
            })
        });
    }

    UpdateMatchScores() {
        let resultsArr = this.GetActivePlayers().sort((a, b) => {
            return b.score - a.score;
        });
        let resultString = "";
        resultsArr.map((res, i) => {
            resultString += `${i+1}   ${res.username}    ${res.score}\n`
        });
        // console.log(`lobbyId: ${this.id} upTime: ${upTime} timeLeft: ${this.timeRemaining}`)
        this.connections.forEach(c => {
            c.socket.emit('updateMatchScores', {
                matchScores: resultString,
            })
        });
    }

    SetHost(connection = Connection) {
        // console.log("setting host... " + connection + " lobby: " + this.id);
        this.host = connection;
        connection.socket.emit("setHost", { });
        // this.InitializeGameBots();
    }

    ResetGame() {
        // console.log("resetting game");
        let lobby = this;
        this.connections.forEach(c => {
            let player = c.player;
            let pos = this.GetSpawnPoint();
            c.socket.emit('loadGame', c.player.name);
            player.position = pos.position;
            player.rotation = pos.rotation;
            player.score = 0;
            // console.log('spawning player...');
            // c.socket.emit('spawn', c.player); // tell myself it has spawned
            // c.socket.broadcast.to(lobby.id).emit('spawn', c.player); // tell other sockets of new spawn

        });
        this.startTime = new Date();
        this.timeRemaining = this.settings.gameLength;
        this.LobbyState.currentState = this.LobbyState.GAME;
    }
}
