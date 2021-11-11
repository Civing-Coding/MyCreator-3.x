
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('VideoTouch')
export class VideoTouch extends Component {


    start() {
        let container = document.querySelector('#Cocos3dGameContainer') as HTMLDivElement;
        let div = document.createElement('div');
        div.className = 'videoTouch';
        div.style.position = 'absolute';
        div.style.bottom = '0px';
        div.style.left = '0px';
        div.style.width = container.style.width;
        div.style.height = container.style.height;
        div.style.pointerEvents = 'auto';
        container.appendChild(div);
        div.style['z-index'] = '99999';
        div.addEventListener('click', (e) => {
            document.querySelector('video')!.play();
            div.remove();
        })
    }
}

