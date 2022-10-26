
import { _decorator, Component, Node, UITransform, Sprite, SpriteFrame, Texture2D, ImageAsset, EventTouch, v3, Vec3, Enum, RenderTexture, Color, color } from 'cc';
import DrawingBoard from './DrawingBoard';
const { ccclass, property, menu } = _decorator;

@ccclass('Painter')
@menu('Tools/Painter')
export class Painter extends Component {

    @property
    defaultColor: Color = color(255, 255, 255, 255);

    @property
    defaultWidth: number = 30;

    private _drawBd: DrawingBoard = null;
    private _tex: Texture2D = null;
    private _history = null;

    public initDrawBoard() {
        let transform = this.getComponent(UITransform);
        this._drawBd = new DrawingBoard(transform.width, transform.width);

        let imageAsset = new ImageAsset();
        imageAsset.reset({
            width: transform.width,
            height: transform.height,
            close: null
        });

        let sprite = this.getComponent(Sprite);
        let spriteFrame = new SpriteFrame();
        this._tex = new Texture2D();
        spriteFrame.texture = this._tex;
        spriteFrame.flipUVY = true;
        sprite.spriteFrame = spriteFrame;
        this._tex.reset({
            width: transform.width,
            height: transform.height,
            format: Texture2D.PixelFormat.RGBA8888
        });
        this._tex.image = imageAsset;

        this.setColor(this.defaultColor.r, this.defaultColor.g, this.defaultColor.b, this.defaultColor.a);
        this.setLineWidth(this.defaultWidth);
    }

    public setColor(r: number, g: number, b: number, a: number) {
        !!this._drawBd && this._drawBd.setColor(r, g, b, a);
    }

    public setLineWidth(width: number) {
        !!this._drawBd && this._drawBd.setLineWidth(width);
    }

    public clear() {
        this._drawBd.clear();
        this._tex.uploadData(this._drawBd.getData());
    }

    public lastStep() {
        if(!!this._history){
            this._drawBd.setData(this._history);
            this._tex.uploadData(this._drawBd.getData());
            this._history = null;
        }
    }

    protected start() {
        this.initDrawBoard();
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
    }

    protected touchStart(e: EventTouch) {
        this._history = this._drawBd.copyData();
        let location = e.getUILocation();
        let transform = this.node.getComponent(UITransform);
        let pos = transform.convertToNodeSpaceAR(v3(location.x, location.y, 0));
        !!this._drawBd && this._drawBd.moveTo(this.getDrawPos(pos).x, this.getDrawPos(pos).y);
    }

    protected touchMove(e: EventTouch) {
        let location = e.getUILocation();
        let transform = this.node.getComponent(UITransform);
        let pos = transform.convertToNodeSpaceAR(v3(location.x, location.y, 0));
        !!this._drawBd && this._drawBd.lineTo(this.getDrawPos(pos).x, this.getDrawPos(pos).y);
        this._tex.uploadData(this._drawBd.getData());
    }

    protected getDrawPos(pos: Vec3) {
        let transform = this.node.getComponent(UITransform);
        return {
            x: pos.x + transform.width * transform.anchorX,
            y: pos.y + transform.height * transform.anchorY
        }
    }

}


