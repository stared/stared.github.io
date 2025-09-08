<template>
  <div v-if="error" class="content-error">
    <div class="error-container">
      <h2>{{ errorTitle }}</h2>
      <p>{{ errorMessage }}</p>
      <button v-if="showRetry" class="retry-button" @click="retry">
        Try Again
      </button>
      <NuxtLink v-if="showHome" to="/" class="home-link">
        Go to Homepage
      </NuxtLink>
    </div>
  </div>
  <div v-else-if="pending" class="content-loading">
    <div class="loading-spinner"/>
    <p>{{ loadingMessage }}</p>
  </div>
  <slot v-else :data="data" />
</template>

<script setup lang="ts" generic="T">
interface Props {
  data: T | null
  pending: boolean
  error: Error | null
  errorTitle?: string
  errorMessage?: string
  loadingMessage?: string
  showRetry?: boolean
  showHome?: boolean
  onRetry?: (() => Promise<void> | void) | undefined
}

const props = withDefaults(defineProps<Props>(), {
  errorTitle: 'Content Not Available',
  errorMessage: 'We couldn\'t load the content you requested.',
  loadingMessage: 'Loading content...',
  showRetry: true,
  showHome: true,
})

const emit = defineEmits<{
  retry: []
}>()

const retry = async () => {
  emit('retry')
  if (props.onRetry) {
    await props.onRetry()
  }
}
</script>

<style scoped>
.content-error {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 500px;
}

.error-container h2 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-container p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.retry-button,
.home-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  background-color: #3b82f6;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover,
.home-link:hover {
  background-color: #2563eb;
}

.content-loading {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.content-loading p {
  margin-top: 1rem;
  color: #6b7280;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>