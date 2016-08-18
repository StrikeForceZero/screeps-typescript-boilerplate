export default class AbstractRoomObjectWrapper<T> {

    protected target: T & RoomObject;

    constructor(target: T & RoomObject){
        this.target = target;
    }
}