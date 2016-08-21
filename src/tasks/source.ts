import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

function checkHarvestResult(creep: CreepWrapper, targetSource: Source) {

    console.log('trying secondary harvest');

    const harvestResult = creep.harvest(targetSource);

    if (harvestResult === OK) {

        creep.memory.assignedSource = targetSource.id;

        if (creep.isFull) {
            return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
        }
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Ok);
    }

    console.log('failed secondary source');

    if (!creep.isEmpty) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
    }

    creep.memory.assignedSource = undefined;

    return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
}

export default function runSourceTask(creep: CreepWrapper) {
    if (creep.isFull) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
    }

    const sources = creep.room.find<Source>(FIND_SOURCES);
    if (sources.length > 0) {
        const harvestResult = creep.harvest(creep.memory.assignedSource ? Game.getObjectById<Source>(creep.memory.assignedSource) : sources[0]);

        creep.memory.assignedSource = creep.memory.assignedSource || sources[0].id;

        if (harvestResult === OK) {
            return creep.updateCurrentTaskStatus(RoleTaskStatus.Ok);
        }

        if ([ERR_NOT_IN_RANGE, ERR_NO_PATH].includes(harvestResult) && sources.length > 1 && creep.memory.ticksSinceLastMove > 2) {
            if (sources.length > 2 && creep.memory.ticksSinceLastMove > 4) {
                if (sources.length > 3 && creep.memory.ticksSinceLastMove > 6) {
                    return checkHarvestResult(creep, sources[3]);
                }
                return checkHarvestResult(creep, sources[2]);
            }
            return checkHarvestResult(creep, sources[1]);
        }

    }
    if (!creep.isEmpty) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
    }
    return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
};
