import { _decorator, Component, Node, Vec3, BoxCollider, UITransform, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CardViewItem')
export class CardViewItem extends Component {


    public CurveOffSetIndex: number = 0;
    public RealIndex: number = 0;
    public CenterOffSet: number = 0;

    onLoad() {
        let collider = this.addComponent(BoxCollider);
        let ui = this.node.getComponent(UITransform);
        collider.size = v3(ui.width, ui.height, 1);

    }

    start() {
        this.node.on(Node.EventType.TOUCH_END, () => { }, this);
    }


    // Update Item's status
    // 1. position
    // 2. scale
    // 3. "depth" is 2D or z Position in 3D to set the front and back item
    public UpdateScrollViewItems(xValue: number, depthCurveValue: number, itemCount: number, yValue: number, scaleValue: number) {
        var targetPos = Vec3.ONE.clone();
        var targetScale = new Vec3(scaleValue, scaleValue, scaleValue);

        // position
        targetPos.x = xValue;
        targetPos.y = yValue;
        this.node.position = targetPos;

        // Set the "depth" of item
        // targetPos.z = depthValue;
        this.SetItemDepth(depthCurveValue, itemCount);
        this.node.setScale(targetScale);
    }

    SetItemDepth(depthCurveValue: number, itemCount: number) {
        var newDepth = Math.floor(depthCurveValue * itemCount);
        this.node.setSiblingIndex(newDepth);
    }

    // Set the item center state
    SetSelectState(isCenter: boolean) {
    }
}

