
import { _decorator, Component, Quat, Node, v3, CCFloat, Sprite, color, CCInteger, Vec3, UITransform, EventTouch, CCBoolean, Vec2, lerp } from 'cc';
import { Utils } from './Utils';
const { ccclass, property, menu } = _decorator;

@ccclass('EllipsoidLayout')
@menu('Tools/EllipsoidLayout')
export class EllipsoidLayout extends Component {


    @property(CCFloat)
    radius: number = 500;

    @property(CCInteger)
    maxScaler: number = 3;

    @property(CCInteger)
    minScaler: number = 0;

    @property(Vec3)
    autoRotateV3 = v3();

    @property
    useTouch = true;

    @property(Node)
    touchPanel = null;

    private _cList: Node[] = [];
    private rDetail = v3();
    private _touch = false;
    private _curQuat = new Quat();
    private _lerpTime = 1;
    start() {
        console.log(Utils.fibonacci_list(100));

        this._cList = [...this.node.children];
        let posList = Utils.fibonacci_sphere(this._cList.length);
        for (let i in this._cList) {
            let pos: Vec3 = v3();
            Vec3.multiplyScalar(pos, posList[i], this.radius);
            this._cList[i].position = pos;
            //测试用
            this._cList[i].getComponent(Sprite).color = color(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
        }

        if (this.useTouch) {
            this.touchPanel.on(Node.EventType.TOUCH_START, this.touchStart, this);
            this.touchPanel.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
            this.touchPanel.on(Node.EventType.TOUCH_END, this.touchEnd, this);
            this.touchPanel.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
        }
    }

    touchStart(event: EventTouch) {
        this._touch = true;
    }


    touchMove(event: EventTouch) {
        let delta = event.touch.getUIDelta();
        this.rDetail = v3(delta.x, delta.y, 0);

    }

    touchEnd(event: EventTouch) {
        this._touch = false;
        this._lerpTime = 0;
    }

    update(dt: number) {
        this._lerpTime += dt * 0.5;
        this._lerpTime = this._lerpTime >= 1 ? 1 : this._lerpTime;
        const axis = v3(-this.rDetail.y, this.rDetail.x, 0); //旋转轴
        let rad = this.rDetail.length() * 1e-2; //旋转角度
        rad = this._touch ? rad : lerp(rad, 0, this._lerpTime);
        const quat_cur = this.node.getRotation();
        Quat.rotateAround(this._curQuat, quat_cur, axis.normalize(), rad);
        this.node.setRotation(this._curQuat);


        this.setChildrenState();
    }

    setChildrenState() {
        for (let i in this._cList) {
            this._cList[i].lookAt(v3(this._cList[i].worldPosition.x, this._cList[i].worldPosition.y, -this.radius - 100));
            this._cList[i].getComponent(UITransform).priority = Math.floor(2 * this.radius - this.node.worldPosition.z + this._cList[i].worldPosition.z);
            let scaler = (2 * this.radius - this.node.worldPosition.z + this._cList[i].worldPosition.z) / (this.radius * 2) * (this.maxScaler - this.minScaler) + this.minScaler;
            this._cList[i].setScale(scaler, scaler, scaler);
        }
    }

}
