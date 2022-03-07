
import { _decorator, Component, Quat, Node, v3, CCFloat, Sprite, color, CCInteger, Vec3, UITransform, EventTouch, CCBoolean, Mat4, quat, mat4 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EllipsoidLayout')
export class EllipsoidLayout extends Component {


    @property(CCFloat)
    radius: number = 500;

    @property(CCInteger)
    maxScaler: number = 3;

    @property(CCInteger)
    minScaler: number = 1;

    @property(Vec3)
    autoRotateV3 = v3();

    @property(CCBoolean)
    useTouch = true;

    @property(Node)
    touchPanel = null;

    private _cList: Node[] = [];
    private rDetail = v3();
    private _touch = false;
    private _curQuat = new Quat();
    start() {
        this._cList = this.node.children;
        let posList = this.fibonacci_sphere(this._cList.length);
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
    }

    update(dt: number) {

        const axis = v3(-this.rDetail.y, this.rDetail.x, 0); //旋转轴
        const rad = this.rDetail.length() * 1e-2; //旋转角度
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

    /**
     * Spherical
     * @param radius Float 半径值，或者说从该点到原点的Euclidean distance（欧几里得距离，即直线距离）。默认值为1.0。
     * @param phi Float 与 y (up) 轴的极坐标角（以弧度为单位）。 默认值为 0。
     * @param theta Float 绕 y (up) 轴的赤道角（以弧度为单位）。 默认值为 0。极点（φ phi）位于正 y 轴和负 y 轴上。赤道（θ theta）从正 z 开始。 
     * @returns 
     */
    getSphericalPos(radius: number, phi: number, theta: number) {
        var sinPhiRadius = Math.sin(phi) * radius;
        return v3(sinPhiRadius * Math.sin(theta), Math.cos(phi) * radius, sinPhiRadius * Math.cos(theta));
    }

    /**
     * fibonacci_sphere
     * 均匀分布在球上
     * @param samples :采样数
     * @returns vector3 array
     */
    fibonacci_sphere(samples: number) {
        let points = [];
        let phi = (Math.sqrt(5) + 1) / 2 - 1;

        for (let i = 1; i <= samples; i++) {
            let z = (2 * i - 1) / samples - 1;
            let rad = Math.sqrt(1 - z * z);
            let theta = 2 * Math.PI * i * phi;
            let x = rad * Math.cos(theta);
            let y = rad * Math.sin(theta);
            points.push(v3(x, y, z).normalize());
        }
        return points;
    }



}
