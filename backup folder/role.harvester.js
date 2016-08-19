const actionsDumpResources = require('actions.dumpResources');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep, creepTotals) {
        
        if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
        else {
            actionsDumpResources.run(creep);
        }
    }
};

module.exports = roleHarvester;