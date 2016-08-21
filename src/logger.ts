import CreepWrapper, {Role, RoleTask, RoleTaskStatus} from './wrappers/CreepWrapper';

export function logTaskStatusChange(creep: CreepWrapper, taskStatus: RoleTaskStatus) {
    // Skip status: OK
    if (taskStatus === RoleTaskStatus.Ok) {
        return;
    }
    console.log(`${creep.name} task: ${RoleTask[creep.memory.currentRoleTask]} (${RoleTaskStatus[taskStatus]})`);
}

export function logRoleStatusChange(creep: CreepWrapper, roleStatus: RoleTaskStatus) {
    // Skip status: OK
    if (roleStatus === RoleTaskStatus.Ok) {
        return;
    }
    console.log(`${creep.name} role: ${Role[creep.memory.currentRole]} (${RoleTaskStatus[roleStatus]})`);
}
