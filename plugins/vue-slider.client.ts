import VueSlider from 'vue-slider-component'
import 'vue-slider-component/dist-css/vue-slider-component.css'
import 'vue-slider-component/theme/default.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VueSlider', VueSlider)
})