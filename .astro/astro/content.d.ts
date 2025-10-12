declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
			components: import('astro').MDXInstance<{}>['components'];
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"2015/01/theres-no-projects-like-side-projects/index.md": {
	id: "2015/01/theres-no-projects-like-side-projects/index.md";
  slug: "2015/01/theres-no-projects-like-side-projects";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2015/12/first-post/index.md": {
	id: "2015/12/first-post/index.md";
  slug: "2015/12/first-post";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2015/12/sci-to-data-sci/index.md": {
	id: "2015/12/sci-to-data-sci/index.md";
  slug: "2015/12/sci-to-data-sci";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2016/02/d3js-icm-kfnrd/index.md": {
	id: "2016/02/d3js-icm-kfnrd/index.md";
  slug: "2016/02/d3js-icm-kfnrd";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2016/03/data-science-intro-for-math-phys-background/index.md": {
	id: "2016/03/data-science-intro-for-math-phys-background/index.md";
  slug: "2016/03/data-science-intro-for-math-phys-background";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2016/05/my-impressions-from-pydata-berlin-2016/index.md": {
	id: "2016/05/my-impressions-from-pydata-berlin-2016/index.md";
  slug: "2016/05/my-impressions-from-pydata-berlin-2016";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2016/08/quantum-mechanics-for-high-school-students/index.md": {
	id: "2016/08/quantum-mechanics-for-high-school-students/index.md";
  slug: "2016/08/quantum-mechanics-for-high-school-students";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2017/01/king-man-woman-queen-why/index.md": {
	id: "2017/01/king-man-woman-queen-why/index.md";
  slug: "2017/01/king-man-woman-queen-why";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2017/04/teaching-deep-learning/index.md": {
	id: "2017/04/teaching-deep-learning/index.md";
  slug: "2017/04/teaching-deep-learning";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2017/07/dating-for-nerds/index.md": {
	id: "2017/07/dating-for-nerds/index.md";
  slug: "2017/07/dating-for-nerds";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2017/08/bangbangcon/index.md": {
	id: "2017/08/bangbangcon/index.md";
  slug: "2017/08/bangbangcon";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2017/09/dating-for-nerds-gender-differences/index.md": {
	id: "2017/09/dating-for-nerds-gender-differences/index.md";
  slug: "2017/09/dating-for-nerds-gender-differences";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2017/11/after-pydata-warsaw-2017/index.md": {
	id: "2017/11/after-pydata-warsaw-2017/index.md";
  slug: "2017/11/after-pydata-warsaw-2017";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2018/08/segmentation-to-recommendation/index.md": {
	id: "2018/08/segmentation-to-recommendation/index.md";
  slug: "2018/08/segmentation-to-recommendation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2018/09/simple-diagrams-deep-learning/index.md": {
	id: "2018/09/simple-diagrams-deep-learning/index.md";
  slug: "2018/09/simple-diagrams-deep-learning";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2019/03/an-edgy-intro-to-graphs-of-interpersonal-relationships/index.md": {
	id: "2019/03/an-edgy-intro-to-graphs-of-interpersonal-relationships/index.md";
  slug: "2019/03/an-edgy-intro-to-graphs-of-interpersonal-relationships";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2019/04/tinder-anecdata-and-sankey-diagrams/index.md": {
	id: "2019/04/tinder-anecdata-and-sankey-diagrams/index.md";
  slug: "2019/04/tinder-anecdata-and-sankey-diagrams";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2019/06/cloak-dagger-creativity-camp/index.md": {
	id: "2019/06/cloak-dagger-creativity-camp/index.md";
  slug: "2019/06/cloak-dagger-creativity-camp";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2019/06/games-in-which-you-walk-and-get-immersed/index.md": {
	id: "2019/06/games-in-which-you-walk-and-get-immersed/index.md";
  slug: "2019/06/games-in-which-you-walk-and-get-immersed";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2019/07/dreams-drugs-convnets/index.md": {
	id: "2019/07/dreams-drugs-convnets/index.md";
  slug: "2019/07/dreams-drugs-convnets";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2019/07/human-machine-learning-motivation/index.md": {
	id: "2019/07/human-machine-learning-motivation/index.md";
  slug: "2019/07/human-machine-learning-motivation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2019/07/there-will-be-the-next-quantum-game-with-photons/index.md": {
	id: "2019/07/there-will-be-the-next-quantum-game-with-photons/index.md";
  slug: "2019/07/there-will-be-the-next-quantum-game-with-photons";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2019/10/the-statues-by-jacek-kaczmarski/index.md": {
	id: "2019/10/the-statues-by-jacek-kaczmarski/index.md";
  slug: "2019/10/the-statues-by-jacek-kaczmarski";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2020/03/doom-2016-vs-doom-eternal-ui-side-by-side/index.md": {
	id: "2020/03/doom-2016-vs-doom-eternal-ui-side-by-side/index.md";
  slug: "2020/03/doom-2016-vs-doom-eternal-ui-side-by-side";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2020/03/types-tests-typescript/index.md": {
	id: "2020/03/types-tests-typescript/index.md";
  slug: "2020/03/types-tests-typescript";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2020/05/adhd-tech-stack-auto-time-tracking/index.md": {
	id: "2020/05/adhd-tech-stack-auto-time-tracking/index.md";
  slug: "2020/05/adhd-tech-stack-auto-time-tracking";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2021/02/dont-fight-flight-or-freeze-your-body-and-emotions/index.md": {
	id: "2021/02/dont-fight-flight-or-freeze-your-body-and-emotions/index.md";
  slug: "2021/02/dont-fight-flight-or-freeze-your-body-and-emotions";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2021/09/embodiment-for-nerds/index.md": {
	id: "2021/09/embodiment-for-nerds/index.md";
  slug: "2021/09/embodiment-for-nerds";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/07/dall-e-2-and-transcendence/index.md": {
	id: "2022/07/dall-e-2-and-transcendence/index.md";
  slug: "2022/07/dall-e-2-and-transcendence";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/09/co-chcialbym-wiedziec-wczesniej-o-adhd/index.md": {
	id: "2022/09/co-chcialbym-wiedziec-wczesniej-o-adhd/index.md";
  slug: "2022/09/co-chcialbym-wiedziec-wczesniej-o-adhd";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/10/perspective-capsaicin-is-a-psychoactive-substance/index.md": {
	id: "2022/10/perspective-capsaicin-is-a-psychoactive-substance/index.md";
  slug: "2022/10/perspective-capsaicin-is-a-psychoactive-substance";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/12/medium-to-markdown/index.md": {
	id: "2022/12/medium-to-markdown/index.md";
  slug: "2022/12/medium-to-markdown";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/01/metal-bands-happiness-correlation/index.md": {
	id: "2023/01/metal-bands-happiness-correlation/index.md";
  slug: "2023/01/metal-bands-happiness-correlation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/02/ai-artists-information-theory/index.md": {
	id: "2023/02/ai-artists-information-theory/index.md";
  slug: "2023/02/ai-artists-information-theory";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/05/genesis-az-by-gpt/index.md": {
	id: "2023/05/genesis-az-by-gpt/index.md";
  slug: "2023/05/genesis-az-by-gpt";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/05/science-games-explorable-explanations/index.md": {
	id: "2024/05/science-games-explorable-explanations/index.md";
  slug: "2024/05/science-games-explorable-explanations";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/10/writing-like-ai/index.md": {
	id: "2024/10/writing-like-ai/index.md";
  slug: "2024/10/writing-like-ai";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025/01/dont-use-cosine-similarity/index.md": {
	id: "2025/01/dont-use-cosine-similarity/index.md";
  slug: "2025/01/dont-use-cosine-similarity";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025/02/markdown-saves/index.md": {
	id: "2025/02/markdown-saves/index.md";
  slug: "2025/02/markdown-saves";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025/03/gajatri-wychwalamy/index.md": {
	id: "2025/03/gajatri-wychwalamy/index.md";
  slug: "2025/03/gajatri-wychwalamy";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2025/04/vibe-translating-quantum-flytrap/index.md": {
	id: "2025/04/vibe-translating-quantum-flytrap/index.md";
  slug: "2025/04/vibe-translating-quantum-flytrap";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"textComponents": {
"blog.md": {
	id: "blog.md";
  slug: "blog";
  body: string;
  collection: "textComponents";
  data: InferEntrySchema<"textComponents">
} & { render(): Render[".md"] };
"footer.md": {
	id: "footer.md";
  slug: "footer";
  body: string;
  collection: "textComponents";
  data: InferEntrySchema<"textComponents">
} & { render(): Render[".md"] };
"me.md": {
	id: "me.md";
  slug: "me";
  body: string;
  collection: "textComponents";
  data: InferEntrySchema<"textComponents">
} & { render(): Render[".md"] };
"projects.md": {
	id: "projects.md";
  slug: "projects";
  body: string;
  collection: "textComponents";
  data: InferEntrySchema<"textComponents">
} & { render(): Render[".md"] };
"publications.md": {
	id: "publications.md";
  slug: "publications";
  body: string;
  collection: "textComponents";
  data: InferEntrySchema<"textComponents">
} & { render(): Render[".md"] };
"resume-highlights.md": {
	id: "resume-highlights.md";
  slug: "resume-highlights";
  body: string;
  collection: "textComponents";
  data: InferEntrySchema<"textComponents">
} & { render(): Render[".md"] };
"resume-intro.md": {
	id: "resume-intro.md";
  slug: "resume-intro";
  body: string;
  collection: "textComponents";
  data: InferEntrySchema<"textComponents">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		"data": {
"experiences": {
	id: "experiences";
  collection: "data";
  data: InferEntrySchema<"data">
};
"external-articles": {
	id: "external-articles";
  collection: "data";
  data: InferEntrySchema<"data">
};
"media-mentions": {
	id: "media-mentions";
  collection: "data";
  data: InferEntrySchema<"data">
};
"projects": {
	id: "projects";
  collection: "data";
  data: InferEntrySchema<"data">
};
"publications": {
	id: "publications";
  collection: "data";
  data: InferEntrySchema<"data">
};
};
"similarities": {
"2015_01_theres-no-projects-like-side-projects": {
	id: "2015_01_theres-no-projects-like-side-projects";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2015_12_first-post": {
	id: "2015_12_first-post";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2015_12_sci-to-data-sci": {
	id: "2015_12_sci-to-data-sci";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2016_02_d3js-icm-kfnrd": {
	id: "2016_02_d3js-icm-kfnrd";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2016_03_data-science-intro-for-math-phys-background": {
	id: "2016_03_data-science-intro-for-math-phys-background";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2016_05_my-impressions-from-pydata-berlin-2016": {
	id: "2016_05_my-impressions-from-pydata-berlin-2016";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2016_08_quantum-mechanics-for-high-school-students": {
	id: "2016_08_quantum-mechanics-for-high-school-students";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2017_01_king-man-woman-queen-why": {
	id: "2017_01_king-man-woman-queen-why";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2017_04_teaching-deep-learning": {
	id: "2017_04_teaching-deep-learning";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2017_07_dating-for-nerds": {
	id: "2017_07_dating-for-nerds";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2017_08_bangbangcon": {
	id: "2017_08_bangbangcon";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2017_09_dating-for-nerds-gender-differences": {
	id: "2017_09_dating-for-nerds-gender-differences";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2017_11_after-pydata-warsaw-2017": {
	id: "2017_11_after-pydata-warsaw-2017";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2018_08_segmentation-to-recommendation": {
	id: "2018_08_segmentation-to-recommendation";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2018_09_simple-diagrams-deep-learning": {
	id: "2018_09_simple-diagrams-deep-learning";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2019_03_an-edgy-intro-to-graphs-of-interpersonal-relationships": {
	id: "2019_03_an-edgy-intro-to-graphs-of-interpersonal-relationships";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2019_04_tinder-anecdata-and-sankey-diagrams": {
	id: "2019_04_tinder-anecdata-and-sankey-diagrams";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2019_06_cloak-dagger-creativity-camp": {
	id: "2019_06_cloak-dagger-creativity-camp";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2019_06_games-in-which-you-walk-and-get-immersed": {
	id: "2019_06_games-in-which-you-walk-and-get-immersed";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2019_07_dreams-drugs-convnets": {
	id: "2019_07_dreams-drugs-convnets";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2019_07_human-machine-learning-motivation": {
	id: "2019_07_human-machine-learning-motivation";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2019_07_there-will-be-the-next-quantum-game-with-photons": {
	id: "2019_07_there-will-be-the-next-quantum-game-with-photons";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2019_10_the-statues-by-jacek-kaczmarski": {
	id: "2019_10_the-statues-by-jacek-kaczmarski";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2020_03_doom-2016-vs-doom-eternal-ui-side-by-side": {
	id: "2020_03_doom-2016-vs-doom-eternal-ui-side-by-side";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2020_03_types-tests-typescript": {
	id: "2020_03_types-tests-typescript";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2020_05_adhd-tech-stack-auto-time-tracking": {
	id: "2020_05_adhd-tech-stack-auto-time-tracking";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2021_02_dont-fight-flight-or-freeze-your-body-and-emotions": {
	id: "2021_02_dont-fight-flight-or-freeze-your-body-and-emotions";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2021_09_embodiment-for-nerds": {
	id: "2021_09_embodiment-for-nerds";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2022_07_dall-e-2-and-transcendence": {
	id: "2022_07_dall-e-2-and-transcendence";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2022_09_co-chcialbym-wiedziec-wczesniej-o-adhd": {
	id: "2022_09_co-chcialbym-wiedziec-wczesniej-o-adhd";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2022_10_perspective-capsaicin-is-a-psychoactive-substance": {
	id: "2022_10_perspective-capsaicin-is-a-psychoactive-substance";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2022_12_medium-to-markdown": {
	id: "2022_12_medium-to-markdown";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2023_01_metal-bands-happiness-correlation": {
	id: "2023_01_metal-bands-happiness-correlation";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2023_02_ai-artists-information-theory": {
	id: "2023_02_ai-artists-information-theory";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2023_05_genesis-az-by-gpt": {
	id: "2023_05_genesis-az-by-gpt";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2024_05_science-games-explorable-explanations": {
	id: "2024_05_science-games-explorable-explanations";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2024_10_writing-like-ai": {
	id: "2024_10_writing-like-ai";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2025_01_dont-use-cosine-similarity": {
	id: "2025_01_dont-use-cosine-similarity";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2025_02_markdown-saves": {
	id: "2025_02_markdown-saves";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2025_03_gajatri-wychwalamy": {
	id: "2025_03_gajatri-wychwalamy";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
"2025_04_vibe-translating-quantum-flytrap": {
	id: "2025_04_vibe-translating-quantum-flytrap";
  collection: "similarities";
  data: InferEntrySchema<"similarities">
};
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
