import { useHead } from "#imports";
import { SITE_CONFIG } from "@/config/site";
import defaultImage from "~/assets/imgs/piotr-migdal-direct-smiling-2022-by-cytacka-thumbnail.jpg";

/**
 * HeaderData for social media (Open Graph, Twitter aka X, etc.)
 */
export class HeaderData {
  title: string;
  description: string;
  image: string;
  author: string;

  constructor(
    title: string,
    description: string,
    image: string,
    author: string
  ) {
    this.title = title;
    this.description = description;
    this.image = image;
    this.author = author;
  }

  static default() {
    return new HeaderData(
      SITE_CONFIG.title,
      SITE_CONFIG.description,
      defaultImage,
      SITE_CONFIG.author
    );
  }

  setTitle(title?: string) {
    this.title = `${title} - ${SITE_CONFIG.author}` || this.title;
    return this;
  }

  setDescription(description: string) {
    this.description = description;
    return this;
  }

  setImage(image?: string) {
    this.image = image || this.image;
    return this;
  }

  getHead() {
    return {
      title: this.title,
      link: [
        { rel: "icon", type: "image/png", href: SITE_CONFIG.images.favicon },
      ],
      meta: [
        { name: "description", content: this.description },
        { name: "author", content: this.author },
        { property: "og:title", content: this.title },
        { property: "og:description", content: this.description },
        { property: "og:image", content: this.image },
        { name: "twitter:card", content: SITE_CONFIG.twitter.card },
        { name: "twitter:title", content: this.title },
        { name: "twitter:description", content: this.description },
        { name: "twitter:image", content: this.image },
      ],
    };
  }

  useHead() {
    useHead(this.getHead());
  }
}
