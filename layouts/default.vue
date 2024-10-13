<template>
  <div class="layout">
    <header class="header">
      <strong>
        <NuxtLink to="/">Piotr Migdał</NuxtLink>
      </strong>
      <nav class="nav">
        <NuxtLink class="nav__link" to="/blog">Blog</NuxtLink>
        <NuxtLink class="nav__link" to="/projects">Projects</NuxtLink>
        <NuxtLink class="nav__link" to="/publications">Publications</NuxtLink>
        <NuxtLink class="nav__link" to="/resume">Resume</NuxtLink>
      </nav>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
useHead({
  link: [
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: "RSS Feed for Piotr Migdał's Blog",
      href: "/feed.xml",
    },
  ],
});
</script>

<style>
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
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

a {
  text-decoration: none;
  color: #2a7ae2;
}

a:visited {
  color: #1756a9;
}

a:hover {
  text-decoration: underline;
  color: black;
}
</style>
