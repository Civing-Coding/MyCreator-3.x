import { _decorator, Component, Node, v3 } from 'cc';
import { RecastJsPlugin } from './RecastJsPlugin';
const { ccclass, property } = _decorator;

@ccclass('RecastAgent')
export class RecastAgent extends Component {

    @property({ tooltip: '半径-运动物体的半径。世界单位。' })
    radius: number = 0.5;

    @property({ tooltip: '高度-以世界单位表示的高度。' })
    height: number = 1;

    @property({ tooltip: '最大加速度-以世界长度单位/（秒*秒）表示的最大加速度' })
    maxAcceleration: number = 20;

    @property({ tooltip: '最大速度-以世界单位长度/秒表示的最大速度。' })
    maxSpeed: number = 6;

    @property({ tooltip: '碰撞查询范围-以世界单位表示的半径，运动物体的碰撞检测系统将考虑这个半径范围内的物体。' })
    collisionQueryRange: number = 2.5;

    @property({ tooltip: '路径优化范围-路径将如何被优化，并变得更直' })
    pathOptimizationRange: number = 0;

    @property({ tooltip: '分离权重-表示这个系统将用多少努力去尝试保持这个运动物体的独立。如果设为0值，则将不努力保持这个运动物体与其他运动物体的分离并可能导致相撞.' })
    separationWeight: number = 0;


    public agentIndex: number = -1;
    public crowd = null;

    public initAgent(crowd: any) {
        this.crowd = crowd;
        let pos = RecastJsPlugin.recastPlugin.ccVec3_Vec3(this.node.worldPosition);
        let params = new RecastJsPlugin.recastPlugin.recast.dtCrowdAgentParams();
        params.radius = this.radius;
        params.height = this.height;
        params.maxAcceleration = this.maxAcceleration;
        params.maxSpeed = this.maxSpeed;
        params.collisionQueryRange = this.collisionQueryRange;
        params.pathOptimizationRange = this.pathOptimizationRange;
        params.separationWeight = this.separationWeight;
        this.agentIndex = crowd.addAgent(pos, params);
    }

    public updateAgent() {
        let v = this.crowd.getAgentPosition(this.agentIndex);
        this.node.worldPosition = v3(v.x, v.y, v.z);
    }
}


