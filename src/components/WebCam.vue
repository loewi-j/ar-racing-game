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
          :settingData="settingData"/>
    </section>

    <section>
      <direction
          :video="this.$refs.webcam"
          @addExample="addExample"/>
    </section>

    <MaskBox
        :maskShow="maskShow"
        :gameOverShow="gameOverShow"
        :settingShow="settingShow"
        :score="score"
        @playAgain="playAgain"
        @backIndex="backIndex"
        @closed="closed"
        @sure="sure"
    />
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
import MaskBox from "./MaskBox";

export default {
  name: "WebCam",
  components: {
    MaskBox,
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
      settingData: {
        speed: 0.4,
        playTime: 20,
        proportion: [5, 4, 1]
      },
      manifest: [
        {src: require('../assets/img/over.png'), id: 'carBomb'},
        {src: require('../assets/img/add.png'), id: 'carQuick'},
        {src: require('../assets/img/barricades.png'), id: 'sub'},
        {src: require('../assets/img/diamond.png'), id: 'add'},
        {src: require('../assets/img/bomb.png'), id: 'over'},
        {src: require('../assets/img/car.png'), id: 'car'},
        {src: require('../assets/img/bg.jpg'), id: 'bg'}
      ],
    }
  },
  props: {
    setting: Boolean
  },
  watch: {
    setting() {
      this.maskShow = !this.maskShow
      this.settingShow = !this.settingShow
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
        }
        await tf.nextFrame();
      }
    },
    sure(settingData) {
      console.log(settingData)
      this.settingData = settingData
      this.closed()
    },
    closed() {
      this.maskShow = false
      this.settingShow = false
      this.gameOverShow = false
    }
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

</style>