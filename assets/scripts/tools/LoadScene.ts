import { _decorator, Component, Node, director, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadScene')
export class LoadScene extends Component {

    private _once: boolean = false;

    loadScene(e, v) {
        if (v != "" && !this._once) {
            log(`切换场景:${v}`);
            director.loadScene(v);
            this._once = true;
        }
    }

    preLoadScene(e, v) {
        if (v == "") {
            return;
        }
        director.preloadScene(v);
    }
}

