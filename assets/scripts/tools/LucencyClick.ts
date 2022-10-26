
import { _decorator, Component, Node, EventTouch, v3, UITransform, Sprite, EventHandler } from 'cc';
import { Utils } from './Utils';
const { ccclass, property, menu } = _decorator;


@ccclass('LucencyClick')
@menu('Tools/LucencyClick')
export class LucencyClick extends Component {

    @property({ type: [EventHandler] })
    clickEvent = [];

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
    }

    touchStart(event: EventTouch) {
        let location = event.getUILocation();
        let transform = this.node.getComponent(UITransform);
        let touch = transform.convertToNodeSpaceAR(v3(location.x, location.y, 0));
        let pos = Utils.changeNodeARPos(touch.x, touch.y, 0.5, 0.5, 0, 1, transform.contentSize.width, transform.contentSize.height);
        let texture = this.node.getComponent(Sprite).spriteFrame.texture;
        let img = new Image();
        img.src = (<any>texture).image.nativeUrl;
        img.onload = () => {
            let c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            let ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
            let imagedata = ctx.getImageData(Math.floor(pos[0]), -Math.floor(pos[1]), 1, 1);
            if (imagedata.data[3] > 0) {
                this.node.emit('click');
                EventHandler.emitEvents(this.clickEvent);
            }
        }
    }
}
