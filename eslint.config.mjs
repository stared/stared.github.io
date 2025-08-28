import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Use Nuxt's recommended ESLint configuration
// This includes Vue 3 recommended, TypeScript recommended, and Nuxt best practices
export default createConfigForNuxt({
  // Enable additional features
  features: {
    stylistic: false, // We're not using Prettier, so disable stylistic rules
  },
  dirs: {
    src: [
      './components',
      './composables',
      './layouts',
      './pages',
      './plugins',
      './server',
      './utils',
      './scripts',
    ]
  }
})
  .override('nuxt/vue/rules', {
    rules: {
      // Only override what's absolutely necessary for the project
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-v-html': 'off', // Allow v-html for blog content rendering
    }
  })
  .override('nuxt/typescript/rules', {
    rules: {
      // Keep TypeScript strict by default, only add project-specific overrides
      '@typescript-eslint/no-explicit-any': 'error', // Enforce no any types
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Warn on console.log
    }
  })
  // Allow console.log in scripts for monitoring generation processes
  .append({
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off', // Scripts can use console for monitoring
    }
  })