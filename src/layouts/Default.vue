<template>
  <div class="layout">
    <header class="header">
      <strong>
        <g-link to="/">Piotr Migdał</g-link>
      </strong>
      <nav class="nav">
        <g-link class="nav__link" to="/blog">Blog</g-link>
        <g-link class="nav__link" to="/projects">Projects</g-link>
        <g-link class="nav__link" to="/publications">Publications</g-link>
        <g-link class="nav__link" to="/resume">Resume</g-link>
      </nav>
    </header>
    <slot />
  </div>
</template>

<style>
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.5;
}

.layout {
  max-width: 760px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  height: 80px;
}

.nav__link {
  margin-left: 20px;
}
</style>
