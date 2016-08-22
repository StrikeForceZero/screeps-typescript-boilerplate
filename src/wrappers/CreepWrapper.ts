import EntityWithNameAndId from './EntityWithNameAndId';
import {logTaskStatusChange, logRoleStatusChange} from '../logger';
import runSourceTask from '../tasks/source';
import runPickupTask from '../tasks/pickup';
import runStoreTask from '../tasks/store';
import runBuildTask from '../tasks/build';
import runUpgradeTask from '../tasks/upgrade';
import runRepairTask from '../tasks/repair';
import runAttackTask from '../tasks/attack';

export enum CreepClassTypes {
    WorkerClass1,

    HarvesterClass1,
    HarvesterClass2,

    CarrierClass1,
    CarrierClass2,

    FighterClass1,
    FighterClass2,
    FighterClass3,
}

export enum BodyPart {
    MOVE          = 1 << 0,
    WORK          = 1 << 1,
    CARRY         = 1 << 2,
    ATTACK        = 1 << 3,
    RANGED_ATTACK = 1 << 4,
    HEAL          = 1 << 5,
    CLAIM         = 1 << 6,
    TOUGH         = 1 << 7,
}

export enum RoleTaskStatus {
    Failed,
    Ok,
    Completed,
}

export enum RoleTask {
    None    = 0,
    Source  = 1,
    Pickup  = 2,
    Store   = 3,
    Upgrade = 4,
    Build   = 5,
    Repair  = 6,
    Heal    = 7,
    Attack  = 8,
}

export enum Role {
    None       = 0,
    Harvester  = 1,
    Carrier    = 2,
    Builder    = 3,
    Upgrader   = 4,
    Maintainer = 5,
    Fighter    = 6,
}

export const RoleTaskPriorty = {
    [Role.None]      : [RoleTask.None],
    [Role.Harvester] : [RoleTask.Store, RoleTask.Pickup, RoleTask.Source],
    [Role.Carrier]   : [RoleTask.Store, RoleTask.Pickup],
    [Role.Builder]   : [RoleTask.Build, RoleTask.Pickup, RoleTask.Source],
    [Role.Upgrader]  : [RoleTask.Upgrade, RoleTask.Pickup, RoleTask.Source],
    [Role.Maintainer]: [RoleTask.Repair, RoleTask.Pickup, RoleTask.Source],
    [Role.Fighter]   : [RoleTask.Attack],
};

export type Body =
    typeof MOVE
        | typeof WORK
        | typeof CARRY
        | typeof ATTACK
        | typeof RANGED_ATTACK
        | typeof HEAL
        | typeof CLAIM
        | typeof TOUGH

export type BodyConfig = Array<Body>;

export type CreepClass = { body: BodyConfig, role: Role};

export interface ICreepClassMap {
    [key: string]: CreepClass ;
}

export const CreepClassMap: ICreepClassMap = {
    WorkerClass1 : {body: [WORK, CARRY, MOVE], role: Role.Harvester},

    HarvesterClass1 : {body: [WORK, MOVE], role: Role.Harvester},
    HarvesterClass2 : {body: [WORK, WORK, MOVE], role: Role.Harvester},

    CarrierClass1 : {body: [CARRY, MOVE], role: Role.Carrier},
    CarrierClass2 : {body: [CARRY, CARRY, MOVE], role: Role.Carrier},

    FighterClass1: {body: [ATTACK, MOVE], role: Role.Fighter},
    FighterClass2: {body: [ATTACK, MOVE, MOVE], role: Role.Fighter},
    FighterClass3: {body: [TOUGH, ATTACK, MOVE, MOVE], role: Role.Fighter},
};

export function getCreepClass(classType: CreepClassTypes) {
    return CreepClassMap[CreepClassTypes[classType]];
}

