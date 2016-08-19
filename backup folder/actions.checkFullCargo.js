const actionsDumpResources = require('actions.dumpResources');

var actionsCheckFullCargo = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.fullCargo && creep.carry.energy == 0) {
            creep.memory.fullCargo = false;
        }
        if(!creep.memory.fullCargo && creep.carry.energy == creep.carryCapacity) {
            creep.memory.fullCargo = true;
        }
    }
};

module.exports = actionsCheckFullCargo;