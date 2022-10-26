
import { _decorator, Component, Node, dragonBones, EventHandler, CCBoolean, CCString, Enum, ccenum } from 'cc';
const { ccclass, property, requireComponent, menu } = _decorator;

@ccclass('DragonBonesEx')
@menu('Tools/DragonBonesEx')
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
}

