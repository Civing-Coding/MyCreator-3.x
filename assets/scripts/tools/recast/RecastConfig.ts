import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RecastConfig')
export class RecastConfig extends Component {

    @property({ tooltip: '网格列表中的网格将被转化为“体素”，好用来计算可到达的导航网格。这个以世界单位表示的参数，定义了1个体素的宽度。' })
    cs: number = 0.2;
    @property({ tooltip: '与cs一样，但定义的是1个体素的高度。' })
    ch: number = 0.2;
    @property({ tooltip: '可行走斜坡的最大坡度，以角度单位表示。' })
    walkableSlopeAngle: number = 35;
    @property({ tooltip: '运动物体可以到达的最大高度，以体素的个数表示。' })
    walkableHeight: number = 1;
    @property({ tooltip: '运动物体可以跨越的最大高度差，以体素的个数表示。' })
    walkableClimb: number = 1;
    @property({ tooltip: '运动物体的半径，以体素的个数表示。' })
    walkableRadius: number = 1;
    @property({ tooltip: '导航网格的边缘的每条边的最大长度。以体素尺寸为单位。' })
    maxEdgeLen: number = 12;
    @property({ tooltip: '导航网格是实际场景的简化，导航网格边缘到原始场景轮廓的最大偏离。' })
    maxSimplificationError: number = 1.3;
    @property({ tooltip: '可以组成孤立岛屿的最少单元格，意思是过于小的区域将被忽略。' })
    minRegionArea: number = 8;
    @property({ tooltip: '范围小于这个值的区域将在可能的情况下和更大的区域合并在一起，意思是过小的区域将与较大的区域融合，这个值一般比mergeRegionArea 更大。' })
    mergeRegionArea: number = 20;
    @property({ tooltip: '每个多边形的最大顶点数量-在轮廓转变为多边形的过程中，对于每个多边形允许生成的最大顶点数量。必须大于3。' })
    maxVertsPerPoly: number = 6;
    @property({ tooltip: '细节采样距离-设置生成细节网格时的采样距离。使用世界长度单位。' })
    detailSampleDist: number = 6;
    @property({ tooltip: '细节采样最大误差-细节网格的表面与高度场数据之间的最大偏离。使用世界长度单位。' })
    detailSampleMaxError: number = 1;
    @property({ visible(this: any) { return this.setParams; } })
    borderSize: number = 0;
    @property({ tooltip: '注意添加的“tileSize”参数。这是以世界单位表示的每个地块的尺寸。如果不提供这个参数或者把它设为0，则导航网格将回退回基础模式，并且障碍物不会生效。另外，取决于你的使用场景，这个值必须被仔细选择，在更多的地块和更高的cpu更新密度间取舍' })
    tileSize: number = 0;

}


