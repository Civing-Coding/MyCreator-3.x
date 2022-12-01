
import { _decorator, Component, Node, dragonBones, EventHandler, CCBoolean, CCString, Enum, ccenum, log } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('DragonBonesEx')
@requireComponent(dragonBones.ArmatureDisplay)
export class DragonBonesEx extends Component {

    //结束触发
    @property({ type: EventHandler })
    completeCallback: EventHandler[] = [];

    //循环触发
    @property({ type: EventHandler })
    loopCompleteCallback: EventHandler[] = [];

    private _armatureDisplay: dragonBones.ArmatureDisplay | null = null;

    onLoad() {
        this._armatureDisplay = this.getComponent(dragonBones.ArmatureDisplay)!;

        this._armatureDisplay.addEventListener(dragonBones.EventObject.COMPLETE, this.onComplete, this);
        this._armatureDisplay.addEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onComplete, this);
    }

    start() {

    }

    onComplete(event: { type: any; animationState: { name: string; }; }) {
        if (event.type == dragonBones.EventObject.COMPLETE) {
            EventHandler.emitEvents(this.completeCallback);
        } else if (event.type == dragonBones.EventObject.LOOP_COMPLETE) {
            EventHandler.emitEvents(this.loopCompleteCallback);
        }
    }

    playAnim(event: any, anim: string) {
        if (anim === undefined) anim = event;
        let list = anim.split(',');
        this._armatureDisplay.playAnimation(list[0], list.length > 0 ? parseInt(list[1], 10) : -1);
    }

    setTimeScale(event: EventHandler, args: string) {
        this._armatureDisplay.timeScale = parseFloat(args);
    }
}

