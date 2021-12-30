
import { _decorator, Component, Node, v3, v2, UITransform } from 'cc';
const { ccclass, property } = _decorator;

/* 
    因为EventHander的事件中找不到Node的相关操作 ，因此补充这个类 
    使用 1，0 代替true false
*/

@ccclass('NodeEx')
export class NodeEx extends Component {

    //active: 1  0
    setActive(_event: TouchEvent, active: string) {
        this.node.active = active == '1';
    }

    //scale:3,3,1
    setScale(_event: TouchEvent, scale: string) {
        this.node.setScale(this.getArgsV3(scale));
    }

    //elur:30
    setElur(_event: TouchEvent, elur: string) {
        this.node.setRotationFromEuler(0, 0, Number(elur));
    }

    //anchor: 0.5,0.5
    setAnctor(_event: TouchEvent, anchor: string) {
        this.node.getComponent(UITransform).setAnchorPoint(this.getArgsV2(anchor));
    }

    //size： 100,100
    setContentSize(_event: TouchEvent, size: string) {
        this.node.getComponent(UITransform).setContentSize(this.getArgsV2(size).x, this.getArgsV2(size).y);
    }

    protected getArgsV3(str: string) {
        let list = str.split(',');
        return v3(Number(list[0]), Number(list[1]), Number(list[2]));
    }

    protected getArgsV2(str: string) {
        let list = str.split(',');
        return v2(Number(list[0]), Number(list[1]));
    }
}

