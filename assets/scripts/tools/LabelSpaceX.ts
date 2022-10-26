
import { _decorator, Component, Label } from 'cc';
const { ccclass, property, menu } = _decorator;


@ccclass('LabelSpaceX')
@menu('Tools/LabelSpaceX')
export class LabelSpaceX extends Component {

    @property({ tooltip: '每个字间隔' })
    spacingX: number = 0;

    private _lbl;

    onLoad() {
        this._lbl = this.getComponent(Label);

    }

    start() {
        if (this.spacingX == 0) {
            return;
        }
        this._lbl.spacingX = this.spacingX;
        this._lbl.updateRenderDate();
    }

}
