import { _decorator, Enum, Component, EventHandler, Node } from 'cc';
import { EventManager } from "./EventManager";

const { ccclass, property, menu } = _decorator;

const EVENT_TYPE = Enum({
    EVENT_MANAGER: 0,
    NODE: 1,
    COMPONENT: 2,
    DELAY_DO: 3
})

const EVENT_COMPONENT_TYPE = Enum({
    ON_LOAD: 0,
    START: 1,
    ON_ENABLE: 2,
    UPDATE: 3,
    ON_DISABLE: 4,
    ON_DESTROY: 5,
})

const EVENT_NODE_TYPE = Enum({
    ANCHOR_CHANGED: 0,
    CHILD_ADDED: 1,
    CHILD_REMOVED: 2,
    CHILD_REORDER: 3,
    COLOR_CHANGED: 4,
    GROUP_CHANGED: 5,
    MOUSE_DOWN: 6,
    MOUSE_ENTER: 7,
    MOUSE_LEAVE: 8,
    MOUSE_MOVE: 9,
    MOUSE_UP: 10,
    MOUSE_WHEEL: 11,
    POSITION_CHANGED: 12,
    ROTATION_CHANGED: 13,
    SCALE_CHANGED: 14,
    SIBLING_ORDER_CHANGED: 15,
    SIZE_CHANGED: 16,
    TOUCH_CANCEL: 17,
    TOUCH_END: 18,
    TOUCH_MOVE: 19,
    TOUCH_START: 20
})

@ccclass('EventTools')
@menu('Tools/EventTools')
export default class EventTools extends Component {

    @property({ type: EVENT_TYPE })
    eventType = EVENT_TYPE.EVENT_MANAGER;

    @property({
        type: Node,
        visible(this: any) {
            return this.eventType != EVENT_TYPE.EVENT_MANAGER;
        }
    })
    target: Node = null;

    @property({
        type: EVENT_NODE_TYPE,
        visible(this: any) {
            return this.eventType == EVENT_TYPE.NODE;
        }
    })
    nodeType = EVENT_NODE_TYPE.TOUCH_START;

    @property({
        type: EVENT_COMPONENT_TYPE,
        visible(this: any) {
            return this.eventType == EVENT_TYPE.COMPONENT;
        }
    })
    componentType = EVENT_COMPONENT_TYPE.ON_LOAD;

    @property({
        visible(this: any) {
            return this.eventType == EVENT_TYPE.EVENT_MANAGER;
        }
    })
    onlyOnce: boolean = false;

    @property({
        visible(this: any) {
            return this.eventType == EVENT_TYPE.EVENT_MANAGER;
        }
    })
    eventName: string = "";

    @property({
        visible(this: any) {
            return this.eventType == EVENT_TYPE.DELAY_DO;
        }
    })
    playOnStart: boolean = false;

    @property({
        visible(this: any) {
            return this.eventType == EVENT_TYPE.DELAY_DO;
        }
    })
    delayTime: number = 0;

    @property({ type: [EventHandler] })
    call_functions = [];

    private _obj: Node = null;

    onLoad() {
        this._obj = (this.target || this.node) as Node;
        this.eventType == EVENT_TYPE.COMPONENT && this.componentType == EVENT_COMPONENT_TYPE.ON_LOAD && this.excute();
        this.eventType == EVENT_TYPE.NODE && this._obj.on(Node.EventType[EVENT_NODE_TYPE[this.nodeType]], this.excute, this);
        if (this.eventType == EVENT_TYPE.EVENT_MANAGER) {
            if (this.onlyOnce) {
                EventManager.getInstance().once(this.eventName, this.excute.bind(this));
            } else {
                EventManager.getInstance().on(this.eventName, this.excute.bind(this));
            }
        }
    }

    start() {
        this.eventType == EVENT_TYPE.COMPONENT && this.componentType == EVENT_COMPONENT_TYPE.START && this.excute();
        this.eventType == EVENT_TYPE.DELAY_DO && this.playOnStart && this.delayExcute();
    }

    onEnable() {
        this.eventType == EVENT_TYPE.COMPONENT && this.componentType == EVENT_COMPONENT_TYPE.ON_ENABLE && this.excute();
    }

    update(dt: number) {
        this.eventType == EVENT_TYPE.COMPONENT && this.componentType == EVENT_COMPONENT_TYPE.UPDATE && this.excute(dt);
    }

    onDisable() {
        this.eventType == EVENT_TYPE.COMPONENT && this.componentType == EVENT_COMPONENT_TYPE.ON_DISABLE && this.excute();
        this.eventType == EVENT_TYPE.NODE && this._obj.off(Node.EventType[EVENT_NODE_TYPE[this.eventType]], this.excute, this);
        if (this.eventType == EVENT_TYPE.EVENT_MANAGER) {
            EventManager.getInstance().remove(this.eventName);
        }
    }

    onDestroy() {
        this.eventType == EVENT_TYPE.COMPONENT && this.componentType == EVENT_COMPONENT_TYPE.ON_DESTROY && this.excute();
    }

    excute(args?: any) {
        EventHandler.emitEvents(this.call_functions, args);
    }

    delayExcute(args?: any) {
        this.scheduleOnce(() => {
            EventHandler.emitEvents(this.call_functions, args);
        }, this.delayTime);
    }
}
