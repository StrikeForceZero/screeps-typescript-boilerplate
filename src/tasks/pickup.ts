import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';
import {Role} from '../wrappers/CreepWrapper';

export default function runPickupTask(creep: CreepWrapper) {
    if (creep.isFull) {
        return RoleTaskStatus.Completed;
    }

    const carriersWithEnergy = creep.room.find<Creep>(FIND_MY_CREEPS, {filter: creep => creep.memory.currentRole === Role.Carrier && creep.carry.energy > 0});
    const droppedResources = creep.room.find<Resource>(FIND_DROPPED_RESOURCES);

    const targets = droppedResources.length > 0 ? droppedResources : carriersWithEnergy;

    if (targets.length > 0 && creep.pickup(targets[0]) === OK) {
        if (creep.isFull) {
            return RoleTaskStatus.Completed;
        }
        return RoleTaskStatus.Ok;
    }
    if (!creep.isEmpty) {
        return RoleTaskStatus.Completed;
    }
    return RoleTaskStatus.Failed;
};
