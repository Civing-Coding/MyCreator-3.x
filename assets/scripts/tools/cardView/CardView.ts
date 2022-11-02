import { _decorator, Component, Node, math, Vec2, geometry, EventTouch, Camera, PhysicsSystem, Button, Vec3, Enum } from 'cc';
import { CardViewItem } from './CardViewItem';
const { ccclass, property } = _decorator;

const ControlType = Enum({
    Drag: 0,
    Ray: 1
});

@ccclass('CardView')
export class CardView extends Component {

    @property({ type: ControlType, displayName: "操作方式" })
    ctrlType: number = ControlType.Drag;

    @property({ type: Camera, displayName: "UI相机", visible() { return this.ctrlType == ControlType.Ray } })
    camera: Camera = null;

    @property({ displayName: "每个卡片宽度" })
    cellWidth: number = 100;

    @property({ displayName: "卡片高度", tooltip: "0" })
    yFixedPositionValue: number = 0;

    @property({ displayName: "切换动画时长", tooltip: "0.2" })
    lerpDuration: number = 0.2;

    @property({ type: Button, displayName: "上一页按钮" })
    lastBtn: Button = null;

    @property({ type: Button, displayName: "下一页按钮" })
    nextBtn: Button = null;


    private listEnhanceItems: CardViewItem[] = [];
    private listSortedItems: CardViewItem[] = [];
    private curCenterItem: CardViewItem = null;
    private preCenterItem: CardViewItem = null;
    private startCenterIndex: number = 0;
    private mCenterIndex: number = 0;
    private dFactor: number = 0;
    private totalHorizontalWidth: number = 0;
    private curHorizontalValue: number = 0;
    private originHorizontalValue: number = 0;
    private mCurrentDuration: number = 0;
    private canChangeItem: boolean = true;
    private enableLerpTween: boolean = true;
    private dragStart = false;
    private lastPosition = Vec2.ZERO;
    private cachedPosition = Vec2.ZERO;
    private useRay = false;

    start() {
        this.listEnhanceItems = []
        let count = this.node.children.length;
        for (let i = 0; i < count; i++) {
            let item = this.node.children[i].getComponent(CardViewItem);
            this.listEnhanceItems.push(item);
        }

        this.startCenterIndex = Math.floor(count / 2);
        this.canChangeItem = true;
        this.dFactor = Math.round(10000 / count) * 0.0001;
        this.mCenterIndex = count % 2 == 0 ? count / 2 - 1 : count / 2;

        let index = 0;
        for (let i = count - 1; i >= 0; i--) {
            let item = this.listEnhanceItems[i];
            item.CurveOffSetIndex = i;
            item.CenterOffSet = this.dFactor * (this.mCenterIndex - index);
            item.SetSelectState(false);
            index++;
        }

        if (this.startCenterIndex < 0 || this.startCenterIndex >= count) {
            this.startCenterIndex = this.mCenterIndex;
        }

        this.listSortedItems = [...this.listEnhanceItems];
        this.totalHorizontalWidth = this.cellWidth * count;
        this.curCenterItem = this.listEnhanceItems[this.startCenterIndex];
        this.curHorizontalValue = 0.5 - this.curCenterItem.CenterOffSet;
        this.LerpTweenToTarget(0, this.curHorizontalValue, false);

        // 触摸监听
        if (this.ctrlType == ControlType.Ray) {
            this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        } else {
            this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }

        this.lastBtn?.node.on("click", this.revolve2Right, this);
        this.nextBtn?.node.on("click", this.revolve2Left, this);

    }

    update(deltaTime: number) {
        this.enableLerpTween && this.TweenViewToTarget(deltaTime);
    }

    TweenViewToTarget(deltaTime: number) {
        this.mCurrentDuration += deltaTime;
        if (this.mCurrentDuration > this.lerpDuration) {
            this.mCurrentDuration = this.lerpDuration;
        }
        let percent = this.mCurrentDuration / this.lerpDuration;
        let value = math.lerp(this.originHorizontalValue, this.curHorizontalValue, percent);
        this.UpdateEnhanceScrollView(value);
        if (this.mCurrentDuration >= this.lerpDuration) {
            this.canChangeItem = true;
            this.enableLerpTween = false;
            this.OnTweenOver();
        }
    }

    LerpTweenToTarget(originValue: number, targetValue: number, needTween: boolean = false) {
        if (!needTween) {
            this.SortEnhanceItem();
            this.originHorizontalValue = targetValue;
            this.UpdateEnhanceScrollView(targetValue);
            this.OnTweenOver();
        }
        else {
            this.originHorizontalValue = originValue;
            this.curHorizontalValue = targetValue;
            this.mCurrentDuration = 0.0;
        }
        this.enableLerpTween = needTween;
    }

    UpdateEnhanceScrollView(fValue: number) {
        for (let i = 0; i < this.listEnhanceItems.length; i++) {
            let itemScript = this.listEnhanceItems[i];
            let xValue = this.GetXPosValue(fValue + itemScript.CenterOffSet);

            let scaleValue = this.GetScaleValue(fValue, itemScript.CenterOffSet);
            let depthCurveValue = this.GetDepthCurve(fValue + itemScript.CenterOffSet);

            itemScript.UpdateScrollViewItems(xValue, depthCurveValue, this.listEnhanceItems.length, this.yFixedPositionValue, scaleValue);
        }
    }

    OnTweenOver() {
        this.preCenterItem?.SetSelectState(false);
        this.curCenterItem?.SetSelectState(true);
    }

