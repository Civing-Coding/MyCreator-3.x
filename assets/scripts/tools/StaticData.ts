
import { director, _decorator } from 'cc';
import { AudioSourceEx, AudioType } from './AudioSourceEx';
const { ccclass } = _decorator;

@ccclass('StaticData')
export class StaticData {

    private static _instance: StaticData = null;

    public static getInstace() {
        if (this._instance == null)
            this._instance = new StaticData();
        return this._instance;
    }

    private _soundMute: boolean;

    public set SoundMute(v: boolean) {
        this._soundMute = v;
        let sourceList = director.getScene().getComponentsInChildren(AudioSourceEx);
        for (let i in sourceList) {
            sourceList[i].node.active && sourceList[i].typeOfAudio == AudioType.Sound && sourceList[i].setMute(v);
        }
    }

    public get SoundMute(): boolean {
        return this._soundMute;
    }

    private _musicMute: boolean;

    public set MusicMute(v: boolean) {
        this._musicMute = v;
        let sourceList = director.getScene().getComponentsInChildren(AudioSourceEx);
        for (let i in sourceList) {
            sourceList[i].node.active && sourceList[i].typeOfAudio == AudioType.Music && sourceList[i].setMute(v);
        }
    }

    public get MusicMute(): boolean {
        return this._musicMute;
    }



}