/*const convertBitArrayToFlags = (enumArray: RoleTask[]) => enumArray.reduce((flags, flag) => flags | flag, 0);

 export const RoleTasks = {
 [Role.None]      : convertBitArrayToFlags(RoleTaskPriorty[Role.None]),
 [Role.Harvester] : convertBitArrayToFlags(RoleTaskPriorty[Role.Harvester]),
 [Role.Carrier]   : convertBitArrayToFlags(RoleTaskPriorty[Role.Carrier]),
 [Role.Builder]   : convertBitArrayToFlags(RoleTaskPriorty[Role.Builder]),
 [Role.Upgrader]  : convertBitArrayToFlags(RoleTaskPriorty[Role.Upgrader]),
 [Role.Maintainer]: convertBitArrayToFlags(RoleTaskPriorty[Role.Maintainer]),
 };*/

export interface IWrapped {
    memory: {
        isWrapped: boolean,
    };
}

export interface IHasRole {
    memory: {
        defaultRole: Role,
        currentRole: Role,
        currentRoleStatus: RoleTaskStatus,
        currentRoleTask: RoleTask,
        currentRoleTaskStatus: RoleTaskStatus,
        pos: RoomPosition,
        lastTick: number,
        ticksSinceLastMove: number,
        assignedSource: string;
        originalBodyConfig: BodyConfig;
    };
}

type CreepWrapperEntityType = Creep & IWrapped & IHasRole;

export default class CreepWrapper extends EntityWithNameAndId<CreepWrapperEntityType> {
    constructor(creep: CreepWrapperEntityType | Creep) {
        super(CreepWrapper.wrap(creep));
    }

    private static wrap(creep: Creep): CreepWrapperEntityType {
        const wrappedCreep = creep as CreepWrapperEntityType;

        if (wrappedCreep.memory.lastTick === Game.time) {
            return wrappedCreep;
        }

        wrappedCreep.memory.lastTick           = Game.time;
        wrappedCreep.memory.ticksSinceLastMove = wrappedCreep.memory.ticksSinceLastMove || 0;

        const hasMoved = !_.isEqual(Object.assign({}, wrappedCreep.memory.pos), Object.assign({}, wrappedCreep.pos));

        wrappedCreep.memory.pos = Object.assign({}, wrappedCreep.pos);

        wrappedCreep.memory.ticksSinceLastMove = !hasMoved && wrappedCreep.memory.ticksSinceLastMove <= 7 ? wrappedCreep.memory.ticksSinceLastMove + 1 : 0;

        if (wrappedCreep.memory.isWrapped) {
            return wrappedCreep;
        }

        wrappedCreep.memory.originalBodyConfig = wrappedCreep.body.map(bpd => BodyPart[bpd.type.toUpperCase()]).reduce((p, c) => {
            p |= c;
            return p;
        }, 0);

        wrappedCreep.memory.isWrapped = true;
        return CreepWrapper.assignRole(wrappedCreep, wrappedCreep.memory.currentRole);
    }

    get creep() {
        return this.target;
    }

    get memory() {
        return this.target.memory;
    }

    get room() {
        return this.target.room;
    }

    get body() {
        return this.creep.body;
    }

    get bodyFlags() {
        return this.body.map(bpd => BodyPart[bpd.type.toUpperCase()]).reduce((p, c) => {
            p |= c;
            return p;
        }, 0);
    }

    public hasBodyPart(bodyPart: BodyPart | string) {
        if (!isNaN(bodyPart as number)) {
            bodyPart = BodyPart[bodyPart];
        }
        return this.body.some(bpd => bpd.type.toUpperCase() === (bodyPart as string).toUpperCase());
    }

    get isFull() {
        return this.creep.carry.energy >= this.creep.carryCapacity;
    }

    get isEmpty() {
        return this.creep.carry.energy <= 0;
    }

    public static assignRole(creep: CreepWrapperEntityType, role: Role = Role.None, isDefault: boolean = false) {
        creep.memory.defaultRole           = isDefault ? role : creep.memory.defaultRole || role;
        creep.memory.currentRole           = role;
        creep.memory.currentRoleStatus     = RoleTaskStatus.Ok;
        creep.memory.currentRoleTask       = RoleTaskPriorty[role][0];
        creep.memory.currentRoleTaskStatus = RoleTaskStatus.Ok;
        return creep;
    }

