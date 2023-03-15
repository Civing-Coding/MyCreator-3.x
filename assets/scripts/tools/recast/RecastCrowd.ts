import { _decorator, Component, Node } from 'cc';
import { RecastAgent } from './RecastAgent';
import { RecastJsPlugin } from './RecastJsPlugin';
const { ccclass, property } = _decorator;

@ccclass('RecastCrowd')
export class RecastCrowd extends Component {

    @property({ tooltip: '最多agent个数' })
    maxAgents: number = 5;

    @property({ tooltip: '最大角度' })
    maxAgentRadius: number = 3;

    public crowd = null;

    start() {
        this.getRecastInstance().then(() => {
            this.crowd = new RecastJsPlugin.recastPlugin.recast.Crowd(this.maxAgents, this.maxAgentRadius, RecastJsPlugin.recastPlugin.navMesh.getNavMesh());
            let agents = this.getComponentsInChildren(RecastAgent);
            agents.map(ag => { ag.initAgent(this.crowd); });
        });
    }

    update(deltaTime: number) {
        if (!!this.crowd) {
            this.crowd.update(deltaTime);
            let agents = this.getComponentsInChildren(RecastAgent);
            agents.map(ag => { ag.updateAgent(); });
        }
    }

    getRecastInstance() {
        return new Promise((resolve, reject) => {
            let vid = setInterval(() => {
                if (!!RecastJsPlugin.recastPlugin?.navMesh) {
                    clearInterval(vid);
                    resolve(null);
                }
            }, 100);
        })
    }

}


