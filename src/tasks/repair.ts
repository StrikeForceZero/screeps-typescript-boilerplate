import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runRepairTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        return RoleTaskStatus.Failed;
    }

    const targets = creep.room.find<Structure>(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax,
    });

    if (targets.length > 0 && creep.repair(targets[0]) === OK) {
        if (creep.isEmpty) {
            return RoleTaskStatus.Completed;
        }
        return RoleTaskStatus.Ok;
    }
    return RoleTaskStatus.Failed;
};
