
import { _decorator, Component, EventHandler, Node, Mask, Vec2, v2, UITransform, EventTouch, Vec3, Camera, v3, Graphics, game, Game } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('ScratchTickets')
@menu('Tools/ScratchTickets')
export class ScratchTickets extends Component {
    @property(Mask)
    mask: Mask = null;

    @property(Camera)
    uiCamera: Camera = null;

    @property({ tooltip: '画笔半径' })
    radius: number = 20;

    @property(EventHandler)
    callBack: EventHandler[] = [];

    private _pList: Vec2[] = [];
    private _checkList: boolean[] = [];
    private _uiTransform: UITransform = null;
    private _lastPoint: Vec3 = null;

    onLoad() {
        this._uiTransform = this.node.getComponent(UITransform);
        this.mask.type = Mask.Type.GRAPHICS_STENCIL;
        this.mask.inverted = true;

        //addCheckPoint
        let pos = this.node.position;
        let width = this._uiTransform.width / 3;
        let height = this._uiTransform.height / 3;
        //top
        this._pList.push(v2(pos.x - width, pos.y + height));
        this._pList.push(v2(pos.x, pos.y + height));
        this._pList.push(v2(pos.x + width, pos.y + height));
        //center
        this._pList.push(v2(pos.x - width, pos.y));
        this._pList.push(v2(pos.x, pos.y));
        this._pList.push(v2(pos.x + width, pos.y));
        //bottom
        this._pList.push(v2(pos.x - width, pos.y - height));
        this._pList.push(v2(pos.x, pos.y - height));
        this._pList.push(v2(pos.x + width, pos.y - height));
        //addCheckList
        this._checkList.length = 9;
        this._checkList.fill(false);

        //addListener
        this.node.on(Node.EventType.TOUCH_START, this.touch, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touch, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);


    }

    clear() {
        this._checkList.fill(false);
        this.mask.getComponent(Graphics).clear();
    }

    touch(event: EventTouch) {
        let p = event.getUILocation();
        let graphics: Graphics = this.mask.getComponent(Graphics);
        graphics.lineWidth = this.radius * 2;
        graphics.lineCap = Graphics.LineCap.ROUND;
        graphics.lineJoin = Graphics.LineJoin.ROUND;
        let v3p = this.uiCamera.convertToUINode(v3(p.x, p.y, 0), this.node);
        let distance = !this._lastPoint ? 0 : Vec3.distance(this._lastPoint, v3p);
        if (distance > 1) {
            graphics.moveTo(this._lastPoint.x, this._lastPoint.y);
            graphics.lineTo(v3p.x, v3p.y);
            graphics.stroke();
            graphics.fill();
        } else {
            graphics.roundRect(v3p.x - this.radius, v3p.y - this.radius, 2 * this.radius, 2 * this.radius, this.radius || 0);
            graphics.fill();
        }
        this._lastPoint = v3p.clone();
        if (this.checkPoint(v2(v3p.x, v3p.y))) {
            //完成
            EventHandler.emitEvents(this.callBack);
        }
    }

    touchEnd(event: EventTouch) {
        this.touch(event);
        this._lastPoint = null;
    }

    checkPoint(p: Vec2) {
        let count = 0;
        for (let i in this._pList) {
            let dis = Vec2.distance(p, this._pList[i]);
            this._checkList[i] = dis < this.radius ? true : this._checkList[i];
            this._checkList[i] && count++;
        }
        return count == this._checkList.length;
    }

}

