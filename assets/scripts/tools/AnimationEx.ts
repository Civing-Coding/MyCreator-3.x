
import { _decorator, Component, Node, EventHandler, Animation, CCBoolean } from 'cc';
const { ccclass, property, menu } = _decorator;



@ccclass('AnimEx')
@menu('Tools/AnimEx')
export class AnimEx extends Component {

    //结束触发
    @property({ type: EventHandler })
    finishedCallback: EventHandler[] = [];

    //循环触发
    @property({ type: EventHandler })
    LastFrameCallback: EventHandler[] = [];

    //播放触发
    @property({ type: EventHandler })
    playCallBack: EventHandler[] = [];

    private _anim: Animation = null;

    protected onLoad() {
        this._anim = this.getComponent(Animation);
    }

    protected start() {

    }

    protected onEnable() {
        if (!!this._anim) {
            this._anim.on(Animation.EventType.FINISHED, this.onFinish, this);
            this._anim.on(Animation.EventType.LASTFRAME, this.onLastFrame, this);
            this._anim.on(Animation.EventType.PLAY, this.onPlay, this);
        }
    }

    onFinish() {
        EventHandler.emitEvents(this.finishedCallback);
    }

    onLastFrame() {
        EventHandler.emitEvents(this.LastFrameCallback);
    }

    onPlay() {
        EventHandler.emitEvents(this.playCallBack);
    }


    protected onDisable() {
        if (!!this._anim) {
            this._anim.off(Animation.EventType.FINISHED);
            this._anim.off(Animation.EventType.LASTFRAME);
            this._anim.off(Animation.EventType.PLAY);
        }
    }

}

