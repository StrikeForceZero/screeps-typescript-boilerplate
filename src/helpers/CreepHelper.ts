import { BodyConfig } from '../wrappers/CreepWrapper';
import { BODY_COST } from '../types/constants';
export default class CreepHelper {
    public static hasBodyPart(creep: Creep, partName: string) {
        return CreepHelper.hasBodyParts(creep, [partName]);
    }

    public static hasBodyParts(creep: Creep, partNames: string[]) {
        return partNames.every(name => creep.body.some(bpd => bpd.type.toUpperCase() === name));
    }

    public static isEmpty(creep: Creep) {
        return creep.carry.energy === 0 && creep.carry.power === 0 && creep.carryCapacity > 0;
    }

    public static isFull(creep: Creep) {
        return creep.carry.energy + creep.carry.power >= creep.carryCapacity;
    }

    public static getBodyCost(body: BodyConfig) {
        return body.reduce((p, c) => p + BODY_COST[c], 0);
    }
}
