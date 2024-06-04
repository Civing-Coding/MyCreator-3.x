//https://forum.cocos.org/t/topic/146839?u=1015130701

import { Enum, Color, UIRenderer, log } from "cc";
import { _decorator, Component } from "cc";
const { ccclass, property, executeInEditMode } = _decorator;

export enum GRID_TYPE {
    GRID_HORIZONTAL,
    GRID_VERTICAL
}

@ccclass("VertexGraident")
@executeInEditMode
export class VertexGraident extends Component {

    @property({ tooltip: "是否反向" })

    set invert(v) {
        if (this._bInvert != v) {
            this._bInvert = v;
            this.markColorDirty();
        }
    }

    get invert() {
        return this._bInvert;
    }

    @property
    _bInvert: boolean = false;

    @property({ type: Enum(GRID_TYPE) })
    set dir(v) {
        if (this._dir != v) {
            this._dir = v;
            this.markColorDirty();
        }
    }

    get dir() {
        return this._dir;
    }

    @property({ type: Enum(GRID_TYPE) })
    _dir: GRID_TYPE = GRID_TYPE.GRID_VERTICAL;

    @property(Color)
    set downColor(value) {
        if (!this._downColor.equals(value)) {
            this._downColor.set(value);
            this.markColorDirty();
        }
    }

    get downColor() {
        return this._downColor.clone();
    }

    @property(Color)
    private _downColor: Color = Color.WHITE.clone();

    @property(Color)
    set upColor(value) {
        if (!this._upColor.equals(value)) {
            this._upColor.set(value);
            this.markColorDirty();
        }
    }

    get upColor() {
        return this._upColor.clone();
    }

    @property(Color)
    private _upColor: Color = Color.WHITE.clone();

    onLoad() {
        let render = this.getComponent(UIRenderer);
        render["_updateColor"] = this.updateColor.bind(this);
        this.markColorDirty();
    }

    updateColor() {
        let cmp = this.getComponent(UIRenderer);
        this.node._uiProps.colorDirty = true;
        cmp["setEntityColorDirty"](true);
        cmp.setEntityColor(cmp["_color"]);
        cmp.setEntityOpacity(this.node._uiProps.localOpacity);
        if (cmp["_assembler"]) {
            //cmp._assembler.updateColor(this);
            this.doUpdateColor(cmp);
            // Need update rendFlag when opacity changes from 0 to !0 or 0 to !0
            cmp["_renderFlag"] = cmp["_canRender"]();
            cmp.setEntityEnabled(cmp["_renderFlag"]);
        }
    }

    markColorDirty() {
        let render = this.getComponent(UIRenderer);
        render["_updateColor"]();
    }

    doUpdateColor(cmp: UIRenderer) {
        let colors = [Color.RED, Color.RED, Color.GREEN, Color.GREEN];
        switch (this.dir) {
            case GRID_TYPE.GRID_VERTICAL:
                {
                    colors = [this.upColor, this.upColor, this.downColor, this.downColor];
                }
                break;

            case GRID_TYPE.GRID_HORIZONTAL:
                {
                    colors = [this.downColor, this.upColor, this.downColor, this.upColor];
                }
                break;
        }

        if (this.invert) {
            colors = colors.reverse();
        }

        const renderData = cmp.renderData;
        const vData = renderData.chunk.vb;
        const floatsPerVert = renderData.floatStride;
        let colorOffset = 5;

        for (let i = 0; i < 4; i++, colorOffset += floatsPerVert) {
            let color = colors[i];
            const colorR = color.r / 255;
            const colorG = color.g / 255;
            const colorB = color.b / 255;
            const colorA = color.a / 255;

            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    }
}