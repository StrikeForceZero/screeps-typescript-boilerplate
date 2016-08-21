import CreepWrapper from './wrappers/CreepWrapper';
import {Role} from './wrappers/CreepWrapper';
import {SPAWN_ERROR} from './constants';

export default class GameManager {

    public static loop() {

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

        for (const rawCreep of Object.values(Game.creeps)) {
            const creep = new CreepWrapper(rawCreep);

            creep.run();
        }
    }
}
