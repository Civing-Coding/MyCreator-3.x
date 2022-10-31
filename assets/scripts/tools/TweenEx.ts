
import { _decorator, Component, Node, Enum, EventHandler, Tween, Vec3, v3, UITransform, UIOpacity, tween, CCBoolean, pingPong, easing, TweenEasing } from 'cc';
import { NodeEx } from './NodeEx';
const { ccclass, property, menu, requireComponent, executeInEditMode } = _decorator;

export const TweenType = Enum({
    Opacity: 0,
    Scale: 1,
    MoveTo: 2,
    MoveBy: 3,
    RotateTo: 4,
});

export const LoopType = Enum({
    Loop: 1,
    PingPong: 2,
});

const TweenEasingStringList: string[] = ['constant', 'linear', 'quadIn', 'quadOut', 'quadInOut', 'cubicIn', 'cubicOut', 'cubicInOut', 'quartIn', 'quartOut', 'quartInOut', 'quintIn', 'quintOut', 'quintInOut', 'sineIn', 'sineOut', 'sineInOut', 'expoIn', 'expoOut', 'expoInOut', 'circIn', 'circOut', 'circInOut', 'elasticIn', 'elasticOut', 'elasticInOut', 'backIn', 'backOut', 'backInOut', 'bounceIn', 'bounceOut', 'bounceInOut', 'smooth', 'fade', 'quadOutIn', 'cubicOutIn', 'quartOutIn', 'quintOutIn', 'sineOutIn', 'expoOutIn', 'circOutIn', 'elasticOutIn', 'backOutIn', 'bounceOutIn'];

export const TweenEasingType = Enum({
    constant: 0,
    linear: 1,
    quadIn: 2,
    quadOut: 3,
    quadInOut: 4,
    cubicIn: 5,
    cubicOut: 6,
    cubicInOut: 7,
    quartIn: 8,
    quartOut: 9,
    quartInOut: 10,
    quintIn: 11,
    quintOut: 12,
    quintInOut: 13,
    sineIn: 14,
    sineOut: 15,
    sineInOut: 16,
    expoIn: 17,
    expoOut: 18,
    expoInOut: 19,
    circIn: 20,
    circOut: 21,
    circInOut: 22,
    elasticIn: 23,
    elasticOut: 24,
    elasticInOut: 25,
    backIn: 26,
    backOut: 27,
    backInOut: 28,
    bounceIn: 29,
    bounceOut: 30,
    bounceInOut: 31,
    smooth: 32,
    fade: 33,
    quadOutIn: 34,
    cubicOutIn: 35,
    quartOutIn: 36,
    quintOutIn: 37,
    sineOutIn: 38,
    expoOutIn: 39,
    circOutIn: 40,
    elasticOutIn: 41,
    backOutIn: 42,
    bounceOutIn: 43,
});



@ccclass('TweenEx')
@menu('Tools/TweenEx')
@requireComponent(NodeEx)
@executeInEditMode(true)
export class TweenEx extends Component {

    @property({
        type: TweenType,
        group: { id: '0', name: 'tween' },
    })
    tweenType: number = TweenType.Scale;

    @property({
        group: { id: '0', name: 'tween' }
    })
    duration: number = 0;

    @property({
        group: { id: '0', name: 'tween' }
    })
    delayTime: number = 0;

    @property({
        group: { id: '0', name: 'tween' },
        visible(this: any) {
            return this.tweenType != TweenType.Opacity;
        }
    })
    vec: Vec3 = v3(0, 0, 0);

    @property({
        group: { id: '0', name: 'tween' },
        visible(this: any) {
            return this.tweenType == TweenType.Opacity;
        }
    })
    opacity: number = 0;

    @property({
        group: { id: '1', name: 'loop' }
    })
    loopTimes: number = 0;

    @property({
        type: LoopType,
        group: { id: '1', name: 'loop' },
        visible(this: any) {
            return this.loopTimes != 0;
        }
    })
    loop: number = LoopType.PingPong;

    @property({
        group: { id: '2', name: 'easing' },
    })
    useEasing = false;

    @property({
        type: TweenEasingType,
        group: { id: '2', name: 'easing' },
        visible(this: any) {
            return !!this.useEasing;
        }
    })
    showEasing: number = TweenEasingType.linear;

    @property({
        type: TweenEasingType,
        group: { id: '2', name: 'easing' },
        visible(this: any) {
            return !!this.useEasing;
        }
    })
    hideEasing: number = TweenEasingType.linear;

    @property({
        group: { id: '3', name: 'setDefault' }
    })
    playOnEnable = false;

    @property({
        group: { id: '3', name: 'setDefault' }
    })
    setDefault = false;

    @property({
        visible(this: any) {
            return this.tweenType != TweenType.Opacity && this.setDefault;
        },
        group: { id: '3', name: 'setDefault' }
    })
    defaultVec: Vec3 = v3(0, 0, 0);

    @property({
        visible(this: any) {
            return this.tweenType == TweenType.Opacity && this.setDefault;
        },
        group: { id: '3', name: 'setDefault' }
    })
    defaultOpacity: number = 0;

    @property({ type: [EventHandler] })
    endCallBack = [];

    private _opacity: number = 0;
    private _pos: Vec3 = v3(0, 0, 0);
    private _scale: Vec3 = v3(0, 0, 0);
    private _UIOpacity = null;
    private _UITransform = null;
    private _eulerAngles: Vec3 = v3(0, 0, 0);

