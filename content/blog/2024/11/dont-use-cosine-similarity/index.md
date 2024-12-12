---
title: Don't use cosine similarity
description: >-
  Cosine similarity - the duct tape of AI. Convenient but often misused.
date: "2024-11-12T00:00:00.030Z"
tags:
  - deep learning
slug: dont-use-cosine-similarity
image: ./cartoon-espresso-word2vec.jpg
migdal_score: 0
---

Midas turned everything he touched into gold. Data scientists turn everything into vectors.
We do it for a reason - as gold is the language of merchants, vectors are the language of AI[^1].

These vectors, called embeddings, are insanely useful. They allow us to see similarities between objects in ways that would make Pythagoras proud. We have word2vec, game2vec, node2vec, [food2vec](https://jaan.io/food2vec-augmented-cooking-machine-intelligence/), and if you can name it, someone has probably turned it into a vec.

When we work with raw IDs, we're blind to relationships. Take the words "know" and "knows" - to a computer, they might as well be "xkcd42" and "banana". But with vectors, we unlock a multidimensional wonderland of relationships. For words, these dimensions might represent part of speech, tense, gender, and countless subtle semantic features. We can even visualize these magical mappings using techniques like PCA or t-SNE.

**queen kind image**

This isn't just theoretical - embeddings are so captivating that my most popular blog post remains [king - man + woman = queen; but why?](https://p.migdal.pl/blog/2017/01/king-man-woman-queen-why).

The journey of turning sentences into vectors has come a long way, from humble bag-of-words beginnings through LSTM networks, to today's Large Language Models. Modern LLMs are so powerful at this that they can capture the essence of text without any fine-tuning. In fact, recent research shows these embeddings are almost as revealing as the original text - see Morris et al., [Text Embeddings Reveal (Almost) As Much As Text](https://arxiv.org/abs/2310.06816), (2023).

Let's look at three sentences:

- A: _"Python can make you rich."_
- B: _"Python can make you itch."_
- C: _"Mastering Python can fill your pockets."_

As raw IDs, they're as different as chalk and cheese. Using string similarity (Levenshtein distance), A and B differ by 2 characters, while A and C are 21 characters apart. Yet semantically (unless you're allergic to money), A is closer to C than B.

