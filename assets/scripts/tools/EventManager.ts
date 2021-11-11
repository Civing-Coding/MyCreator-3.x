import { error} from 'cc';
/**
 * 事件管理系统 处理脚本级事件
 */
class Event {
    _name: string;
    _func: Function;
    _onceCheck: boolean;

    constructor(_name: string, _func: Function, _onceCheck: boolean) {
        this._name = _name;
        this._func = _func;
        this._onceCheck = _onceCheck;
    }
}

export class EventManager {
    private static _instance: EventManager;
    private static _eventList: Event[] = [];
    private static _evmID: number = 0;

    static getInstance() {
        if (!EventManager._instance) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }

    on(name: string, func: Function) {
        if (typeof name !== "string" || typeof func !== "function") {
            error("EventManager.js method on param error!");
            return;
        }
        EventManager._eventList[++EventManager._evmID] = new Event(name, func, true);
        return EventManager._evmID;
    }

    once(name: string, func: Function) {
        if (typeof name !== "string" || typeof func !== "function") {
            error("EventManager.js method once param error!");
            return;
        }
        EventManager._eventList[++EventManager._evmID] = new Event(name, func, false);
        return EventManager._evmID;
    }

    remove(args: any) {
        if (typeof args == 'string') {
            for (let i in EventManager._eventList) {
                if (EventManager._eventList[i]._name == args) {
                    delete (EventManager._eventList[i]);
                }
            }
        } else if (typeof args == 'number') {
            if (!!EventManager._eventList[args]) {
                delete (EventManager._eventList[args]);
            }
        } else {
            error("EventManager.js method remove param error!");
            return;
        }
    }

    emit(name: string, ...param: any) {
        if (typeof name !== "string") {
            error("EventManager.js method emit param error!");
            return;
        }

        for (let i in EventManager._eventList) {
            if (!!EventManager._eventList[i] && EventManager._eventList[i]._name == name) {
                EventManager._eventList[i]._func(...param);
                if (!!EventManager._eventList[i] && !EventManager._eventList[i]._onceCheck) {
                    delete (EventManager._eventList[i]);
                }
                // excuteTimes++;
            }
        }
        // cc.log("EventManager.js method emit function excute " + excuteTimes + " times!");
    }

    clear() {
        EventManager._eventList = [];
        EventManager._evmID = 0;
    };
}
