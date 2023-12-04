import { _decorator, CCBoolean, Component, EPhysics2DDrawFlags, Node, PhysicsSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColliderDebug')
export class ColliderDebug extends Component {

    @property(CCBoolean)
    debug: boolean = false;

    onLoad() {
        if (!this.debug) return;
        PhysicsSystem2D.instance.enable = true;
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
            EPhysics2DDrawFlags.Pair |
            EPhysics2DDrawFlags.CenterOfMass |
            EPhysics2DDrawFlags.Joint |
            EPhysics2DDrawFlags.Shape;
    }

}


