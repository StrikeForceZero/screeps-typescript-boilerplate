declare namespace MyScreeps {

    interface ICreepTotals {
        harvesters: number;
        builders: number;
        upgraders: number;
        miners: number;
        haulers: number;
    }

    interface IState {
        creepTotals: ICreepTotals;
        gameTimeFromLastSpawnCheck: number;
    }

    interface IConfig {
        maxMinersPerSource: number;
        MinimumEnergyToGrab: number;
    }
}

interface CreepMemory {
    role: string;
    assignedSource: string;
}

interface Memory extends MyScreeps.IConfig, MyScreeps.IState {
}