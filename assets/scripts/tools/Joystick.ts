import { _decorator, Component, Node, Enum, UITransform, EventTouch, Vec3, v3, EventHandler } from "cc";
const { ccclass, property } = _decorator;

const JoystickType = Enum({
    FreeArea: 0,
    FixedArea: 1,
})

const JoystickDirection = Enum({
    FourDirections: 0,
    AllDirections: 1
});

@ccclass("Joystick")
export class Joystick extends Component {

    @property(Node)
    dot: Node = null;

    @property(Node)
    ring: Node = null;

    @property(Node)
    touchPanel: Node = null;

    @property({ type: JoystickType })
    joystickType = JoystickType.FixedArea;

    @property({ type: JoystickDirection })
    joystickDirection = JoystickDirection.AllDirections;

    @property
    moveSpeed: number = 10;

    @property(Node)
    target: Node = null;

    @property
    useEvent: boolean = false;

    @property({
        type: [EventHandler],
        visible(this: any) { return this.useEvent; },
    })
    onTouchStartEvent: EventHandler[] = [];

    @property({
        type: [EventHandler],
        visible(this: any) { return this.useEvent; },
    })
    onTouchEndEvent: EventHandler[] = [];


    private _joystickPos: Vec3 = null;
    private _panelUItransform: UITransform = null;
    private _radius: number = null;

    onLoad() {
        this.ring.parent = this.touchPanel;
        this._panelUItransform = this.touchPanel.getComponent(UITransform);
        this.dot.parent = this.ring;
        this.ring.active = false;
        this.dot.position = Vec3.ZERO;
        this._radius = this.ring.getComponent(UITransform).contentSize.x / 2;
        this.ring.active = this.joystickType == JoystickType.FixedArea;
    }

    onEnable() {
        this.touchPanel.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchPanel.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchPanel.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchPanel.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDisable() {
        this.touchPanel.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchPanel.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchPanel.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchPanel.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(e: EventTouch) {
        let uiPos = e.getUILocation();
        let uiTouchPos = this._panelUItransform.convertToNodeSpaceAR(v3(uiPos.x, uiPos.y, 0));
        if (this.joystickType == JoystickType.FreeArea) {
            this.ring.active = true;
            this.ring.position = uiTouchPos.clone();
            this.dot.position = Vec3.ZERO;
        }
        this._joystickPos = this.ring.position.clone();
        !!this.onTouchStartEvent && EventHandler.emitEvents(this.onTouchStartEvent);
    }

    onTouchMove(e: EventTouch) {
        let uiPos = e.getUILocation();
        let uiTouchPos = this._panelUItransform.convertToNodeSpaceAR(v3(uiPos.x, uiPos.y, 0));
        let distance = Vec3.distance(uiTouchPos, this._joystickPos);
        distance = distance > this._radius ? this._radius : distance;
        let pos = uiTouchPos.subtract(this._joystickPos).normalize().multiplyScalar(distance);
        this.dot.position = pos;
    }

    onTouchEnd(e: EventTouch) {
        if (this.joystickType == JoystickType.FreeArea) this.ring.active = false;
        this.dot.position = Vec3.ZERO;
        !!this.onTouchEndEvent && EventHandler.emitEvents(this.onTouchEndEvent);
    }

    update(dt: number) {
        if (this.dot.position.equals(Vec3.ZERO)) return;
        let moveVector: Vec3;
        if (this.joystickDirection == JoystickDirection.FourDirections) {
            moveVector = this.dot.position.clone().normalize();
            moveVector = Math.abs(moveVector.x) > Math.abs(moveVector.y) ? v3(moveVector.x, 0, 0) : v3(0, moveVector.y, 0);
            moveVector.multiplyScalar(this.moveSpeed);
        } else if (this.joystickDirection == JoystickDirection.AllDirections) {
            moveVector = this.dot.position.clone().normalize().multiplyScalar(this.moveSpeed);
        }
        this.target.position = this.target.position.clone().add(moveVector);
    }

}
