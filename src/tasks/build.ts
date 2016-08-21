import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runBuildTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
    }

    const targets = creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);

    if (targets.length > 0 && creep.build(targets[0]) === OK) {
        if (creep.isEmpty) {
            return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
        }
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Ok);
    }
    return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
};