    public assignRole(role: Role, isDefault: boolean = false) {
        return CreepWrapper.assignRole(this.target, role, isDefault);
    }

    public nextTask() {
        const currentRoleTasks            = RoleTaskPriorty[this.memory.currentRole];
        const currentRoleTaskIndex        = currentRoleTasks.indexOf(this.memory.currentRoleTask);
        const nextRoleTaskIndex           = currentRoleTaskIndex >= currentRoleTasks.length - 1 ? 0 : currentRoleTaskIndex + 1;
        this.memory.currentRoleTask       = currentRoleTasks[nextRoleTaskIndex] || currentRoleTasks[0];
        this.memory.currentRoleTaskStatus = RoleTaskStatus.Ok;
        // console.log(`[TASK (Next)] ${this.name} : ${currentRoleTaskIndex} -> ${nextRoleTaskIndex}`);
        // console.log(`${this.name} role: ${Role[this.memory.currentRole]} next: ${RoleTask[RoleTaskPriorty[this.memory.currentRole].indexOf(this.memory.currentRoleTask)]}`);
        return this;
    }

    public prevTask() {
        const currentRoleTasks            = RoleTaskPriorty[this.memory.currentRole];
        const currentRoleTaskIndex        = currentRoleTasks.indexOf(this.memory.currentRoleTask);
        const nextRoleTaskIndex           = currentRoleTaskIndex > 0 ? currentRoleTaskIndex - 1 : 0;
        this.memory.currentRoleTask       = currentRoleTasks[nextRoleTaskIndex] || currentRoleTasks[0];
        this.memory.currentRoleTaskStatus = RoleTaskStatus.Ok;
        // console.log(`[TASK (Prev)] ${this.name} : ${currentRoleTaskIndex} -> ${nextRoleTaskIndex}`);
        // console.log(`${this.name} role: ${Role[this.memory.currentRole]} previous: ${RoleTask[currentRoleTasks[nextRoleTaskIndex]]}`);
        return this;
    }

    public nextRole() {
        const roles            = Object.entries(Role).slice(0, Object.keys(Role).length / 2).map(([value, name]) => parseInt(value, 10));
        const currentRoleIndex = roles.findIndex(r => r === this.memory.currentRole);
        const nextRoleIndex    = currentRoleIndex >= roles.length - 1 ? 0 : currentRoleIndex + 1;
        console.log(`[ROLE] ${this.name} : ${Role[roles[currentRoleIndex]]} -> ${Role[roles[nextRoleIndex]]} (${currentRoleIndex}->${nextRoleIndex})`);
        this.assignRole(Role[Role[roles[nextRoleIndex]]]);
        // console.log(`${this.name} role: ${Role[this.memory.currentRole]}`); // task: ${RoleTask[RoleTaskPriorty[this.memory.currentRole][0]]}`);
        return this;
    }

    public updateCurrentTaskStatus(status: RoleTaskStatus) {
        logTaskStatusChange(this, status);
        this.memory.currentRoleTaskStatus = status;
        return this;
    }

    public updateCurrentRoleStatus(status: RoleTaskStatus) {
        logRoleStatusChange(this, status);
        this.memory.currentRoleStatus = status;
        return this;
    }

    public get isStuck() {
        return this.memory.ticksSinceLastMove >= 7;
    }

    public harvest(source: Source) {
        const harvestResult = this.creep.harvest(source);
        if ([ERR_NOT_IN_RANGE, ERR_NO_PATH].includes(harvestResult)) {
            if (this.isStuck) {
                return harvestResult;
            }
            return this.creep.moveTo(source);
        }
        return harvestResult;
    }

