---
title: Don't use cosine similarity
description: >-
  Cosine similarity - the duck tape of AI.
date: "2024-11-12T00:00:00.030Z"
tags:
  - deep learning
slug: dont-use-cosine-similarity
image: ./cartoon-espresso-word2vec.jpg
migdal_score: 0
---

Midas turned everything he touched into gold. Data scientists turn everything into vectors.
We do it for a reason - as gold is the language of merchants, vectors are the language of AI[^1].

These vectors, called embeddings, are insanely useful. They allow us see similarities between objects we consider. There is word2vec, game2vec, node2vec, [food2vec](https://jaan.io/food2vec-augmented-cooking-machine-intelligence/) and countless others. If we have entities by ids, we know nothing about their relationship. Words `know` and `knows`. When using vectors, there is there is a notion not only of similarity but also various dimensions. If we speak about words, it may part of speach, tense, gender, and quite a few. For example, these mapping can be visualized using PCA or t-SNE.

**queen kind image**

Not only embeddings are popular, most popular blog post is [king - man + woman = queen; but why?](https://p.migdal.pl/blog/2017/01/king-man-woman-queen-why).

Turning whole sentences into vectors goes back to bag-of-words techniques and early sequential networks like LSTMs. Now, with current Large Language Models, it shines, and can be used using general-purpose model, without any fine-tuning.

For example, let's have three sentences:

- A: _“Python can make you rich.”_
- B: _“Python can make you itch.”_
- C: _“Mastering Python can fill your pockets.”_

If we look at these as IDs, they are all different, end of story.
If we look as strings, we use [Levenstein's edit distance](https://en.wikipedia.org/wiki/Edit_distance), A-B is 2, A-C is 21. Yet, unless someone has money alergy, A is closer to B.

If we use embeddings, we can see that A and B are close, and C is far away. I use [OpenAI text-embedding-3-large](https://platform.openai.com/docs/guides/embeddings) capped at 1000 dimensions.

- A: `[-0.003738, -0.033263, -0.017596,  0.029024, -0.015251, ...]`
- B: `[-0.066795, -0.052274, -0.015973,  0.077706,  0.044226, ...]`
- C: `[-0.011167,  0.017812, -0.018655,  0.006625,  0.018506, ...]`

Cosine similarity between A and B is 0.576, A and C is 0.750. It matches our intuition.

## Naive usage of cosine similarity

How to compare vectors? There is a simple recipe - just use the cosine similarity.

$$ \text{cosine similarity} = \frac{\vec{a} \cdot \vec{b}}{\|\vec{a}\| \|\vec{b}\|} $$

```python
def cosine_similarity(a, b):
  return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

The formula is simple. Moeover, it has a nice property - for same vectors it returns 1, for random vectors - it gives something close to 0. Usually these vectors are long - a few hundreds of dimensions.

Yet, this simplicity is misleading.

Just because values are usually between 0-1 does not mean it is probability or anything like that.
Negative values are not impossible - but instead of opposite ideas, these are (usually) gibberish.

In other words - cosine distance is a hack, not a solid solution. You can plug it anywhere, no matter what model you use, is it images or text, audio or code.

Yet, as in a proper Greek tragedy, a blessing is also a curse.

It sometimes works. But other times it is completly off. If it doesn't work as expected, it may be impossible to know why.

## We optinmize cost function

To be perfectly clear - cosine similarity as a **objective function** is a valid choice. It composes of two things code for deep learning - dot product and normalization.

The problems start when we use it for other purposes, that is when

- the cost function is not the cosine similarity,
- or the training objective is different from the one we care about.

One common things is training involved using normalized vectors, e.g. optiomizing log loss on $\sigma(v_a \cdot v_b)$. Then, normalization has nice properties (e.g. makes sure the result is in the range -1 to +1, regardles of dimennsions).

## Similarity is contextual

The other, perpendicular issue, is that similarity is contextual. Even if [the model was precisely trained on cosine similarity](https://cdn.openai.com/papers/Text_and_Code_Embeddings_by_Contrastive_Pre_Training.pdf), the question is if there notion of similarity is similar.

For one person book is similar, because it has the same author. For another, what matters is the book genre. For yet another - what's its length.
Embeddings carry a lot of information of cosine similarity merges all types of similarity into one, with unknown weights.

For example, in Obsidian editor, I have a daily todo list. Should it consider similar other daily notes, ore maybe notes touching the same topic.

![Cartoon by [Dmitry Malkov](https://www.kdnuggets.com/2017/04/cartoon-word2vec-espresso-cappuccino.html)](./cartoon-espresso-word2vec.jpg)

In the US people won't notice, but in Italy, well...

## Silver lining

Even if the models is neither trained on cosine similarity, or the problems we care about, the results can be still useful. I remember playing with VGG16, one of the earliest models trained on ImageNet.

It is not even trained on embeddings themselves - these are inner layer. Or, alternatively, we can use logists for class predictions.

Yet, it was still useful. Just looking at correlations of these vectors showed some similarity.

- subtract means
- normalize
- dot product

## Examples it doesn't work

Let's go back to text, and see when it does not work.

It is a toy example of just a few short sentences. In any real case, we have a lot more. Thousands.
For sure more that would reasnably fit into a single context window. And the more data, the more noise sensitivity.

## So, what can we use instead?

Instead of using a black box, we can direcly optimize for the problem we care about.
It happens in two ways - fine-tuning (i.e. changing weights of the model) or transfer learning (i.e. using results of the models to create new embeddings).

Fine-tune for the problem.
Or easier - use transfer learning

Is document

$$ \sigma{ v*{a} \cdot v*{b} }$$

There is a

`Is sentence A likely to be similar to sentence B?`

## Anything simpler?

We got used to zero-shot learning, and it is not easy to go back. Sure, we can train model. Maybe even train on artifically generated data - but what if we want to avoid this step entirely?

Yes, there are two simple solutions.
One is to add prompt to the text, so to put more weight on what wre care about.

A simple example - let's have a cities.

- `Cousine in {city}`
- `Size of {city}`
- `Climate of {city}`
- `Latitude and longitude of {city}`

**PLOTS**

Another approach is to rewrite the original piece of text

For example, we

## ==

In LLMs, embedding has everything. Yes, everytin

- Morriss et al., [Text Embeddings Reveal (Almost) As Much As Text](https://arxiv.org/abs/2310.06816), (2023)
- https://arxiv.org/abs/2403.05440

## Recap

- Cosine similarity is NOT probability.
- Cosine similarity is contextual.

## From conf

- Michal reef: embeddings are contextual
- Fine: Cost function AND optimization is the same
- IDea: xkcd plot or excalidraw
- https://www.linkedin.com/posts/piotrmigdal_llm-ai-activity-7271894516058509312-e489?utm_source=share&utm_medium=member_desktop
- Which cost function?
- p[]

[^1]: To the point that my Jupyter Notebook intro to deep learning is called [Thinking in tensors, writing in PyTorch](https://github.com/stared/thinking-in-tensors-writing-in-pytorch)
