import { _decorator, Component, MeshRenderer, v3, Vec3, Node, utils, Layers, gfx, EventTouch, geometry, PhysicsSystem, Line, Color, Camera, Material } from 'cc';
import { RecastAgent } from './RecastAgent';
import { RecastConfig } from './RecastConfig';
const { ccclass, property, requireComponent } = _decorator;

const Recast = (window as any).Recast;

@ccclass('RecastJsPlugin')
@requireComponent(RecastConfig)
export class RecastJsPlugin extends Component {

    @property({ type: Node, tooltip: '寻路环境父节点' })
    public env: Node = null;

    @property({ tooltip: 'debug模式' })
    public debug: boolean = false;

    @property({ type: Camera, visible(this: any) { return this.debug; }, tooltip: 'debug模式射线相机' })
    public mainCamera: Camera = null;

    @property({ type: Component, visible(this: any) { return this.debug; }, tooltip: 'debug agent' })
    public debugAgent: RecastAgent = null;

    @property({ type: Node, visible(this: any) { return this.debug; } })
    public canvasNode: Node = null;

    public recast: any;  //Recast
    public navMesh: any; //NavMesh
    public debugNode: Node; //Debug 模式下有用
    public debugLine: Node; //Debug 模式下有用


    public static recastPlugin: RecastJsPlugin;

    onLoad() {
        RecastJsPlugin.recastPlugin = this;
    }

    async start() {
        this.recast = await new Recast();
        this.buidEnvMesh();
        this.debug && this.schedule(this.createDebugNavMesh.bind(this), 1);
        this.debug && this.canvasNode.on(Node.EventType.TOUCH_START, this.onClick, this);
    }

    public buidEnvMesh() {
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
        let config = this.getNavMeshConfig();
        this.navMesh.build(positions, offset, indices, indices.length, config);
    }

    update() {
        !!this.navMesh && this.navMesh.update();
    }

    public getNavMeshConfig() {
        if (!this.recast) { return; }
        let config = this.getComponent(RecastConfig);
        let rc = new this.recast.rcConfig();
        rc.cs = config.cs;
        rc.ch = config.ch;
        rc.borderSize = config.borderSize;
        rc.tileSize = config.tileSize;
        rc.walkableSlopeAngle = config.walkableSlopeAngle;
        rc.walkableHeight = config.walkableHeight;
        rc.walkableClimb = config.walkableClimb;
        rc.walkableRadius = config.walkableRadius;
        rc.maxEdgeLen = config.maxEdgeLen;
        rc.maxSimplificationError = config.maxSimplificationError;
        rc.minRegionArea = config.minRegionArea;
        rc.mergeRegionArea = config.mergeRegionArea;
        rc.maxVertsPerPoly = config.maxVertsPerPoly;
        rc.detailSampleDist = config.detailSampleDist;
        rc.detailSampleMaxError = config.detailSampleMaxError;
        return rc;
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
        if (!this.debugNode) {
            this.debugNode = new Node('debugNode');
            this.debugNode.parent = this.env;
            this.debugNode.layer = this.env.layer;
            this.debugNode.position = Vec3.ZERO;
            let com = this.debugNode.addComponent(MeshRenderer);
            let mtl = new Material();
            mtl.initialize({
                effectName: "builtin-unlit",
                states: {
                    primitive: gfx.PrimitiveMode.LINE_STRIP,//TRIANGLE_LIST
                    rasterizerState: {
                        cullMode: gfx.CullMode.NONE,
                    }
                },
            });
            mtl.setProperty("mainColor", Color.RED);
            com.setMaterial(mtl, 0);
        }

        let mr = this.debugNode.getComponent(MeshRenderer);
        mr.mesh = mesh;
    }


    degbugTour(pos: Vec3) {
        const pos1 = this.ccVec3_Vec3(this.debugAgent.node.worldPosition);
        const pos2 = this.ccVec3_Vec3(pos);
        const navPath = this.navMesh.computePath(pos1, pos2);
        const pointCount = navPath.getPointCount();
        const positions = [];
        for (let pt = 0; pt < pointCount; pt++) {
            const p = this.Vec3_ccVec3(navPath.getPoint(pt));
            positions.push(p);
        }

        if (!this.debugLine) {
            let lineNode = new Node('LineNode');
            lineNode.parent = this.env;
            lineNode.layer = this.env.layer;
            lineNode.position = Vec3.ZERO;
            lineNode.addComponent(Line);
            this.debugLine = lineNode;
        }

        let linePath = this.debugLine.getComponent(Line);
        linePath.width.constant = 0.2;
        linePath.color.color = Color.GREEN;
        linePath.worldSpace = true;
        linePath.positions = <never[]>positions;
    }

    onClick(e: EventTouch) {
        let ray = new geometry.Ray();
        this.mainCamera.screenPointToRay(e.getLocationX(), e.getLocationY(), ray);
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const hitPoint = raycastClosestResult.hitPoint;
            this.debugAgent.crowd.agentGoto(this.debugAgent.agentIndex, this.ccVec3_Vec3(hitPoint));
            this.degbugTour(hitPoint);
        }

    }

}
