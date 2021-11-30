
import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('StringType')
export class StringType extends Component {

    @property({ tooltip: '每个字的时间' })
    detailTime: number = 0.1;

    @property({ tooltip: '如果不填会使用Label组件的String，或动态赋值使用' })
    str: string = '';

    @property
    playOnStart: boolean = false;

    private _lbl: Label = null;

    onLoad() {
        this._lbl = this.getComponent(Label);
        if (!this.str) {
            this.str = this._lbl.string;
        }
    }

    start() {
        this.playOnStart && this.excute();
    }

    excute(str: string = '') {
        let st = str || this.str;
        this.unscheduleAllCallbacks();
        this._lbl.string = '';
        let index = 0;
        let length = st.length;
        this.schedule(() => {
            index++;
            if (index <= length) {
                this._lbl.string = st.substr(0, index);
            }
        }, this.detailTime, length);
    }

    onEnable() {
        this.unscheduleAllCallbacks();
    }
}
