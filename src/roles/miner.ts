/*
    The miner is dedicated to literally just grabbing a resource, and dropping it on the floor for someone else to retrieve.
*/
let miner = {

    /** @param {Creep} creep **/
    run: function(creep, creepTotals) {
        
        // if(creep.carry.energy < creep.carryCapacity) {
            // var sources = creep.room.find(FIND_SOURCES);
            var source = Game.getObjectById(creep.memory.assignedSource)
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        // }
    }
};

export { miner };