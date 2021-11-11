
import { _decorator, Component, Node, Vec2, v2, Vec3, v3, Rect, EventHandler, rect, UIOpacity, UITransform, EventTouch } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('DragComponent')
export class DragComponent extends Component {


    @property(Node)
    target: Node[] = [];

    @property(Vec2)
    offset: any = v2(0, 0);

    @property(Vec3)
    dragEndPosition: Vec3 = v3(0, 0, 0);

    @property({ type: [EventHandler] })
    dragSuccess_cb = [];

    @property({ type: [EventHandler] })
    dragFail_cb = [];

    protected dragTarget: Vec2;
    protected dragOffset: Vec2;
    protected orginPos: Vec3;
    protected zIndex: number;
    protected targetRange: Rect[] = [];
    protected _opacity: UIOpacity;

    onLoad() {

    }

    start() {
        this.startListener();
        this._opacity = this.getComponent(UIOpacity) || this.addComponent(UIOpacity);
        this.zIndex = this.node.getSiblingIndex();
        this.orginPos = this.node.getPosition();

        for (let i in this.target) {
            this.setTargetPos(this.target[i].position.x, this.target[i].position.y, this.offset.x, this.offset.y);
        }
    }

    setTargetPos(x: number, y: number, width: number, height: number) {
        this.dragTarget = v2(x, y);
        this.dragOffset = v2(width, height);

        this.targetRange.push(rect(
            this.dragTarget.x - this.dragOffset.x / 2,
            this.dragTarget.y - this.dragOffset.y / 2,
            this.dragOffset.x,
            this.dragOffset.y
        ));
    }

    touchStart() {
        this._opacity.opacity = 200;
        this.node.setSiblingIndex(99);
    }

    touchMove(e: EventTouch) {
        this.node.setPosition(v3(this.node.position.x + e.getUIDelta().x, this.node.position.y + e.getUIDelta().y, 0));
    }

    touchEnd() {
        this._opacity.opacity = 255;
        this.node.setSiblingIndex(this.zIndex);

        for (let i in this.targetRange) {
            if (this.targetRange[i].contains(v2(this.node.position.x, this.node.position.y))) {
                this.dragEnd(true, i);
                return;
            }
        }

        this.node.setPosition(this.orginPos.clone());
        this.dragEnd(false, '');

    }

    dragEnd(over: Boolean, rangId: string) {
        // console.log('拖拽到指定地点', over, rangId);
        if (over) {
            this.node.position = this.dragEndPosition;
            this.endListener();
            EventHandler.emitEvents(this.dragSuccess_cb, rangId);
        } else {
            EventHandler.emitEvents(this.dragFail_cb, rangId);
        }

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

    ok(args: any) {
        console.log('ok' + args);
    }

    no(args: any) {
        console.log('no' + args);
    }
}

