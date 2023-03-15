import { Button, CCInteger, Component, instantiate, Prefab, resources, tween, _decorator, Animation, Node, UITransform, v3, EventHandler, view, Vec3 } from "cc";
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

    @property(Animation)
    playerAnim: Animation = null;

    @property(Node)
    maskNode: Node = null;

    @property(Button)
    nextBtn: Button = null;

    @property(Button)
    lastBtn: Button = null;

    @property(CCInteger)
    pptCount: number = 1;

    private _timeDetal: boolean = false;
    private _curIndex: number = 0;
    private _curPage: Node = null;

    onLoad() {
        EventManager.getInstance().on("NEXTLAYER", this.nextLayer.bind(this));
        EventManager.getInstance().on("LASTLAYER", this.lastLayer.bind(this));
    }

    start() {
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
        if (this._timeDetal || this._curIndex - 1 < 0) {
            return;
        }

        !!this.nextBtn && (this.nextBtn.node.active = false);
        !!this.lastBtn && (this.lastBtn.node.active = false);

        this._timeDetal = true;

        let pageOld = this._curPage;
        this.setToLayer(this._curIndex - 1).then((nd: Node) => {

            this.scheduleOnce(() => {
                !!this.nextBtn && (this.nextBtn.node.active = true);
                !!this.lastBtn && (this.lastBtn.node.active = true);
                this._timeDetal = false;
            }, 1.2);

            this.playerAnim.play('pptReverse');

            let newPage = nd;
            newPage.active = true;
            let maskTransform = this.maskNode.getComponent(UITransform);
            newPage.setSiblingIndex(1);
            pageOld.setSiblingIndex(0);
            maskTransform.width = 0;
            let oldPos = pageOld.worldPosition.clone();
            newPage.parent = this.maskNode;
            newPage.worldPosition = oldPos;
            newPage.setRotationFromEuler(v3(0, 0, 12));

            tween(maskTransform)
                .to(0.95, { width: 1800 })
                .call(() => {
                    newPage.parent = this.layer;
                    newPage.position = v3(0, 0);
                    newPage.eulerAngles = Vec3.ZERO;
                    pageOld.removeFromParent();
                    this._curPage = newPage;
                    this._curIndex--;
                })
                .start();
        })

    }

    nextLayer() {
        if (this._timeDetal || this._curIndex + 1 > this.pptCount - 1) {
            return;
        }

        !!this.nextBtn && (this.nextBtn.node.active = false);
        !!this.lastBtn && (this.lastBtn.node.active = false);

        this._timeDetal = true;

        let pageOld = this._curPage;
        this.setToLayer(this._curIndex + 1).then((nd: Node) => {

            this.scheduleOnce(() => {
                !!this.nextBtn && (this.nextBtn.node.active = true);
                !!this.lastBtn && (this.lastBtn.node.active = true);
                this._timeDetal = false;
            }, 1.2);

            this.playerAnim.play('ppt');

            let newPage = nd;
            newPage.active = true;
            this.layer.setSiblingIndex(0);
            this.maskNode.setSiblingIndex(1);
            let maskTransform = this.maskNode.getComponent(UITransform);
            maskTransform.width = 1800;
            let oldPos = pageOld.worldPosition.clone();
            pageOld.parent = this.maskNode;
            pageOld.worldPosition = oldPos;
            pageOld.setRotationFromEuler(v3(0, 0, 12));
            tween(maskTransform)
                .delay(0.16)
                .to(0.92, { width: 0 })
                .call(() => {
                    pageOld.removeFromParent();
                    newPage.parent = this.layer;
                    this._curPage = newPage;
                    this._curIndex++;
                    resources.load(`ppt/ppt${this._curIndex + 1}`);
                })
                .start();
        })
    }

    onDisable() {
        EventManager.getInstance().remove("NEXTLAYER");
        EventManager.getInstance().remove("LASTLAYER");
    }
}
