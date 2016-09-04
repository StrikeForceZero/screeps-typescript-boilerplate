import { IEntityWithId, IEntityWithName } from './Entity';
import { Role, BodyConfig } from './CreepWrapper';
import AbstractObjectWithMemoryWrapper from './AbstractObjectWithMemoryWrapper';
import CreepHelper from '../helpers/CreepHelper';

export interface ISpawnQueueItem {
    bodyOptions: BodyConfig[];
    name?: string;
    role: Role;
}

interface ISpawnMemory {
    memory: {
        spawnQueue: ISpawnQueueItem[]
    };
}

type SpawnWrapperEntityType = Spawn & ISpawnMemory & IEntityWithId & IEntityWithName;

export default class SpawnWrapper extends AbstractObjectWithMemoryWrapper<SpawnWrapperEntityType> implements IEntityWithId, IEntityWithName {
    protected target: SpawnWrapperEntityType;

    constructor(target: Spawn) {
        super(SpawnWrapper.wrap(target));
    }

    private static wrap(spawn: Spawn): SpawnWrapperEntityType {
        const wrappedRoom = spawn as SpawnWrapperEntityType;

        if (wrappedRoom.memory.isWrapped) {
            return wrappedRoom;
        }

        wrappedRoom.memory.spawnQueue = wrappedRoom.memory.spawnQueue || [];
        return wrappedRoom;
    }

    get id(): string {
        return this.spawn.id;
    }

    get name(): string {
        return this.spawn.name;
    }

    get spawn(): Spawn {
        return this.target;
    }

    get memory() {
        return this.spawn.memory;
    }

    public processQueue(spawnQueue: ISpawnQueueItem[], priority = false) {
        spawnQueue = spawnQueue.concat(this.memory.spawnQueue);
        // console.log(JSON.stringify(spawnQueue, null, 2));
        for (const [index, spawnItem] of spawnQueue.entries()) {
            for (const body of spawnItem.bodyOptions.reverse()) {
                if (this.spawn.room.energyCapacityAvailable >= CreepHelper.getBodyCost(body)) {
                    if (this.spawn.canCreateCreep(body, spawnItem.name) === OK) {
                        const result = this.spawn.createCreep(body, spawnItem.name, {
                            defaultRole: spawnItem.role,
                            currentRole: spawnItem.role,
                        });
                        if (_.isString(result)) {
                            spawnQueue.splice(index, 1);
                        }
                    }
                    break;
                }
                console.log(`cant spawn in ${Role[spawnItem.role]}`);
            }
        }
    }
}
