const roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(!creep.memory.hauling && creep.carry.energy == 0) {
            creep.memory.hauling = true;
            creep.say('hauling');
        }
        if(creep.memory.hauling && creep.carry.energy == creep.carryCapacity) {
            creep.memory.hauling = false;
            creep.say('storing');
        }

        if(creep.memory.hauling) {
            let sources = creep.room.find(FIND_DROPPED_RESOURCES);
            if(sources.length){
                const pickupResult = creep.pickup(sources[0]);
                if(pickupResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                    return true;
                }
                return pickupResult == OK;
            }

            sources = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 0;
                }
            });

            if(sources.length){
                const withdrawlResult = creep.withdraw(sources[0], RESOURCE_ENERGY);
                if(withdrawlResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                    return true;
                }
                return withdrawlResult == OK;
            }

            const canWork = creep.body.some(x => x == WORK);

            if(!canWork) {
                creep.memory.hauling = false;
                return false;
            }

            sources = creep.room.find(FIND_SOURCES);
            if(sources.length){
                const harvestResult = creep.harvest(sources[0]);
                if(harvestResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                    return true;
                }
                return harvestResult == OK;
            }
        }

        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });

        if(!targets.length){
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                }
            });
        }

        if(targets.length) {
            const transferResult = creep.transfer(targets[0], RESOURCE_ENERGY);
            if(transferResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
                return true;
            }
            return transferResult == OK;
        }



        return false;
    }
};

export default roleHauler;