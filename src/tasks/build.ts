import CreepWrapper from '../wrappers/CreepWrapper';
import {RoleTaskStatus} from '../wrappers/CreepWrapper';

enum BuildPriority {
    road,
    storage,
    container,
    extractor,
    lab,
    observer,
    powerspawn, // TODO: one word?
    nuker,
    terminal,
    extension,
    wall,
    rampart,
    link,
    tower,
    spawn,
}

export default function runBuildTask(creep: CreepWrapper) {
    if (creep.isEmpty) {
        return RoleTaskStatus.Failed;
    }

    const priorityBuildAreas = creep.room.find<Flag>(FIND_FLAGS, {
        filter: flag => flag.name === 'priority_build',
    });

    const priorityTargets = priorityBuildAreas
        .map(flag => flag.pos.findInRange<ConstructionSite>(FIND_CONSTRUCTION_SITES, 2))
        .filter(x => x.length > 0);

    let targets = (priorityTargets.length > 0 ? priorityTargets[0] : creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES));
    targets.sort((a, b) => {
            const A = BuildPriority[a.structureType];
            const B = BuildPriority[b.structureType];

            if (_.isUndefined(A) && !_.isUndefined(B) || A < B) {
                return 1;
            }
            if (!_.isUndefined(A) && _.isUndefined(B) || A > B) {
                return -1;
            }
            return 0;
        });

    if (targets.length > 0) {
        let currentIndex = 0;
        let result       = creep.build(targets[currentIndex]);

        while (currentIndex < targets.length - 1 && [ERR_NO_PATH, ERR_INVALID_TARGET, ERR_RCL_NOT_ENOUGH].includes(result)) {
            result = creep.build(targets[++currentIndex]);
        }

        if (result === OK) {
            if (creep.isEmpty) {
                return RoleTaskStatus.Completed;
            }
            return RoleTaskStatus.Ok;
        }
    }

    // Fail role since we are out of work
    if (targets.length === 0) {
        creep.failTaskAndRoleStatus();
    }

    return RoleTaskStatus.Failed;
};
