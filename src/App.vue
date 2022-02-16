<template>
  <div id="app">
    <div class="title"><span><b>AR</b>赛车游戏</span></div>
    <i class="i el-icon-s-tools" @click="setting = !setting"></i>
    <web-cam :setting="setting"/>
  </div>
</template>

<script>
import WebCam from "./components/WebCam";

export default {
  name: 'app',
  components: {
    WebCam,
  },
  data() {
    return {
      setting: false
    }
  },
  methods: {
    setting() {
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.title {
  height: 80px;
  width: 100%;
  line-height: 80px;
  background-color: var(--purple);
}

.title span {
  font-size: 30px;
  background: -webkit-linear-gradient(to right, var(--pink), var(--white));
  background: linear-gradient(to right, var(--pink), var(--white));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.i {
  position: absolute;
  color: var(--pink);
  font-size: 30px;
  right: 2rem;
  top: 25px;
}
</style>
