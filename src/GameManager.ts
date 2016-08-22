import CreepWrapper, {CreepClass, CreepClassTypes, getCreepClass} from './wrappers/CreepWrapper';
import {Role} from './wrappers/CreepWrapper';
import {SPAWN_ERROR} from './constants';

type roleMap = { [key: string]: CreepWrapper[] };

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

export default class GameManager {

    public static loop() {

        console.log(`======= ${Game.time} =======`);

        const creeps = Object.values(Game.creeps).map(creep => new CreepWrapper(creep));

        Memory.totalCreepsAlive = Memory.totalCreepsAlive || creeps.length;

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
            createCreep(spawn, getCreepClass(CreepClassTypes.WorkerClass1));
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
