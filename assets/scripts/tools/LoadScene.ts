import { _decorator, Component, Node, director, log } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('LoadScene')
@menu('Tools/LoadScene')
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

