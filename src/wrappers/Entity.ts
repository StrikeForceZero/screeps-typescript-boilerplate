import { AbstractEntityWrapper } from './AbstractEntityWrapper';

export interface IEntityWithId {
    id: string;
}

export interface IEntityWithName {
    name: string;
}

export class EntityWithId<T> extends AbstractEntityWrapper<T & IEntityWithId> {
    get id(){
        return this.target.id;
    }
}

export class EntityWithName<T> extends AbstractEntityWrapper<T & IEntityWithName> {
    get name(){
        return this.target.name;
    }
}

export class EntityWithNameAndId<T> extends AbstractEntityWrapper<T & IEntityWithId & IEntityWithName> {
    get id(){
        return this.target.id;
    }

    get name(){
        return this.target.name;
    }
}

