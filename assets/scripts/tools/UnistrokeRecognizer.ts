import { _decorator, Component, Node, EventTouch, log } from 'cc';
import { DollarRecognizer, Point } from './plugins/dollar';
const { ccclass, property } = _decorator;

@ccclass('UnistrokeRecognizer')
export class UnistrokeRecognizer extends Component {

    private _gesture: any = null;
    private _gesturePoints: any = [];

    start(): void {
        this.startListener();
    }

    destory(): void {
        this.endListener();
    }


    startListener() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    endListener() {
        this.node.off(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    touchStart(e: EventTouch) {
        this._gesture = new DollarRecognizer();
        this._gesturePoints = [];
    }

    touchMove(e: EventTouch) {
        let location = e.getUILocation();
        this._gesturePoints.push(new Point(-location.x, location.y));
    }

    touchEnd(e: EventTouch) {
        let result = this._gesture.Recognize(this._gesturePoints);
        this._gesture = null;
        this._gesturePoints = [];
        log(result.name, result.score, result.time);
    }
}

