
import { _decorator, Component, Node, Enum, EventHandler, Tween, Vec3, v3, UITransform, UIOpacity, tween } from 'cc';
const { ccclass, property } = _decorator;

export const TweenType = Enum({
    Opacity: 0,
    Scale: 1,
    MoveTo: 2,
    MoveBy: 3,
});

@ccclass('TweenEx')
export class TweenEx extends Component {

    @property({ type: TweenType })
    tweenType: number = TweenType.Scale;

    @property
    duration: number = 0;

    @property
    delayTime: number = 0;

    @property({
        visible(this: any) {
            return this.tweenType != TweenType.Opacity;
        }
    })
    vec: Vec3 = v3(0, 0, 0);

    @property({
        visible(this: any) {
            return this.tweenType == TweenType.Opacity;
        }
    })
    opacity: number = 0;

    @property
    repeatTimes: number = -1;

    @property
    playOnStart: Boolean = false;

    @property({ type: [EventHandler] })
    endCallBack = [];

    private _opacity: number = 0;
    private _pos: Vec3 = v3(0, 0, 0);
    private _scale: Vec3 = v3(0, 0, 0);
    private _UIOpacity = null;
    private _UITransform = null;

    onLoad() {
        this._UITransform = this.getComponent(UITransform);
        if (this.tweenType == TweenType.Opacity) {
            this._UIOpacity = this.getComponent(UIOpacity) || this.addComponent(UIOpacity);
            this._opacity = this._UIOpacity.opacity;
        }
        this._pos = this.node.position.clone();
        this._scale = this.node.scale.clone();
    }

    start() {
        if (this.playOnStart) {
            this.excute();
        }
    }

    show() {
        this.showAction().start();
    }

    hide() {
        this.hideAction().start();
    }

    excute() {
        if (this.delayTime > 0) {
            this.scheduleOnce(() => {
                this.excuteAction();
            }, this.delayTime);
        } else {
            this.excuteAction();
        }
    }

    protected excuteAction() {
        if (this.repeatTimes == -1) {
            tween(this.tweenType == TweenType.Opacity ? this._UIOpacity : this.node)
                .sequence(this.showAction(), this.hideAction())
                .repeatForever()
                .start()
        } else if (this.repeatTimes > 0) {
            tween(this.tweenType == TweenType.Opacity ? this._UIOpacity : this.node)
                .sequence(this.showAction(), this.hideAction())
                .repeat(this.repeatTimes)
                .call(() => {
                    EventHandler.emitEvents(this.endCallBack);
                })
                .start()
        } else {
            this.showAction()
                .call(() => {
                    EventHandler.emitEvents(this.endCallBack);
                })
                .start();
        }
    }

    protected showAction() {
        let tw = null;
        switch (this.tweenType) {
            case TweenType.Opacity:
                tw = tween(this._UIOpacity)
                    .to(this.duration, { opacity: this.opacity })
                break;
            case TweenType.Scale:
                tw = tween(this.node)
                    .to(this.duration, { scale: this.vec })
                break;
            case TweenType.MoveTo:
                tw = tween(this.node)
                    .to(this.duration, { position: this.vec })
                break;
            case TweenType.MoveBy:
                tw = tween(this.node)
                    .by(this.duration, { position: this.vec })
                break;
            default:
                break;
        }
        return tw;
    }

    protected hideAction() {
        let tw = null;
        switch (this.tweenType) {
            case TweenType.Opacity:
                tw = tween(this._UIOpacity)
                    .to(this.duration, { opacity: this._opacity })
                break;
            case TweenType.Scale:
                tw = tween(this.node)
                    .to(this.duration, { scale: this._scale })
                break;
            case TweenType.MoveTo:
                tw = tween(this.node)
                    .to(this.duration, { position: this._pos })
                break;
            case TweenType.MoveBy:
                tw = tween(this.node)
                    .by(this.duration, { position: v3(-this.vec.x, -this.vec.y, -this.vec.z) })
                break;
            default:
                break;
        }
        return tw;
    }

}
