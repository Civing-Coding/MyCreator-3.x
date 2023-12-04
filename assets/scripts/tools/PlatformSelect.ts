import { _decorator, Component, Enum, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

export const PlatformEnum = Enum({
    UNKNOWN: 0,
    EDITOR_PAGE: 1,
    EDITOR_CORE: 2,
    MOBILE_BROWSER: 3,
    DESKTOP_BROWSER: 4,
    WIN32: 5,
    ANDROID: 6,
    IOS: 7,
    MACOS: 8,
    OHOS: 9,
    OPENHARMONY: 10,
    WECHAT_GAME: 11,
    WECHAT_MINI_PROGRAM: 12,
    BAIDU_MINI_GAME: 13,
    XIAOMI_QUICK_GAME: 14,
    ALIPAY_MINI_GAME: 15,
    TAOBAO_CREATIVE_APP: 16,
    TAOBAO_MINI_GAME: 17,
    BYTEDANCE_MINI_GAME: 18,
    OPPO_MINI_GAME: 19,
    VIVO_MINI_GAME: 20,
    HUAWEI_QUICK_GAME: 21,
    COCOSPLAY: 22,
    LINKSURE_MINI_GAME: 23,
    QTT_MINI_GAME: 24
})

@ccclass('PlatformSelect')
export class PlatformSelect extends Component {

    @property({
        type: PlatformEnum,
        group: { id: '0', name: 'Platform' },
    })
    platform: number = PlatformEnum.DESKTOP_BROWSER;

    @property(Node)
    showNodes: Node[] = [];

    @property(Node)
    hideNodes: Node[] = [];

    start() {
        this.showNodes.forEach(element => {
            element.active = sys.platform == sys.Platform[PlatformEnum[this.platform]];
        });
        this.hideNodes.forEach(element => {
            element.active = sys.platform != sys.Platform[PlatformEnum[this.platform]];
        });
    }

}


