
/**
 * 引用自 https://note.youdao.com/ynoteshare/index.html?id=6e341c297dec36391775de676ceaaa04&type=note&_time=1639551552655 
 * 作者：柒汐夜
 * 只能UI相机 3d部分就完蛋了
 */

// 这种引入方式方便兼容2.X
import * as cc from "cc";

/**
 * 矩形
 */
interface IRect {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

/**
 * 节点基础信息
 */
interface INodeInfo {
    width?: number;
    height?: number;
    anchorX?: number;
    anchorY?: number;
    scaleX?: number;
    scaleY?: number;
    scaleZ?: number;
}


/**
 * 截图工具
 * @author liwenin
 */
export default class CaptureUtils {
    /**
     * 全局摄像机
     */
    private static _camera: cc.Camera;

    /**
     * 画布
     */
    private static _canvas: HTMLCanvasElement;

    /**
     * 临时变量
     */
    private static _tmpMat4: cc.Mat4 = cc.mat4();

    /**
     * 临时变量
     */
    private static _tmpVec3: cc.Vec3 = cc.v3();

    /**
     * 临时变量
     */
    private static _tmpInfo: INodeInfo = {};

    /**
     * 屏幕捕捉，核心功能——摄像机的锚点在中心点，设置捕捉区域的属性需要注意
     * @param area 捕捉区域，同时也是摄像机的父节点，以及渲染节点
     * @param rect 需要捕捉的内部区域
     */
    private static _capture(area: cc.Scene | cc.Node, rect: IRect): cc.RenderTexture {
        var camera = CaptureUtils.getCamera(), cNode = camera.node, texture = camera.targetTexture = new cc.RenderTexture;
        texture.reset({ width: rect.width, height: rect.height });
        cNode.setPosition(rect.x, rect.y);
        area.addChild(cNode);
        camera.orthoHeight = rect.height / 2;
        camera.targetTexture = texture;
        // 执行渲染，单个渲染会报错，那就直接全部渲染一次吧（单个渲染：cc.director.root.pipeline.render([camera.camera]);）
        cc.director.root.frameMove(0);
        camera.targetTexture = null;
        cNode.parent = null;
        return texture;
    }

    /**
     * 获取节点信息
     * @param node 
     */
    private static _getNodeInfo(node: cc.Node | cc.Scene): INodeInfo {
        var tmpInfo = CaptureUtils._tmpInfo, scale = node.getWorldMatrix(CaptureUtils._tmpMat4).getScale(CaptureUtils._tmpVec3);
        tmpInfo.scaleX = scale.x;
        tmpInfo.scaleY = scale.y;
        tmpInfo.scaleZ = scale.z;

        if (node == cc.director.getScene()) {
            let view = cc.view['_visibleRect'] as cc.Rect;// 可以用cc.view.getVisibleSize()，不过每次调用都会新建一个Size
            tmpInfo.anchorX = tmpInfo.anchorY = 0;
            tmpInfo.width = view.width;
            tmpInfo.height = view.height;
        }

        else {
            let ui = node.getComponent(cc.UITransform);
            if (ui) {
                tmpInfo.anchorX = ui.anchorX;
                tmpInfo.anchorY = ui.anchorY;
                tmpInfo.width = ui.width;
                tmpInfo.height = ui.height;
            }
            else {
                tmpInfo.anchorX = tmpInfo.anchorY = 0.5;
                tmpInfo.width = tmpInfo.height = 1;
            }
        }
        return tmpInfo;
    }

    /**
     * 获取摄像机
     */
    protected static getCamera(): cc.Camera {
        var camera = CaptureUtils._camera;
        if (!camera) {
            let node = new cc.Node('CaptureUtils');
            camera = CaptureUtils._camera = node.addComponent(cc.Camera);
            // 采取自动适配尺寸，非全屏
            camera.projection = cc.Camera.ProjectionType.ORTHO;
            camera.near = 0;/* 默认1，必须改为0否则黑屏 */
            camera.visibility = 41943040;/* 显示2D和3D，显示不同分组需要调整，cc.Layers.Enum.UI_2D | cc.Layers.Enum.UI_3D */
        }
        return camera;
    }

    /**
     * 获取画布——不支持document形式创建，则替换成对应平台提供的方式来创建即可
     */
    protected static getCanvas(): HTMLCanvasElement {
        return CaptureUtils._canvas || (CaptureUtils._canvas = document.createElement('canvas'));
    }


