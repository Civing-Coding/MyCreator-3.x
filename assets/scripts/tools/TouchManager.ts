
import { _decorator, Component, Node, EventTouch, v3, Vec3, UITransform} from 'cc';
import { EventManager } from './EventManager';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

const HOLD_TIME = 3;

@ccclass('TouchManager')
export class TouchManager extends Component {

    private _moveDetail = { x: 0, y: 0, pos: Vec3.zero, orgin: Vec3.zero };
    private _orginDistance = 0;
    private _zoom = false;
    private _holdTime = 0;
    private _lastPressTimes = 0;

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    touchStart(event: EventTouch) {
        this._orginDistance = 0;
        this._zoom = false;
        this._holdTime = 0;
        this._moveDetail = { x: 0, y: 0, pos: Vec3.zero, orgin: Vec3.zero };
        let touches = event.getTouches();
        let tmp = touches[0].getUILocation();
        let touch = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(tmp.x, tmp.y, 0));
        this._moveDetail.pos = <any>touch;
        this._moveDetail.orgin = <any>Vec3.clone(touch);
        if (touches.length == 2) {
            this._zoom = true;
        }
        this.node.emit('t_start', this._moveDetail);
        this.schedule(this.checkHold, 0.1);
        let tm = new Date().getTime();
        if (tm - this._lastPressTimes <= 500) {
            this.node.emit('t_TwicePress');
        }
        this._lastPressTimes = tm;
    }

    checkHold() {
        this._holdTime++;
        if (this._holdTime >= HOLD_TIME) {
            this.unschedule(this.checkHold);
            this._holdTime += 0.1;
            this.node.emit('t_LongPress');
        }
    }

    touchMove(event: EventTouch) {
        let touches = event.getTouches();
        if (touches.length == 1 && !this._zoom) {
            let tmp = touches[0].getUILocation();
            let touch = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(tmp.x, tmp.y, 0));
            let tx = touch.x - (<any>this._moveDetail.pos as Vec3).x;
            let ty = touch.y - (<any>this._moveDetail.pos as Vec3).y;
            this._moveDetail.pos = <any>touch;
            this._moveDetail.x = tx;
            this._moveDetail.y = ty;
            !!tx && !!ty && this.node.emit('t_move', this._moveDetail);
        } else if (touches.length == 2) {
            //处理两指缩放
            this._zoom = true;
            let touch1 = touches[0].getUILocation();
            let touch2 = touches[1].getUILocation();
            let distance = Utils.getDistance(touch1, touch2);
            if (this._orginDistance == 0) {
                this._orginDistance = distance;
            } else {
                let zoom = distance - this._orginDistance > 0 ? 1 : -1;
                this.node.emit('t_zoom', zoom);
            }
        }
    }

    touchEnd(event: EventTouch) {
        this.unschedule(this.checkHold);
        this._orginDistance = 0;
        this._holdTime = 0;
        this._moveDetail = { x: 0, y: 0, pos: Vec3.zero, orgin: Vec3.zero };
        this._zoom = false;
        EventManager.getInstance().emit('t_end');
    }
}
