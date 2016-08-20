import { dumpResources as actionsDumpResources } from '../actions';

let hauler = {


    /**
     * @param {Creep} creep
     * @param creepTotals
     */
    run: function(creep, creepTotals) {
        const minimumEnergyAmountToGrab = creep.carryCapacity;
        const MaxRandomTargetsToPickFrom = 1
        
        var target = Game.getObjectById(creep.memory.assignedDroppedEnergy)
        if(creep.carry.energy < creep.carryCapacity) {
            
            if(!target){
                var targets = creep.room.find(FIND_DROPPED_ENERGY,{
                    filter: (droppedEnergy) => droppedEnergy.amount > minimumEnergyAmountToGrab
                });
                var randomTargets = [];
                for(var i=0; i < MaxRandomTargetsToPickFrom; i++){
                    var randomNumber = Math.floor((Math.random() * targets.length));
                    randomTargets.push(targets[randomNumber]);
                }
                var target = creep.pos.findClosestByRange(randomTargets);
                if(target){ creep.memory.assignedDroppedEnergy = target.id; }
            }
            
            if(!target){
                target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
                if(target){ creep.memory.assignedDroppedEnergy = target.id; }
            }
            
            if(target) {
                if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
        else {
            creep.memory.assignedDroppedEnergy = null;
            actionsDumpResources.run(creep);
        }
    }
};

export { hauler };