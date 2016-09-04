import construct = Reflect.construct;
import extend = require('lodash/extend');
import { AbstractEntityWrapper } from './AbstractEntityWrapper';

export interface IWrapped {
    memory: {
        isWrapped: boolean,
    };
}

export default class AbstractObjectWithMemoryWrapper<T> extends AbstractEntityWrapper<T> {

    protected target: T & IWrapped;

    constructor(target: T) {
        super(target);
        if (!AbstractObjectWithMemoryWrapper.hasMemory(target)) {
            throw new Error('object does not contain memory');
        }
        this.memory.isWrapped = true;
        this.target = target as T & IWrapped;
    }

    private static hasMemory(target: any): target is IWrapped {
        return typeof target.memory !== 'undefined';
    }

    get memory() {
        return this.target.memory;
    }
}
