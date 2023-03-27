import { Button, CCInteger, Component, instantiate, Prefab, resources, tween, _decorator, Node, view, Vec3, Quat, Tween, UITransform, UIOpacity } from "cc";
import { EventManager } from "./EventManager";
const { ccclass, property, menu } = _decorator;


/*
 * PPT命名：ppt + 0-9999 
 * resources/ppt
 */

@ccclass('PPTLayer')
@menu('Tools/PPTLayer')
export default class PPTLayer extends Component {

    @property(Node)
    layer: Node = null;

    @property({ type: Node })
    ClippingPlane = null;

    @property({ type: Node })
    BackPage = null;

    @property(Node)
    maskNode: Node = null;

    @property(Button)
    nextBtn: Button = null;

    @property(Button)
    lastBtn: Button = null;

    @property(CCInteger)
    pptCount: number = 1;

    private readonly tweenDuration: number = 1.0;
    private readonly angle = 45;

    private pageWidth: number
    private pageHeight: number

    private worldPos: Vec3 = new Vec3(0, 0, 0);
    private worldRot: Quat = new Quat(0, 0, 0, 0);

    isFlipping = false;

    private _curIndex: number = 0;
    private _curPage: Node = null;

    private newPage: Node = null;
    private oldPage: Node = null;
    private oldPos: Vec3;

    onLoad() {
        this.pageWidth = view.getDesignResolutionSize().width;
        this.pageHeight = view.getDesignResolutionSize().height;

        EventManager.getInstance().on("NEXTLAYER", this.nextLayer.bind(this));
        EventManager.getInstance().on("LASTLAYER", this.lastLayer.bind(this));
    }

    start() {
        this.ClippingPlane.getComponent(UITransform).width = 4920;
        this.ClippingPlane.getComponent(UITransform).height = 3240;

        this.BackPage.getComponent(UITransform).width = view.getDesignResolutionSize().width;
        this.BackPage.getComponent(UITransform).height = view.getDesignResolutionSize().height * 1.5;

        this.setToLayer(this._curIndex).then((nd: Node) => {
            resources.load(`ppt/ppt${this._curIndex + 1}`);
            this._curPage = nd;
        })
    }

    setToLayer(index: number) {
        return new Promise((resolve, reject) => {
            resources.load(`ppt/ppt${index}`, (err, asset: Prefab) => {
                if (err) {
                    reject();
                }
                let node = instantiate(asset);
                this.layer.addChild(node);
                node.active = true;
                resolve(node);
            })
        })
    }

    lastLayer() {
        if (this.isFlipping || this._curIndex - 1 < 0) {
            return;
        }

        !!this.nextBtn && (this.nextBtn.node.active = false);
        !!this.lastBtn && (this.lastBtn.node.active = false);

        this.oldPage = this._curPage;
        this.setToLayer(this._curIndex - 1).then((nd: Node) => {
            this.prePage();
            this.newPage = nd;
            this.newPage.active = true;
            this.oldPos = new Vec3(this.oldPage.worldPosition.clone().x - this.newPage.getComponent(UITransform).width, this.oldPage.worldPosition.clone().y, this.oldPage.worldPosition.clone().z);
            this.newPage.parent = this.maskNode;
            this.newPage.worldPosition = this.oldPos;
        })

    }

    nextLayer() {
        if (this.isFlipping || this._curIndex + 1 > this.pptCount - 1) {
            return;
        }

        !!this.nextBtn && (this.nextBtn.node.active = false);
        !!this.lastBtn && (this.lastBtn.node.active = false);

        this.oldPage = this._curPage;
        this.setToLayer(this._curIndex + 1).then((nd: Node) => {
            this.nextPage();
            this.newPage = nd;
            this.newPage.active = true;
            this.oldPos = this.oldPage.worldPosition.clone();
            this.oldPage.parent = this.maskNode;
            this.oldPage.worldPosition = this.oldPos;
        })
    }

    onDisable() {
        EventManager.getInstance().remove("NEXTLAYER");
        EventManager.getInstance().remove("LASTLAYER");
    }

    update(deltaTime: number) {
        if (this.isFlipping) {
            this.maskNode.worldPosition = Vec3.clone(this.worldPos);
            this.maskNode.worldRotation = Quat.clone(this.worldRot);
        }

    }

