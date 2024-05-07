export class HeaderData {
  title: string;
  description: string;
  image: string;

  constructor(title: string, description: string, image: string) {
    this.title = title;
    this.description = description;
    this.image = image;
  }

  static default() {
    return new HeaderData(
      "Piotr Migdał",
      "Homepage and blog of Piotr Migdał",
      ""
    );
  }

  setTitle(title?: string) {
    this.title = `{title} - Piotr Migdał` || this.title;
    return this;
  }

  setDescription(description: string) {
    this.description = description;
    return this;
  }

  setImage(image: string) {
    this.image = image;
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
}
