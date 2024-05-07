import { useHead } from "@vueuse/head";

const DEFAULT_AUTHOR = "Piotr Migdał";
const DEFAULT_TITLE = "Piotr Migdał";
const DEFAULT_DESCRIPTION = "Piotr Migdał - blog posts and stuff";
const DEFAULT_BASE_URL = "https://p.migdal.pl";
const DEFAULT_IMAGE = new URL(
  "~/assets/imgs/piotr-migdal-direct-smiling-2022-by-cytacka-thumbnail.jpg",
  import.meta.url
).href;

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
      DEFAULT_TITLE,
      DEFAULT_DESCRIPTION,
      DEFAULT_IMAGE,
      DEFAULT_AUTHOR
    );
  }

  setTitle(title?: string) {
    this.title = `${title} - ${DEFAULT_AUTHOR}` || this.title;
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
      meta: [
        {
          name: "description",
          content: this.description,
        },
        { name: "author", content: this.author },
        {
          property: "og:title",
          content: this.title,
        },
        {
          property: "og:description",
          content: this.description,
        },
        {
          property: "og:image",
          content: this.image,
        },
        {
          name: "twitter:title",
          content: this.title,
        },
        {
          name: "twitter:description",
          content: this.description,
        },
        {
          name: "twitter:image",
          content: this.image,
        },
      ],
    };
  }

  useHead() {
    useHead(this.getHead());
  }
}
