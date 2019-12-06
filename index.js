const port = process.env.PORT || 5280;
const io = require('socket.io')(port);
const Player = require('./Classes/Player');
const Vector3 = require('./Classes/Vector3');
const Projectile = require('./Classes/Projectile');
const Server = require('./Classes/Server')

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
