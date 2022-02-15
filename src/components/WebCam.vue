<template>
  <div id="app">
    <section>
      <!--    提示信息-->
      <div class="console">
        <p id="modelInfo" v-show="loadingInfoShow">model is loading...</p>
        <p id="webcamInfo" v-show="webcamInfoShow">waiting for webcam...</p>
        <p v-show="!webcamInfoShow & !loadingInfoShow">&nbsp;</p>
      </div>

      <video autoplay playsinline muted ref="webcam" width="300" height="300"></video>

      <div>
        <button id="train" @click="train">Train</button>
        <button id="play" @click="play">Play</button>
      </div>
      <div class="console">
        <p>{{ console }}</p>
      </div>
    </section>

    <section id="game">
      <create2-d
          ref="cam"
          @playAgain="playAgain"
          @gameOver="gameOver"
          :direction="direction"
          :manifest="manifest"
          :score="score"
          :allTime="allTime"/>
    </section>

    <section>
      <direction
          :video="this.$refs.webcam"
          @addExample="addExample"/>
    </section>

    <div id="mask" v-show="maskShow">
      <div class="maskLog" id="gameOver" v-show="gameOverShow">
        <h2>游戏结束！</h2>
        <p>您的的得分为：{{ score }}</p>
        <button @click="playAgain">继续游戏</button>
        <button @click="backIndex">返回主页</button>
      </div>
      <div class="maskLog" id="setting" v-show="settingShow">
      </div>
    </div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs'
//使用ImageNet 数据库中的标签对图像进行分类。
import * as mobilenet from '@tensorflow-models/mobilenet'
//这个包提供了一个使用 K-最近邻算法创建分类器的实用程序。可用于迁移学习。
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import Create2D from './Create2D.vue'
import Direction from "./Direction";

export default {
  name: "WebCam",
  components: {
    Direction,
    Create2D
  },
  data() {
    return {
      loadingInfoShow: true,
      webcamInfoShow: false,
      trainFinish: false,
      maskShow: false,
      gameOverShow: false,
      settingShow: false,
      classifier: null,
      net: null,
      direction: null,
      console: '',
      activationList: [],
      score: 0,
      allTime: 25,
      manifest: [
        {src: require('../assets/img/car_eff_bomb@2x.png'), id: 'carBomb'},
        {src: require('../assets/img/car_eff_quick@2x.png'), id: 'carQuick'},
        {src: require('../assets/img/car_eff_slow@2x.png'), id: 'carSlow'},
        {src: require('../assets/img/car_prop1_roadb@2x.png'), id: 'sub'},
        {src: require('../assets/img/car_prop2_gas@2x.png'), id: 'add'},
        {src: require('../assets/img/car_prop3_bomb@2x.png'), id: 'over'},
        {src: require('../assets/img/car_1@2x.png'), id: 'car'},
        {src: require('../assets/img/car_bg_1@2x.jpg'), id: 'bg'}
      ],
    }
  },
  mounted() {
    this.classifier = knnClassifier.create();
    this.init();

  },
  methods: {
    init() {
      this.loadModel().then(_ => {
        this.loadWebcam();
      }).catch(err => {
        console.log(err)
      })
    },
    // load model
    async loadModel() {
      this.net = await mobilenet.load();
      this.loadingInfoShow = false
    },
    // load webcam
    async loadWebcam() {
      this.webcamInfoShow = true
      //调用手机摄像头
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia || navigator.msGetUserMedia;

      // if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      if (navigator.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        }).then(stream => {
          window.stream = stream;
          this.$refs.webcam.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.$refs.webcam.onloadedmetadata = () => {
              resolve();
              this.webcamInfoShow = false
            };
          });
        });
      }
    },

    async train() {
      if (this.activationList.length !== 0) {
        this.console = 'Training...'
        this.activationList.map(async item => {
          this.classifier.addExample(item.activation, item.elementId);
          this.classifier.addExample(item.activation, item.elementId);
          this.classifier.addExample(item.activation, item.elementId);
        })
        this.console = 'Complete the training!'
        this.trainFinish = true
      } else {
        this.console = 'Add some examples before training!'
      }
    },
    addExample(elementId) {
      this.activationList.push(
          {'activation': this.net.infer(this.$refs.webcam, "conv_preds"), 'elementId': elementId}
      );
    },

    play() {
      if (this.trainFinish) {
        this.$refs.cam.preLoad()
        this.bindPlaying();
      } else {
        this.console = 'Please train the model first!'
      }
    },

    gameOver(score) {
      this.score = score
      console.log('maskShow')
      this.maskShow = true
      this.gameOverShow = true
    },

    playAgain() {
      this.maskShow = false
      this.gameOverShow = false
      this.$refs.cam.reStart()
      this.bindPlaying();
    },

    backIndex() {
      this.maskShow = false
      this.gameOverShow = false
      this.$refs.cam.drawMask()
    },
    async bindPlaying() {

      while (!this.maskShow) {
        if (this.classifier.getNumClasses() > 0) {
          // get the activation from mobilenet from the webcam.
          const activation = this.net.infer(this.$refs.webcam, "conv_preds");
          // get the most likely class and confidences from the classifier module.
          const result = await this.classifier.predictClass(activation);
          const classes = ["up", "left", "down", "right"];
          this.console = `prediction: ${classes[result.classIndex]}\n`;
          this.direction = result.classIndex

          // if (result.classIndex === this.type) {
          //   this.score++
          //   // 庆祝动画
          //   this.$refs.cam.fireworkPlay()
          //   // 继续游戏
          //   setTimeout(async () =>{
          //     this.$refs.cam.fireworkStop()
          //     await this.bindPlaying();
          //   }, 500);
          //   break;
          // }
        }
        await tf.nextFrame();
      }
    },
  }
}
</script>

<style scoped>
video {
  margin: 0 auto;
}

button {
  margin: 0 1rem;
}

#app {
  display: flex;
  margin-top: 2rem;
}

#app section {
  flex: 1;
  text-align: center;
}

.console {
  color: var(--purple);
  margin-top: 4rem;
}

#mask {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  transition: all .5s linear;
}

.maskLog {
  line-height: 1.5;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  transition: all .5s linear;
  color: var(--purple);
}

#gameOver {
  width: 450px;
  height: 230px;
  /*margin: 100px auto;*/
  background-color: #eeeeee;
  padding: 15px;
  text-align: center;
  border-radius: 15px;
}

#gameOver p {
  line-height: 70px;
  font-weight: 550;
}
</style>