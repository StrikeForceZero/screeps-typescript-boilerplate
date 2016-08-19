var actionsRetrieveEnergy = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 0;
            }
        });
        
        if(sources.length){
            if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
        else {
            var droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            if(droppedEnergy) {
                if(creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
        }
    }
};

module.exports = actionsRetrieveEnergy;