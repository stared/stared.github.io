---
title: "Quantum logic gates for a single qubit, interactively"
date: 2021-04-10
author: Piotr Migdał
source: https://quantumflytrap.com/blog/2021/qubit-interactively/
---

Quantum computers use quantum physics to perform computation. They use phenomena such as superposition and entanglement that make it possible to use more powerful algorithms than in classical computing. In classical computing, we use the electric signal as the carrier of information. In quantum, we use various implementations, including the polarization of light, the spin of ions, and the states of superconductors.

## Qubit

In classical computing, the basic unit is a bit - 0 or 1. In quantum computing, the basic unit is a qubit. Instead of just two values, we have a vector with two components. In this article, we explore what a single qubit is, and what are the quantum computing operations.

In general, a qubit can be any superposition of |0⟩ and |1⟩ - that is |ψ⟩ = α|0⟩ + β|1⟩ where α and β are complex numbers, that is numbers z = x + iy, were x and y are real numbers and i is an imaginary unit i²=-1.

Here are a few common states:
- |+⟩ = (|0⟩+|1⟩)/√2
- |-⟩ = (|0⟩-|1⟩)/√2
- |↺⟩ = (|0⟩+i|1⟩)/√2
- |↻⟩ = (|0⟩-i|1⟩)/√2

If complex numbers are new to you - don't worry. First, many interesting quantum states, operators, and phenomena can be described without complex numbers. Second, complex numbers are important and fun on their own.

## Operations on a qubit

Instead of classic logic gates, we use quantum logic gates. How do they work? These are 2×2 matrices, changing the state via matrix-vector multiplication: |ψ_new⟩ = M |ψ⟩

## Quantum gates

Only identity (I) and negation (X) are the same in classical and quantum computing. All other gates are specific to quantum computing. For example, Hadamard gate (H), while having only real numbers, is enough to show the difference between |+⟩ and |-⟩ states. Another interesting gate is the square root of negation (√X or √NOT). If we apply it twice, we get a negation.

Common gates include:
- I (Id, identity)
- X (Pauli-X, NOT)
- Y (Pauli-Y)
- Z (Pauli-Z, 1/2 phase shift)
- H (Hadamard gate)
- S (1/4 phase shift)
- T (1/8 phase shift)
- √X (square root of NOT)

## Quantum circuits

Quantum gates can be composed. In a conventional matrix notation, we read from right to left. That is, X H Z |0⟩ means that we start with state |0⟩, then apply Z gate, then H, then X. It is a historic notation that is going to stay here.

A general parametrization of a qubit state is:
|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩

If you want to avoid complex values, use φ=0 (for positive values) or φ=π (for negative values).

We use colors to denote phase of complex numbers (domain coloring).

This post is a part of the quantum computing series by Quantum Flytrap. This article uses:
- Quantum Tensors library for computing quantum operations (supported by the Centre for Quantum Technologies, National University of Singapore)
- BraKetVue for quantum state and operator visualization (supported by the Unitary Fund)

These libraries are open source (MIT), as well as this post (CC-BY).
