<template>
  <div id="mask" v-show="maskShow">
    <!--  <div id="mask" @click="closed">-->
    <div class="maskLog" id="gameOver" v-show="gameOverShow">
      <!--      <div class="maskLog" id="gameOver">-->
      <h2>游戏结束！</h2>
      <p>您的的得分为：{{ score }}</p>
      <button @click="playAgain">继续游戏</button>
      <button @click="backIndex">返回主页</button>
    </div>
    <div class="maskLog" id="setting" v-show="settingShow">
      <!--    <div class="maskLog" id="setting">-->
      <h2>游戏设置</h2>
      <hr/>
      <div class="control">
        <span class="desc">快速设置：</span>
        <div class="text">
          <input @click="fastSelect(0)" class="radio_type" type="radio" name="type" id="radio1"/>
          <label for="radio1">easy</label>
          <input @click="fastSelect(1)" class="radio_type" type="radio" name="type" id="radio2"/>
          <label for="radio2">medium</label>
          <input @click="fastSelect(2)" class="radio_type" type="radio" name="type" id="radio3"/>
          <label for="radio3">hard</label>
        </div>
      </div>
      <div class="control">
        <span class="desc">道具出现速度(秒)：</span>
        <div class="text">
          <el-slider
              v-model="settingData.speed"
              :step="0.2"
              :max="1.2"
              :min="0.4"
              show-stops>
          </el-slider>
        </div>
      </div>
      <div class="control">
        <span class="desc">道具出现权重：<br/>(权数相加=10)&nbsp;&nbsp;&nbsp;</span>
        <div class="text" style="font-size: 14px">
          钻石(加分)
          <el-input-number v-model="settingData.proportion[0]"
                           controls-position="right"
                           size="mini"
                           @change="numberChange()"
                           :min="1"
                           :max="8"></el-input-number>
          <br/>
          障碍(减分)
          <el-input-number v-model="settingData.proportion[1]"
                           size="mini"
                           controls-position="right"
                           @change="numberChange()"
                           :min="1"
                           :max="8"></el-input-number>
          <br/>
          炸弹(结束)
          <el-input-number v-model="settingData.proportion[2]"
                           size="mini"
                           controls-position="right"
                           @change="numberChange()"
                           :min="1"
                           :max="8"></el-input-number>
        </div>
      </div>
      <div class="control">
        <span class="desc">游戏时间(秒)：</span>
        <div class="text">
          <el-slider
              v-model="settingData.playTime"
              :step="10"
              :max="40"
              :min="10"
              show-stops>
          </el-slider>
        </div>
      </div>
      <button @click="sure">确认</button>
      <button @click="closed">取消</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "MaskBox",
  data() {
    return {
      settingData: {
        speed: 0.4,
        playTime: 20,
        proportion: [5, 4, 1]
      }

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
    fastSelect(level) {
      switch (level) {
        case 0:
          this.settingData = {
            speed: 1.2,
            playTime: 20,
            proportion: [6, 3, 1]
          }
          break;
        case 1:
          this.settingData = {
            speed: 0.8,
            playTime: 30,
            proportion: [4, 4, 2]
          }
          break;
        case 2:
          this.settingData = {
            speed: 0.4,
            playTime: 40,
            proportion: [2, 5, 3]
          }
          break;
      }
    },
    numberChange() {
      let sum = 0
      this.settingData.proportion.forEach(i => sum += i)
      if (sum > 10) {
        this.$message({
          message: '道具权数相加大于10！',
          type: 'warning'
        });
        return false
      } else return true
    },
    sure() {
      console.log(this.settingData)
      let sum = 0
      this.settingData.proportion.forEach(i => sum += i)
      if (sum <= 10) {
        console.log(this.settingData)
        this.$emit('sure', this.settingData)

      }
      // if (this.numberChange()) {
      //   console.log(this.settingData)
      // }
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
  margin: 1rem 1rem;
}

#setting button {
  float: right;
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