import { dumpResources as actionsDumpResources } from '../actions';

let hauler = {


    /**
     * @param {Creep} creep
     * @param creepTotals
     */
    run: function(creep, creepTotals) {
        const minimumEnergyAmountToGrab = creep.carryCapacity;
        const MaxRandomTargetsToPickFrom = 1;
        
        let target = Game.getObjectById<Resource>(creep.memory.assignedDroppedEnergy);
        if(creep.carry.energy < creep.carryCapacity) {
            
            if(!target){
                const targets: Resource[] = creep.room.find(FIND_DROPPED_ENERGY,{ // TODO: figure out why it complains about creep.room.find<Resource>(...)
                    filter: (droppedEnergy) => droppedEnergy.amount > minimumEnergyAmountToGrab
                });
                const randomTargets: Resource[] = [];
                for(var i=0; i < MaxRandomTargetsToPickFrom; i++){
                    var randomNumber = Math.floor((Math.random() * targets.length));
                    randomTargets.push(targets[randomNumber]);
                }
                target = creep.pos.findClosestByRange(randomTargets);
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