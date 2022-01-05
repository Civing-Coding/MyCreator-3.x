import { BaseNode, Color, director, dynamicAtlasManager, ImageAsset, SpriteFrame, Texture2D, v2, Vec2, Node, assetManager, math } from "cc";

export class Utils {

    //数字开头填充0
    static padStart(num: any, n: number) {
        let len = num.toString().length;
        while (len < n) {
            num = "0" + num;
            len++;
        }
        return num;
    }

    //固定种子重复随机算法 
    static getRandomBySeedRe(seed: number, num: number, minN: number, maxN: number) {
        let seededRandom = function (max: number, min: number) {
            max = max || 1;
            min = min || 0;
            seed = (seed * 9301 + 49297) % 233280;
            let rnd = seed / 233280.0;
            return Math.floor(min + rnd * (max - min));
        }

        let list = [];
        while (list.length < num) {
            list.push(seededRandom(maxN, minN));
        }
        return list;
    };

    //固定种子不重复随机算法 
    static getRandomBySeed(seed: number, num: number, minN: number, maxN: number) {
        let seededRandom = function (max: number, min: number) {
            max = max || 1;
            min = min || 0;
            seed = (seed * 9301 + 49297) % 233280;
            let rnd = seed / 233280.0;
            return Math.floor(min + rnd * (max - min));
        }

        let list: Set<number> = new Set();
        while (list.size < num) {
            list.add(seededRandom(maxN, minN));
        }
        return new Array(list);
    };

    //带权重随机
    static randomWithWeight(weightList: number[]) {
        if (weightList.length == 1) {
            return 0;
        }
        let total = 0;
        weightList.forEach(i => {
            total += i;
        });
        let r = Utils.random(1, total);
        let i = 0;
        let temp = 0;
        while (temp < total) {
            temp += weightList[i];
            if (r <= temp) {
                return i;
            }
            ++i;
        }
        return weightList.length - 1;
    }

    //正态分布随机  -1-1 68%  -2-2 95% -3-3 99%  other 0.2%
    static random_Box_Muller() {
        //Math.sqrt(-2 * Math.log(Math.random())) * Math.sin(2 * Math.PI * Math.random());
        let ran = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
        return ran;
    }

    //获取是一年的第几周
    static getWeekOfYear() {
        let today = new Date();
        let firstDay = new Date(today.getFullYear(), 0, 1);
        let dayOfWeek = firstDay.getDay();
        let spendDay = 1;
        if (dayOfWeek != 0) {
            spendDay = 7 - dayOfWeek + 1;
        }
        firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
        let d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
        let result = Math.ceil(d / 7);
        return result + 1;
    };

    //金币转化为100，000  
    static formatMoney = (s: string, type: number) => {
        if (/[^0-9\.]/.test(s))
            return "0.00";
        if (s == null || s == "null" || s == "")
            return "0.00";
        s = s.toString().replace(/^(\d*)$/, "$1.");
        s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
        s = s.replace(".", ",");
        let re = /(\d)(\d{3},)/;
        while (re.test(s))
            s = s.replace(re, "$1,$2");
        s = s.replace(/,(\d\d)$/, ".$1");
        if (type == 0) {
            let a = s.split(".");
            if (a[1] == "00") {
                s = a[0];
            }
        }
        return s;
    };

    //金币转化为 10,000P
    static covertMoney(s: string) {
        let value = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'B', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj', 'kk', 'll', 'mm', 'nn', 'oo', 'pp', 'qq', 'rr', 'ss', 'tt', 'uu', 'vv', 'ww', 'xx', 'yy', 'zz'];
        s = Utils.formatMoney(s, 0);
        let m = (s.match(/,/g) || []).length;
        let n = s.indexOf(','); //-1
        if (m >= 0 && n >= 0) {
            return s.slice(0, n + 4) + value[m - 1];
        } else {
            return s;
        }
    }

