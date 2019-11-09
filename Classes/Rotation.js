module.exports = class Rotation {
    constructor(X = 0, Y = 0, Z = 0, W = 0) {
        this.x = X;
        this.y = Y;
        this.z = Z;
        this.w = W;
    }

     ConsoleOutput() {
         return '(' + this.x + ',' + this.y + ',' + this.z + ',' + this.w + ')';
     }
}