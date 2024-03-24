---
title: New blog - moving from Medium to Gridsome
description: >-
  Why and how I moved from Jekyll and Medium to Gridsome.
date: "2022-12-29T17:12:13.030Z"
tags:
  - tech
slug: new-blog-from-medium-to-gridsome
migdal_score: -1
---

Welcome to [my new blog](/)!

I redesigned a few things - but the biggest change is that I moved here posts from various sources.

## Changed

- The [blog post list](/blog) is sortable, in a weighted way. To see how it works, pick any combination of date and popularity.
- There used to be two lists of posts, one for posts I host, and the other for published elsewhere. It was confusing - so I created a single list. Where it is published is an "implementation detail".
- Copied all posts from Medium here. This deserves a separate thread - which I provide below.
- Switched from Google Analytics to [Plausible](https://plausible.io/), which is simpler and more respectful of privacy.
- Slightly different naming. This post is `/blog/2022/12/new-blog-from-medium-to-gridsome` rather than `/2022/12/29/new-blog-from-medium-to-gridsome.html`. Yet, I made sure that all old links work.
- A lot of technical things that make it more enjoyable for me to develop.

## Picking Gridsome

[Gridsome](https://gridsome.org/) is a Vue-based static site generator. It was a no-brainer to go for static sites - much easier to write and deploy, and I don't need any server. Also, for evergreen content, it is likely to stay much longer.

[Gatsby](https://www.gatsbyjs.com/), which is React-based, is way more popular and actively developed. I am all for the [React](https://reactjs.org/) philosophy, including that it uses JavaScript for templating rather than some made-up syntax. Yet, in Gatsby the simplest things (such as blog post routing) there are many ways to go. It felt like giving me tools rather than solutions. In a contrast, in Gridsome things worked out of the box.

So, I picked Gridsome. I already use Vue (especially in [Virtual Lab by Quantum Flytrap](https://lab.quantumflytrap.com/lab?mode=waves)). And it just works.

## Moving from Jekyll

This one was easy. Just a few path changes, both for content and internal links. A few regular expressions did the job.

## Moving from Medium

[Medium](https://medium.com/) is a blog posting platform. Anyone can create an account and start writing.

### Why

For some time a lot of tech community started writing there, myself included.
Now it has less favorable opinions - to the point that [the Hackers News crowd seems to hate Medium](https://hn.algolia.com/?dateRange=all&page=0&prefix=true&query=medium&sort=byPopularity&type=story).
I share some (but not all) of the concerns.
However:

- I write for the readers. And the readers' experience matters.
- I want to have all of my writings in one place, rather than distributed among various platforms.
- I like to create the whole website according to my needs (and quirks).
- And, well, I can.

So, to be clear - I don't boycott anything. My Medium blog posts stay there, I even link them here.
But all of the changes

Moreover, if you want to write your first post, I recommend Medium by all means!

### How

Moving from Medium needed a few steps:

- Downloading blog posts locally, see [export your account data](https://help.medium.com/hc/en-us/articles/115004745787-Export-your-account-data).
- Turning them into Markdown with [medium-2-md](https://www.npmjs.com/package/medium-2-md).
- Using a custom Python script to put images nicely in folders and to process some parts of the front matter. The script in the as-it-is form is [here](https://github.com/stared/stared.github.io/blob/main/content/blog/from-medium/clean_medium-2-md-for-gridsome.ipynb).
- Converting images to jpg (many png were large, and I wanted to keep a typical image file around 100kB). Used [mogrify](https://imagemagick.org/script/mogrify.php), `mogrify -format jpg *.png`. Also, gifs are not supported - so turned them into jpgs or pngs.
- Manual changes to set thumbnails, create frontmatter (e.g. tags), add image captions (they were lost by `medium-2-md`), some other changes (e.g. for an unknown reason Gridsome does not display two or more subsequent images).

If I had to do it for the second time, I guess I would write my own library for turning Medium posts into Markdown suitable for Gridsome (or any other static blog).

## What's next?

The source is here <https://github.com/stared/stared.github.io>.
