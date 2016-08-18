import Manager from "./AbstractRoomObjectWrapper";

export interface IEntityWithName extends RoomObject {
    name: string;
}

export default class EntityWithName<T> extends Manager<T & IEntityWithName> {
    get name(){
        return this.target.name;
    }
}