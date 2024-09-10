
import { _decorator, Component, EventHandler, Node, Mask, Vec2, v2, UITransform, EventTouch, Vec3, Camera, v3, Graphics, game, Game, color, Color, director, CCInteger, Sprite, UIOpacity } from 'cc';
import { EventManager } from './EventManager';
const { ccclass, property, menu } = _decorator;

@ccclass('ScratchTickets')
@menu('Tools/ScratchTickets')
export class ScratchTickets extends Component {
    @property(Mask)
    mask: Mask = null;

    @property({
        type: Camera, visible(this: any) { return false; },
    })
    uiCamera: Camera = null;

    @property({ tooltip: '画笔半径' })
    radius: number = 20;

    @property(EventHandler)
    callBack: EventHandler[] = [];

    @property(Node)
    checkPointPr: Node = null;

    private _pList: Vec2[] = [];
    private _checkList: boolean[] = [];
    private _lastPoint: Vec3 = null;
    private _graphics: Graphics = null;
    private _over: boolean = false;

    onLoad() {
        this.uiCamera = director.getScene().getChildByPath('Canvas/Camera').getComponent(Camera);
        this.mask.type = Mask.Type.GRAPHICS_STENCIL;
        this._graphics = this.mask.getComponent(Graphics);

        // this.mask.inverted = true;
        this._checkList.length = this.checkPointPr.children.length;
        if (this.checkPointPr) {
            for (let i in this.checkPointPr.children) {
                let p = this.checkPointPr.children[i].position;
                this._pList.push(v2(p.x, p.y));
            }
        }
        this.clear();

        //addListener
        this.node.on(Node.EventType.TOUCH_START, this.touch, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touch, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    start() {

    }

    clear() {
        this._checkList.fill(false);
        this._graphics.clear();
        this._graphics.fillColor = Color.TRANSPARENT;
        this._graphics.stroke();
        this._graphics.fill();
    }

    touch(event: EventTouch) {
        if (this._over) return;
        let p = event.getUILocation();
        this._graphics.lineWidth = this.radius * 2;
        this._graphics.lineCap = Graphics.LineCap.ROUND;
        this._graphics.lineJoin = Graphics.LineJoin.ROUND;
        let v3p = this.uiCamera.convertToUINode(v3(p.x, p.y, 0), this.node);
        let distance = !this._lastPoint ? 0 : Vec3.distance(this._lastPoint, v3p);
        if (distance > 1) {
            this._graphics.moveTo(this._lastPoint.x, this._lastPoint.y);
            this._graphics.lineTo(v3p.x, v3p.y);
            this._graphics.stroke();
            this._graphics.fill();
            let t = v3();
            for (let i = 0; i < distance; i++) {
                Vec3.lerp(t, v3p, this._lastPoint, i / (distance - 1));
                this.checkPoint(v2(t.x, t.y));
            }
        } else {
            this._graphics.roundRect(v3p.x - this.radius, v3p.y - this.radius, 2 * this.radius, 2 * this.radius, this.radius || 0);
            this._graphics.fill();
            this.checkPoint(v2(v3p.x, v3p.y));
        }
        this._lastPoint = v3p.clone();

    }

    touchEnd(event: EventTouch) {
        if (this._over) return;
        if (this.checkPoint(v2(-10000, -10000)) && !this._over) {
            //完成
            this.GameOver();
        }
        this.touch(event);
        this._lastPoint = null;
    }

    checkPoint(p: Vec2) {
        let count = 0;
        for (let i in this._pList) {
            let dis = Vec2.distance(p, this._pList[i]);
            this._checkList[i] = dis < this.radius + 5 ? true : this._checkList[i];
            this._checkList[i] && count++;
        }
        return count >= this._checkList.length * 0.96;
    }

    GameOver() {
        this._over = true;
        let nd = this._graphics.getComponent(UITransform);
        this._graphics.fillColor = Color.WHITE;
        this._graphics.fillRect(-nd.width / 2, -nd.height / 2, nd.width, nd.height);
        this._graphics.stroke();
        this._graphics.fill();
        console.log("Game Complete!");
        EventHandler.emitEvents(this.callBack);
        EventManager.getInstance().emit('Game_Complete');
    }

}