    public pickup(resource: Resource) {
        const pickupResult = this.creep.pickup(resource);
        if ([ERR_NOT_IN_RANGE, ERR_NO_PATH].includes(pickupResult)) {
            if (this.isStuck) {
                return pickupResult;
            }
            return this.creep.moveTo(resource);
        }
        return pickupResult;
    }

    public store(target: Structure) {
        const transferResult = this.creep.transfer(target, RESOURCE_ENERGY);
        if ([ERR_NOT_IN_RANGE, ERR_NO_PATH].includes(transferResult)) {
            if (this.isStuck) {
                return transferResult;
            }
            return this.creep.moveTo(target);
        }
        return transferResult;
    }

    public build(target: ConstructionSite) {
        const transferResult = this.creep.build(target);
        if ([ERR_NOT_IN_RANGE, ERR_NO_PATH].includes(transferResult)) {
            if (this.isStuck) {
                return transferResult;
            }
            return this.creep.moveTo(target);
        }
        return transferResult;
    }

    public upgrade(controller: Controller) {
        const upgradeResult = this.creep.upgradeController(controller);
        if ([ERR_NOT_IN_RANGE, ERR_NO_PATH].includes(upgradeResult)) {
            if (this.isStuck) {
                return upgradeResult;
            }
            return this.creep.moveTo(controller);
        }
        return upgradeResult;
    }

    public repair(target: Structure) {
        const repairResult = this.creep.repair(target);
        if ([ERR_NOT_IN_RANGE, ERR_NO_PATH].includes(repairResult)) {
            if (this.isStuck) {
                return repairResult;
            }
            return this.creep.moveTo(target);
        }
        return repairResult;
    }

    public attack(target: Creep) {
        const attackResult = this.creep.attack(target);
        if ([ERR_NOT_IN_RANGE, ERR_NO_PATH].includes(attackResult)) {
            if (this.isStuck) {
                return attackResult;
            }
            return this.creep.moveTo(target);
        }
        return attackResult;
    }

    public failTaskAndRoleStatus() {
        return this.updateCurrentTaskStatus(RoleTaskStatus.Failed).updateCurrentRoleStatus(RoleTaskStatus.Failed);
    }

    private performTask() {
        switch (this.memory.currentRoleTask) {
            case RoleTask.Source:
                return this.hasBodyPart(WORK)
                    ? this.updateCurrentTaskStatus(runSourceTask(this)).memory.currentRoleTaskStatus
                    : this.failTaskAndRoleStatus().memory.currentRoleTaskStatus;
            case RoleTask.Pickup:
                return this.hasBodyPart(CARRY)
                    ? this.updateCurrentTaskStatus(runPickupTask(this)).memory.currentRoleTaskStatus
                    : this.failTaskAndRoleStatus().memory.currentRoleTaskStatus;
            case RoleTask.Store:
                return this.hasBodyPart(CARRY)
                    ? this.updateCurrentTaskStatus(runStoreTask(this)).memory.currentRoleTaskStatus
                    : this.failTaskAndRoleStatus().memory.currentRoleTaskStatus;
            case RoleTask.Build:
                return this.hasBodyPart(WORK)
                    ? this.updateCurrentTaskStatus(runBuildTask(this)).memory.currentRoleTaskStatus
                    : this.failTaskAndRoleStatus().memory.currentRoleTaskStatus;
            case RoleTask.Upgrade:
                return this.hasBodyPart(WORK)
                    ? this.updateCurrentTaskStatus(runUpgradeTask(this)).memory.currentRoleTaskStatus
                    : this.failTaskAndRoleStatus().memory.currentRoleTaskStatus;
            case RoleTask.Repair:
                const result = this.hasBodyPart(WORK)
                    ? this.updateCurrentTaskStatus(runRepairTask(this))
                    : this.failTaskAndRoleStatus().memory.currentRoleTaskStatus;
                if (result === RoleTaskStatus.Failed && this.isFull) {
                   this.updateCurrentRoleStatus(RoleTaskStatus.Failed);
                }
                return result;
            case RoleTask.Attack:
                return this.hasBodyPart(ATTACK)
                    ? this.updateCurrentTaskStatus(runAttackTask(this)).memory.currentRoleTaskStatus
                    : this.failTaskAndRoleStatus().memory.currentRoleTaskStatus;
            case RoleTask.None:
                console.log(`${this.creep.name} is doing nothing!`);
                break;
            default:
                console.log(`task: ${RoleTask[this.memory.currentRoleTask]} not implemented`);
            // throw new Error('unknown task');
        }
        return this.failTaskAndRoleStatus().memory.currentRoleTaskStatus;
    }