Using embeddings from [OpenAI text-embedding-3-large](https://platform.openai.com/docs/guides/embeddings), we get:

- A: `[-0.003738, -0.033263, -0.017596,  0.029024, -0.015251, ...]`
- B: `[-0.066795, -0.052274, -0.015973,  0.077706,  0.044226, ...]`
- C: `[-0.011167,  0.017812, -0.018655,  0.006625,  0.018506, ...]`

The cosine similarity between A and C is 0.750, while A and B score 0.576. Finally, numbers that match our intuition!

## What is cosine similarity?

When comparing vectors, there's a temptingly simple solution - cosine similarity:

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

One common things is training involved using normalized vectors, e.g. optiomizing log loss on $\sigma(v_a \cdot v_b)$. Then, normalization has nice properties (e.g. makes sure the result is in the range -1 to +1, regardles of dimennsions), but nonetheless is a hack, which may improve results or not, see [Is Cosine-Similarity of Embeddings Really About Similarity?](https://arxiv.org/abs/2403.05440).

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

- "What did I do to"
- "In left them my pocket"
- "On the table"
- "What I did to my life"

## So, what can we use instead?

Instead of using a black box, we can direcly optimize for the problem we care about.
It happens in two ways: fine-tuning (i.e. changing weights of the model) or transfer learning (i.e. using results of the models to create newer, better embeddings).

We can as "Is A similar to B?"

$$\sigma{ u{A} \cdot u{B}}$$

Where $u = M v$, $M$ is the matrix reducing the dimensionality of the embedding space to one we care about. Since we are dealing with less general problem that capturing the content of the exitre document, we reduce the dimensionality.

Often times, the problem is not about similarity itself, but about quering. E.g. "Is question A answered correctly in document B?" (note the word "correctly").

$$\sigma{ q{A} \cdot k{B}}$$

and $q = Q v$, $k = K v$, $Q$ and $K$ are matrices that transform the embedding space to the space of questions and keys.

If we want to use embedding for retrival augmented generation (RAG), we can use the same approach.

OK, but since it is a training problem, how to get data. We can use the samew AI model for that,

In general, putting all data in a single prompt is vastly superior to using any vector similarity, or at least - provided the upper bound. Just it is impractical both for cost and time.

But we can use it to create training data, later used in PyTorch, TensorFlow or other frameworks.

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

## Recap

- Cosine similarity is NOT probability.
- Cosine similarity is contextual.

**PHOTO FROM Pythob Sunmit**

## From conf

- IDea: xkcd plot or excalidraw

[^1]: To the point that my Jupyter Notebook intro to deep learning is called [Thinking in tensors, writing in PyTorch](https://github.com/stared/thinking-in-tensors-writing-in-pytorch)

---

## NOTES

It is NOT a part of the blog post, just some editing context to see what was discussed on LinkedIn - to make sure I cover the most important points, and as the same time - write in a way that is accessible and interesting to this audience.

[LinkedIn post](https://www.linkedin.com/posts/piotrmigdal_llm-ai-activity-7271894516058509312-e489?utm_source=share&utm_medium=member_desktop)

This Wednesday, I'll be giving a technical talk on why one of the most common methods for finding similar items with AI is flawed—and how to address its limitations. At the very least, you'll learn why it's crucial to understand these limitations.

"Don't Use Cosine Similarity" at Python Summit

Here’s a tl;dr:

In most models, embeddings are byproducts. While they do reflect some similarities, there's no guarantee about the kind of similarity they prioritize.

For example, let’s say you want to find an answer to a question. You turn the question into a vector and search for similar vectors using cosine similarity. What do you get? Likely, you'll find similar questions instead. And if you’re lucky, they’ll match by topic—though they might also match by length, format, writing style, or even shared typos and grammatical errors.

A blog post on this topic is coming soon.

hashtag#llm hashtag#ai

George Deac • 2nd
2B or not 2B that is 0xFF
2d
I always thought that it also depends on the model training, cos sim is used because it's the least computationally intensive (being basically a Pearson correlation with the assumption that vectors are mean centered). Dot product, euclidean distance are not used because of the curse of dimensionality loss of information, and distribution aware transport metrics are too expensive.
2 Replies 2 Replies on George Deac’s comment
Piotr Migdał Author
Technical Lead in AI | ex-CTO of Quantum Flytrap | Open for Ambitious Challenges
21h
George Deac Cosine similarity is precisely a dot product, after rescaling (typically used once, rather than for each query). And (for unit vectors), it is equivalent to the Euclidean distance.

This correlation is often a hack, as it uses a different metric than the one on which the model was trained. Sure, similar things get close to each other, but not necessarily according to the same type of similarity we care about.
George Deac • 2nd
2B or not 2B that is 0xFF
9h
(edited)
Piotr Migdał exactly all three are linked, cos sim only accounts for the direction, euclidean norm for the magnitude and dot product combines both.

They are also purely geometric, unlike for example the Pearson correlation which is a cos sim centered around the assumption of a centered statistical variance field (which does not necessarily hold in the latent space).

There are also the newer correlation formulations that don't purely revolve around the classical assumption, the newer ones that extend the transport optimization theory. Maybe an optimized solution that can be integrated within deep models can be formulated from here, I've also been researching this recently.
Luís Felipe Oliveira de Melo • 3rd+
M.Sc. AI Engineer | Machine Learning | Deep Learning | Data Science | Data | PyTorch | ONNX | Computer Vision | C++ | Python
1d
(edited)
It depends solely on the model training. The model will convert to a subspace manifold that matches the metrics used as a loss function. If the adopted loss function somewhat induced a hyper spherical subspace that prioritizes similarity over one specific feature, then it's appropriate to adopt cosine similarity. Otherwise you're just counting into luck that the distributions of the feature target in training and desired feature retrieval are somewhat correlated.

At least that's why losses like Additive Margin Loss and similar ones were suggested in comparison to softmax and center loss
2 Replies 2 Replies on Luís Felipe Oliveira de Melo’s comment
Piotr Migdał Author
Technical Lead in AI | ex-CTO of Quantum Flytrap | Open for Ambitious Challenges
21h
Luís Felipe Oliveira de Melo There will be a blog post on that. But a short version is that: unless cosine sim is the training cost function AND the objective is precisely the same as ours, it is a hack.
Lukas Valatka • 2nd
Software Engineer - Data & Machine Learning
2d
Isn't it just fine if you pre-train on cosine similarity?
1 Reply 1 Comment on Lukas Valatka’s comment
Piotr Migdał Author
Technical Lead in AI | ex-CTO of Quantum Flytrap | Open for Ambitious Challenges
21h
Lukas Valatka If you train (or fine-tune) on cosine similarity according to the relevant cost function, then cosine similarity is perfect. And other quantities would be a hack. :)
Barid Temple • 3rd+
Scientific Data Consulting | Emergency Analytics | Scientific Research | Application Development
3h
I'm experimenting with GLiNER for label to label embeddings. These theoretically will better categorize my embeddings while remaining independent of word to word comparisons. The experiment defines heirarchal structures of thought process and objects meaning under separate contexts to provide a more human like search mechanism. I'm intending to be able to articulate missing context to be retrieved, or take suggestions as context alterations for peer to peer fine tuning. This allows me to take a very small model and greatly reduce hallucination while iteratively teaching my architecture to think.

Will be posting a demo.
The Nam Nguyen • 3rd+
Kaggle Competition Master | Machine Learning Engineer | Python, Pytorch, OpenCV | Computer Vision, NLP
7h
Personally, I think the problem does not lie in the similarity metrics, but rather what we expect the model to learn. Modern retrieval system just wants the model to output vectors so that we can use them to compare. If we want to hand craft those characteristics, of course we can. However it takes time and might lead to inconsistency.
Dominic A. W. • 3rd+
AI Engineer & Entrepreneur
15h
(edited)
What I would think is that it would be best if you make your embeddings more informative, especially in applications where exact search precision is highly required. If we have a decently sized dataset (that can allow for efficient cosine similarity computations) and the embeddings are quite informative enough to pick up on more semantic nuances in chunks), then I think we can accelerate performance.

I'd suggest that in order to do this, one could conduct extensive manual feature engineering on the dataset firstly, and then work our way up from there. The Data Science foundations of wrangling data never fails - especially in the case where model complexity of creating informative vectors for representing chunk embeddings would become an issue.

But I don't think nothing is wrong with Cosine Similarity- especially if the dataset is not that large enough. Just extensive feature enginnering on the dataset firstly and then, one can add more % of the search quality.
Whitchurch Muthumani • 3rd+
Co-founder ZEIOS AI | AI Developer Architect | Robotics Autonomous Systems -(GenAI/RPA/Reinforcement Learning /Robotics/Swarm Algorithms) at ASU
19h
(edited)
Nah man, I think it depends on the model used for embedding, certain models do a phenomenal job of embedding concepts in their vector spaces real well.

As for you example. Question type vectors will occupy a separate direction in the N-dimensional space.

Prompting is done to add context to the query, so that the whole context is used to fetch content rather than similar questions.

Point being I never encountered this problem ever.

Cosine similarity is very robust for semantic similarity cases. But yes the sophistication of the underlying embedding model is the key player to get benefits from Cosine similarity.

In this non-deterministic world of AI. Math is the one sure thing to rely on to bring order to the probabilistic chaos.

But sure, I am curious to see what new ideas you can show us. Look forward to that.
Maxim Popov • 3rd+
Computer Vision Researcher @MBZUAI
12h
(edited)
Netflix has already released its version of the blogpost in March, might be a good reference point to include what they have overlooked

arxiv org/abs/2403.05440
Mitch Haile • 3rd+
AI Beyond Language. 1 click custom AI models privately trained on your data with no data cleaning.
6h
Don't use cosine similarity, or ... use better embeddings? :-)
Dani Azzam • 3rd+
AI Engineer @ inmind.ai | Mechatronics, Robotics
10h
Interesting perspective, but I think the issue here isn’t really with cosine similarity, but with the embeddings being used. The focus should be on improving the quality and task-specific alignment of the embeddings. Fine-tuning the model or designing embeddings that prioritize the right features could solve this problem more effectively, right?
Sudhanshu Mishra • 2nd
Machine Learning Engineer | MLOps | IIT Kanpur
16h
Waiting for the video and blog. This seems really interesting
