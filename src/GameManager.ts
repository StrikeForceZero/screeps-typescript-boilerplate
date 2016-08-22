import CreepWrapper, {CreepClass, CreepClassTypes, getCreepClass, BodyPart} from './wrappers/CreepWrapper';
import {Role} from './wrappers/CreepWrapper';
import {SPAWN_ERROR} from './constants';

type roleMap = { [key: string]: CreepWrapper[] };

class SpawnQueueItem implements ISpawnQueueItem {
    constructor(
        public classType: CreepClassTypes | number,
        public defaultRole: Role | number,
        public fallBack: ISpawnQueueItem[] = [],
    ) { }
}

function createCreep(spawn: Spawn, creepClass: CreepClass) {
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
        creep.assignRole(creepClass.role, true);

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
    let result = createCreep(spawn, getCreepClass(spawnQueueItem.classType));
    if (result === OK) {
        Memory.spawnQueue.shift();
        return result;
    }
    for (const queueItem of spawnQueueItem.fallBack) {
        result = createCreep(spawn, getCreepClass(queueItem.classType));
        if (result === OK) {
            Memory.spawnQueue.shift();
            return result;
        }
    }
}

function enqueueWorkers(spawn: Spawn, creeps: CreepWrapper[]) {
    const creepsWithStandardWorkerBodies = creeps.filter(creep => creep.bodyFlags & BodyPart.WORK & BodyPart.CARRY & BodyPart.MOVE);

    if (creepsWithStandardWorkerBodies.length > 4) {
        const creepsWithCarrierBodies = creeps.filter(creep => creep.bodyFlags & BodyPart.CARRY & BodyPart.MOVE & ~BodyPart.WORK);
        if (creepsWithCarrierBodies.length < 2 && Memory.spawnQueue.filter(x => x.defaultRole === Role.Carrier).length < 2) {
            Memory.spawnQueue.push(new SpawnQueueItem(CreepClassTypes.CarrierClass2, Role.Carrier, [ new SpawnQueueItem(CreepClassTypes.CarrierClass1, Role.Carrier)]));
        }

        const creepsWithStationaryHarvesterBodies = creeps.filter(creep => creep.bodyFlags & BodyPart.WORK & BodyPart.MOVE & ~BodyPart.CARRY);
        if (creepsWithStationaryHarvesterBodies.length < 2 && Memory.spawnQueue.filter(x => x.defaultRole === Role.Harvester).length < 2) {
            Memory.spawnQueue.push(new SpawnQueueItem(CreepClassTypes.HarvesterClass2, Role.Harvester, [ new SpawnQueueItem(CreepClassTypes.HarvesterClass1, Role.Harvester)]));
        }
    }

    if (creeps.length < 5) {
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
