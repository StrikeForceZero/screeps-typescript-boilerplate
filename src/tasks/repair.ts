import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runRepairTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        return RoleTaskStatus.Failed;
    }

    const priorityBuildAreas = creep.room.find<Flag>(FIND_FLAGS, {
        filter: flag => flag.name === 'priority_build',
    });

    const priorityTargets = priorityBuildAreas
        .map(flag => flag.pos.findInRange<Structure>(FIND_STRUCTURES, 2, {filter: structure => structure.hits < structure.hitsMax}))
        .filter(x => x.length > 0);

    const targets = priorityTargets.length > 0 ? priorityTargets[0] : creep.room.find<Structure>(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax,
    });

    if (targets.length > 0) {
        let currentIndex = 0;
        let result       = creep.repair(targets[currentIndex]);

        while (currentIndex < targets.length - 1 && [ERR_NO_PATH, ERR_INVALID_TARGET].includes(result)) {
            result = creep.repair(targets[++currentIndex]);
        }

        if (result === OK) {
            if (creep.isEmpty) {
                return RoleTaskStatus.Completed;
            }
            return RoleTaskStatus.Ok;
        }
    }
    return RoleTaskStatus.Failed;
};
