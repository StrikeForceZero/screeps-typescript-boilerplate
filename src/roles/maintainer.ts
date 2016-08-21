const roleMaintainer = {

    run: function (creep) {

        if (creep.memory.maintaining && creep.carry.energy === 0) {
            creep.memory.maintaining = false;
            creep.say('gathering');
        }
        if (!creep.memory.maintaining && creep.carry.energy === creep.carryCapacity) {
            creep.memory.maintaining = true;
            creep.say('maintaining');
        }

        if (creep.memory.maintaining) {
            const targets = creep.room.find(
                FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.hitsMax - structure.hits > 100);
                    },
                }
            );

            if (targets.length) {
                const repairResult = creep.repair(targets[0]);
                if (repairResult === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                    return true;
                }
                return repairResult === OK;
            }
            return false;
        }

        let sources = creep.room.find(FIND_DROPPED_RESOURCES);
        if (sources.length) {
            const pickupResult = creep.pickup(sources[0]);
            if (pickupResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
                return true;
            }
            return pickupResult === OK;
        }

        sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 0;
            },
        });
        if (sources.length) {
            const withdrawlResult = creep.withdraw(sources[0], RESOURCE_ENERGY);
            if (withdrawlResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
                return true;
            }
            return withdrawlResult === OK;
        }

        sources = creep.room.find(FIND_SOURCES);
        if (sources.length) {
            const harvestResult = creep.harvest(sources[0]);
            if (harvestResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
                return true;
            }
            return harvestResult === OK;
        }

        return false;
    },
};

export default roleMaintainer;