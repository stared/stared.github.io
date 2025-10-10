import { ref, computed, type Ref } from "vue";
import type { ExternalPost, BlogPostMetadata } from "@/scripts/postData";
import { BlogPostLabels } from "@/scripts/postData";

/**
 * Manage blog post filtering and sorting
 */
export const blogFilter = (
  blogPosts: Ref<BlogPostMetadata[] | null>,
  externalPosts: ExternalPost[]
) => {
  const tagSelected = ref("all");
  const weightPopularity = ref(4);
  const weightMentions = ref(2);
  const weightAge = ref(-8);
  const migdalweight = ref(2);

  const sliderLine = (dotPos: number[]) => [
    [50, dotPos[0], { backgroundColor: dotPos[0] < 50 ? "pink" : "" }],
  ];

  const blogPostLabels = BlogPostLabels.new()
    .addInternal(blogPosts.value || [])
    .addExternal(externalPosts);

  const filteredPosts = computed(() =>
    blogPostLabels
      .filterByTag(tagSelected.value)
      .sortByWeights(
        weightPopularity.value,
        weightMentions.value,
        weightAge.value,
        migdalweight.value
      ).items
  );

  const allTagsCounted = blogPostLabels.allTagsCounted();

  return {
    tagSelected,
    weightPopularity,
    weightMentions,
    weightAge,
    migdalweight,
    sliderLine,
    filteredPosts,
    allTagsCounted,
  };
};
