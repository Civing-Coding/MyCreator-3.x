
import { _decorator, Component, Node, Enum, EventHandler, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

const CounterType = Enum({
    ObjCounter: 0,
    NumberCounter: 1
})

@ccclass('Counter')
export class Counter extends Component {

    @property({ type: CounterType })
    type: number = CounterType.NumberCounter;

    @property(CCInteger)
    targetCount: number = 0;

    @property({ type: EventHandler })
    callFunc: EventHandler[] = [];

    private _index: number = 0;
    private _obj: Set<any> = new Set<any>();

    rest() {
        this._index = 0;
        this._obj = new Set<any>();
    }

    addNumber() {
        this._index++;
        this.check();
    }

    addObj(obj: any) {
        this._obj.add(obj);
        this.check();
    }

    private check() {
        if (this.type == CounterType.NumberCounter && this._index == this.targetCount || this.type == CounterType.ObjCounter && this._obj.size == this.targetCount) {
            EventHandler.emitEvents(this.callFunc);
        }
    }
}

