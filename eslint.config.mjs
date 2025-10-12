// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // The Nuxt module already includes:
  // - Vue 3 recommended rules
  // - TypeScript recommended rules
  // - Nuxt-specific rules
  // - Import organization rules

  // Add minimal custom overrides only if needed
  {
    rules: {
      // Allow single-word component names (index.vue, etc)
      'vue/multi-word-component-names': 'off',

      // Allow self-closing on void elements (common in Vue)
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }],

      // TypeScript already handles these
      'no-undef': 'off',

      // Console/debugger based on environment
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    }
  }
)