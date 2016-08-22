import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runBuildTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        return RoleTaskStatus.Failed;
    }

    const priorityBuildAreas = creep.room.find<Flag>(FIND_FLAGS, {
        filter: flag => flag.name === 'priority_build',
    });

    const priorityTargets = priorityBuildAreas
        .map(flag => flag.pos.findInRange<ConstructionSite>(FIND_CONSTRUCTION_SITES, 2))
        .filter(x => x.length > 0);

    const targets = priorityTargets.length > 0 ? priorityTargets[0] : creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);

    if (targets.length > 0) {
        let currentIndex = 0;
        let result       = creep.build(targets[currentIndex]);

        while (currentIndex < targets.length && [ERR_NO_PATH, ERR_INVALID_TARGET, ERR_RCL_NOT_ENOUGH].includes(result)) {
            result = creep.build(targets[++currentIndex]);
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
