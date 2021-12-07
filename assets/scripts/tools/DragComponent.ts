
import { _decorator, Component, Node, Vec2, v2, Vec3, v3, Rect, EventHandler, rect, UIOpacity, UITransform, EventTouch } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('DragComponent')
export class DragComponent extends Component {


    @property({ tooltip: '拖拽目标', type: Node })
    target: Node[] = [];

    @property({ tooltip: '如果不填，使用物体本身的size作为范围。' })
    offset = v2(0, 0);

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
        this.orginPos = this.node.getWorldPosition();

        for (let i in this.target) {
            let uiTransform = this.target[i].getComponent(UITransform);
            this.setTargetPos(this.target[i].worldPosition.x, this.target[i].worldPosition.y,
                this.offset.x == 0 ? uiTransform.width : this.offset.x,
                this.offset.y == 0 ? uiTransform.height : this.offset.y);
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
        let tmp = this.node.worldPosition;
        this.node.setWorldPosition(tmp.x + e.getUIDelta().x, tmp.y + e.getUIDelta().y, 0);
    }

    touchEnd() {
        this._opacity.opacity = 255;
        this.node.setSiblingIndex(this.zIndex);

        for (let i in this.targetRange) {
            if (this.targetRange[i].contains(v2(this.node.worldPosition.x, this.node.worldPosition.y))) {
                this.dragEnd(true, i);
                return;
            }
        }

        this.node.setWorldPosition(this.orginPos.clone());
        this.dragEnd(false, '');

    }

    dragEnd(over: Boolean, rangId: string) {
        // console.log('拖拽到指定地点', over, rangId);
        if (over) {
            console.log('over');
            let endPos = new Vec3();
            Vec3.add(endPos, this.target[rangId].worldPosition, this.dragEndPosition);
            this.node.setWorldPosition(endPos);
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
}

