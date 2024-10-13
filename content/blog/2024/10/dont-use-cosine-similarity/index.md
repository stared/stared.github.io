---
title: Don't use cosine similarity
description: >-
  Hint: let's live in the moment and write a token at a time.
date: "2024-09-06T00:00:00.030Z"
tags:
  - deep learning
slug: dont-use-cosine-similarity
image: ./fourier-color-coded.png
migdal_score: 0
---

Midas turned everything he touched into gold. Data scientists turn everything into vectors.

In particular, we can [turn words into vectors](https://p.migdal.pl/blog/2017/01/king-man-woman-queen-why). Powerful

Right now, we

As

How to compare vectors? There is a simple recipe - just use the cosine similarity.

$$ \text{cosine similarity} = \frac{\vec{a} \cdot \vec{b}}{\|\vec{a}\| \|\vec{b}\|} $$

The formula is simple. Moeover, it has a nice property - for same vectors it returns 1, for random vectors - it gives something close to 0.
Yet, this simplicity is misleading.

Just because values are usually between 0-1 does not mean it is probability or anything like that.
Negative values are not impossible - but instead of opposite ideas, these are (usually) gibberish.

In other words - cosine distance is a hack, not a solid solution. You can plug it anywhere, no matter what model you use, is it images or text, audio or code. It sometimes works. But other times it is completly off. If it doesn't work as expected, it may be impossible to know why.

## Examples it doesn't work

If

## So, what can we use instead?

Neutral networks are good at predicting probabilities. In some cases, e.g. word2vec, Golve and similar methods, embedding vectors are directly related to probabilies of work coocurrence.

##

---

In LLMs, embedding has everything. Yes, everytin

- Morriss et al., [Text Embeddings Reveal (Almost) As Much As Text](https://arxiv.org/abs/2310.06816), (2023)

![Cartoon by [Dmitry Malkov](https://www.kdnuggets.com/2017/04/cartoon-word2vec-espresso-cappuccino.html)](./cartoon-espresso-word2vec.jpg)

## Other thigs

- Cosine similarity - the duck tape of AI
