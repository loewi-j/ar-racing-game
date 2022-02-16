<template>
  <div id="mask" v-show="maskShow" @click="closed">
    <!--  <div id="mask" @click="closed">-->
    <div class="maskLog" id="gameOver" v-show="gameOverShow">
      <!--      <div class="maskLog" id="gameOver">-->
      <h2>游戏结束！</h2>
      <p>您的的得分为：{{ score }}</p>
      <button @click="playAgain">继续游戏</button>
      <button @click="backIndex">返回主页</button>
    </div>
    <!--      <div class="maskLog" id="setting" v-show="settingShow">-->
    <div class="maskLog" id="setting">
      <h2>游戏设置</h2>
      <hr/>
      <div class="control">
        <span class="desc">快速设置：</span>
        <div class="text">
          <input class="radio_type" type="radio" name="type" id="radio1"/>
          <label for="radio1">easy</label>
          <input class="radio_type" type="radio" name="type" id="radio2"/>
          <label for="radio2">medium</label>
          <input class="radio_type" type="radio" name="type" id="radio3"/>
          <label for="radio3">hard</label>
        </div>
      </div>
      <div class="control">
        <span class="desc">道具出现速度(秒)：</span>
        <div class="text">
          <el-slider
              v-model="speed"
              :step="0.2"
              :max="1.2"
              :min="0.4"
              show-stops>
          </el-slider>
        </div>
      </div>
      <div class="control">
        <span class="desc">道具出现比例：</span>
        <div class="text" style="font-size: 14px">
          钻石(加分)
          <el-input-number v-model="proportion[0]"
                           controls-position="right"
                           size="mini"
                           @change="numberChange"
                           :min="1"
                           :max="10"></el-input-number>
          <br/>
          障碍(减分)
          <el-input-number v-model="proportion[1]"
                           size="mini"
                           controls-position="right"
                           @change="numberChange"
                           :min="1"
                           :max="10"></el-input-number>
          <br/>
          炸弹(结束)
          <el-input-number v-model="proportion[2]"
                           size="mini"
                           controls-position="right"
                           @change="numberChange"
                           :min="1"
                           :max="10"></el-input-number>
        </div>
      </div>
      <div class="control">
        <span class="desc">游戏时间(秒)：</span>
        <div class="text">
          <el-slider
              v-model="playTime"
              :step="10"
              :max="40"
              :min="10"
              show-stops>
          </el-slider>
        </div>
      </div>
      <button>确认</button>
      <button>取消</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "MaskBox",
  data() {
    return {
      speed: 0.4,
      playTime: 20,
      proportion: [5, 4, 1]
    }
  },
  props: {
    maskShow: Boolean,
    gameOverShow: Boolean,
    settingShow: Boolean,
    score: Number,
  },
  methods: {
    playAgain() {
      this.$emit('playAgain')
    },
    backIndex() {
      this.$emit('backIndex')
    },
    numberChange() {

    },
    closed() {
      this.$emit('closed')
    }
  }
}
</script>

<style scoped>

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
  text-align: center;
}

#gameOver {
  width: 450px;
  height: 230px;
  background-color: #f3f3f3;
  padding: 15px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

}

#gameOver p {
  line-height: 70px;
  font-weight: 550;
}

#setting {
  width: 500px;
  height: 440px;
  background-color: #fdfdfd;
  padding: 10px 55px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.control {
  display: flex;
  line-height: 35px;
  margin-top: 1rem;
}

.desc {
  flex: 2;
  text-align: right;
  font-weight: 600;
}

.text {
  flex: 4;
  text-align: left;
  margin-left: 1rem;
  margin-right: 2rem;
  color: #666;

}

label {
  display: inline-block;
  margin-left: 5px;
  margin-right: 15px;
  vertical-align: middle;

}

input {
  outline-style: none;
  -webkit-appearance: none;
  border: none;
  appearance: none;
}

.radio_type {
  vertical-align: middle;
  margin-right: 8px;
  width: 18px;
  height: 18px;
  border: 1px solid #DDDDDD;
  border-radius: 50%;
}

.radio_type:checked {
  border: 6px solid var(--blue);
  background: #FFFFFF;
}

button {
  float: right;
  margin: 1rem 1rem;
}
</style>
<style>
.el-slider__button {
  border: 2px solid var(--blue) !important;
}

.el-slider__bar {
  background-color: var(--blue) !important;
}
</style>