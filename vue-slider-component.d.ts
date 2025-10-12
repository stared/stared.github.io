/**
 * Type declarations for vue-slider-component (no official TypeScript definitions)
 */
declare module 'vue-slider-component/dist-css/vue-slider-component.umd.min.js' {
  import type { DefineComponent } from 'vue'
  const VueSlider: DefineComponent<{
    modelValue?: number;
    min?: number;
    max?: number;
    width?: string;
    process?: (dotPos: number[]) => Array<[number, number, { backgroundColor?: string }]>;
  }>
  export default VueSlider
}
