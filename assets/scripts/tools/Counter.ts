
import { _decorator, Component, Node, Enum, EventHandler, CCInteger, EventTouch } from 'cc';
const { ccclass, property, menu } = _decorator;

const CounterType = Enum({
    ObjCounter: 0,
    NumberCounter: 1
})

@ccclass('Counter')
@menu('Tools/Counter')
export class Counter extends Component {

    @property({ type: CounterType })
    type: number = CounterType.NumberCounter;

    @property(CCInteger)
    targetCount: number = 0;

    @property({ type: EventHandler })
    callFunc: EventHandler[] = [];

    private _index: number = 0;
    private _obj: Set<any> = new Set<any>();

    reset() {
        this._index = 0;
        this._obj = new Set<any>();
    }

    addNumber() {
        this._index++;
        this.check();
    }

    addObj(obj: any, args: any) {
        this._obj.add(args);
        this.check();
    }

    private check() {
        if (this.type == CounterType.NumberCounter && this._index == this.targetCount || this.type == CounterType.ObjCounter && this._obj.size == this.targetCount) {
            EventHandler.emitEvents(this.callFunc);
        }
    }
}

