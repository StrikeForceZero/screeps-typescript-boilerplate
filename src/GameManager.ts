import CreepWrapper, {CreepClass, CreepClassTypes, getCreepClass, BodyPart} from './wrappers/CreepWrapper';
import {Role} from './wrappers/CreepWrapper';
import {SPAWN_ERROR} from './constants';

type roleMap = { [key: string]: CreepWrapper[] };

class SpawnQueueItem implements ISpawnQueueItem {
    constructor(
        public classType: CreepClassTypes | number,
        public defaultRole: Role | number,
        public isRoleLocked = false,
        public fallBack: ISpawnQueueItem[] = [],
    ) { }
}

function createCreep(spawn: Spawn, creepClass: CreepClass, isRoleLocked = false) {
    let creepResult: number | string = spawn.canCreateCreep(creepClass.body);
    if (creepResult === OK) {
        creepResult = spawn.createCreep(creepClass.body);
        console.log(creepResult);

        if (!isNaN(creepResult as number)) {
            console.log(SPAWN_ERROR[creepResult]);
            return creepResult;
        }

        Memory.totalCreepsAlive++;

        const creep = new CreepWrapper(Game.creeps[creepResult]);
        creep.assignRole(creepClass.role, true, isRoleLocked);

        return creepResult;
    }
    return creepResult;
}

function processWorkerCreationQueue(spawn: Spawn) {
    const spawnQueue = Memory.spawnQueue;
    if (spawnQueue.length === 0) {
        return;
    }
    const spawnQueueItem = spawnQueue[0];
    let result = createCreep(spawn, getCreepClass(spawnQueueItem.classType), spawnQueueItem.isRoleLocked);
    if (result === OK) {
        Memory.spawnQueue.splice(0, 1);
        return result;
    }
    for (const queueItem of spawnQueueItem.fallBack) {
        result = createCreep(spawn, getCreepClass(queueItem.classType));
        if (result === OK) {
            Memory.spawnQueue.splice(0, 1);
            return result;
        }
    }
}

function enqueueWorkers(spawn: Spawn, creeps: CreepWrapper[]) {
    const standardWorkerBody = (BodyPart.WORK | BodyPart.CARRY | BodyPart.MOVE);
    const creepsWithStandardWorkerBodies = creeps.filter(creep => (creep.bodyFlags & standardWorkerBody) === standardWorkerBody);

    if (creepsWithStandardWorkerBodies.length > 4) {
        const stationaryHarvesterBody = (BodyPart.WORK | BodyPart.MOVE);
        const creepsWithStationaryHarvesterBodies = creeps.filter(creep =>
            // doesn't have CARRY body
            ((creep.bodyFlags & stationaryHarvesterBody) === stationaryHarvesterBody) && ((creep.bodyFlags & BodyPart.CARRY) === 0));
        if (creepsWithStationaryHarvesterBodies.length < 2
            && Memory.spawnQueue.filter(x => [CreepClassTypes.HarvesterClass2, CreepClassTypes.HarvesterClass1].includes(x.classType)).length < 2
        ) {
            Memory.spawnQueue.push(
                new SpawnQueueItem(CreepClassTypes.HarvesterClass2, Role.Harvester, true, [ new SpawnQueueItem(CreepClassTypes.HarvesterClass1, Role.Harvester)]));
        }

        const carrierWorkerBody = (BodyPart.CARRY | BodyPart.MOVE);
        const creepsWithCarrierBodies = creeps.filter(creep =>
            // doesn't have WORK body
        ((creep.bodyFlags & carrierWorkerBody) === carrierWorkerBody) && ((creep.bodyFlags & BodyPart.WORK) === 0) );
        if (creepsWithCarrierBodies.length < 2 && Memory.spawnQueue.filter(x => x.defaultRole === Role.Carrier).length < 2) {
            Memory.spawnQueue.push(new SpawnQueueItem(CreepClassTypes.CarrierClass2, Role.Carrier, true, [ new SpawnQueueItem(CreepClassTypes.CarrierClass1, Role.Carrier)]));
        }
        return;
    }

    if (Memory.spawnQueue.filter(x => x.classType === CreepClassTypes.WorkerClass1).length === 0) {
        Memory.spawnQueue.unshift(new SpawnQueueItem(CreepClassTypes.WorkerClass1, Role.Harvester));
    }

    if (creepsWithStandardWorkerBodies.length < 4 &&
        ((Memory.spawnQueue.length > 0 && Memory.spawnQueue[0].classType !== CreepClassTypes.WorkerClass1) || Memory.spawnQueue.length === 0)
    ) {
        let index = Memory.spawnQueue.findIndex(x => x.classType !== CreepClassTypes.WorkerClass1);
        while (index > -1) {
            Memory.spawnQueue.splice(index, 1);
            index = Memory.spawnQueue.findIndex(x => x.classType !== CreepClassTypes.WorkerClass1);
        }
        Memory.spawnQueue.unshift(new SpawnQueueItem(CreepClassTypes.WorkerClass1, Role.Harvester));
    }
}

export default class GameManager {

    public static loop() {

        console.log(`======= ${Game.time} =======`);

        const creeps = Object.values(Game.creeps).map(creep => new CreepWrapper(creep));

        Memory.totalCreepsAlive = Memory.totalCreepsAlive || creeps.length;
        Memory.spawnQueue = Memory.spawnQueue || [];

        for (const name in Memory.creeps) {
            if (!Game.creeps[name]) {
                console.log('deleting old creep data');
                Memory.totalCreepsAlive--;
                delete Memory.creeps[name];
            }
        }

        const spawn = Game.spawns['Spawn1'];

        const hostiles = spawn.room.find<Creep>(FIND_HOSTILE_CREEPS);

        let fightersNeeded = hostiles.length > 0 ? hostiles.length * 2 - creeps.filter(creep => creep.memory.currentRole === Role.Fighter).length : 0;

        if (fightersNeeded) {
            if (createCreep(spawn, getCreepClass(CreepClassTypes.FighterClass3)) === OK) {
                fightersNeeded--;
            } else if (createCreep(spawn, getCreepClass(CreepClassTypes.FighterClass2)) === OK) {
                //
            } else if (createCreep(spawn, getCreepClass(CreepClassTypes.FighterClass1)) === OK) {
                //
            }
        }

        if (!fightersNeeded && Memory.totalCreepsAlive < 15) {
            enqueueWorkers(spawn, creeps);

            processWorkerCreationQueue(spawn);
        }

        const roles: roleMap = Object.keys(Role).slice(Object.keys(Role).length / 2).reduce((p, c) => {
            p[c] = [];
            return p;
        }, {});

        for (const creep of _.sortBy(creeps, 'name')) {

            if (fightersNeeded > 0 && creep.hasBodyPart(ATTACK)) {
                creep.assignRole(Role.Fighter);
                fightersNeeded--;
            }

            creep.run();

            roles[Role[creep.memory.currentRole]].push(creep);
        }

        const outputTable = ['<table>'];
        for (const [role, creeps] of Object.entries(roles)) {
            outputTable.push(`<tr><td>${role} (${creeps.length}) : </td></tr>`); // ${creeps.map(creep => `<td>${creep.name} </td>`).join('')}</tr>`);
        }
        outputTable.push(`<tr><td>Total (${Memory.totalCreepsAlive})</td></tr>`);
        outputTable.push('</table>');

        console.log(outputTable.join(''));
    }
}
