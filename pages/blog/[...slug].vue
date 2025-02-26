<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <article>
        <div class="markdown-header">
          <h1>{{ doc.title }}</h1>
          <p class="header-information">
            {{ formatDate(doc.date) }} | by {{ doc.author || "Piotr Migdał" }}
          </p>
          <ul
            v-if="doc.mentions && doc.mentions.length > 0"
            class="header-mentions"
          >
            <li v-for="mention in doc.mentions" :key="mention.href">
              <a :href="mention.href">{{ mention.text }}</a>
            </li>
          </ul>
        </div>
        <ContentRenderer :value="doc" />

        <!-- Parse similar posts from the content if available -->
        <SimilarPosts
          v-if="parsedSimilarPosts.similar.length > 0"
          :similarPosts="parsedSimilarPosts.similar"
          :leastSimilarPosts="parsedSimilarPosts.leastSimilar"
        />
      </article>
    </ContentDoc>
    <footer>
      <ContentDoc path="/text-components/footer" :head="false" />
    </footer>
  </main>
</template>

<script setup lang="ts">
import { HeaderData } from "@/scripts/utils";

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-UK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const { path } = useRoute();
const { data } = await useAsyncData(`content-${path}`, () =>
  queryContent().where({ _path: path }).findOne()
);

HeaderData.default()
  .setTitle(data.value?.title)
  .setDescription(data.value?.description)
  .setImage(data.value?.image)
  .useHead();

// Parse similar posts from the content
const parsedSimilarPosts = computed(() => {
  if (!data.value?.body) return { similar: [], leastSimilar: [] };

  // Convert the body to an array if it's not already
  const content = Array.isArray(data.value.body) ? data.value.body : [];

  // Find the similar posts section
  let similarPostsSection = null;
  let sectionIndex = -1;

  for (let i = 0; i < content.length; i++) {
    const section = content[i];
    if (
      section.type === "element" &&
      section.tag === "h2" &&
      section.children?.[0]?.value === "Similar posts"
    ) {
      similarPostsSection = section;
      sectionIndex = i;
      break;
    }
  }

  if (!similarPostsSection || sectionIndex === -1) {
    return { similar: [], leastSimilar: [] };
  }

  // Find the list that follows the heading
  let listElement = null;
  for (let i = sectionIndex + 1; i < content.length; i++) {
    const element = content[i];
    if (element.type === "element" && element.tag === "ul") {
      listElement = element;
      break;
    }
  }

  if (!listElement) return { similar: [], leastSimilar: [] };

  // Parse the similar posts
  const similarPosts = listElement.children
    .filter((item: any) => item.type === "element" && item.tag === "li")
    .map((item: any) => {
      // Extract the similarity score (inside code element)
      const codeElement = item.children.find(
        (child: any) => child.type === "element" && child.tag === "code"
      );
      const similarity = codeElement?.children?.[0]?.value || "";

      // Extract the link
      const linkElement = item.children.find(
        (child: any) => child.type === "element" && child.tag === "a"
      );
      const title = linkElement?.children?.[0]?.value || "";
      const path = linkElement?.props?.href || "";

      return { similarity, title, path };
    });

  // Find the "least similar posts" paragraph
  let leastSimilarParagraph = null;
  let leastSimilarIndex = -1;

  for (let i = sectionIndex + 1; i < content.length; i++) {
    const element = content[i];
    if (
      element.type === "element" &&
      element.tag === "p" &&
      element.children?.[0]?.value?.includes("least similar")
    ) {
      leastSimilarParagraph = element;
      leastSimilarIndex = i;
      break;
    }
  }

  let leastSimilarPosts: any[] = [];

  if (leastSimilarParagraph && leastSimilarIndex !== -1) {
    // Find the list that follows the paragraph
    let leastSimilarList = null;

    for (let i = leastSimilarIndex + 1; i < content.length; i++) {
      const element = content[i];
      if (element.type === "element" && element.tag === "ul") {
        leastSimilarList = element;
        break;
      }
    }

    if (leastSimilarList) {
      // Parse the least similar posts
      leastSimilarPosts = leastSimilarList.children
        .filter((item: any) => item.type === "element" && item.tag === "li")
        .map((item: any) => {
          // Extract the similarity score (inside code element)
          const codeElement = item.children.find(
            (child: any) => child.type === "element" && child.tag === "code"
          );
          const similarity = codeElement?.children?.[0]?.value || "";

          // Extract the link
          const linkElement = item.children.find(
            (child: any) => child.type === "element" && child.tag === "a"
          );
          const title = linkElement?.children?.[0]?.value || "";
          const path = linkElement?.props?.href || "";

          return { similarity, title, path };
        });
    }
  }

  return {
    similar: similarPosts,
    leastSimilar: leastSimilarPosts,
  };
});
</script>

<style>
.markdown-header .header-mentions {
  font-size: 0.8em;
}

blockquote {
  font-style: italic;
}

img {
  max-width: 100%;
  margin: auto;
  display: block;
}

img.width-max-half {
  max-width: 380px;
}

img.width-max-two-thirds {
  max-width: 506px;
}

figure.width-max-half img {
  max-width: 380px;
}

/* Center display equations */
p:has(> mjx-container:only-child) {
  text-align: center;
}

mjx-container {
  margin: 1em auto;
}

/* Keep inline equations as normal text */
p:not(:has(> mjx-container:only-child)) mjx-container {
  display: inline-block;
  margin: 0;
}

footer {
  margin-top: 2em;
  margin-bottom: 2em;
}
</style>
