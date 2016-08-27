import { IEntityWithId, IEntityWithName } from './Entity';
import { Role } from './CreepWrapper';
import AbstractObjectWithMemoryWrapper from './AbstractObjectWithMemoryWrapper';

export interface ISpawnQueueItem {
    body: BodyPartDefinition[];
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

    private static wrap(room: Spawn): SpawnWrapperEntityType {
        return room as SpawnWrapperEntityType;
    }

    get id(): string {
        return this.spawn.id;
    }

    get name(): string {
        return this.spawn.id;
    }

    get spawn(): Spawn {
        return this.target;
    }

    public processQueue() {

    }
}
