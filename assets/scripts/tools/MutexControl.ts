
import { _decorator, Component, Node, EventHandler, error, UIOpacity, tween, Vec3, v3 } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('MutexControl')
export class MutexControl extends Component {

    @property({ type: Node, tooltip: '互斥节点列表' })
    objList: Node[] = [];

    @property({ type: EventHandler, tooltip: '当选择改变时触发' })
    onChangeEvent: EventHandler[] = [];

    @property
    defaultShow: boolean = true;

    private _curIndex: string = null;

    onLoad() {
        this.closeAll();
    }

    start() {
        this.defaultShow && this.next();
    }

    closeAll() {
        this._curIndex = null;
        this.objList.map(x => x!.active = false)
    }

    closeCurItem() {
        if (!!this.objList[this._curIndex]) {
            this.objList[this._curIndex].active = false;
            this._curIndex = null;
        }
    }

    selectItem(e: Event, index: string) {
        if (!!this.objList[index]) {
            this.closeCurItem();
            this._curIndex = index;
            this.objList[index].active = true;
            EventHandler.emitEvents(this.onChangeEvent, index);
        }
    }

    selectItemTween(e: Event, index: string) {
        let obj = this.objList[index];
        if (!!obj) {
            this.closeCurItem();
            this._curIndex = index;
            EventHandler.emitEvents(this.onChangeEvent, index);
            let opacity = obj.getComponent(UIOpacity) || obj.addComponent(UIOpacity);
            obj.active = true;
            tween(obj)
                .set({ scale: v3(0.8, 0.8, 0.8) })
                .to(0.2, { scale: v3(1, 1, 1) })
                .start()

            tween(opacity)
                .set({ opacity: 0 })
                .to(0.2, { opacity: 255 })
                .start();
        }
    }

    next() {
        let id = this._curIndex;
        this.closeAll();
        id = id || '-1';
        id = Number(id) >= this.objList.length - 1 ? '-1' : id;
        id = String(Number(id) + 1);
        this.selectItemTween(null, id);
    }
}

