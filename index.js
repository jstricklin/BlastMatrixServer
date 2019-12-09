const port = process.env.PORT || 5280;
const express = require('express');
const app = express();
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);
const Player = require('./Classes/Player');
const Vector3 = require('./Classes/Vector3');
const Projectile = require('./Classes/Projectile');
const Server = require('./Classes/Server')
const routes = require('./routes')

serv.listen(port);

app.use('/', routes);

app.use((req, res, next) => {
    let err = new Error('Hmmm... You really shouldn\'t be here...');
    err.status = 404
    next(err)
})

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: err.message
    })
})

console.log('BlastMatrix party has begun.');

let server = new Server();

// divide by ten for unity server update time
setInterval(() => {
    server.OnUpdate();
}, 100, 0)

io.on('connection', (socket) => {
    console.log("player connected");
    let connection = server.OnConnected(socket);
    connection.CreateEvents();
    connection.socket.emit('register', {
        'id': connection.player.id
    });
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
