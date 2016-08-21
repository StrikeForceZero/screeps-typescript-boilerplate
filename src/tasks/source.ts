import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runSourceTask(creep: CreepWrapper) {
    if (creep.isFull) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
    }

    const sources = creep.room.find<Source>(FIND_SOURCES);
    if (sources.length && creep.harvest(sources[0]) === OK) {
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
