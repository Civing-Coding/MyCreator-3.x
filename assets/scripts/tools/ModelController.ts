import { _decorator, Component, Node, EventTouch, Vec3, Quat, clamp, CCFloat, tween, Tween, UIOpacity, director } from "cc";
const { ccclass, property, menu } = _decorator;

@ccclass("PartShow")
export class PartShow {
    @property({ displayName: "CameraNode角度" })
    cNodeRot: Vec3 = new Vec3();
    @property({ displayName: "CameraNode缩放" })
    cNodeScale: Vec3 = new Vec3(1, 1, 1);
    @property({ displayName: "Camera位置" })
    cPos: Vec3 = new Vec3();
    @property({ displayName: "Model角度" })
    mRot: Vec3 = new Vec3();
    @property({ type: CCFloat, displayName: "MaxAngle-X" })
    xMaxAngle: number = 180;
    @property({ type: CCFloat, displayName: "MinAngle-X" })
    xMinAngle: number = -180;
}

@ccclass("ModelController")
@menu('Tools/ModelController')
export class ModelController extends Component {

    @property(Node)
    cameraNode: Node = null;//--------x
    @property(Node)
    modelTarget: Node = null;//--------y

    //@property(CCFloat)
    //xMaxAngle: number = 30;
    private xMaxAngle: number = 180;

    //@property(CCFloat)
    //xMinAngle: number = -30;
    private xMinAngle: number = -180;

    @property(CCFloat)
    public moveSpeed = 1;

    private _rot = new Vec3();
    private pointsDis: number;

    private isLerp: boolean = true;
    private xr: number;
    private yr: number;
    private delta: number;

    @property(CCFloat)
    private autoRotateSpeed: number = 0.3;

    @property(CCFloat)
    private autoRotateTime: number = 3;

    private isSelfRotate: boolean = true;

    private tweenSpeed: object;
    @property(CCFloat)
    private tweenTime: number = 0.5;

    @property(CCFloat)
    private minScale: number = 0.5;
    @property(CCFloat)
    private maxScale: number = 5;
    @property(CCFloat)
    private speed: number = 0.5;

    @property({ type: [PartShow], displayName: "局部初始位置和旋转" })
    public partShowList: PartShow[] = [];

    public isEnable: boolean = true;
    private model: Node;
    private camera: Node;
    private cameraTween: Tween<Node>;
    private cameraNodeTween: Tween<Node>;
    private modelTween: Tween<Node>;

    start() {
        let clickArea = director.getScene().getChildByName('Canvas');

        clickArea.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        clickArea.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        clickArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        clickArea.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        clickArea.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        clickArea.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
        this._rot.set(this.cameraNode.eulerAngles);

        this.delta = 0;

        //console.log("---this.cameraNode.scale--- " , this.cameraNode.scale)
        //console.log("---this.cameraNode.rotation--- " , this.cameraNode.eulerAngles)
        //console.log("---this.cameraNode.position--- " , this.cameraNode.position)
        //console.log("---this.modelTarget.rotation--- " , this.modelTarget.eulerAngles)
    }

    show() {
        this.node.active = true;
        this.node.emit('fade-in');
    }

    hide() {
        this.node.active = false;
        this.node.emit('fade-out');
    }

    public onTouchStart(event: EventTouch) {
        if (this.isEnable == false) return;

        this.isSelfRotate = false;
        this.unschedule(this.callBack);

        this.isLerp = false;
        this.xr = 0;
        this.yr = 0;
        let touches = event.getTouches();
        if (touches.length == 2) {
            let startPos1 = new Vec3(touches[0].getLocation().x, touches[0].getLocation().y, 0);
            let startPos2 = new Vec3(touches[1].getLocation().x, touches[1].getLocation().y, 0);
            this.pointsDis = Vec3.distance(startPos1, startPos2);//startPos1.sub(startPos2).mag();
        }
    }
    public onTouchMove(event: EventTouch) {
        if (this.isEnable == false) return;

        this.isSelfRotate = false;
        this.unschedule(this.callBack);

        let touches = event.getTouches();
        if (touches.length == 1) {
            this._rotateRole(event);
        } else if (touches.length == 2) {
            // 两根手指是缩放
            let touchPoint1 = new Vec3(touches[0].getLocation().x, touches[0].getLocation().y, 0);
            let touchPoint2 = new Vec3(touches[1].getLocation().x, touches[1].getLocation().y, 0);
            let newPointsDis = Vec3.distance(touchPoint1, touchPoint2);
            if (newPointsDis > this.pointsDis) {
                // 表明两根手指在往外划
                this.pointsDis = newPointsDis;
                let x = this.cameraNode.scale.x - 0.02;
                this.cameraNode.scale = new Vec3(x, x, x);
            }
            else if (newPointsDis < this.pointsDis) {
                this.pointsDis = newPointsDis;
                let x = this.cameraNode.scale.x + 0.02;
                this.cameraNode.scale = new Vec3(x, x, x);
            }
            this.pointsDis = newPointsDis;
        }
    }

