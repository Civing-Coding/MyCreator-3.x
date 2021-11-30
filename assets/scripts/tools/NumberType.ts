import { _decorator, Component, Label, lerp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass
export default class NumberType extends Component {

    @property
    stepTime: number = 0.01;

    @property
    duringTime: number = 60;

    public label: Label = null;
    private _curNum: number = 0;
    private _stack = [];
    private _run: boolean = false;

    start() {
        this.label = this.getComponent(Label);
        this._curNum = parseFloat(this.label.string);
    }


    public typeTo(n: number, afterPointfixed: number = 0) {
        if (this._run || this._stack.length > 0) {
            this._stack.push({
                n: n,
                afterPointfixed: afterPointfixed
            });
        } else {
            this.excuteType(n, afterPointfixed);
        }
    }

    private excuteType(n: number, afterPointfixed: number = 0) {
        this._run = true;
        let index = 0;
        this.schedule(() => {
            index = parseFloat((index + 0.02).toFixed(2));
            this.label.string = lerp(this._curNum, n, index).toFixed(afterPointfixed).toString();
            if (index == 1) {
                this._curNum = parseFloat(this.label.string);
                this._run = false;
                if (this._stack.length > 0) {
                    let tmp = this._stack.shift();
                    this.excuteType(tmp.n, tmp.afterPointfixed);
                }
            }
        }, this.stepTime, this.duringTime - 1);
    }
}
