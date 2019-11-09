const port = process.env.port || 5280;
const io = require('socket.io')(port);
const Player = require('./Classes/Player');
const Vector3 = require('./Classes/Vector3');
const Projectile = require('./Classes/Projectile');

// divide by ten for unity server update time
setInterval(() => {
    // server.OnUpdate();
}, 100, 0)

io.on('connection', (socket) => {
    // let connection = server.OnConnected(socket); 
    // connection.CreateEvents();
    // connection.socket.emit('register', { 'id': connection.player.id });
    console.log("player connected");
    let newPlayer = new Player();
    socket.emit('register', { 'id': newPlayer.id });
    newPlayer.position = new Vector3(5, 0.25, 15)
    socket.emit('spawn', newPlayer);
    socket.on('fireProjectile', (e) => {
        console.log("player has fired their cannon");
        let projectile = new Projectile();
        // projectile.name = "Shell";
        socket.emit('serverSpawn', projectile);
        socket.broadcast.emit('serverSpawn', projectile);
    })
})
io.on('joinGame', (socket) => {
    console.log("player has joined the game");
    socket.broadcast.emit('joinedGame', {'id': socket.id});
})
io.on('disconnect', (socket) => {
    console.log("player has disconnected");
    socket.broadcast.emit('disconnected', {'id': socket.id});
})