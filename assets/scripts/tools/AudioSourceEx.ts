
import { _decorator, AudioSource, Enum, EventHandler } from 'cc';
import { StaticData } from './StaticData';
const { ccclass, property, menu } = _decorator;

export const AudioType = Enum({
    Music: 0,
    Sound: 1
});

@ccclass('AudioSourceEx')
@menu('Tools/AudioSourceEx')
export class AudioSourceEx extends AudioSource {

    @property({ type: AudioType })
    typeOfAudio = AudioType.Music;

    @property({ type: EventHandler, visible(this: any) { return this.typeOfAudio == AudioType.Sound } })
    onStartedCallFunc: EventHandler[] = [];

    @property({ type: EventHandler, visible(this: any) { return this.typeOfAudio == AudioType.Sound } })
    onEndedCallFunc: EventHandler[] = [];

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

        this.node.on(AudioSource.EventType.STARTED, this.onAudioStarted, this);
        this.node.on(AudioSource.EventType.ENDED, this.onAudioEnded, this);
    }

    onDisable() {
        super.onDisable();
        this.node.off(AudioSource.EventType.STARTED, this.onAudioStarted, this);
        this.node.off(AudioSource.EventType.ENDED, this.onAudioEnded, this);
    }

    onAudioStarted() {
        EventHandler.emitEvents(this.onStartedCallFunc);
    }

    onAudioEnded() {
        EventHandler.emitEvents(this.onEndedCallFunc);
    }

    setMute(mute: boolean) {
        this.volume = mute ? 0 : this._orginVolume;
    }


}
