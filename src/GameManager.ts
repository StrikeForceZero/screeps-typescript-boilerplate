import CreepWrapper from './wrappers/CreepWrapper';
import {Role} from './wrappers/CreepWrapper';
import {SPAWN_ERROR} from './constants';
import {RoleTask} from './wrappers/CreepWrapper';

type roleMap = { [key: string]: CreepWrapper[] };

export default class GameManager {

    public static loop() {

        console.log(`======= ${Game.time} =======`);

        const spawn = Game.spawns['Spawn1'];

        if (spawn.canCreateCreep([WORK, CARRY, MOVE]) === OK) {
            const creepResult = spawn.createCreep([WORK, CARRY, MOVE]);
            console.log(creepResult);

            if (!isNaN(creepResult as number)) {
                console.log(SPAWN_ERROR[creepResult]);
                return;
            }

            const creep = new CreepWrapper(Game.creeps[creepResult]);
            creep.assignRole(Role.Harvester, true);
        }

        const roles: roleMap = Object.keys(Role).slice(Object.keys(Role).length / 2).reduce((p, c) => {
            p[c] = [];
            return p;
        }, {});

        for (const rawCreep of _.sortBy(Object.values(Game.creeps), 'name')) {
            const creep = new CreepWrapper(rawCreep);

            creep.run();

            roles[Role[creep.memory.currentRole]].push(creep);
        }

        const outputTable = ['<table>'];
        for (const [role, creeps] of Object.entries(roles)) {
            outputTable.push(`<tr><td>${role}</td>${creeps.map( creep => `<td>${creep.name}</td>`).join('')}</tr>`);
        }
        outputTable.push('</table>');

        console.log(outputTable.join(''));
    }
}