    onLoad() {
        this.showEasing = this.useEasing ? this.showEasing : TweenEasingType.linear;
        this.hideEasing = this.useEasing ? this.hideEasing : TweenEasingType.linear;
        this._UITransform = this.getComponent(UITransform);
        if (this.tweenType == TweenType.Opacity) {
            this._UIOpacity = this.getComponent(UIOpacity) || this.addComponent(UIOpacity);
            this._opacity = this.setDefault ? this.defaultOpacity : this._UIOpacity.opacity;
        }
        this._pos = this.setDefault ? this.defaultVec : this.node.position.clone();
        this._scale = this.setDefault ? this.defaultVec : this.node.scale.clone();
        this._eulerAngles = this.setDefault ? this.defaultVec : this.node.eulerAngles;
    }

    onEnable() {
        this.setDefault && this.hideActionImmediately();
        this.playOnEnable && this.excute();
    }

    show() {
        this.showAction().call(() => { EventHandler.emitEvents(this.endCallBack); }).start();
    }

    hide() {
        this.hideAction().call(() => { EventHandler.emitEvents(this.endCallBack); }).start();
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

    excuteAction() {
        if (this.loopTimes == 0) {
            this.showAction()
                .call(() => { EventHandler.emitEvents(this.endCallBack); })
                .start();
        } else if (this.loopTimes == -1) {
            if (this.loop == LoopType.Loop) {
                tween(this.tweenType == TweenType.Opacity ? this._UIOpacity : this.node)
                    .sequence(this.showAction(), tween().call(this.hideActionImmediately.bind(this)))
                    .repeatForever()
                    .start()
            } else if (this.loop == LoopType.PingPong) {
                tween(this.tweenType == TweenType.Opacity ? this._UIOpacity : this.node)
                    .sequence(this.showAction(), this.hideAction())
                    .repeatForever()
                    .start()
            }
        } else {
            if (this.loop == LoopType.Loop) {
                tween(this.tweenType == TweenType.Opacity ? this._UIOpacity : this.node)
                    .sequence(this.showAction(), tween().call(this.hideActionImmediately.bind(this)))
                    .repeat(this.loopTimes)
                    .call(() => { EventHandler.emitEvents(this.endCallBack); })
                    .start()
            } else if (this.loop == LoopType.PingPong) {
                tween(this.tweenType == TweenType.Opacity ? this._UIOpacity : this.node)
                    .sequence(this.showAction(), this.hideAction())
                    .repeat(this.loopTimes)
                    .call(() => { EventHandler.emitEvents(this.endCallBack); })
                    .start()
            }
        }
    }

    showAction() {
        let tw = null;
        let ease = { easing: TweenEasingStringList[this.showEasing] as TweenEasing };
        switch (this.tweenType) {
            case TweenType.Opacity:
                tw = tween(this._UIOpacity)
                    .to(this.duration, { opacity: this.opacity }, ease)
                break;
            case TweenType.Scale:
                tw = tween(this.node)
                    .to(this.duration, { scale: this.vec }, ease)
                break;
            case TweenType.MoveTo:
                tw = tween(this.node)
                    .to(this.duration, { position: this.vec }, ease)
                break;
            case TweenType.MoveBy:
                tw = tween(this.node)
                    .by(this.duration, { position: this.vec }, ease)
                break;
            case TweenType.RotateTo:
                tw = tween(this.node)
                    .to(this.duration, { eulerAngles: this.vec }, ease)
                break;
            default:
                break;
        }
        return tw;
    }

    hideAction() {
        let tw = null;
        let ease = { easing: TweenEasingStringList[this.hideEasing] as TweenEasing };
        switch (this.tweenType) {
            case TweenType.Opacity:
                tw = tween(this._UIOpacity)
                    .to(this.duration, { opacity: this._opacity }, ease)
                break;
            case TweenType.Scale:
                tw = tween(this.node)
                    .to(this.duration, { scale: this._scale }, ease)
                break;
            case TweenType.MoveTo:
                tw = tween(this.node)
                    .to(this.duration, { position: this._pos }, ease)
                break;
            case TweenType.MoveBy:
                tw = tween(this.node)
                    .by(this.duration, { position: v3(-this.vec.x, -this.vec.y, -this.vec.z) }, ease)
                break;
            case TweenType.RotateTo:
                tw = tween(this.node)
                    .to(this.duration, { eulerAngles: this._eulerAngles }, ease)
                break;
            default:
                break;
        }

        return tw;
    }

    showActionImmediately() {
        let tw = null;
        switch (this.tweenType) {
            case TweenType.Opacity:
                this._UIOpacity.opacity = this.opacity;
                break;
            case TweenType.Scale:
                this.node.scale = this.vec;
                break;
            case TweenType.MoveTo:
                this.node.position = this.vec;
                break;
            case TweenType.MoveBy:
                this.node.position = this.node.position.add(this.vec);
                break;
            case TweenType.RotateTo:
                this.node.eulerAngles = this.vec;
            default:
                break;
        }
        return tw;
    }

    hideActionImmediately() {
        let tw = null;
        switch (this.tweenType) {
            case TweenType.Opacity:
                this._UIOpacity.opacity = this._opacity;
                break;
            case TweenType.Scale:
                this.node.scale = this._scale;
                break;
            case TweenType.MoveTo:
                this.node.position = this._pos;
                break;
            case TweenType.MoveBy:
                this.node.position = this.node.position.add(this.vec.negative());
                break;
            case TweenType.RotateTo:
                this.node.eulerAngles = this._eulerAngles;
            default:
                break;
        }
        return tw;
    }

}
