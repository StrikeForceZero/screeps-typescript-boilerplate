import { AbstractEntityWrapper } from './AbstractEntityWrapper';

export default class AbstractRoomObjectWrapper<T> extends AbstractEntityWrapper<T> {

    protected target: T & RoomObject;

    constructor(target: T & RoomObject) {
        super(target);
        this.target = target;
    }
}