    public onMouseWheel(e) {

        if (this.isEnable == false) return;
        //this.isSelfRotate=false;

        const delta = -e.getScrollY() * this.moveSpeed * 0.1;
        let x = this.cameraNode.scale.x + delta * 0.01;
        this.cameraNode.scale = new Vec3(x, x, x);

        if (this.cameraNode.scale.x <= this.minScale) {
            this.cameraNode.scale = new Vec3(this.minScale, this.minScale, this.minScale);
        }
        if (this.cameraNode.scale.x >= this.maxScale) {
            this.cameraNode.scale = new Vec3(this.maxScale, this.maxScale, this.maxScale);
        }
    }

    public onTouchCancel(event: EventTouch) {
        if (this.isEnable == false) return;

        this.scheduleOnce(this.callBack, this.autoRotateTime);

        this.isLerp = true;

        this.delta = 0.005;
    }

    public onTouchEnd(event: EventTouch) {
        if (this.isEnable == false) return;

        this.scheduleOnce(this.callBack, this.autoRotateTime);

        this.isLerp = true;


        this.delta = 0.005;
    }

    _rotateRole(event: EventTouch) {
        const y = event.getDeltaX();
        const x = event.getDeltaY();

        this.xr = x;
        this.yr = y;

        var quat = new Quat();
        Quat.rotateAroundLocal(quat, quat, new Vec3(this.xr * this.speed, 0, 0), 0.005)
        this.cameraNode.rotate(quat);

        var quat1 = new Quat();
        Quat.rotateAroundLocal(quat1, quat1, new Vec3(0, this.yr * this.speed, 0), 0.005)
        this.modelTarget.rotate(quat1);

    }

    lateUpdate() {
        if (this.isEnable == false) return;

        var quat = new Quat();
        let x = clamp(this.xMaxAngle, this.xMinAngle, this.cameraNode.eulerAngles.x);
        this.cameraNode.setRotationFromEuler(x, 0, 0);

        if (this.cameraNode.scale.x <= this.minScale) {
            this.cameraNode.scale = new Vec3(this.minScale, this.minScale, this.minScale);
        }
        if (this.cameraNode.scale.x >= this.maxScale) {
            this.cameraNode.scale = new Vec3(this.maxScale, this.maxScale, this.maxScale);
        }

        //console.log("---this.cameraNode.scale--- " , this.cameraNode.scale)
        //console.log("---this.cameraNode.rotation--- " , this.cameraNode.eulerAngles)
        //console.log("---this.cameraNode.position--- " , this.cameraNode.position)
        //console.log("---this.modelTarget.rotation--- " , this.modelTarget.eulerAngles)
    }
    update() {
        if (this.isEnable == false) return;

        if (this.isLerp) {
            if (this.delta > 0.0001) {
                this.delta = this.delta * 0.95;

                var quat = new Quat();
                Quat.rotateAroundLocal(quat, quat, new Vec3(this.xr, 0, 0), this.delta)
                this.cameraNode.rotate(quat);

                var quat1 = new Quat();
                Quat.rotateAroundLocal(quat1, quat1, new Vec3(0, this.yr, 0), this.delta)
                this.modelTarget.rotate(quat1);
            }
        }

        if (this.isSelfRotate == true) {
            this.selfRotate();
        }
    }

    selfRotate() {
        this._rot = this.modelTarget.eulerAngles;
        this._rot.y += this.autoRotateSpeed;

        this.modelTarget.eulerAngles = this._rot;
        this._rot.set(this.modelTarget.eulerAngles);
    }

    onMouseUp() {
        if (this.isEnable == false) return;

        this.scheduleOnce(this.callBack, this.autoRotateTime);

    }

    callBack() {
        this.isSelfRotate = true;
    }

    public SetXAngle(max, min) {
        this.xMinAngle = min;
        this.xMaxAngle = max;
    }

    showPart(index) {
        if (index < 0 || index >= this.partShowList.length) return;
        let data = this.partShowList[index];
        if (this.cameraNodeTween) {
            this.cameraNodeTween.stop();
        }
        if (this.cameraTween) {
            this.cameraTween.stop();
        }
        if (this.modelTween) {
            this.modelTween.stop();
        }
        this.cameraTween = tween(this.cameraNode)
            .to(1, { position: new Vec3(data.cPos.x, data.cPos.y, data.cPos.z) })
            .start();

        this.cameraNodeTween = tween(this.cameraNode)
            .to(1, { eulerAngles: new Vec3(data.cNodeRot.x, data.cNodeRot.y, data.cNodeRot.z), scale: new Vec3(data.cNodeScale.x, data.cNodeScale.y, data.cNodeScale.z) }, {
                'onComplete': (target: object) => {

                }
            })
            .start();

        this.modelTween = tween(this.modelTarget)
            .to(1, { eulerAngles: new Vec3(data.mRot.x, data.mRot.y, data.mRot.z) })
            .start();
    }
}

