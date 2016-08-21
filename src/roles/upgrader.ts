const roleUpgrader = {

    run: function (creep) {

        if (creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('gathering');
        }
        if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('upgrading');
        }

        if (creep.memory.upgrading) {
            const upgradeResult = creep.upgradeController(creep.room.controller);
            if (upgradeResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
                return true;
            }
            return upgradeResult === OK;
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
    }
};

export default roleUpgrader;