    /**
     * 捕捉节点的内部区域
     * @param area 需要捕捉的节点，默认当前场景下的Canvas；用Canvas的原因是它有宽高，而场景没有，这样rect也可不传
     * @param rect 需要捕捉的内部区域，坐标默认捕捉区域的中心点，宽高默认节点的宽高；注意若节点本身宽高为0，会导致捕捉异常，因此必须手动传入rect的宽高；
     */
    public static capture(area?: cc.Scene | cc.Node, rect?: IRect): cc.SpriteFrame {
        var void0 = void 0, spf = new cc.SpriteFrame, info: INodeInfo;
        area === void0 && (area = cc.find('Canvas') || cc.director.getScene());
        rect === void0 && (rect = {});
        // 获取节点信息
        info = CaptureUtils._getNodeInfo(area);
        if (rect.width === void0) {
            rect.width = info.width * info.scaleX;
        }

        if (rect.height === void0) {
            rect.height = info.height * info.scaleY;
        }

        if (rect.x === void0) {
            rect.x = (.5 - info.anchorX) * info.width;
        }

        if (rect.y === void0) {
            rect.y = (.5 - info.anchorY) * info.height;
        }
        spf.texture = CaptureUtils._capture(area, rect);
        // 此处做了翻转，也可根据官方给的示例将像素点数据进行翻转（调用toImgurl来转换）
        spf.flipUVY = true;
        return spf;
    }

    /**
     * 读取渲染纹理像素信息
     * @param texture 
     */
    public static readPixels(texture: cc.RenderTexture): Uint8Array {
        var { width, height } = texture, arrayBuffer = new ArrayBuffer(width * height * 4), region = new cc.gfx.BufferTextureCopy, texExtent = region.texExtent;
        // region.texOffset.x = region.texOffset.y = 0;
        texExtent.width = width;
        texExtent.height = height;
        (cc.director.root.device as any).copyFramebufferToBuffer(texture.window.framebuffer, arrayBuffer, [region]);
        return new Uint8Array(arrayBuffer);
    }

    /**
     * 渲染纹理转图片路径，根据环境区分；
     * @param texture 渲染纹理
     * @description
     * 1、部分小游戏平台不支持toTempFilePathSync异步版，若需要也可则切换成Promise版本；
     * 2、返回的url可通过“cc.assetManager.loadRemote<cc.ImageAsset>(url, { ext: '.png' }, (_, img) => { let texture = new cc.Texture2D;texture.image = img;”来生成纹理，也可通过"var img = new Image; img.src = url; img.onload = function () { let texture = new cc.Texture2D; texture.reset({ width: img.width, height: img.height }); texture.uploadData(img); };"来生成纹理（web）；
     */
    public static toImgUrl(texture: cc.RenderTexture): string {

        var data = CaptureUtils.readPixels(texture), width = texture.width, height = texture.height, url: string;
        if (cc.sys.isNative) {
            let filePath = jsb.fileUtils.getWritablePath() + 'tmpImg.png';/* 临时文件名 */
            window['fsUtils'].writeFile(filePath, data);
            url = filePath;
        }

        else {
            // 通用模式，只要确保能创建一个2d canvas即可
            let canvas = CaptureUtils.getCanvas(), ctx = canvas.getContext('2d'), toTempFilePathSync = canvas['toTempFilePathSync'],
                rowBytes = width * 4, row = 0;
            // 调整画布成当前纹理大小
            canvas.width = width;
            canvas.height = height;
            // 写入canvas
            while (row < height) {
                let srow = height - 1 - row, imageData = ctx.createImageData(width, 1), start = srow * width * 4;
                for (let i = 0; i < rowBytes; i++) {
                    imageData.data[i] = data[start + i];
                }
                ctx.putImageData(imageData, 0, row++);
            }

            if (typeof toTempFilePathSync === 'function') {
                // 异步版本
                // return new Promise(function (resolve) { toTempFilePathSync.call(canvas, { success(res) { ctx.clearRect(0, 0, width, height),resolve(res.tempFilePath) } }) });
                // 默认参数就是canvas自身大小、类型png，可以都不填写，一个空{}都可以，quality：图片质量，0~1，fileType='jpg'时有效
                url = toTempFilePathSync.call(canvas, { /* x: 0, y: 0, width: width, height: height, destWidth: width, destHeight: height, fileType: 'png', quality: 1 */ });
            }
            else {
                url = canvas.toDataURL('image/png');
            }
            // 用完立即清空数据
            ctx.clearRect(0, 0, width, height);
        }
        // 异步版本
        // return Promise.resolve(url);
        return url;
    }

}