    GetDepthCurve(value: number) {
        let y: number;
        let tempX = Math.abs(value) % 1.0;
        if (tempX >= 0 && tempX <= 0.5) {
            y = 2 * tempX;
        } else {
            y = 2 * (1 - tempX);
        }
        return y;

    }
    GetPositionCurve(value: number) {
        let n = value >= 0 ? Math.abs(value) % 1 : 1 + Math.abs(value) % 1;
        let v = -1 / 2 * (Math.cos(Math.PI * n / 1) - 1);
        return v
    }

    GetXPosValue(value: number) {
        let evaluateValue = this.GetPositionCurve(value) * this.totalHorizontalWidth - this.totalHorizontalWidth / 2;
        return evaluateValue;
    }

    GetScaleCurve(value: number) {
        let y;
        let tempX = Math.abs(value) % 1.0;
        if (tempX >= 0 && tempX <= 0.5) {
            y = 1.252 * tempX + 0.374;
        } else {
            y = 1.252 * (1 - tempX) + 0.374;
        }
        return y;
    }

    GetScaleValue(sliderValue: number, added: number) {
        let scaleValue = this.GetScaleCurve(sliderValue + added);
        return scaleValue;
    }

    SortEnhanceItem() {
        this.listSortedItems.sort((a: CardViewItem, b: CardViewItem) => {
            if (a.node.position.x > b.node.position.x) {
                return 1;
            } else if (a.node.position.x == b.node.position.x) {
                return 0;
            }
            return -1;
        });

        for (let i = this.listSortedItems.length - 1; i >= 0; i--) {
            this.listSortedItems[i].RealIndex = i;
        }
    }

    onTouchStart(e: EventTouch) {
        let ray = new geometry.Ray();
        this.camera.screenPointToRay(e.getLocationX(), e.getLocationY(), ray);
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const collider = raycastClosestResult.collider;
            !!collider && this.SetHorizontalTargetItemIndex(collider.getComponent(CardViewItem));
        }
    }

    onTouchEnd() {
        this.dragStart = false;
        this.OnDragEnhanceViewEnd();
    }

    onTouchMove(e: EventTouch) {
        this.cachedPosition = e.getUILocation();
        let d = Vec2.distance(this.cachedPosition, this.lastPosition);
        if (!this.dragStart && Math.abs(d) != 0)
            this.dragStart = true;

        this.dragStart && this.OnDragEnhanceViewMove(e.getUIDelta())
        this.lastPosition = this.cachedPosition;
    }

    GetMoveCurveFactorCount(preCenterItem: CardViewItem, newCenterItem: CardViewItem) {
        this.SortEnhanceItem();
        let factorCount = Math.abs(newCenterItem.RealIndex) - Math.abs(preCenterItem.RealIndex);
        return Math.abs(factorCount);
    }

    SetHorizontalTargetItemIndex(selectItem: CardViewItem) {
        if (!this.canChangeItem || this.curCenterItem == selectItem)
            return;

        this.canChangeItem = false;
        this.preCenterItem = this.curCenterItem;
        this.curCenterItem = selectItem;

        // calculate the direction of moving
        let centerXValue = this.GetPositionCurve(0.5) * this.totalHorizontalWidth - this.totalHorizontalWidth / 2;
        let isRight = selectItem.node.position.x > centerXValue;
        // calculate the offset * dFactor
        let moveIndexCount = this.GetMoveCurveFactorCount(this.preCenterItem, selectItem);
        let dvalue = (isRight ? -1 : 1) * this.dFactor * moveIndexCount;
        let originValue = this.curHorizontalValue;
        this.LerpTweenToTarget(originValue, this.curHorizontalValue + dvalue, true);
    }

    revolve2Right() {
        if (!this.canChangeItem)
            return;
        let targetIndex = this.curCenterItem.CurveOffSetIndex + 1;
        targetIndex = targetIndex > this.listEnhanceItems.length - 1 ? 0 : targetIndex;
        this.SetHorizontalTargetItemIndex(this.listEnhanceItems[targetIndex]);
    }

    revolve2Left() {
        if (!this.canChangeItem)
            return;
        let targetIndex = this.curCenterItem.CurveOffSetIndex - 1;
        targetIndex = targetIndex < 0 ? this.listEnhanceItems.length - 1 : targetIndex;
        this.SetHorizontalTargetItemIndex(this.listEnhanceItems[targetIndex]);
    }

    OnDragEnhanceViewMove(delta: Vec2) {
        if (Math.abs(delta.x) > 0.2) {
            this.curHorizontalValue = 1 + this.curHorizontalValue % 1;
            this.curHorizontalValue += delta.x * 0.001;
            this.LerpTweenToTarget(0.0, this.curHorizontalValue, false);
        }
    }

    OnDragEnhanceViewEnd() {
        // find closed item to be centered
        let closestIndex = 0;
        let value = (this.curHorizontalValue - Math.floor(this.curHorizontalValue));
        let min = Number.MAX_VALUE;
        let tmp = 0.5 * (this.curHorizontalValue < 0 ? -1 : 1);
        for (let i = 0; i < this.listEnhanceItems.length; i++) {
            let dis = Math.abs(Math.abs(value) - Math.abs((tmp - this.listEnhanceItems[i].CenterOffSet)));
            if (dis < min) {
                closestIndex = i;
                min = dis;
            }
        }
        this.originHorizontalValue = this.curHorizontalValue;
        let target = (Math.floor(this.curHorizontalValue) + (tmp - this.listEnhanceItems[closestIndex].CenterOffSet));
        this.preCenterItem = this.curCenterItem;
        this.curCenterItem = this.listEnhanceItems[closestIndex];
        this.LerpTweenToTarget(this.originHorizontalValue, target, true);
        this.canChangeItem = false;
    }
}

