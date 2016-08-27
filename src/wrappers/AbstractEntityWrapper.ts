export class AbstractEntityWrapper<T> {
    protected target: T;

    constructor(target: T) {
        this.target = target;
    }
}