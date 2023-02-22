import { _decorator, Component, Node, instantiate, v3, EventTouch, UITransform, Sprite, v2 } from 'cc';

import Simulator from "./Simulator"
import RVOMath from "./RVOMath"
import Vector2D from "./Vector2D";
import { Utils } from '../Utils';

const { ccclass, property } = _decorator;

@ccclass('RVO_Run')
export class RVO_Run extends Component {

    @property(Node)
    agentPb: Node = null;

    @property(Node)
    obNode: Node = null;

    public simulator = null;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.simulator = new Simulator();
        this.simulator.setTimeStep(0.02);
        this.simulator.setAgentDefaults(50, 10, 10, 1, 2, 100, new Vector2D(0, 0));

        let counts = 1000
        for (let i = 0; i < counts; i++) {
            let x = Math.random() * 500 - 250;
            let y = Math.random() * 500 - 250;
            this.simulator.addAgent(null);
            this.simulator.setAgentPosition(i, x, y);
            let ag = instantiate(this.agentPb);
            ag.parent = this.node;
            ag.position = v3(x, y, 0);
        }

        let obs = this.obNode.getComponentsInChildren(Sprite);
        for (let i in obs) {
            let uiOb = obs[i].getComponent(UITransform);
            let rt = uiOb.getBoundingBox();
            let obList = [];
            obList.push(new Vector2D(rt.xMin, rt.yMax));
            obList.push(new Vector2D(rt.xMax, rt.yMax));
            obList.push(new Vector2D(rt.xMax, rt.yMin));
            obList.push(new Vector2D(rt.xMin, rt.yMin));
            this.simulator.addObstacle(obList);
        }

        this.simulator.processObstacles();
    }

    step() {
        let simulator = this.simulator;

        for (let i = 0; i < simulator.getNumAgents(); ++i) {
            if (RVOMath.absSq(simulator.getGoal(i).minus(simulator.getAgentPosition(i))) < simulator.agents[i].radius) {
                simulator.setAgentPrefVelocity(i, 0.0, 0.0);
            } else {
                let v = RVOMath.normalize(simulator.getGoal(i).minus(simulator.getAgentPosition(i))).scale(simulator.agents[i].maxSpeed);
                simulator.setAgentPrefVelocity(i, v.x, v.y);
            }
        }

        simulator.run();
        if (simulator.reachedGoal()) {
            this.unschedule(this.step);
            console.log('finish')
        }

    }


    onTouchStart(e: EventTouch) {
        this.unschedule(this.step);
        let uip = e.getUILocation();
        let ap = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(uip.x, uip.y, 0));
        for (let i = 0; i < this.simulator.getNumAgents(); i++) {
            let p = Utils.getCirclePoint(v2(ap.x, ap.y), 800, 360 / this.simulator.getNumAgents() * i);
            this.simulator.setAgentGoal(i, p.x, p.y);
        }
        this.schedule(this.step, 0.02);
    }

    update() {
        for (let i in this.simulator.agents) {
            let v2d = this.simulator.agents[i].position;
            this.node.children[i].position = v3(v2d.x, v2d.y, 0);
        }
    }


}


