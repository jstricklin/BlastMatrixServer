const shortId = require('shortid');
const Vector3 = require('./Vector3')
const Rotation = require('./Rotation');

module.exports = class Player {
    constructor(name = 'Default_Player') {
        this.username = name;
        this.id = shortId.generate();
        this.lobby = 0;
        this.position = new Vector3();
        this.rotation = new Rotation();
        this.cannonRotation = new Rotation();
        this.barrelRotation = new Rotation();
        this.health = new Number(100);
        this.score = new Number(0);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
    }

    DisplayPlayerInformation() {
        let player = this;
        return '(' + player.username + ':' + player.id + ')';
    }
    RespawnCounter() {
        this.respawnTicker += 1;
        if (this.respawnTicker >= 10) {
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;
            // console.log("ticking... " + this.respawnTime);
            // three second respawn time
            if (this.respawnTime >= 3) {
                console.log("Respawning player: " + this.id);
                this.isDead = false;
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                this.health = new Number(100);
                // this.position = new Vector3(5, 0.85, 10);

                return true;
            }
        }
        return false;
    }
    DealDamage(amount = Number) {
        this.health -= amount;
        if (this.health <= 0) {
            this.isDead = true;
            this.respawnTicker = new Number (0);
            this.respawnTimer = new Number(0);
        }
        return this.isDead;
    }
}