interface ISpawnQueueItem {
    defaultRole: number;
    classType: number;
    fallBack: ISpawnQueueItem[];
    isRoleLocked: boolean;
}

interface Memory { // tslint:disable-line:interface-name
    totalCreepsAlive: number;
    spawnQueue: ISpawnQueueItem[];
}
