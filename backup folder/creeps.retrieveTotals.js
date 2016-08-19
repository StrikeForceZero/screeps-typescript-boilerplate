module.exports = {

    run:function(){
        Memory.creepTotals.harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester').length;
        Memory.creepTotals.builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length;
        Memory.creepTotals.upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader').length;
        Memory.creepTotals.miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner').length;
        Memory.creepTotals.haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler').length;
        
        console.log(
        'Harvesters:',Memory.creepTotals.harvesters,
        '\nBuilders  :',Memory.creepTotals.builders,
        '\nUpgraders :',Memory.creepTotals.upgraders,
        '\nMiners    :',Memory.creepTotals.miners,
        '\nHaulers   :',Memory.creepTotals.haulers
        );
    }
    

};