<template>
  <div>
    <canvas ref="create" id="create" height="550" width="380"/>

  </div>
</template>

<script>

export default {
  name: 'Create2D',
  data() {
    return {
      positions: [86, 164, 242],
      queue: null,
      speed: 5,  //默认速度
      stage: null,
      bgImg: null,  //背景图
      bgImg2: null,  //背景图bgImg2
      bgImgH: 0,
      mask: null,

      itemList: [], //道具
      crash: {  //物体占的位置 用于碰撞检测
        car: {},
        point: []
      },

      addTimeout: 0, //加速定时器
      pointIntervalId: 0,
      intervalTime: 0,
      intervalId: 0,

      timeDisc: null,
      scoreDisc: null,
      score: null,
      points: []
    }
  },
  props: {
    settingData: Object, //设置数据
    direction: Number, //方向
    manifest: Array //图片资源
  },
  watch: {
    direction: {
      handler(index) {
        if (index === 3) {
          this.turnRight();
        } else if (index === 1) {
          this.turnLeft();
        } else if (index === 2) {
          this.turnDown();
        } else if (index === 0) {
          this.turnTop();
        }
      },
      deep: true
    }
  },
  //  这里主要不能放在 created() 里
  mounted() {
    this.init()
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
  },
  methods: {
    init() {
      this.stage = new createjs.Stage('create')
      this.drawMask();
    },
    //预加载图片
    preLoad() {
      createjs.Ticker.removeEventListener("tick", this.tick);

      this.queue = new createjs.LoadQueue(false);
      this.queue.on('complete', this.handleComplete, this);
      this.queue.loadManifest(this.manifest);
    },
    //资源加载成功后
    handleComplete() {
      let car = new createjs.Bitmap(this.queue.getResult('car'))
      let carBomb = new createjs.Bitmap(this.queue.getResult('carBomb'))
      let carQuick = new createjs.Bitmap(this.queue.getResult('carQuick'))
      let bg = this.queue.getResult('bg')

      this.drawBg(bg);
      this.drawCar(car, carBomb, carQuick);
      this.play()
    },
    play() {
      console.log(this.settingData)
      this.stage.removeChild(this.mask)
      //障碍物
      let addPoint = new createjs.Bitmap(this.queue.getResult('add'))
      let subPoint = new createjs.Bitmap(this.queue.getResult('sub'))
      let overPoint = new createjs.Bitmap(this.queue.getResult('over'))

      const that = this
      //循环绘制
      this.pointIntervalId = setInterval(function () {
        that.drawPoint(addPoint, subPoint, overPoint)
      }, this.settingData.speed * 1000);  //400ms ~ 1200ms

      this.score = 0
      this.intervalTime = this.settingData.playTime
      this.intervalId = setInterval(this.Timing, 1000);
      createjs.Ticker.addEventListener("tick", this.tick);
      createjs.Ticker.paused = 0;
    },

    turnLeft() {
      let car = this.stage.getChildByName("car")
      if (car.x < 120)
        return;

      createjs.Tween.get(car).to({
        x: car.x - 78
      }, 200);

      this.crash.car = {
        x: [car.x - 78, car.x - 78 + 50],
        y: [car.y, car.y + 78]
      };
    },
    turnRight() {
      let car = this.stage.getChildByName("car");
      if (car.x > 200)
        return;

      createjs.Tween.get(car).to({
        x: car.x + 78
      }, 150);

      this.crash.car = {
        x: [car.x + 78, car.x + 78 + 50],
        y: [car.y, car.y + 78]
      };
    },
    turnTop() {
      let car = this.stage.getChildByName("car")
      if (car.y < 150)
        return;

      createjs.Tween.get(car).to({
        y: car.y - 80
      }, 200);

      this.crash.car = {
        x: [car.x, car.x + 50],
        y: [car.y - 78, car.y - 78 + 78]
      };
    },
    turnDown() {
      let car = this.stage.getChildByName("car");
      if (car.y > 400)
        return;

      createjs.Tween.get(car).to({
        y: car.y + 80
      }, 200);

      this.crash.car = {
        x: [car.x, car.x + 50],
        y: [car.y + 78, car.y + 78 + 78]
      };
    },
    //绘制背景
    drawBg(bg) {
      this.bgImg = new createjs.Bitmap(bg);
      this.bgImg.y = 0;
      this.bgImg.x = 0;
      this.bgImg.scaleX = 0.73;
      this.bgImg.scaleY = 0.73;

      //背景副本 用于滚动时连接
      this.bgImgH = -bg.height / 2;
      this.bgImg2 = new createjs.Bitmap(bg);
      this.bgImg2.x = 0;
      this.bgImg2.y = this.bgImgH;
      this.bgImg2.scaleX = 0.73;
      this.bgImg2.scaleY = 0.73;

      //加载倒计时及分数
      this.timeDisc = new createjs.Text(`Remaining: ${this.intervalTime} s`, "16px Arial", "#2f2a63")
      this.timeDisc.x = 135
      this.timeDisc.y = 14

      this.scoreDisc = new createjs.Text(`Score: 0`, "16px Arial", "#2f2a63")
      this.scoreDisc.x = 155
      this.scoreDisc.y = 42

      this.stage.addChild(this.bgImg);
      this.stage.addChild(this.bgImg2);
      this.stage.addChild(this.timeDisc)
      this.stage.addChild(this.scoreDisc)
    },

    tick(e) {
      if (e.paused !== 1) {
        //背景滚动
        this.bgImg.y = this.speed + this.bgImg.y;
        this.bgImg2.y = this.speed + this.bgImg2.y;
        if (this.bgImg2.y > -40) {
          this.bgImg.y = this.bgImg2.y + this.bgImgH;
        }
        if (this.bgImg2.y > -this.bgImgH - 100) {
          this.bgImg2.y = this.bgImgH + this.bgImg.y;
        }
        this.scoreDisc.text = 'Score: ' + this.score
        this.timeDisc.text = 'Remaining: ' + this.intervalTime + ' s'

        // 障碍物逐帧逻辑处理函数
        for (let i = 0; i < this.itemList.length; i++) {
          if (this.itemList[i]) {
            this.itemList[i].y += this.speed;
            //实时更新障碍物的位置
            this.crash.point[i] = {
              x: [this.itemList[i].x, this.itemList[i].x + 54],
              y: [this.itemList[i].y, this.itemList[i].y + 60]
            };
            //碰撞检测
            if (this.isCrash(this.crash.car, this.crash.point[i])) {
              //绘制特效
              let name = this.itemList[i].name
              if (name === 'add') {
                this.changePoint('add')
              } else if (name === 'sub') {
                this.changePoint('sub')
              } else if (name === 'over') {
                this.gameOver()
              }
              this.stage.removeChild(this.itemList[i])
              //删除数组的数据
              this.itemList.splice(i--, 1)
            }
          }
        }
        this.stage.update(e);
      }
    },
    //碰撞检测
    isCrash(car, obst) {
      if (((obst.x[0] < car.x[1]) && (obst.x[1] > car.x[0])) &&
          ((obst.y[0] < car.y[1]) && (obst.y[1] > car.y[0]))) {
        return true;
      }
      return false;
    },

    //爆炸，游戏结束
    gameOver() {
      this.$emit('gameOver', this.score)
      this.pause();

      //保存分数
      this.points.push(this.score);
      this.points = this.points.sort(function (a, b) {
        return b - a
      });
      //显示爆炸效果
      let car = this.stage.getChildByName("car");
      car.getChildByName('bomb').visible = true;
      car.getChildByName('add').visible = false;

      this.destroy();
    },

    //绘制汽车
    drawCar(car, bomb, add) {
      let carGroup = new createjs.Container()
      carGroup.name = 'car'
      car.x = -16
      carGroup.addChild(car)

      //绘制特效
      carGroup.addChild(bomb)
      carGroup.addChild(add)
      bomb.x = -30
      bomb.y = -8
      add.x = -8
      add.y = -4

      bomb.name = 'bomb'
      add.name = 'add'
      bomb.visible = false
      add.visible = false

      carGroup.y = 672 - 76 - 180
      carGroup.x = 187 - 25
      carGroup.scaleX = 0.5
      carGroup.scaleY = 0.5

      this.crash.car = {
        x: [carGroup.x, carGroup.x + 50],
        y: [carGroup.y, carGroup.y + 78]
      }
      this.stage.addChild(carGroup)
    },

    //随机绘制障碍物
    drawPoint(addPoint, subPoint, overPoint) {
      //随机绘制
      let type = Math.floor(10 * Math.random())
      console.log(type)
      let prop
      const rate = this.settingData.proportion[1] + this.settingData.proportion[2]
      // 可调节道具出现比例
      if (type >= 0 && type <= this.settingData.proportion[2]) {
        console.log('over')
        prop = overPoint.clone()
        prop.name = 'over'
      } else if ((type >= this.settingData.proportion[2]) && (type <= rate)) {
        prop = subPoint.clone()
        prop.name = 'sub'
        console.log('sub')

      } else if ((type >= (rate+1)) && (type <= 10)) {
        prop = addPoint.clone()
        prop.name = 'add'
        console.log('add')

      }
      // 随机坐标
      prop.x = this.positions[Math.floor(3 * Math.random())]
      prop.y = 0
      prop.scaleX = 0.5
      prop.scaleY = 0.5

      this.itemList.push(prop)
      this.stage.addChild(prop)

      // 删除越界道具
      if (this.itemList[0].y > -this.bgImgH + 200) {
        this.stage.removeChild(this.itemList[0]);
        this.itemList.splice(0, 1);
      }
    },
    drawMask() {
      this.mask = new createjs.Container()

      let bg = new createjs.Shape();
      bg.graphics.beginFill("#ececec").drawRect(0, 0, 380, 550);
      bg.name = 'bg'

      let title = new createjs.Text(`赛车游戏`, "40px Arial", "#534a92")
      title.x = 108
      title.y = 120

      let rank = new createjs.Text(`---- 排行榜 ----`, "25px Arial", "#777")
      rank.x = 110
      rank.y = 220

      let txt = ''
      this.points.map((value, index) => {
        if (index < 4)
          txt += 'No.' + (index + 1) + ': ' + value + ' points\n'
      })
      let list = new createjs.Text(txt, "17px Arial", "#777")
      list.x = 130
      list.y = 280

      this.mask.addChild(bg)
      this.mask.addChild(title)
      this.mask.addChild(rank)
      this.mask.addChild(list)
      this.stage.addChild(this.mask)
      this.stage.update()
    },
    //倒计时
    Timing() {
      if (this.intervalTime === 0) {
        //保存分数
        this.points.push(this.score);
        this.points = this.points.sort(function (a, b) {
          return b - a
        });
        this.$emit('gameOver', this.score)
        this.pause();
        this.destroy();
      }
      this.intervalTime--;
    },
    //改变分数  参数 add--加分  sub--扣分
    changePoint(type) {
      const car = this.stage.getChildByName('car')
      if (type === 'add') {
        //改变UI
        car.getChildByName('add').visible = true;
        //重新设置延时器
        clearTimeout(this.addTimeout);
        this.score++

        this.addTimeout = setTimeout(function () {
          car.getChildByName('add').visible = false;
        }, 2000);
      }
    },

    //暂停游戏
    pause() {
      //暂停倒计时
      clearTimeout(this.intervalId);
      //暂停动画
      createjs.Ticker.paused = 1;
    },
    //批量销毁
    destroy() {
      console.log('销毁')
      createjs.Ticker.removeEventListener("tick", this.tick);
      //清除计时器等
      clearInterval(this.pointIntervalId);
      clearInterval(this.intervalId);

      this.stage.update();
      createjs.Ticker.paused = 1;
    },

    //重新开始
    reStart() {
      this.destroy()
      console.log('reStart')
      this.stage.removeAllChildren();
      createjs.Ticker.removeEventListener("tick", this.tick);

      this.score = 0
      this.itemList = []
      this.crash = {
        car: {},
        point: []
      }
      this.preLoad();
    },
  }
}
</script>

<style scoped>
#create {
  padding: 10px;
  border: 2px dashed var(--purple);

}

</style>
