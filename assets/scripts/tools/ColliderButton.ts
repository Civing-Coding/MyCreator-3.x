import { _decorator, Component, Node, PolygonCollider2D, EventTouch, EventHandler, UITransform, v3, v2, Vec2 } from 'cc';
const { ccclass, property, menu, requireComponent } = _decorator;

/**
 * 开启该组件 需要开启2d物理模块。
 * 编辑器中需要点击Regenerate Points按钮
 */

@ccclass('ColliderButton')
@menu('Tools/ColliderButton')
@requireComponent(PolygonCollider2D)
export class ColliderButton extends Component {

    @property({ type: EventHandler })
    event: EventHandler[] = [];

    private collider: PolygonCollider2D = null;

    onLoad() {
        this.collider = this.getComponent(PolygonCollider2D);
        this.node.on(Node.EventType.TOUCH_END, this.onclick, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_END, this.onclick, this);
    }

    public onclick(e: EventTouch) {
        let tmp = e.getUILocation();
        let touch = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(tmp.x, tmp.y, 0));
        let hit = this._isInPolygon(v2(touch.x, touch.y), this.collider.points);
        hit && EventHandler.emitEvents(this.event, e);
    }


    _isInPolygon(checkPoint: Vec2, polygonPoints: Vec2[]) {
        let counter: number = 0;
        let pointCount = polygonPoints.length;
        let p1 = polygonPoints[0];

        for (let i = 1; i <= pointCount; i++) {
            let p2 = polygonPoints[i % pointCount];
            if (checkPoint.x > Math.min(p1.x, p2.x) && checkPoint.x <= Math.max(p1.x, p2.x)) {
                if (checkPoint.y <= Math.max(p1.y, p2.y)) {
                    if (p1.x != p2.x) {
                        let xinters = (checkPoint.x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
                        if (p1.y == p2.y || checkPoint.y <= xinters) {
                            counter++;
                        }
                    }
                }
            }
            p1 = p2;
        }
        if (counter % 2 == 0) {
            return false;
        } else {
            return true;
        }
    }
}



