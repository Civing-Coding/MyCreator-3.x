
import { _decorator, Component, Node, Rect, UITransform, EventTouch, Vec2, instantiate, v3, v2, Vec3, EventHandler, CCInteger, AudioClip } from 'cc';
import { AudioSourceEx } from './AudioSourceEx';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;


@ccclass('LineControl')
export class LineControl extends Component {

    @property(Node)
    touchPanel: Node = null;

    @property(Node)
    linePr: Node = null;

    @property(Node)
    linePb: Node = null;

    @property(CCInteger)
    count: number = 0;

    @property(AudioClip)
    trueAc: AudioClip = null;

    @property(AudioClip)
    falseAc: AudioClip = null;

    @property([EventHandler])
    endFunc: EventHandler[] = [];

    private _curLine: Node = null;
    private _beginPos: Node = null;
    private _part: Node[] = [];
    private _partRects: Rect[] = [];
    private _objs = {};
    private _index = 0;
    private _audioSource: AudioSourceEx = null;

    init() {
        this._audioSource = this.node.getComponent(AudioSourceEx);
        this._objs = {};
        this._curLine = null;
        this._beginPos = null;
        this._part = this.touchPanel.children;
        this.linePr.removeAllChildren();
        for (let i in this._part) {
            let tmp = this._part[i];
            let n = parseInt(tmp.name);
            this._objs[n] = 0;
            let transform = tmp.getComponent(UITransform);
            this._partRects[i] = new Rect(tmp.position.x - transform.width / 2, tmp.position.y - transform.height / 2, transform.width, transform.height);
        }
    }

    onEnable() {
        this.init();
        this.touchPanel.on(Node.EventType.TOUCH_START, this.touchStart, this)
        this.touchPanel.on(Node.EventType.TOUCH_MOVE, this.touchMove, this)
        this.touchPanel.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this)
        this.touchPanel.on(Node.EventType.TOUCH_END, this.touchEnd, this)
    }

    onDisable() {
        this.touchPanel.off(Node.EventType.TOUCH_START, this.touchStart, this)
        this.touchPanel.off(Node.EventType.TOUCH_MOVE, this.touchMove, this)
        this.touchPanel.off(Node.EventType.TOUCH_CANCEL, this.touchEnd, this)
        this.touchPanel.off(Node.EventType.TOUCH_END, this.touchEnd, this)
    }

    touchStart(e: EventTouch) {
        this._beginPos = null;
        let location = e.getUILocation();
        let pos = this.touchPanel.getComponent(UITransform).convertToNodeSpaceAR(v3(location.x, location.y, 0));
        let tmp = this.checkRect(pos);
        if (tmp != -1) {
            let n = parseInt(this._part[tmp].name);
            let c1 = this._objs[n] > 1;
            let c2 = this._objs[n] == 1;
            let c3 = Math.floor(n / 10) == 1 || Math.floor(n / 10) == 3;
            if (c1 || c2 && c3) {
                return;
            }
            this._beginPos = this._part[tmp];
            this._curLine = this.cLine(v2(this._part[tmp].position.x, this._part[tmp].position.y));
        }
    }

    touchMove(e: EventTouch) {
        if (this._curLine) {
            let location = e.getUILocation();
            let pos = this.touchPanel.getComponent(UITransform).convertToNodeSpaceAR(v3(location.x, location.y, 0));
            let dis = Utils.getDistance(v2(this._beginPos.position.x, this._beginPos.position.y), v2(pos.x, pos.y));
            let angle = Utils.getAngle(v2(this._beginPos.position.x, this._beginPos.position.y), v2(pos.x, pos.y));
            angle = pos.x - this._beginPos.position.x > 0 ? angle : angle - 180;
            console.log(angle);
            this._curLine.angle = angle;
            this._curLine.getComponent(UITransform).width = dis;
        }
    }

    touchEnd(e: EventTouch) {
        if (this._curLine) {
            let location = e.getUILocation();
            let pos = this.touchPanel.getComponent(UITransform).convertToNodeSpaceAR(v3(location.x, location.y, 0));
            let tmp = this.checkRect(pos);
            if (tmp != -1) {
                let n1 = parseInt(this._beginPos.name);
                let n2 = parseInt(this._part[tmp].name);
                let check1 = n1 % 10 == n2 % 10;
                let check2 = Math.abs(n1 - n2) == 10;
                if (check1 && check2) {
                    this._objs[n1]++;
                    this._objs[n2]++;
                    this._index++;

                    let dis = Utils.getDistance(v2(this._beginPos.position.x, this._beginPos.position.y), v2(this._part[tmp].position.x, this._part[tmp].position.y));
                    let angle = Utils.getAngle(v2(this._beginPos.position.x, this._beginPos.position.y), v2(this._part[tmp].position.x, this._part[tmp].position.y));
                    angle = pos.x - this._beginPos.position.x > 0 ? angle : angle - 180;
                    console.log(angle);
                    this._curLine.angle = angle;
                    this._curLine.getComponent(UITransform).width = dis;
                    !!this.trueAc && this._audioSource.playOneShot(this.trueAc);
                    this._index == this.count && this.scheduleOnce(EventHandler.emitEvents.bind(this, this.endFunc), 1);
                } else {
                    !!this.falseAc && this._audioSource.playOneShot(this.falseAc);
                    this._curLine.removeFromParent();
                }
            } else {
                !!this.falseAc && this._audioSource.playOneShot(this.falseAc);
                this._curLine.removeFromParent();
            }
            this._curLine = null;
            this._beginPos = null;
        }
    }

    cLine(startPos: Vec2) {
        let tmp = instantiate(this.linePb);
        tmp.active = true;
        tmp.parent = this.linePr;
        tmp.position = v3(startPos.x, startPos.y, 0)
        return tmp;
    }

    checkRect(pos: Vec3) {
        for (let i in this._partRects) {
            if (this._partRects[i].contains(v2(pos.x, pos.y)))
                return i;
        }
        return -1;
    }


}

