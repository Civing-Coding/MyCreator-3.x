import { _decorator, Component, Node, Enum, UITransform, director, Canvas, Vec2, CCBoolean, v2, v3 } from 'cc';
const { ccclass, property } = _decorator;

const FITMODE = Enum({
    Expand: 0,
    Shrink: 1,
    FitWidth: 2,
    FitHeight: 3,
    Wrap: 4
});

const ExcuteMode = Enum({
    Once: 0,
    Always: 1,
    None: 2
});

@ccclass('AutoFit')
export class AutoFit extends Component {

    @property({ type: FITMODE })
    fitMode: number = FITMODE.Expand;

    @property({ type: ExcuteMode })
    excuteMode: number = ExcuteMode.Once;

    @property(CCBoolean)
    fitWithCanvas: boolean = false;

    private _target: UITransform = null;
    private _rt: UITransform = null;

    onLoad() {
        this._rt = this.getComponent(UITransform);
        this._target = (this.fitWithCanvas ? director.getScene().getComponentInChildren(Canvas).node : this.node.parent).getComponent(UITransform);
    }

    lateUpdate(dt: number) {
        if (this.excuteMode == ExcuteMode.None || !this._rt || !this._target || this._rt.width == 0 || this._rt.height == 0) return;
        if (this.excuteMode == ExcuteMode.Once) this.excuteMode = ExcuteMode.None;
        let scaleX: number, scaleY: number;
        let scaleV2 = v2(this._target.width / this._rt.width, this._target.height / this._rt.height);
        switch (this.fitMode) {
            case FITMODE.Expand:
                scaleX = scaleY = Math.max(scaleV2.x, scaleV2.y);
                break;
            case FITMODE.Shrink:
                scaleX = scaleY = Math.min(scaleV2.x, scaleV2.y);
                break;
            case FITMODE.FitWidth:
                scaleX = scaleY = scaleV2.x;
                break;
            case FITMODE.FitHeight:
                scaleX = scaleY = scaleV2.y;
                break;
            case FITMODE.Wrap:
                [scaleX, scaleY] = [scaleV2.x, scaleV2.y];
                break;
        }
        this._rt.node.scale = v3(scaleX, scaleY, 1);
    }

}


