---
title: "Quantum Flytrap: Shaping the Future of Quantum DevTools"
date: 2022-07-01
author: "Piotr Migdał (interviewed)"
source: "https://www.future-of-computing.com/quantum-flytrap-shaping-the-future-of-quantum-devtools/"
---

Quantum computing is currently at the same level of sophistication as using punched cards for normal computing—it's a tedious, manual process that still very much depends on your quantum hardware. But what if you could simply open up an editor and start developing quantum code—for any hardware, without losing performance?

People tend to underappreciate good interfaces, as the best ones feel so natural that they are invisible. But they matter as much as hardware and algorithms do. There is a reason people don't code websites in Assembly. Even the top AI researchers use deep learning frameworks like PyTorch, interactive environments like Jupyter Notebooks, or integrated development environments.

Following the same spirit, the Polish-Israeli startup Quantum Flytrap built the first no-code IDE for quantum algorithms. Founded by Piotr Migdał and Klem Jankiewicz in early 2020, it has raised a pre-seed round from SMOK Ventures and just started its first pilot project with the Paris-based quantum hardware manufacturer PASQAL.

## Why Did You Start Quantum Flytrap?

In 2019, Prof. Artur Ekert, a founder of quantum cryptography and now an advisor to Quantum Flytrap, invited us to the Centre for Quantum Technologies in Singapore. We developed Virtual Lab, an interactive, web-based simulation of photons, the elementary particles of light. It lets the user experiment with quantum phenomena like superposition, entanglement, measurement, or even quantum cryptography and quantum algorithms. To make it easy and engaging for education, we released it as a Quantum Game.

After this intense three-month hackathon-like project, Klem and I decided to continue working together, and we founded Quantum Flytrap. The goal was to go way beyond academic or educational projects—to make it easy to use quantum computing in business. Like Excel is the standard for accounting, we want to become the standard user interface for quantum computing.

## How Does Quantum DevTools Work?

Let's start with a few notes on quantum computing: The first quantum computers won't be universal, general-purpose computers but rather noisy intermediate-scale quantum processing units (QPUs) that can be used for optimization problems. To leverage the full speed-up that comes from specialized hardware, one needs to write low-level code for a concrete physical device.

Quantum algorithms can be expressed in an abstract, hardware-agnostic way using quantum circuits. However, as with any abstraction, it comes with an overhead. Each quantum device has different physical operations, some expressible as quantum gates, some not. Consequently, for early-stage quantum computers, and maybe for all quantum computers, all practical code will be written for a particular QPU architecture.

That's why it's important to have high-level programming tools that help you develop and test code easily, and that's why we are developing Quantum Flytrap: a no-code IDE for quantum algorithms. It allows users to write quantum code and simulate and debug it all visually on their local machine—simulating in real-time how the code would run on an actual quantum computer.

## How Did You Evaluate Your Startup Idea?

At first, we thought we could just go and build the IDE, but we soon realized that this would involve too many untested assumptions on the product-market fit. We needed to test it early on with companies interested in contracts for such solutions, not just freelancers or researchers.

That's why we focused on optimization problems for large enterprises, e.g., logistics, warehousing, or portfolio optimization. For Fortune 500 companies, a few percent improvements can lead to significant savings and billions in business value. We wanted to focus exclusively on B2B sales.

In the short term, we focus on quantum hardware manufacturers—to help with creating tools for internal development and facilitating the sales process. Even the most seasoned software engineers with PhDs in quantum physics benefit from time savings with quantum algorithm development.

We got a first project going with the quantum hardware manufacturer PASQAL, where we're testing our real-time simulation engine and user interface, and their internal team uses it to create working examples of quantum algorithms running on their hardware.
