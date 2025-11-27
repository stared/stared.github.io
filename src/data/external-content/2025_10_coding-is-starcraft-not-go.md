---
title: "AI for coding is still playing Go, not StarCraft"
date: 2025-10-14
author: Piotr Migdał
source: https://quesma.com/blog/coding-is-starcraft-not-go
---

AI gets smarter and smarter at programming. Claude Code shines at creating projects from scratch, and OpenAI achieved gold medal-level performance at the 2025 International Olympiad in Informatics. But LLMs still struggle with ordinary projects in large codebases – let alone distributed systems on real infrastructure.

Let's explore why, draw lessons from two triumphs of AI in gaming – AlphaGo and AlphaStar – and define the next step for creating AI that can handle real, complex software systems.

The day-to-day work of software engineering has much more in common with a complex, fast-paced strategy game like StarCraft 2 than with the clean, minimalistic games of Chess or Go. Especially when there are multiple outages and we need to solve them in real time on production.

So, what does playing StarCraft 2 have to do with software engineering?

## Two axes of difficulty

There are two axes of difficulty, that can be summarized as smart vs knowledgeable, or theory vs practice.

For a computer science student, programming is about algorithms, data structures, complexity classes, and paradigms – essentially a branch of mathematics. Problems might be clever but can be solved with a pen and paper.

For a software engineer, it's about dealing with mess: buggy code, mismatched library versions, outdated documentation, merge conflicts, and systems that fail for no apparent reason, all while a critical cloud service is down. Solving it takes a lot of experience, knowledge, intuition – and more often than not, collaboration with others.

Most of real-world programming's difficulty lies in this complex, tedious part. This applies even to the most advanced systems. When AI itself has an outage, it's not due to lack of intelligence, but rather its underlying infrastructure.

Recently, we created CompileBench, a benchmark for compiling real open-source projects – a glimpse into the complexity of build systems.

In this post, we push further, exploring what is needed to benchmark AI for distributed systems. Let's compare the state of AI for software development with AI for strategy games to see what we need to move forward.

## Which is harder: Go or StarCraft 2?

Games are invaluable for training AI models. Recently, OpenAI reportedly offered $500M to buy video gameplays. But their history is even more impressive, as reinforcement learning has achieved feats previously thought impossible.

StarCraft 2 is a real-time strategy game set in space. It demands multitasking: gathering minerals, building bases, constructing units, scouting, attacking, defending, and upgrading. While ambitious, it's not traditionally considered as intellectually deep as Go (the game, not the programming language). Yet, while AlphaGo beat Lee Sedol in 2016, it wasn't until 2019 that AlphaStar could compete at the Grandmaster level in StarCraft 2, beating a Polish Protoss player MaNa.

Why did a popular multiplayer video game turn out to be more difficult for AI? And what does this have to do with software engineering?

In Go, the board is a 19x19 grid, where each space is either empty or holds a black or white stone. The rules are simple – you could code them in your favorite programming language. In StarCraft 2, the configuration space is vastly larger – hundreds of units can move across the map in continuous space. The rules are complicated and nuanced – to run it, you need Blizzard's engine.

Moreover, Go is a game of perfect information – you see the entire state of the board. StarCraft 2 is a game of imperfect information. The "fog of war" hides parts of the map that aren't in the sight range of your scouts. Much of the game is about game theory, anticipating your opponent's moves, and navigating "rock-paper-scissors" unit counters. So, instead of optimizing for a single, known scenario, the AI must constantly weigh all plausible scenarios, assign them probabilities, and execute a strategy that works best on average.

StarCraft 2 isn't smarter than Go – it's just vastly more complex.

> There is so much to manage, there are so many different fights going on, there are so many little decisions you have to constantly make based on the information you have gathered — LowkoTV, a StarCraft 2 commentator

## AI in software engineering

When it comes to software engineering, we are slowly approaching the AlphaGo level – see the already mentioned reports of gold medal-level performance at the 2025 International Olympiad in Informatics. AI can now tackle small, isolated, and well-defined programming problems at the level of the smartest humans.

At the same time, we are nowhere near the AlphaStar level in coding. Even in deterministic scenarios, AI tools are of limited use in large codebases. There is a broad consensus that they all work better for smaller, newer projects. A recent study, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity, found in a randomized controlled trial that while developers felt more productive using AI, they actually took more time to complete tasks.

This doesn't mean AI is useless for large codebases – in certain cases, it can be immensely useful. But it is not yet the universal tool it aspires to be. It's like early language models used for autocorrect, helping you only if you already know how to write and which suggestions to accept.

And this is before we even consider the "fog of war". Real-world systems are even more complicated. When you get a long series of errors that an API is down, it might be because your server is overloaded, the cloud provider is having an outage, or one of a thousand other reasons. Many bugs are hard to find or reproduce as they depend on external states – other libraries, API calls, or server statuses. In the context of software, this is called observability — logs, metrics, and traces, often collected with OpenTelemetry, with dashboards visualized in Grafana. We need to infer the internal state from byproducts.

## A call for sandboxes, evals, and benchmarks

If we want to create AI that deals with complex, distributed, non-deterministic systems, we need a proper environment for learning and evaluation.

Testing **small programming problems** is simple: write a program, run it, check for compilation errors, and see if the result matches expectations. Since LLMs can be used to both solve and create problems, we have a virtuous cycle.

Testing **larger projects** is more complicated. We often can't just use a pure LLM, as the full project won't fit in the context window. This requires agentic AI with tool-calling capabilities, which is why it's such a hot topic.

Testing **large, distributed systems** has more challenges, as we cannot measure everything directly; we need to infer from observability tools — logs, metrics and traces. More often than not, not only is the code too large to feed to our LLM, but even the logs themselves need to be queried wisely. A minimal system would require a few services communicating with each other, a database, and a realistic workload. All of that needs to be investigated and solved in production.

If no one else picks up this gauntlet, we will.

Being able to deal with such systems goes far beyond programming itself. Most complex real-world challenges – from management to healthcare to biology – have little to do with short mathematical proofs and everything to do with complexity, distributed systems, and imperfect information.

> Your life is Tetris. Stop playing it like chess. – Tor Bair

Programming is StarCraft 2. Stop playing it like Go.
