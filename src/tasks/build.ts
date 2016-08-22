import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runBuildTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
    }

    const priorityBuildAreas = creep.room.find<Flag>(FIND_FLAGS, {
        filter: flag => flag.name === 'priority_build',
    });

    const priorityTargets = priorityBuildAreas
        .map(flag => flag.pos.findInRange<ConstructionSite>(FIND_CONSTRUCTION_SITES, 6))
        .filter(x => x.length > 0);

    const targets = priorityTargets.length > 0 ? priorityTargets[0] : creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);

    if (targets.length > 0 && creep.build(targets[0]) === OK) {
        if (creep.isEmpty) {
            return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
        }
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Ok);
    }
    return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
};
