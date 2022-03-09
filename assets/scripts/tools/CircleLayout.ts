
import { _decorator, Component, Node, v3, UIOpacity, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CircleLayout')
export class CircleLayout extends Component {

    @property({ tooltip: '轴a' })
    a: number = 100;

    @property({ tooltip: '轴b' })
    b: number = 500;

    @property({ tooltip: '透明度变化' })
    useOpacity: boolean = false;

    @property({ tooltip: '大小变化' })
    useScaler: boolean = false;

    @property({ tooltip: '自动旋转,只可以展示' })
    autoLoop: boolean = false;

    @property({
        tooltip: '自动旋转速度',
        visible(this: any) {
            return this.autoLoop;
        }
    })
    autoSpeed: number = 0.2;

    @property({ tooltip: '开启触摸操作' })
    allowTouch: boolean = false;

    private _list: Node[] = [];
    private _count: number = 0;
    private _angle: number = 0;
    private _target: number = 0;
    private _curIndex: number = 0;   //当前序列
    private _recorderPosX: number = 0;

    onLoad() {
        this._list = [...this.node.children];
        this._count = this._list.length;

        if (this.allowTouch) {
            this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
            this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        }
    }

    start() {
        this.autoLoop ? this.setAutoLoop() : this.setToCircle();
    }

    touchStart(event: EventTouch) {
        let touches = event.getTouches();
        let tmp = touches[0].getUILocation();
        this._recorderPosX = tmp.x;
    }

    touchEnd(event: EventTouch) {
        let touches = event.getTouches();
        let tmp = touches[0].getUILocation();
        if (tmp.x - this._recorderPosX > 100) {
            this.next();
        } else if (this._recorderPosX - tmp.x > 100) {
            this.last();
        }
    }

    private setAutoLoop() {
        let n = 0;
        this.schedule(() => {
            n = n + this.autoSpeed >= 360 ? n + this.autoSpeed - 360 : n + this.autoSpeed;
            this.setToCircle(n);
        });
    }

    private setToCircle(addN: number = 0) {
        let angle = 360 / this._count;
        let yList = [];
        this._curIndex = Math.round(addN / angle);
        for (let i in this._list) {
            this._list[i].position = this.getOvalPosition(angle * Number(i) + addN);
            yList[i] = { index: i, value: this._list[i].position.y };
        }

        yList.sort((a, b) => b.value - a.value)
        for (let i in yList) {
            let card = this._list[yList[i].index];
            card.setSiblingIndex(Number(i));
            let rate = 1 - (yList[i].value + this.b) / (this.b * 2);
            if (this.useOpacity) {
                let Op = card.getComponent(UIOpacity) || card.addComponent(UIOpacity);
                Op.opacity = rate * 100 + 155;
            }
            if (this.useScaler) {
                card.scale = v3(1, 1, 1).multiplyScalar(rate * 0.5 + 0.8);
            }
            // card.active = card.position.y <= 0;  //显示半页
        }
    }

    private getOvalPosition(angle: number) {
        angle = angle >= 360 ? angle - 360 : angle;
        angle = angle < 0 ? angle + 360 : angle;
        let pos = v3(0, 0, 0);
        let rad = Math.PI / 180 * angle;
        pos.x = this.a * Math.sin(rad);
        pos.y = - this.b * Math.cos(rad);
        return pos;
    }

    public last() {
        if (this._angle == this._target) {
            this._target = this._angle - 360 / this._count;
        } else {
            this._target = this._target - 360 / this._count;
        }
        this.cirleMove(false);
    }

    public next() {
        if (this._angle == this._target) {
            this._target = this._angle + 360 / this._count;
        } else {
            this._target = this._target + 360 / this._count;
        }
        this.cirleMove(true);
    }

    private cirleMove(next: boolean) {
        this.unscheduleAllCallbacks();
        this.schedule(() => {
            if (next) {
                this._angle += 2;
                this._angle = this._angle >= this._target ? this._target : this._angle;
            } else {
                this._angle -= 2;
                this._angle = this._angle <= this._target ? this._target : this._angle;
            }
            this.setToCircle(this._angle);
            if (this._angle == this._target) {
                this.unscheduleAllCallbacks();
            }
        }, 0.01);
    }

}

