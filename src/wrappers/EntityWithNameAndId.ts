import Manager from './AbstractRoomObjectWrapper';
import {IEntityWithId} from './EntityWithId';
import {IEntityWithName} from './EntityWithName';

export default class EntityWithNameAndId<T> extends Manager<T & IEntityWithId & IEntityWithName> {
    get id(){
        return this.target.id;
    }

    get name(){
        return this.target.name;
    }
}
