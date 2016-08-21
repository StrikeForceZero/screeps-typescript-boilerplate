import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

export default function runUpgradeTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
    }

    const controller = creep.room.controller;

    if (controller.level < 8 && creep.upgrade(controller) === OK) {
        if (creep.isEmpty) {
            return creep.updateCurrentTaskStatus(RoleTaskStatus.Completed);
        }
        return creep.updateCurrentTaskStatus(RoleTaskStatus.Ok);
    }
    return creep.updateCurrentTaskStatus(RoleTaskStatus.Failed);
};