    nextPage() {
        Tween.stopAll();
        this.ClippingPlane.position = new Vec3(this.pageWidth * 0.5, -this.pageHeight * 0.5, 0);
        this.ClippingPlane.setRotationFromEuler(0, 0, -this.angle);
        this.BackPage.position = new Vec3(0, 0, 0);
        this.BackPage.setRotationFromEuler(0, 0, 0);
        this.BackPage.getComponent(UIOpacity).opacity = 255;

        this.maskNode.setRotationFromEuler(0, 0, this.angle);
        this.maskNode.position = new Vec3(-this.pageWidth * Math.cos(this.angle * (Math.PI / 180)), -this.pageWidth * Math.cos(this.angle * (Math.PI / 180)), 0);

        this.worldPos = Vec3.clone(this.maskNode.worldPosition);
        this.worldRot = Quat.clone(this.maskNode.worldRotation);
        this.isFlipping = true;
        // 缓动的时长
        tween(this.ClippingPlane)
            .to(this.tweenDuration, { position: new Vec3(-this.pageWidth * 0.5, -this.pageHeight * 0.5, 0), eulerAngles: new Quat(0, 0, 0) }, {
                easing: "linear",
                onUpdate: (target: Vec3, ratio: number) => {
                    this.maskNode.worldPosition = Vec3.clone(this.worldPos);
                    this.maskNode.worldRotation = Quat.clone(this.worldRot);
                }
            }).call(() => {
            })
            .start();

        tween(this.BackPage)
            .to(this.tweenDuration, { position: new Vec3(-this.pageWidth, 0, 0), eulerAngles: new Quat(0, 0, 0) }, { easing: "linear", })
            .call(() => {
                this.BackPage.getComponent(UIOpacity).opacity = 0;
                this.isFlipping = false;
                this.oldPage.removeFromParent();
                this.newPage.parent = this.layer;
                this._curPage = this.newPage;
                this._curIndex++;
                resources.load(`ppt/ppt${this._curIndex + 1}`);

                !!this.nextBtn && (this.nextBtn.node.active = true);
                !!this.lastBtn && (this.lastBtn.node.active = true);

                //---------向后翻页结束--------------

            }).start();

    }

    prePage() {
        this.ClippingPlane.position = new Vec3(-this.pageWidth * 0.5, -this.pageHeight * 0.5, 0);
        this.ClippingPlane.setRotationFromEuler(0, 0, 0);
        this.BackPage.position = new Vec3(-this.pageWidth, 0, 0);
        this.BackPage.setRotationFromEuler(0, 0, 0);
        this.maskNode.position = new Vec3(-this.pageWidth, 0, 0);
        this.maskNode.setRotationFromEuler(0, 0, 0);
        this.BackPage.getComponent(UIOpacity).opacity = 255;
        this.isFlipping = true;
        Tween.stopAll();
        tween(this.ClippingPlane)
            .to(this.tweenDuration, { position: new Vec3(this.pageWidth * 0.5, -this.pageHeight * 0.5, 0), eulerAngles: new Quat(0, 0, -this.angle, 0) }, {
                easing: "linear",
                onUpdate: (target: Vec3, ratio: number) => {
                    this.maskNode.worldPosition = Vec3.clone(this.worldPos);
                    this.maskNode.worldRotation = Quat.clone(this.worldRot);
                }
            })
            .start();

        tween(this.BackPage)
            .to(this.tweenDuration, { position: new Vec3(0, 0, 0), eulerAngles: new Quat(0, 0, 0, 0) }, { easing: "linear", })
            .call(() => {
                this.isFlipping = false;
                this.BackPage.getComponent(UIOpacity).opacity = 0;
                this.newPage.parent = this.layer;
                this.newPage.position = new Vec3(0, 0, 0);
                this.newPage.eulerAngles = Vec3.ZERO;
                this.oldPage.removeFromParent();
                this._curPage = this.newPage;
                this._curIndex--;

                !!this.nextBtn && (this.nextBtn.node.active = true);
                !!this.lastBtn && (this.lastBtn.node.active = true);

                //---------向前翻页结束--------------

            }).start();
    }
}
