module.exports = class Damage {

    constructor()
    {
        this.totalDamage = new Number(0);        
    }

    ScaleDamageByDistance(baseDamage, dist, maxDist) {
        let minDistMaxDmg = maxDist * 0.5;

        let distDelta = minDistMaxDmg / dist

        let dmgScale = baseDamage * distDelta;

        this.totalDamage = dmgScale > baseDamage ? baseDamage : dmgScale;
        return this.totalDamage;
    }
}