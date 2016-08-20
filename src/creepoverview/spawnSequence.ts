import { retrieveTotals as creepsRetrieveTotals } from '../creepoverview';

let spawnSequence = {
    

    run:function(creepMax){
        // for(var name in Memory.creeps) {
        //     if(!Game.creeps[name]) {
        //         delete Memory.creeps[name];
        //         creepsRetrieveTotals.run();
        //     }
        // }
        let creepTotals = Memory.creepTotals;
        let harvesters = creepTotals.harvesters;
        let builders = creepTotals.builders;
        let upgraders = creepTotals.upgraders;
        let miners = creepTotals.miners;
        let haulers = creepTotals.haulers;
        
        let pickedNextSpawn = false;
            
         /* Determining What miners are already positioned on what sources and assigning the new miner appropriately. */
                
               
        if(pickedNextSpawn == false //      MINERS
            && builders >= 1
            // && miners <= haulers
            && miners < creepMax.miners
            && miners < (Game.spawns['Spawn1'].room.find(FIND_SOURCES).length) * 3
            && Game.spawns['Spawn1'].energy >= 250){
                var thisIsFirstMiner = true;
                var thisMinersSource = '';
                var assignedSources = {};
                
                for(var name in Game.creeps) {
                    var creep = Game.creeps[name];
                    var assignedSource = creep.memory.assignedSource;
                    if(creep.memory.role == 'miner') {
                        console.log('opening script for a miner');
                        thisIsFirstMiner = false;
                        
                        console.log('current source:',assignedSource);
                        if(assignedSource in assignedSources){
                            assignedSources[assignedSource]++
                        } else{
                            assignedSources[assignedSource] = 1;
                        }
                    }
                }
                
                for (var assigned in assignedSources){
                        console.log('checking source:',assigned,'current number:',assignedSources[assigned]);
                        if (assignedSources[assigned] < Memory.maxMinersPerSource){
                            delete assignedSources[assigned];
                        }
                    }
                console.log('-- all sources:',assignedSources);
                
                var sources = creep.room.find<Source>(FIND_SOURCES);
                var foundASource = false;
                
                for (var source in sources){
                    var noSourcesMatch = true;
                    console.log('== the current source is:',sources[source].id);
                    for(var assigned in assignedSources){
                        console.log('comparing sources',sources[source].id,'and',assigned);
                        if(sources[source].id == assigned){
                            noSourcesMatch = false;
                        }
                    }
                    if(noSourcesMatch && !foundASource){
                        console.log('WE FOUND OUR SOURCE!:',sources[source].id);
                        thisMinersSource = sources[source].id;
                        foundASource = true;
                    }
                }
                
                
                if (thisIsFirstMiner){
                    console.log('this is the first miner.');
                    thisMinersSource = creep.pos.findClosestByPath<Source>(FIND_SOURCES).id;
                    console.log('his source:',thisMinersSource);
                }
                var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,MOVE], 'miner-'+ (Math.floor(Math.random() * 10000)+1), {role: 'miner', assignedSource: thisMinersSource});
                console.log(newName,'was spawned.');
                pickedNextSpawn = true;
                creepsRetrieveTotals.run();
        }
        
        if(pickedNextSpawn == false //      HAULERS
            && builders >= 1
            && miners >= 1
            && haulers <= miners
            && haulers < creepMax.haulers
            && Game.spawns['Spawn1'].energy >= 100){
                var newName = Game.spawns['Spawn1'].createCreep([CARRY,MOVE], 'hauler-'+ (Math.floor(Math.random() * 10000)+1), {role: 'hauler'});
                console.log(newName,'was spawned.');
                pickedNextSpawn = true;
                creepsRetrieveTotals.run();
        }
        
        if(pickedNextSpawn == false //      BUILDERS
            && builders <= upgraders
            && builders < creepMax.builders
            && Game.spawns['Spawn1'].energy >= 200){
                var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], 'builder-'+ (Math.floor(Math.random() * 10000)+1), {role: 'builder'});
                console.log(newName,'was spawned.');
                pickedNextSpawn = true;
                creepsRetrieveTotals.run();
        }
        
        if(pickedNextSpawn == false //      UPGRADERS
            && miners >= 3
            && haulers >= 2
            && upgraders <= builders
            && upgraders < creepMax.upgraders
            && Game.spawns['Spawn1'].energy >= 200){
                var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], 'upgrader-'+ (Math.floor(Math.random() * 10000)+1), {role: 'upgrader'});
                console.log(newName,'was spawned.');
                pickedNextSpawn = true;
                creepsRetrieveTotals.run();
        }
        
    }

};

export { spawnSequence };