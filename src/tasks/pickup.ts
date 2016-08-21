import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runPickupTask(creep: CreepWrapper) {
    if (creep.isFull) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
    }

    const resources = creep.room.find<Resource>(FIND_DROPPED_RESOURCES);
    if (resources.length > 0 && creep.pickup(resources[0]) === OK) {
        if (creep.isFull) {
            return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
        }
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Ok);
    }
    if (!creep.isEmpty) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
    }
    return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
};
