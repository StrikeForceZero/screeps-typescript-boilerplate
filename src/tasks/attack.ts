import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runAttackTask(creep: CreepWrapper) {
    const targets = creep.room.find<Creep>(FIND_HOSTILE_CREEPS);

    if (targets.length > 0 && creep.attack(targets[0]) === OK) {
        if (targets.length === 1 && targets[0].hits === 0) {
            return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
        }
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Ok);
    }

    const idleAreas = creep.room.find<Flag>(FIND_FLAGS, {
        filter: flag => flag.name === 'idle_attackers',
    });

    // goto to idle spot if not attackers so spawn doesn't get blocked
    if (targets.length === 0 && idleAreas.length > 0) {
        if (creep.creep.moveTo(idleAreas[0]) === OK) {
            return creep.updateCurrentTaskStatus(RoleTaskStatus.Ok);
        }
    }

    return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
};
