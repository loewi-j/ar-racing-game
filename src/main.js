import Vue from 'vue'
import App from './App.vue'
import '@/assets/css/style.css'
import 'script-loader!createjs/builds/1.0.0/createjs.min.js';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
Vue.use(ElementUI);

new Vue({
  render: h => h(App),
}).$mount('#app')
