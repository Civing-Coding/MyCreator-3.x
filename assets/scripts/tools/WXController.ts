import { _decorator, Button, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WXController')
export class WXController extends Component {

    @property(Button)
    BackNode: Button = null;

    private _tm = 0;

    public onLoad() {
        // if (/MicroMessenger/i.test(window.navigator.userAgent)) {
        //     this.BackNode.node.on(Button.EventType.CLICK, this.Back, this);
        // } else {
        //     this.BackNode.node.active = false;
        // }
        this.BackNode.node.on(Button.EventType.CLICK, this.Back, this);
    }

    public Back() {
        if (this._tm > 0) return;
        this._tm = 3;
        this.BackBtn(false);
    }

    public GameEnd() {
        if (this._tm > 0) return;
        this._tm = 3;
        this.BackBtn(true);
    }

    protected update(dt: number): void {
        if (this._tm > 0) {
            this._tm -= dt;
        }
    }

    private BackBtn(success: boolean) {
        let wx = (window as any).wx;
        // if (success) {
        //     console.log("游戏完成");
        //     // !!(<any>window).android && !!(<any>window).android.showResultView && !!(<any>window).android.showResultView();
        //     // (wx as any).miniProgram.navigateTo({
        //     //     url: `/pages/ar/ThirdRoad/success?game_id=${Utils.getQueryString('game_id')}&level_id=${Utils.getQueryString('level_id')}`,
        //     // });
        //     console.log("返回");
        //     (wx as any).miniProgram.navigateBack({
        //         delta: 2
        //     });
        // } else {
        // console.log("返回");
        // (wx as any).miniProgram.navigateBack({
        //     delta: 2
        // });
        // }

        console.log("返回");
        (wx as any).miniProgram.navigateBack({
            delta: 1
        });
    }
}


