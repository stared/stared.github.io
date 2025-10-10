import { AUTHOR, SITE_TITLE, SITE_DESCRIPTION } from "~/constants";
import defaultImage from "~/assets/imgs/piotr-migdal-direct-smiling-2022-by-cytacka-thumbnail.jpg";

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  author?: string;
}

/**
 * Set SEO meta tags (Open Graph, Twitter, etc.)
 */
export const seo = (options: SeoOptions = {}) => {
  const title = options.title ? `${options.title} - ${AUTHOR}` : SITE_TITLE;
  const description = options.description || SITE_DESCRIPTION;
  const image = options.image || defaultImage;
  const author = options.author || AUTHOR;

  useHead({
    title,
    link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    meta: [
      { name: "description", content: description },
      { name: "author", content: author },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
  });
};
