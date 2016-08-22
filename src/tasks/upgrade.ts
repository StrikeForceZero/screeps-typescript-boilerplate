import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runUpgradeTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        return RoleTaskStatus.Failed;
    }

    const controller = creep.room.controller;

    if (controller.level < 8 && creep.upgrade(controller) === OK) {
        if (creep.isEmpty) {
            return RoleTaskStatus.Completed;
        }
        return RoleTaskStatus.Ok;
    }

    // Fail role since we are out of work
    if (controller.level >= 8) {
        creep.failTaskAndRoleStatus(); // fail for now since we aren't using the default role system..
        // TODO: return RoleTaskStatus.Completed;
    }

    return RoleTaskStatus.Failed;
};
