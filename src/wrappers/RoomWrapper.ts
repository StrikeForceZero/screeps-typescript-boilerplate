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

class SpawnQueue {
    public priority: ISpawnQueueItem[] = [];
    public standard: ISpawnQueueItem[] = [];
}

interface IRoomMemory {
    memory: {
        sourceMap: ISourceAssignmentMap;
        spawnQueues: SpawnQueue;
        roomConfig: RoomConfigType;
    };
}

type RoompWrapperEntityType = Room & IRoomMemory & IEntityWithName;

export default class RoomWrapper extends AbstractObjectWithMemoryWrapper<RoompWrapperEntityType> implements IEntityWithName {
    protected target: RoompWrapperEntityType;

    public spawns  = GameManager.wrapAll(this.room.find<Spawn>(FIND_MY_SPAWNS), SpawnWrapper);
    public creeps  = GameManager.wrapAll(this.room.find<Creep>(FIND_MY_CREEPS), CreepWrapper);
    public sources = this.room.find<Source>(FIND_SOURCES);

    constructor(target: Room) {
        super(RoomWrapper.wrap(target));
    }

    private static wrap(room: Room): RoompWrapperEntityType {
        const wrappedRoom = room as RoompWrapperEntityType;

        if (wrappedRoom.memory.isWrapped) {
            return wrappedRoom;
        }

        wrappedRoom.memory.sourceMap   = wrappedRoom.memory.sourceMap || {};
        wrappedRoom.memory.spawnQueues = wrappedRoom.memory.spawnQueues || new SpawnQueue();
        wrappedRoom.memory.roomConfig  = wrappedRoom.memory.roomConfig || RoomConfigType.Standard;

        return wrappedRoom;
    }

    get name(): string {
        return this.room.name;
    }

    get room(): RoompWrapperEntityType {
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

        console.log(JSON.stringify(roleCounts, null, 2));

        const masterSpawnQueueCopy = this.memory.spawnQueues.priority.concat(this.memory.spawnQueues.standard);

        // console.log(JSON.stringify(masterSpawnQueueCopy, null, 2));

        type SpawnCountMap = { [key: number]: number };

        const getSpawnCounts: () => SpawnCountMap = () => masterSpawnQueueCopy.reduce((p, c) => {
            p[c.role] = (p[c.role] || 0) + 1;
            return p;
        }, {});

        const getCreepEgg: (role: Role) => ISpawnQueueItem = (role: Role) => ({
            role       : role,
            name       : `${Math.ceil(Math.random() * 100000)}_${Role[role].toLowerCase()}`,
            bodyOptions: CreepClassMap[role],
        });

        const getTotalSpawnRoleCounts = (spawnQueueCounts: SpawnCountMap, role: Role) => (roleCounts[role] || 0) + (spawnQueueCounts[role] || 0);

        const roomConfig = RoomWrapper.getRoomConfig(this.sources.length)[RoomConfigType.Standard];

        const priorities        = Object.entries<Role, IRoomConfigRule>(roomConfig);
        const currentPriorities = priorities.slice();

        for (const [role, rules] of currentPriorities) {

            let spawnQueueCounts = getSpawnCounts();

            console.log(JSON.stringify(getTotalSpawnRoleCounts(spawnQueueCounts, role), null, 2));
            /*if (getTotalSpawnRoleCounts(spawnQueueCounts, role) === 0) {
                console.log(Role[role] + ': 0');
                break;
            }*/

            // if we have exceed limit until next role
            if (getTotalSpawnRoleCounts(spawnQueueCounts, role) >= rules.next) {
                // if we have not yet exceeded 2 below max
                if (getTotalSpawnRoleCounts(spawnQueueCounts, role) < rules.max - 1 || rules.max === 0) {
                    console.log('renqueued: ' + Role[role]);
                    currentPriorities.push([role, rules]);
                }
            }

            while (getTotalSpawnRoleCounts(spawnQueueCounts, role) < rules.min) {
                console.log('[P]enqueued: ' + Role[role]);
                this.memory.spawnQueues.priority.push(getCreepEgg(role));
                spawnQueueCounts = getSpawnCounts();
                break;
            }

            if (getTotalSpawnRoleCounts(spawnQueueCounts, role) < rules.max) {
                while (getTotalSpawnRoleCounts(spawnQueueCounts, role) < rules.next - 1) {
                    console.log('[S]enqueued: ' + Role[role]);
                    this.memory.spawnQueues.standard.push(getCreepEgg(role));
                    spawnQueueCounts = getSpawnCounts();
                    break;
                }
                console.log('[S]enqueued: ' + Role[role]);
                this.memory.spawnQueues.standard.push(getCreepEgg(role));
                spawnQueueCounts = getSpawnCounts();
            }

            break;
        }

        for (const spawn of spawns) {
            console.log('spawn: ' + spawn.name);
            if (this.memory.spawnQueues.priority.length === 0) {
                console.log('running standard queue');
                spawn.processQueue(this.removeBodyOptions(this.memory.spawnQueues.priority, roleCounts), true);
                continue;
            }
            console.log('running priority queue');
            spawn.processQueue(this.removeBodyOptions(this.memory.spawnQueues.standard, roleCounts));
        }

        // console.log(JSON.stringify(this.memory.spawnQueues, null, 2));
    }

    public processCreeps(creeps: CreepWrapper[] = this.creeps) {
        for (const creep of creeps) {
            console.log('creep: ' + creep.name);
            creep.run();
        }
    }

    /**
     * Modify queue to remove body options that would be dangerous if minimums weren't met
     * @param queue
     * @param roleCounts
     * @returns {ISpawnQueueItem[]}
     */
    private removeBodyOptions(queue: ISpawnQueueItem[], roleCounts: { [key: number]: number }) {
        return queue.slice().map(item => {
            item.bodyOptions = (roleCounts[item.role] || 0) < 2 ? [item.bodyOptions[0]] : item.bodyOptions;
            return item;
        });
    }

    public static getRoomConfig(numOfSources: number): { [key: number]: { [key: number]: IRoomConfigRule } } {
        return {
            [RoomConfigType.None]    : {},
            [RoomConfigType.Standard]: {
                [Role.Harvester] : {weight: 0, min: 1, next: numOfSources, max: numOfSources * 2},
                [Role.Upgrader]  : {weight: 1, min: 1, next: 1, max: 0},
                [Role.Carrier]   : {weight: 2, min: 1, next: numOfSources, max: numOfSources * 2},
                [Role.Builder]   : {weight: 3, min: 1, next: 1, max: numOfSources * 2},
                [Role.Maintainer]: {weight: 4, min: 1, next: 1, max: numOfSources * 2},
            },
            [RoomConfigType.Resource]: {},
        };

    }
}
