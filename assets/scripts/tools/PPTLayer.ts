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
        EventManager.getInstance().on("LASTLAYER", this.nextLayer.bind(this));
        this.preLoad(this._curIndex);
    }

    start() {
        this.setToLayer(this._curIndex).then((nd: Node) => {
            this._curPage = nd;
        })
    }

    preLoad(index: number) {
        resources.load(`ppt/ppt${index}`);
        resources.load(`ppt/ppt${index + 1}`);
        resources.load(`ppt/ppt${index - 1}`);
        resources.release(`ppt/ppt${index + 2}`);
        resources.release(`ppt/ppt${index - 2}`);
    }

    setToLayer(index: number) {
        this.preLoad(index);
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
        this.scheduleOnce(() => {
            !!this.nextBtn && (this.nextBtn.node.active = true);
            !!this.lastBtn && (this.lastBtn.node.active = true);
            this._timeDetal = false;
        }, 1.2);

        this.playerAnim.play('pptReverse');
        let pageOld = this._curPage;
        this.setToLayer(this._curIndex - 1).then((nd: Node) => {
            let newPage = nd;
            newPage.active = true;
            let maskTransform = this.maskNode.getComponent(UITransform);
            newPage.setSiblingIndex(1);
            pageOld.setSiblingIndex(0);
            maskTransform.width = 0;
            newPage.parent = this.maskNode;
            newPage.worldPosition = v3(1624 / 2, 750 / 2);
            // newPage.eulerAngles = v3(0, 0, 12);
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
        this.scheduleOnce(() => {
            !!this.nextBtn && (this.nextBtn.node.active = true);
            !!this.lastBtn && (this.lastBtn.node.active = true);
            this._timeDetal = false;
        }, 1.2);

        this.playerAnim.play('ppt');
        let pageOld = this._curPage;
        this.setToLayer(this._curIndex + 1).then((nd: Node) => {
            let newPage = nd;
            newPage.active = true;
            this.layer.setSiblingIndex(0);
            this.maskNode.setSiblingIndex(1);
            let maskTransform = this.maskNode.getComponent(UITransform);
            maskTransform.width = 1800;
            pageOld.parent = this.maskNode;
            pageOld.worldPosition = v3(1624 / 2, 750 / 2);
            // pageOld.eulerAngles = v3(0, 0, 12);
            pageOld.setRotationFromEuler(v3(0, 0, 12));
            tween(maskTransform)
                .delay(0.16)
                .to(0.92, { width: 0 })
                .call(() => {
                    pageOld.removeFromParent();
                    newPage.parent = this.layer;
                    this._curPage = newPage;
                    this._curIndex++;
                })
                .start();
        })
    }

    onDisable() {
        EventManager.getInstance().remove("NEXTLAYER");
        EventManager.getInstance().remove("LASTLAYER");
    }
}
