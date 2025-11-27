---
title: "Two heads are better than one. How about more?"
date: 2014-01-30
author: "Piotr Migdał"
source: "https://egtheory.wordpress.com/2014/01/30/two-heads-are-better-than-one-how-about-more/"
---

I like hiking a lot, especially with a few good friends of mine. But when the scenery is wild, or when the weather conditions are harsh, it is not uncommon to lose trail, or at least – be in doubt whether we are going the right way. In these situations we discuss with each other, consulting as well a map and compass. And even if none of us is certain about the right path we need to take on an overgrown crossroad, we usually manage to reach the mountain hut as we planned.

A common wisdom says that *two heads are better than one*. In this article we will investigate empirical basis for this claim. Additionally, we will look at frameworks quantifying performance in simple tasks, trying to answer how does 'doing better' scale with the number of participants, and their skills.

Perhaps the best known instance were a group of people can do better than a single expert is the so-called wisdom of crowds. This is a scenario, where we can collect a big number of guesses. They may be with high variance, but once averaged sometimes the collective guess happens to be very close to the actual value. The classical example is estimation of weight of an ox, described by Francis Galton in 1907.

However, averaging does not always work. One numerical quantity that you can average for a meaningful result is not available in every problem. Moreover, in some areas the difference of skill and knowledge may be high among participants.

## Which one is bigger? (Perceptual tasks)

I want to concentrate on perceptual tasks, instead of guessing numerical values. Consider the Two-Alternatives Forced Choice (or 2AFC) paradigm with a pair of people collaborating to make the best binary decision.

Bahrami et al. gave participants two sets of Gabor patches. In one trial, one patch has a slightly different contrast that others. Participants were to choose which set had a different patch. Then they were allowed to communicate and make a joint decision.

The key thing here is to find the dyad (i.e. pair) performance as a function of individual performances. The theoretical result depends on the model we consider. Given the exact structure of the tasks, and assumptions on what participants can communicate, we can make claims on the optimal decision a pair can make.

## Two is a company, three is a crowd. (Generalizations and scaling)

In our paper, we generalize the models from a pair of interacting people to group of n people. Considering more strategies and arbitrary n reveals a neat form of the result. All considered strategies can be expressed in the following way:

s_group = c × n^α × (generalized mean of skills)

where α describes the scaling with respect to the number of participants, and β describes how well a group can use its more skilled members.

## Further remarks

Collective decision-making is an important and prevalent activity, working at various scales. In some sense you can look at democracy, as (an alleged) wisdom of crowds. However, it is unlikely that there is one universal result covering all types of intellectual collaboration.

A fascinating question is: how does performance scale in real-world situations? For example: having a group of n programmers unlikely make the progress n times faster. When it comes to the performance of scientific groups, it turns about that there is a strong benefit from collaboration.

And last not least, not only size matters. As with the perceptual task, collaboration technique is crucial, with the emphasis on communication. It has real-world implications – for example, when there are two programmers, they can work separately or do so-called pair-programming (working on a single computer). While initially the later may look as waste of resources, in many cases it turns out to be more efficient, for work and learning alike.

## References

- Migdał, P., Rączaszek-Leonardi, J., Denkiewicz, M., & Plewczynski, D. (2012). Information-Sharing and Aggregation Models for Interacting Minds. Journal of Mathematical Psychology, 56 (6), 417-426
- Bahrami, B., Olsen, K., Latham, P. E., Roepstorff, A., Rees, G., and Frith, C. D. 2010. "Optimally Interacting Minds." Science 329 (5995)
