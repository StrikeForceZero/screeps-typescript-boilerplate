// import CreepWrapper from "./wrappers/CreepWrapper";
// import {Role} from './wrappers/CreepWrapper';
// import {SPAWN_ERROR} from './constants';
import {
    retrieveTotals as creepsRetrieveTotals,
    spawnSequence as creepsSpawnSequence,
} from './creepoverview';

import {
    harvester as roleHarvester,
    upgrader as roleUpgrader,
    builder as roleBuilder,
    miner as roleMiner,
    hauler as roleHauler,
} from './roles';

export default class GameManager {

    static loop() {
        if(!Memory.creepTotals){
            Memory.creepTotals = {
                harvesters: 0,
                builders: 0,
                upgraders: 0,
                miners: 0,
                haulers: 0,
            };
            Memory.maxMinersPerSource = 3;
            Memory.MinimumEnergyToGrab = 50;
            Memory.gameTimeFromLastSpawnCheck = Game.time;
        }

        let creepMax = {
            harvesters: 0,
            builders: 3,
            upgraders: 3,
            miners: 6,
            haulers: 10,
        };
        const ticksToWaitBeforeSpawning = 5;


        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                creepsRetrieveTotals.run();
            }
        }
    


        let creepTotals = Memory.creepTotals;
        
        if(!Game.spawns['Spawn1'].spawning && Game.time >= Memory.gameTimeFromLastSpawnCheck){
            Memory.gameTimeFromLastSpawnCheck = Game.time + ticksToWaitBeforeSpawning;
            creepsSpawnSequence.run(creepMax)
        }
        // console.log('creeper totals:',creepTotals.harvesters,creepTotals.builders,creepTotals.upgraders);

        var tower = Game.getObjectById<Tower>('TOWER_ID');
        if(tower) {
            var closestDamagedStructure = tower.pos.findClosestByRange<Structure>(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }

            var closestHostile = tower.pos.findClosestByRange<Creep>(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            }
        }

        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep, creepTotals);
            }
            if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep, creepTotals);
            }
            if(creep.memory.role == 'builder') {
                roleBuilder.run(creep, creepTotals);
            }
            if(creep.memory.role == 'miner') {
                roleMiner.run(creep, creepTotals);
            }
            if(creep.memory.role == 'hauler') {
                roleHauler.run(creep, creepTotals);
            }
        };
    }
}