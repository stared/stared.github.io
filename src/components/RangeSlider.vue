<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: number;
  min: number;
  max: number;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: '150px',
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const percentage = computed(() => {
  const range = props.max - props.min;
  const value = props.modelValue - props.min;
  return (value / range) * 100;
});

const midpoint = computed(() => {
  return (props.max + props.min) / 2;
});

const isNegative = computed(() => {
  return props.modelValue < midpoint.value;
});

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
}
</script>

<template>
  <div class="range-slider" :style="{ width }">
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      class="slider-input"
      :class="{ negative: isNegative }"
      :style="{
        '--value': `${percentage}%`,
      }"
      @input="handleInput"
    />
  </div>
</template>

<style scoped>
.range-slider {
  position: relative;
  display: flex;
  align-items: center;
}

.slider-input {
  width: 100%;
  height: 16px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  cursor: pointer;
}

/* Track */
.slider-input::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  background: linear-gradient(
    to right,
    #ddd 0%,
    #ddd 50%,
    #ddd 50%,
    #ddd 100%
  );
  border-radius: 3px;
}

.slider-input.negative::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    pink 0%,
    pink var(--value),
    #ddd var(--value),
    #ddd 50%,
    #ddd 50%,
    #ddd 100%
  );
}

.slider-input:not(.negative)::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    #ddd 0%,
    #ddd 50%,
    #ddd 50%,
    #a0d4ff 50%,
    #a0d4ff var(--value),
    #ddd var(--value),
    #ddd 100%
  );
}

.slider-input::-moz-range-track {
  width: 100%;
  height: 6px;
  background: linear-gradient(
    to right,
    #ddd 0%,
    #ddd 50%,
    #ddd 50%,
    #ddd 100%
  );
  border-radius: 3px;
}

.slider-input.negative::-moz-range-track {
  background: linear-gradient(
    to right,
    pink 0%,
    pink var(--value),
    #ddd var(--value),
    #ddd 50%,
    #ddd 50%,
    #ddd 100%
  );
}

.slider-input:not(.negative)::-moz-range-track {
  background: linear-gradient(
    to right,
    #ddd 0%,
    #ddd 50%,
    #ddd 50%,
    #a0d4ff 50%,
    #a0d4ff var(--value),
    #ddd var(--value),
    #ddd 100%
  );
}

/* Thumb */
.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #999;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  margin-top: -5px;
}

.slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #999;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border: none;
}

.slider-input:hover::-webkit-slider-thumb {
  background: #666;
}

.slider-input:hover::-moz-range-thumb {
  background: #666;
}
</style>
