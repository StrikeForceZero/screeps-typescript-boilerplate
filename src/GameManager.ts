import { SPAWN_ERROR } from './types/constants';
import CreepWrapper from './wrappers/CreepWrapper';
import { AbstractEntityWrapper } from './wrappers/AbstractEntityWrapper';
import SpawnWrapper from './wrappers/SpawnWrapper';
import RoomWrapper from './wrappers/RoomWrapper';

export default class GameManager {

    constructor() {
        //
    }

    public static wrapAll<T, C>(items: T[], wrapperClass: new(T) => C): C[] {
        return items.map(item => new wrapperClass(item));
    }

    public static initializeMemory() {
        if (Memory.isInitialized) {
            return Memory.data;
        }
        Memory.isInitialized = true;
        return Memory.data = {
            totalCreepsAlive: 0,
        };
    }

    public static cleanup() {
        for (const creepName of Object.keys(Memory.creeps).filter(name => !Game.creeps[name])) {
            delete Memory.creeps[creepName];
        }
    }

    public static loop() {

        const gm = new GameManager();

        console.log(`======= ${Game.time} =======`);

        const memory = GameManager.initializeMemory();
        memory.totalCreepsAlive = 0;

        GameManager.cleanup();

        const rooms = Object.values<Room>(Game.rooms);
        for (const room of GameManager.wrapAll(rooms, RoomWrapper)) {
            console.log('room: ' + room.name);

            memory.totalCreepsAlive += room.creeps.length;

            room.processSpawns();
            room.processCreeps();

        }
    }
}
