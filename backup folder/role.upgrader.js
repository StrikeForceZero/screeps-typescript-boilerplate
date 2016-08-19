const actionsCheckFullCargo = require('actions.checkFullCargo');
const actionsRetrieveEnergy = require('actions.retrieveEnergy');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep, creepTotals) {
        
        actionsCheckFullCargo.run(creep);

        if(creep.memory.fullCargo) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else if(creepTotals.miners >= 1){ // if cargo is empty and there IS A miner alive, gather resources from a container. IF no containter (with energy) is found, gather from dropped energy instead.
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

module.exports = roleUpgrader;