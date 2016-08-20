import {
    dumpResources as actionsDumpResources,
    checkFullCargo as actionsCheckFullCargo,
    retrieveEnergy as actionsRetrieveEnergy,
} from '../actions';

let builder = {


    /**
     * @param {Creep} creep
     * @param creepTotals
     */
    run: function(creep, creepTotals) {

        actionsCheckFullCargo.run(creep);

        if(creep.memory.fullCargo) {  //  If cargo is full, find a construction site
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length && creepTotals.miners >= 1 && creepTotals.haulers >= 1) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
               var damagedTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                });
                
                if(damagedTargets.length && creepTotals.miners >= 1 && creepTotals.haulers >= 1) {
                    if(creep.repair(damagedTargets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(damagedTargets[0]);
                    }
                } else {
                    actionsDumpResources.run(creep);
                    // creep.say('Nothing to build, dumping');
                }
                
                
            }
        }
        
        else if(Memory.creepTotals.miners >= 1){ // if cargo is empty and there IS A miner alive, gather resources from a container. IF no containter (with energy) is found, gather from dropped energy instead.
            actionsRetrieveEnergy.run(creep);
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
    }
};

export { builder };