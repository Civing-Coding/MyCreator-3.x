import { _decorator, Component, Node, MeshRenderer, Vec3, v3, Line, Color, utils, gfx, Material, Camera, EventTouch, PhysicsSystem, PhysicsRayResult, geometry } from 'cc';
const { ccclass, property } = _decorator;

const Recast = (window as any).Recast;
export interface IObstacle { }

@ccclass('RecastControl')
export class RecastControl extends Component {

    @property(Node)
    public env: Node = null;

    @property(Node)
    body: Node = null;

    @property(Node)
    obPr: Node = null;

    @property(Node)
    debugLine: Node = null;

    @property(Node)
    debugMesh: Node = null;

    @property(Camera)
    mainCamera: Camera = null;

    @property(Node)
    canvasNode: Node = null;

    @property
    setParams: boolean = false;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '网格列表中的网格将被转化为“体素”，好用来计算可到达的导航网格。这个以世界单位表示的参数，定义了1个体素的宽度。' })
    cs: number = 0.2;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '与cs一样，但定义的是1个体素的高度。' })
    ch: number = 0.2;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '可行走斜坡的最大坡度，以角度单位表示。' })
    walkableSlopeAngle: number = 35;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '运动物体可以到达的最大高度，以体素的个数表示。' })
    walkableHeight: number = 1;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '运动物体可以跨越的最大高度差，以体素的个数表示。' })
    walkableClimb: number = 1;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '运动物体的半径，以体素的个数表示。' })
    walkableRadius: number = 1;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '导航网格的边缘的每条边的最大长度。以体素尺寸为单位。' })
    maxEdgeLen: number = 12;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '导航网格是实际场景的简化，导航网格边缘到原始场景轮廓的最大偏离。' })
    maxSimplificationError: number = 1.3;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '可以组成孤立岛屿的最少单元格，意思是过于小的区域将被忽略。' })
    minRegionArea: number = 8;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '范围小于这个值的区域将在可能的情况下和更大的区域合并在一起，意思是过小的区域将与较大的区域融合，这个值一般比mergeRegionArea 更大。' })
    mergeRegionArea: number = 20;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '每个多边形的最大顶点数量-在轮廓转变为多边形的过程中，对于每个多边形允许生成的最大顶点数量。必须大于3。' })
    maxVertsPerPoly: number = 6;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '细节采样距离-设置生成细节网格时的采样距离。使用世界长度单位。' })
    detailSampleDist: number = 6;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '细节采样最大误差-细节网格的表面与高度场数据之间的最大偏离。使用世界长度单位。' })
    detailSampleMaxError: number = 1;
    @property({ visible(this: any) { return this.setParams; } })
    borderSize: number = 0;
    @property({ visible(this: any) { return this.setParams; }, tooltip: '注意添加的“tileSize”参数。这是以世界单位表示的每个地块的尺寸。如果不提供这个参数或者把它设为0，则导航网格将回退回基础模式，并且障碍物不会生效。另外，取决于你的使用场景，这个值必须被仔细选择，在更多的地块和更高的cpu更新密度间取舍' })
    tileSize: number = 0;

    @property
    setAgentParams: boolean = false;
    @property({ visible(this: any) { return this.setAgentParams; }, tooltip: '半径-运动物体的半径。世界单位。' })
    radius: number = 0.5;
    @property({ visible(this: any) { return this.setAgentParams; }, tooltip: '高度-以世界单位表示的高度。' })
    height: number = 1;
    @property({ visible(this: any) { return this.setAgentParams; }, tooltip: '最大加速度-以世界长度单位/（秒*秒）表示的最大加速度' })
    maxAcceleration: number = 20;
    @property({ visible(this: any) { return this.setAgentParams; }, tooltip: '最大速度-以世界单位长度/秒表示的最大速度。' })
    maxSpeed: number = 6;
    @property({ visible(this: any) { return this.setAgentParams; }, tooltip: '碰撞查询范围-以世界单位表示的半径，运动物体的碰撞检测系统将考虑这个半径范围内的物体。' })
    collisionQueryRange: number = 2.5;
    @property({ visible(this: any) { return this.setAgentParams; }, tooltip: '路径优化范围-路径将如何被优化，并变得更直' })
    pathOptimizationRange: number = 0;
    @property({ visible(this: any) { return this.setAgentParams; }, tooltip: '分离权重-表示这个系统将用多少努力去尝试保持这个运动物体的独立。如果设为0值，则将不努力保持这个运动物体与其他运动物体的分离并可能导致相撞.' })
    separationWeight: number = 1;

    public recast = null;
    public config = null;
    public navMesh = null;
    public crowd = null;
    public agentIndex = null;

    start() {
        this.initRecast();
        this.canvasNode.on(Node.EventType.TOUCH_START, this.onClick, this);
    }

    setRcConfig() {
        let rc = new this.recast.rcConfig();
        rc.cs = this.cs;
        rc.ch = this.ch;
        rc.borderSize = this.borderSize;
        rc.tileSize = this.tileSize;
        rc.walkableSlopeAngle = this.walkableSlopeAngle;
        rc.walkableHeight = this.walkableHeight;
        rc.walkableClimb = this.walkableClimb;
        rc.walkableRadius = this.walkableRadius;
        rc.maxEdgeLen = this.maxEdgeLen;
        rc.maxSimplificationError = this.maxSimplificationError;
        rc.minRegionArea = this.minRegionArea;
        rc.mergeRegionArea = this.mergeRegionArea;
        rc.maxVertsPerPoly = this.maxVertsPerPoly;
        rc.detailSampleDist = this.detailSampleDist;
        rc.detailSampleMaxError = this.detailSampleMaxError;
        this.config = rc;
    }

    setNavMesh() {
        let meshRenders = this.env.getComponentsInChildren(MeshRenderer);
        this.navMesh = new this.recast.NavMesh();

        const indices = [];
        const positions = [];
        let offset = 0;

        for (let i in meshRenders) {
            const mr = meshRenders[i];
            const mr_sms = mr.model.subModels;
            for (let j in mr_sms) {
                const mr_gInfo = mr_sms[j].subMesh.geometricInfo;
                const worldMatrix = meshRenders[i].node.getWorldMatrix();
                for (let is in mr_gInfo.indices) {
                    indices.push(mr_gInfo.indices[is] + offset);
                }

                for (let pt = 0; pt < mr_gInfo.positions.length; pt += 3) {
                    let position = v3(0, 0, 0), transformed = v3(0, 0, 0);
                    Vec3.fromArray(position, mr_gInfo.positions, pt);
                    Vec3.transformMat4(transformed, position, worldMatrix);
                    positions.push(transformed.x, transformed.y, transformed.z);
                }
                offset += mr_gInfo.positions.length / 3;
            }
        }
        this.navMesh.build(positions, offset, indices, indices.length, this.config);
    }

    createAgent() {
        this.crowd = new this.recast.Crowd(5, 3, this.navMesh.getNavMesh());
        let agentparams = new this.recast.dtCrowdAgentParams();

        agentparams.radius = this.radius;
        agentparams.height = this.height;
        agentparams.maxAcceleration = this.maxAcceleration;
        agentparams.maxSpeed = this.maxSpeed;
        agentparams.collisionQueryRange = this.collisionQueryRange;
        agentparams.pathOptimizationRange = this.pathOptimizationRange;
        agentparams.separationWeight = this.separationWeight;
        let pos = this.ccVec3_Vec3(this.body.worldPosition);
        let agentIndex = this.crowd.addAgent(pos, agentparams);
        return agentIndex;
    }

    async initRecast() {
        this.recast = await new Recast();
        this.setRcConfig();
        this.setNavMesh();
        this.addObList();

        this.agentIndex = this.createAgent();
    }


    update(deltaTime: number) {
        if (!!this.crowd) {
            this.navMesh.update();
            this.crowd.update(deltaTime);
            let v = this.crowd.getAgentPosition(this.agentIndex);
            this.body.worldPosition = v3(v.x, v.y, v.z);
            this.createDebugNavMesh();
        }
    }

    degbugTour(pos: Vec3) {
        const pos1 = this.ccVec3_Vec3(this.body.worldPosition);
        const pos2 = this.ccVec3_Vec3(pos);
        const navPath = this.navMesh.computePath(pos1, pos2);
        const pointCount = navPath.getPointCount();
        const positions = [];
        for (let pt = 0; pt < pointCount; pt++) {
            const p = this.Vec3_ccVec3(navPath.getPoint(pt));
            positions.push(p);
        }


        let linePath = this.debugLine.getComponent(Line) || this.debugLine.addComponent(Line);
        linePath.width.constant = 0.2;
        linePath.color.color = Color.GREEN;
        linePath.worldSpace = true;
        linePath.positions = <never[]>positions;
    }

    addObList() {
        for (let i in this.obPr.children) {
            let nd = this.obPr.children[i];
            this.addBoxObstacle(nd.getWorldPosition(), nd.scale, nd.eulerAngles.y);
        }
    }

    addCylinderObstacle(position: Vec3, radius: number, height: number): IObstacle {
        let pos = this.ccVec3_Vec3(position);
        let ob = this.navMesh.addCylinderObstacle(pos, radius, height);
        return ob;
    }

    addBoxObstacle(position: Vec3, extent: Vec3, angle: number): IObstacle {
        let pos1 = this.ccVec3_Vec3(position);
        let pos2 = this.ccVec3_Vec3(extent);
        let ob = this.navMesh.addBoxObstacle(pos1, pos2, angle);
        return ob;
    }

    removeObstacle(obstacle: IObstacle): void {
        this.navMesh.removeObstacle(obstacle);
    }

    ccVec3_Vec3(v: Vec3) {
        return new this.recast.Vec3(v.x, v.y, v.z);
    }

    Vec3_ccVec3(v: any) {
        return v3(v.x, v.y, v.z);
    }

    createDebugNavMesh() {
        const debugNavMesh = this.navMesh.getDebugNavMesh();
        const triangleCount = debugNavMesh.getTriangleCount();

        const indices = [];
        const positions = [];
        for (let tri = 0; tri < triangleCount * 3; tri++) {
            indices.push(tri);
        }
        for (let tri = 0; tri < triangleCount; tri++) {
            for (let pt = 0; pt < 3; pt++) {
                const point = debugNavMesh.getTriangle(tri).getPoint(pt);
                positions.push(point.x, point.y, point.z);
            }
        }
        let mesh = utils.createMesh({ positions: positions, indices: indices, doubleSided: false, primitiveMode: gfx.PrimitiveMode.LINE_STRIP });
        let mr = this.debugMesh.getComponent(MeshRenderer);
        mr.mesh = mesh;
    }

    onClick(e: EventTouch) {
        let ray = new geometry.Ray();
        this.mainCamera.screenPointToRay(e.getLocationX(), e.getLocationY(), ray);
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const hitPoint = raycastClosestResult.hitPoint;
            this.crowd.agentGoto(this.agentIndex, this.ccVec3_Vec3(hitPoint));
            this.degbugTour(hitPoint);
        }

    }
}


