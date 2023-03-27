import { _decorator, Component, Texture2D, RenderTexture, assetManager, ImageAsset, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WebVideoPlayer')
export class WebVideoPlayer extends Component {

    @property
    videoUrl = '';

    @property
    videoWidth = 1920;

    @property
    videoHeight = 1080;

    @property
    muted = false;

    @property
    autoplay = false;

    @property
    loop = false;

    @property(Sprite)
    uiSprite: Sprite = null;

    private _video_element: HTMLVideoElement;
    private _canvas_element: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _img = new ImageAsset();
    private _spriteFrame = null;

    onEnable() {
        this._video_element = document.createElement('video') as HTMLVideoElement;
        this._video_element.src = this.videoUrl;
        this._video_element.muted = this.muted;
        this._video_element.loop = this.loop;
        this._video_element.autoplay = this.autoplay;
        this._video_element.oncanplay = this.onCanPlay.bind(this);
        this._video_element.oncanplaythrough = this.onCanPlay.bind(this);

        this._canvas_element = document.createElement('canvas') as HTMLCanvasElement;
        this._canvas_element.width = this.videoWidth;
        this._canvas_element.height = this.videoHeight;
        this._ctx = this._canvas_element.getContext('2d');
    }

    onCanPlay(e: Event) {
        const video = e.target as HTMLVideoElement;
        if (video.readyState == 1 || video.readyState == 4) {
            this._video_element.ontimeupdate = () => {
                this._ctx.drawImage(this._video_element, 0, 0, this.videoWidth, this.videoHeight);
                let b64 = this._canvas_element.toDataURL("image/jpeg", 1);
                // this._canvas_element.toBlob((blob) => {
                let img = new Image();
                img.src = b64
                // img.src = window.URL.createObjectURL(blob);
                img.onload = () => {
                    b64 = null;
                    // blob = null;
                    this._img.reset(img);
                    img = null;
                    this.uiSprite.spriteFrame = SpriteFrame.createWithImage(this._img);
                };
                // }, 'image/jpeg', 1);
            };
        }
    }

    play() {
        this._video_element?.play();
    }

    pause() {
        this._video_element?.pause();
    }

    playRewind() {
        if (this._video_element) {
            this._video_element.currentTime = 0;
            this._video_element?.play();
        }
    }

    onDisable() {
        this._ctx = null;
        delete (this._video_element);
        delete (this._canvas_element);
    }

}


