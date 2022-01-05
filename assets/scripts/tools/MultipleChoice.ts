
import { _decorator, Component, Node, Label, EventHandler, v3, CCBoolean, CCInteger, resources, error, Asset, math, AudioClip, Button, tween } from 'cc';
import { AudioSourceEx } from './AudioSourceEx';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('MultipleChoice')
export class MultipleChoice extends Component {


    @property(Label)
    tittle: Label = null;

    @property(Node)
    choiceList: Node[] = [];

    @property(CCBoolean)
    useAnim: boolean = false;

    @property(CCBoolean)
    randomQuestion: boolean = false;

    @property(CCInteger)
    count: number = 0;

    @property(AudioClip)
    trueAc: AudioClip = null;

    @property(AudioClip)
    falseAc: AudioClip = null;

    @property({ type: [EventHandler] })
    endEvent: EventHandler[] = [];

    private _index = 0;            //序号
    private _curQuestion = null;   //当前题目
    private _question = [];        //题库
    private _selected = new Set(); //已答题

    protected start() {

    }

    protected onEnable() {
        this.init();
    }

    protected onDisable() {
        resources.release('multipleChoice');
    }

    init() {
        this.node.scale = v3(0, 0, 0);
        this._index = 0;
        this._curQuestion = null;
        this._question = [];
        this._selected = new Set();

        resources.load('multipleChoice', (err, jsonAsset: any) => {
            if (err) {
                error('读取题库有误! 检查"resour/multipleChoice.json"');
                return;
            }
            this._question = jsonAsset.json;
            this.nextQuestion();
        })
    }

    nextQuestion() {
        this._curQuestion = this.getQuestion();
        this.tittle.string = this._curQuestion.title;
        if (this.useAnim) {
            tween(this.node)
                .to(0.1, { scale: v3(0, 0, 0) })
                .call(() => {
                    for (let i in this.choiceList) {
                        let show = !!this._curQuestion[i];
                        this.choiceList[i].active = show;
                        show && (this.choiceList[i].getComponentInChildren(Label).string = this._curQuestion[i]);
                        this.choiceList[i].getChildByName('dui').active = false;
                        this.choiceList[i].getChildByName('cuo').active = false;
                        this.choiceList[i].getComponent(Button).interactable = true;
                    }
                })
                .delay(0.1)
                .to(0.1, { scale: v3(1, 1, 1) })
                .start()
        } else {
            for (let i in this.choiceList) {
                let show = !!this._curQuestion[i];
                this.choiceList[i].active = show;
                show && (this.choiceList[i].getComponentInChildren(Label).string = this._curQuestion[i]);
                this.choiceList[i].getChildByName('dui').active = false;
                this.choiceList[i].getChildByName('cuo').active = false;
                this.choiceList[i].getComponent(Button).interactable = true;
            }
            this.node.scale = v3(1, 1, 1);
        }
    }

    protected getQuestion() {
        if (this.randomQuestion) {
            let r = 0;
            do {
                r = math.randomRangeInt(0, this._question.length);
            } while (this._selected.has(this._question[r].index))
            return this._question[r];
        } else {
            return this._question[this._index];
        }
    }

    protected select(e: EventHandler, args: string) {
        let check = this._curQuestion.ans == args;
        e.target.getComponent(Button).interactable = false;
        if (check) {
            this._selected.add(this._curQuestion.index);
            let btns = this.getComponentsInChildren(Button);
            btns.map(o => { o.interactable = false; })
            this._index++;
            this.scheduleOnce(() => {
                this._index >= this.count ? EventHandler.emitEvents(this.endEvent) : this.nextQuestion();
            }, 2);
        }
        if (check && !!this.trueAc) {
            this.getComponent(AudioSourceEx).playOneShot(this.trueAc);
        } else if (!check && !!this.falseAc) {
            this.getComponent(AudioSourceEx).playOneShot(this.falseAc);
        }
        this.scheduleOnce(() => {
            e.target.getChildByName('dui').active = check;
            e.target.getChildByName('cuo').active = !check;
        }, 0.2);
    }


}