    static random(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    //返回当前到秒的时间戳
    static getTime() {
        return Math.floor(new Date().getTime() / 1000);
    }

    //返回当前天数时间戳  
    static getDay() {
        return Math.floor(Math.floor(new Date().getTime() / 1000) / 86400);
    }

    // 获取当前日期
    static getDate(): string {
        return new Date().toLocaleDateString();
    }

    //返回00：00形式
    static getTimeFormate(t: number) {
        let a = Math.floor(t / 3600);
        let b = Math.floor(t % 3600 / 60);
        let c = Math.floor(t % 60);
        return !!a ? `${Utils.padStart(a, 2)}:${Utils.padStart(b, 2)}:${Utils.padStart(c, 2)}` : `${Utils.padStart(b, 2)}:${Utils.padStart(c, 2)}`;
    }

    //http
    static http(url: string, data: any) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (!!xhr.response) {
                        console.log(xhr.response);
                        try {
                            const response = JSON.parse(xhr.response);
                            if (response.status == 1) {
                                resolve(response);
                            } else {
                                reject('参数错误');
                            }

                        } catch (e) {
                            console.error('json解析错误');
                            reject(e);
                        }
                    } else {
                        reject('url' + url + '空消息');
                    }
                }
            }
            xhr.ontimeout = () => {
                reject('超时');
            }

            xhr.onerror = () => {
                reject('连接失败');
            }

            xhr.open("post", url);
            xhr.setRequestHeader('Accept', 'appliaction/json');
            xhr.send(data);
        })
    }

    //h5获取参数
    static getQueryString(name: string) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
        if (r != null) return unescape(r[2]);
        return null;
    }

    //h5修改参数
    static setQueryString(name: string, replaceName: string) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        if (Utils.getQueryString(name) != null) {
            let url = window.location.href.toString();
            url = url.replace(eval('/(' + name + '=)([^&]*)/gi'), replaceName);
            window.history.replaceState({}, null, url);
            return;
        }
    }


    //获取两点角度
    static getAngle(p1: Vec2, p2: Vec2): number {
        return Math.atan((p2.y - p1.y) / (p2.x - p1.x)) * 180 / Math.PI;
    }

    //两点距离
    static getDistance(p1: Vec2, p2: Vec2): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    //通过角度获取弧度   math.toRadian  math.toDegree
    static angleToRadian(angle: number): number {
        return angle * Math.PI / 180;
    }

    //通过原点x,y 半径 角度 求圆上点坐标
    static getCirclePoint(center: Vec2, radius: number, degree: number) {
        let x = center.x + radius * Math.cos(-degree * Math.PI / 180);
        let y = center.y + radius * Math.sin(-degree * Math.PI / 180);
        return v2(x, y);
    }

    //显示当前节点树
    static tree(node: any) {
        let style = `color: ${node.parent === null || node.activeInHierarchy ? 'green' : 'grey'};`;
        if (node.children.length > 0) {
            console.groupCollapsed(`%c${node.name}`, style);
            node.children.forEach(child => Utils.tree(child));
            console.groupEnd();
        } else {
            console.log(`%c${node.name}`, style);
        }
    }

    //彩色log
    static colorLog(msg: string, color = '#6666ff') {
        console.log(`%c◆%c${msg}`, `color:#009999;font-weight:bold`, `color:${color};font-weight:bold;font-size:20px`);
    }

    //获取指定点 改变锚点后坐标
    static changeNodeARPos(x: number, y: number, arx: number, ary: number, arx1: number, ary1: number, width: number, height: number) {
        let px = x - (arx1 - arx) * width;
        let py = y - (ary1 - ary) * height;
        return [px, py];
    }

    //将RGBA颜色分量转换为一个数值表示的颜色，颜色分量为0~255之间的值
    static convertToNumber(r: number, g: number, b: number, a: number = 255): number {
        return ((r & 0xfe) << 23) | (g << 16) | (b << 8) | a;
    }

    //将十六进制的颜色转换为RGBA分量表示的颜色
    static convertToRGBA(color: number): { r: number, g: number, b: number, a: number } {
        return {
            r: (color & 0xef000000) >> 23,
            g: (color & 0x00ff0000) >> 16,
            b: (color & 0x0000ff00) >> 8,
            a: (color & 0x000000ff),
        };
    }

    //设置同时下载数减少等待时间
    static changeAssetManagerMax() {
        //默认只有6 太少了  只能修改非原生环境
        assetManager.downloader.maxConcurrency = 20;//下载时的最大并发数
        assetManager.downloader.maxRequestsPerFrame = 20;//下载时每帧可以启动的最大请求数
    }

}