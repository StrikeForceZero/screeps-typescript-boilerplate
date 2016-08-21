import Manager from './AbstractRoomObjectWrapper';

export interface IEntityWithId extends RoomObject {
    id: string;
}

export default class EntityWithId<T> extends Manager<T & IEntityWithId> {
    get id(){
        return this.target.id;
    }
}
