import { IEntityWithId, IEntityWithName } from './Entity';
import { ISpawnQueueItem, default as SpawnWrapper } from './SpawnWrapper';
import AbstractObjectWithMemoryWrapper from './AbstractObjectWithMemoryWrapper';
import CreepWrapper, { Role, CreepClassMap } from './CreepWrapper';
import GameManager from '../GameManager';

enum RoomConfigType {
    None,
    Standard,
    Resource,
}
;

interface IRoomConfigRule {
    weight: number;
    min: number;
    next: number;
    max: number;
}

interface ISourceAssignment {
    sourceId: string;
    pos: RoomPosition;
    creepsAssigned: string[];
    ticksFromSpawn: number;
}

interface ISourceAssignmentMap {
    [sourceId: string]: ISourceAssignment;
}

interface IRoomMemory {
    memory: {
        sourceMap: ISourceAssignmentMap;
        spawnQueue: ISpawnQueueItem[];
        prioritySpawnQueue: ISpawnQueueItem[];
        roomConfig: RoomConfigType;
    };
}

type RoompWrapperEntityType = Room & IRoomMemory & IEntityWithName;

export default class RoomWrapper extends AbstractObjectWithMemoryWrapper<RoompWrapperEntityType> implements IEntityWithName {
    protected target: RoompWrapperEntityType;

    public spawns  = GameManager.wrapAll(this.room.find<Spawn>(FIND_MY_SPAWNS), SpawnWrapper);
    public creeps  = GameManager.wrapAll(this.room.find<Creep>(FIND_CREEPS), CreepWrapper);
    public sources = this.room.find<Source>(FIND_SOURCES);

    constructor(target: Room) {
        super(RoomWrapper.wrap(target));
    }

    private static wrap(room: Room): RoompWrapperEntityType {
        return room as RoompWrapperEntityType;
    }

    get name(): string {
        return this.room.name;
    }

    get room(): Room {
        return this.target;
    }

    get memory() { // TODO: fix not getting right type from parent class
        return this.room.memory;
    }

    public processSpawns(spawns: SpawnWrapper[] = this.spawns) {

        const roleCounts: { [key: number]: number } = this.creeps.reduce((p, c) => {
            p[c.memory.currentRole] = (p[c.memory.currentRole] || 0) + 1;
            return p;
        }, {});

        const masterSpawnQueueCopy = this.memory.prioritySpawnQueue.concat(this.memory.spawnQueue);
        const getSpawnCounts: () => { [key: number]: number } = () => masterSpawnQueueCopy.reduce((p, c) => {
            p[c.role] = (p[c.role] || 0) + 1;
            return p;
        }, {});

        const roomConfig = RoomWrapper.getRoomConfig(this.sources.length)[RoomConfigType.Standard];

        const priorities = Object.entries<Role, IRoomConfigRule>(roomConfig);
        const currentPriorities = priorities.slice();

        for (const [role, rules] of currentPriorities) {
            const creepEgg = {
                role: role,
                name: `${Math.ceil(Math.random() * 100000)}_${Role[role].toLowerCase()}`,
                body: CreepClassMap[role], // TODO: finish
            };

            let spawnQueueCounts = getSpawnCounts();
            const getTotalSpawnRoleCounts = () => roleCounts[role] + spawnQueueCounts[role];

            // if we have exceed limit until next role
            if (getTotalSpawnRoleCounts() >= rules.next) {
                // if we have not yet exceeded 2 below max
                if (getTotalSpawnRoleCounts() < rules.max - 1) {
                    currentPriorities.push([role, rules]);
                }
            }

            while (getTotalSpawnRoleCounts() < rules.min) {
                this.memory.prioritySpawnQueue.push(creepEgg);
                spawnQueueCounts = getSpawnCounts();
            }

            if (getTotalSpawnRoleCounts() < rules.max) {
                while (getTotalSpawnRoleCounts() < rules.next) {
                    this.memory.spawnQueue.push(creepEgg);
                    spawnQueueCounts = getSpawnCounts();
                }
                this.memory.spawnQueue.push(creepEgg);
                spawnQueueCounts = getSpawnCounts();
            }
        }

        for (const spawn of spawns) {
            console.log(spawn.name);
            spawn.processQueue();
        }
    }

    public processCreeps(creeps: CreepWrapper[] = this.creeps) {
        for (const creep of creeps) {
            //
        }
    }

    public static getRoomConfig(numOfSources: number): { [key: number]: { [key: number]: IRoomConfigRule } } {
        return {
            [RoomConfigType.None]    : {},
            [RoomConfigType.Standard]: {
                [Role.Harvester] : {weight: 0, min: 1, next: numOfSources, max: numOfSources * 2},
                [Role.Upgrader]  : {weight: 1, min: 1, next: 1,            max: 0},
                [Role.Carrier]   : {weight: 2, min: 1, next: numOfSources, max: numOfSources * 2},
                [Role.Builder]   : {weight: 3, min: 1, next: 1,            max: numOfSources * 2},
                [Role.Maintainer]: {weight: 4, min: 1, next: 1,            max: numOfSources * 2},
            },
            [RoomConfigType.Resource]: {},
        };

    }
}
