
import { _decorator, Component, Node, AudioSource, Enum } from 'cc';
import { StaticData } from './StaticData';
const { ccclass, property } = _decorator;

export const AudioType = Enum({
    Music: 0,
    Sound: 1
});

@ccclass('AudioSourceEx')
export class AudioSourceEx extends AudioSource {

    @property({ type: AudioType })
    typeOfAudio = AudioType.Music;

    private _orginVolume: number = 0;

    onLoad() {
        super.onLoad();
        this._orginVolume = this.volume;
    }

    onEnable() {
        super.onEnable();
        let b1 = this.typeOfAudio == AudioType.Music && StaticData.getInstace().MusicMute;
        let b2 = this.typeOfAudio == AudioType.Sound && StaticData.getInstace().SoundMute;
        this.setMute(b1 || b2);
    }

    setMute(mute: boolean) {
        this.volume = mute ? 0 : this._orginVolume;
    }


}
