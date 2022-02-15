<template>
  <div id="app">
    <div class="title"><span><b>AR</b>赛车游戏</span></div>
    <web-cam />
  </div>
</template>

<script>
import WebCam from "./components/WebCam";

export default {
  name: 'app',
  components: {
    WebCam,
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
  background: linear-gradient(to right, var(--pink),var(--white));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
