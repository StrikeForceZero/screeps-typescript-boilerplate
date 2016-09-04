import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runStoreTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        console.log('empty');
        return RoleTaskStatus.Failed;
    }

    let targets = creep.room.find<Structure>(FIND_STRUCTURES, {
        filter: (structure) => {
            return (
                structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        },
    });

    if (targets.length === 0) {
        console.log('no main structures');
        targets = creep.room.find<Structure>(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
            },
        });
    }

    if (targets.length > 0 && creep.store(targets[0]) === OK) {
        if (creep.isEmpty) {
            console.log('empty');
            return RoleTaskStatus.Completed;
        }
        return RoleTaskStatus.Ok;
    }

    // Fail role since we are out of work
    if (targets.length === 0) {
        console.log('no targets');
        creep.failTaskAndRoleStatus();
    }

    return RoleTaskStatus.Failed;
};
