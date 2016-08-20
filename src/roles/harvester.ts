import { dumpResources as actionsDumpResources } from '../actions';

let harvester = {

    /**
     * @param {Creep} creep
     * @param creepTotals
     */
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

export { harvester };