    private checkTaskStatus() {

        /*console.log(`${this.name} \n\
         role: ${Role[this.memory.currentRole]} \
         task: ${RoleTask[RoleTaskPriorty[this.memory.currentRole][0]]} \
         status: ${RoleTaskStatus[this.memory.currentRoleStatus]} \
         `);*/
        switch (this.memory.currentRoleTaskStatus) {
            case RoleTaskStatus.Failed:
                // if role failed skip
                if (this.memory.currentRoleStatus === RoleTaskStatus.Failed) {
                    break;
                }

                // console.log(`${this.creep.name} failed (check)`);
                // console.log(RoleTask[this.memory.currentRoleTask]);
                // try the next task

                this.nextTask();

                // console.log(RoleTask[this.memory.currentRoleTask]);
                // if we end up at the beginning then fail the role
                if (RoleTaskPriorty[this.memory.currentRole].indexOf(this.memory.currentRoleTask) === 0) {
                    // console.log(`${this.creep.name} failed (check 2)`);
                    this.updateCurrentRoleStatus(RoleTaskStatus.Failed);
                }

                // console.log(`${this.creep.name} next`);

                break;
            case RoleTaskStatus.Ok:
                // keep working task
                break;
            case RoleTaskStatus.Completed:
                // go back to the default task
                // this.assignRole(this.memory.defaultRole, true);
                this.assignRole(this.memory.currentRole);
                break;
            default:
                throw new Error('unknown task status!');
        }
    }

    private checkRoleStatus() {
        switch (this.memory.currentRoleStatus) {
            case RoleTaskStatus.Failed:
                console.log(`${this.name} dropping energy`);
                this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);

                const takenRoles = Object.values(Game.creeps).map(creep => new CreepWrapper(creep).memory.currentRole);
                // need harvesters?
                if (!takenRoles.some(role => role === Role.Harvester)) {
                    console.log('harvesters needed!');
                    this.assignRole(Role.Harvester);
                    break;
                }
                // need upgraders?
                if (this.creep.room.controller.ticksToDowngrade <= 500 && !takenRoles.some(role => role === Role.Upgrader)) {
                    console.log('upgraders needed!');
                    this.assignRole(Role.Upgrader);
                    break;
                }
                // need maintainers?
                if (!takenRoles.some(role => role === Role.Maintainer)
                    && this.creep.room.find<Structure>(FIND_STRUCTURES, {filter: structure => structure.hits < structure.hitsMax * .75}).length > 0) {
                    console.log('maintainers needed!');
                    this.assignRole(Role.Maintainer);
                    break;
                }
                // try the next role
                this.nextRole();
                break;
            case RoleTaskStatus.Ok:
                // keep working
                break;
            case RoleTaskStatus.Completed:
                const role = this.memory.currentRole;
                // if we are not at the top level role task
                if (RoleTaskPriorty[role].indexOf(this.memory.currentRoleTask) > 0) {
                    this.prevTask();
                    break;
                }
                // all tasks in role completed. go back to default role
                // this.assignRole(this.memory.defaultRole, true);
                this.assignRole(role);
                break;
            default:
                throw new Error('unknown task status!');
        }
    }

    public run() {
        this.performTask();

        this.checkTaskStatus();

        this.checkRoleStatus();

    }
}
