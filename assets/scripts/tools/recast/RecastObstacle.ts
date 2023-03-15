import { _decorator, Component, Node, Vec3, Enum } from 'cc';
import { RecastJsPlugin } from './RecastJsPlugin';
const { ccclass, property } = _decorator;

const OBSTACLE_TYPE = Enum({
    CylinderObstacle: 1,
    BoxObstacle: 2
});

@ccclass('RecastObstacle')
export class RecastObstacle extends Component {

    @property({ type: OBSTACLE_TYPE })
    obType: number = OBSTACLE_TYPE.BoxObstacle;

    @property({ visible(this: any) { return this.obType == OBSTACLE_TYPE.BoxObstacle; } })
    angle: number = 0;

    @property({ visible(this: any) { return this.obType == OBSTACLE_TYPE.CylinderObstacle; } })
    radius: number = 0;

    @property({ visible(this: any) { return this.obType == OBSTACLE_TYPE.CylinderObstacle; } })
    height: number = 0;


    public obstacle = null;

    start() {
        this.getRecastInstance().then(() => {
            let pos = this.node.getWorldPosition();
            let extent = this.node.worldScale;
            if (this.obType == OBSTACLE_TYPE.CylinderObstacle) {
                this.addCylinderObstacle(pos, this.radius, this.height);
            } else {
                this.addBoxObstacle(pos, extent, this.angle);
            }
        });
    }

    addCylinderObstacle(position: Vec3, radius: number, height: number) {
        let pos = RecastJsPlugin.recastPlugin.ccVec3_Vec3(position);
        let ob = RecastJsPlugin.recastPlugin.navMesh.addCylinderObstacle(pos, radius, height);
        return ob;
    }

    addBoxObstacle(position: Vec3, extent: Vec3, angle: number) {
        let pos1 = RecastJsPlugin.recastPlugin.ccVec3_Vec3(position);
        let pos2 = RecastJsPlugin.recastPlugin.ccVec3_Vec3(extent);
        let ob = RecastJsPlugin.recastPlugin.navMesh.addBoxObstacle(pos1, pos2, angle);
        return ob;
    }

    removeObstacle(ob: any) {
        RecastJsPlugin.recastPlugin.navMesh.removeObstacle(ob);
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


