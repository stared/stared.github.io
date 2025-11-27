---
title: "Sandboxing AI-Generated Code: Why We Moved from WebR to AWS Lambda"
date: 2025-08-07
author: Piotr Migdał, Przemysław Hejman
source: https://quesma.com/blog/sandboxing-ai-generated-code-why-we-moved-from-webr-to-aws-lambda
---

Where should you run LLM-generated code to ensure it's both safe and scalable? And why did we move from a cool in-browser WebAssembly approach to boring, yet reliable, cloud computing? Our AI chart generator taught us that running R in the browser with WebR, while promising, created practical issues with user experience and our development workflow. Moving the code execution to AWS Lambda proved to be a more robust solution.

## A bit of context

We develop Quesma Charts – a tool that generates plots from a simple CSV and a text prompt. We use the wonderful ggplot2 library to create the initial chart, which users can then tweak directly in their browser. In our recent blog post, Which chart would you swipe right?, we compare some of our charts with ones from academic papers, The Economist, and Reddit r/dataisbeautiful.

Major AI tools like ChatGPT, Google AI Studio, and Julius default to matplotlib, the standard Python plotting library. While the resulting charts are technically correct, they often have a distinct "data scientist" look. We aim slightly higher - for the visual polish of a keynote speech or the Financial Times publication. While in principle any tool could do the job, ggplot2 hits the sweet spot. Its "grammar of graphics" allows us to concisely describe and style a wide range of charts. It provides the right abstractions and tools. For instance, creating non-overlapping labels – a basic requirement for any professional chart – is a one-liner. In matplotlib, it is anything but straightforward. This all requires one pesky step: running R code, both for the initial AI generation and for subsequent user edits.

## Running AI-generated code

Running untrusted code is always a security risk. Even a small injection can have unwanted effects. With Large Language Models, the risk is amplified, as the generated code could, in principle, be anything.

A direct risk is malicious code. This can stem from deliberate prompt engineering, accidental exploits (see the "evil vector"), or even random chance. More realistically, code can simply eat up resources. A single query might download a massive dataset, killing bandwidth. An infinite loop can freeze everything up. Even sensible, compute-intensive tasks can create scaling bottlenecks. With large data sources, a complex but legitimate query can run for an unacceptably long time. No bad intentions needed – just pure inefficiency.

We knew we needed to sandbox the code. So, we decided to outsource the risk to the user by running the chart rendering logic in their browser using WebAssembly. This approach had three appealing benefits. First, it scales organically at no cost to us. Second, if a process is inefficient, the user can simply close the tab – a built-in "human-in-the-loop" safeguard. Third, if a user has malicious intentions, the joke's on them.

## R in the Browser

We were thrilled to discover WebR, which runs R directly in the browser. We were even happier to find it supports a large collection of libraries – not just ggplot2 and the tidyverse, but also niche yet crucial packages like ggrepel for non-overlapping labels.

It took some time to set everything up, but it wasn't overly difficult. And the most important part: it worked! Performance was often comparable to running R locally, as noted in these benchmarks. We even built a non-AI demo of WebR with ggplot2 so you can play with it without any setup (and see some of the issues).

Running R in WebAssembly is cool. WebR works nicely. So, where's the catch?

## The devil's in the details

### Dependency friction

While WebR offers an impressively large collection of packages, it isn't exhaustive. For a hobby project, a missing package might be a minor inconvenience. For a professional product like ours, however, this gap between "almost everything" and "everything" is the uncanny valley.

R's dependency management also created headaches. Pinning a package to a specific version, a standard practice for reliable software, isn't built-in. It requires using the remote package - a workaround that simply didn't function in WebR.

By default, WebR serves dependencies from its own CDN. To make fetching more efficient and predictable, we decided to host these packages ourselves. This required us to mirror them to an S3 bucket and serve them through a CloudFront distribution.

While none of these dependency issues were a showstopper on their own, they added a layer of friction that contributed to our decision.

### Size matters

The power of WebR comes at a price. The base library alone is 12MB. Adding the tidyverse (for ggplot2 and data processing tools) brings the total to 92MB. A lighter setup with just ggplot2, dplyr, and ggrepel was still a hefty 39MB.

On a fast connection, this causes a slight delay. On a slow one, the site can become unusable. A few seconds of waiting hurts the user experience; much more, and the app is simply too slow to provide value.

We learned this the hard way at the Data Council 2025 conference. As is typical at conferences, the WiFi was choked by hundreds of data-hungry devices, making even simple websites a challenge to load. We were wise enough to have a recorded screencast for our demo, but attendees couldn't try the app on their own devices.

### Workflow complexity

In the simplest use case, the backend serves the LLM while the frontend handles all user input, computation, and output.

But a real application needs to save results. So after executing the code, we save the generated chart image to S3. This introduces a new layer of complexity: charts now come from two sources – newly rendered in WASM or loaded from cloud storage.

As with most AI code generation, a single pass is often not enough. The code might have errors and need to be rerun. This complicates the pipeline, requiring a lot of back-and-forth calls between the frontend and backend.

If we wanted to analyze the generated chart on the backend, we would have to send even more data over the network.

Furthermore, it's often beneficial for the LLM to investigate the data before generating a chart. Some visualizations can't be created in a single step; they require an initial query to understand the data's structure before deciding on the best way to display it. For an agentic AI system, this complex data flow becomes a major bottleneck.

## Embracing a boring, yet reliable, solution

So, we scrapped our cool WebAssembly experiment for a boring one: running our R code on AWS Lambda. Moving the rendering logic to the backend felt less innovative, but it immediately solved our biggest headaches: dependencies, performance, and data flow complexity.

### Untangling the data flow

Instead of the complex dance between a WASM-powered frontend and our backend, now all the heavy lifting happens server-side.

The flow is simple:

- The user sends a prompt and data to the backend.
- An LLM generates the R code.
- A Lambda function runs the code in a Docker environment. This step can be repeated to fix errors, explore the data, and improve the chart.
- The final chart is saved to S3, and the backend updates the app with the new image.

The biggest win was a dramatically lighter, simpler frontend. It no longer had to manage code execution or complex data flows. Its only job was to display the final chart.

### Controlling the environment with Docker

The "uncanny valley" of almost-complete WebR packages was our first problem we had to solve. With Lambda, we could build our own perfect execution environment using Docker. We created a container image with our specific version of R, bundling all the necessary dependencies. This eliminated version conflicts and the need for users to download a large package bundle to get started. The result was a consistent and predictable environment, where we could pin specific versions of R, its libraries, and even system fonts.

### Lambda for security and stability

Moving code execution to our servers meant we had to build the sandbox we'd previously avoided. We could no longer rely on a user closing their browser tab to stop a misbehaving script.

We tackled security on two fronts: network isolation and resource limits.

First, we isolated the code's execution environment. Our Lambda functions run inside a Virtual Private Cloud (VPC) with no access to the public internet. This VPC uses a private endpoint to connect to our S3 bucket, keeping our data off the public web and eliminating a whole class of network-based threats.

Second, we guarded against inefficient code. To prevent runaway processes from hogging resources, we implemented a simple but effective guardrail: a hard 30-second timeout. Since an average chart takes about 10 seconds to generate, this gives legitimate queries a generous buffer while stopping any single process from running indefinitely.

### The dev experience and a costly quirk

While the AWS Lambda Go SDK made API integration straightforward, we found that local development and testing presented its own set of challenges. We evaluated tools like the AWS SAM CLI that aim to replicate the cloud environment locally, but they often required a difficult setup and didn't perfectly match the production environment.

To boost developer productivity, we adopted a different approach: we run the main web service locally but connect to a shared Lambda function running in a dedicated AWS development environment for all testing.

This journey also introduced us to a classic cloud quirk. On AWS Lambda, CPU power is directly linked to memory allocation – to get more CPU, you must provision more RAM. Our R code is CPU-bound, not memory-bound. To get the processing power we needed, we had to provision 2048MB of RAM, even though our process never actually uses more than 205MB. This is a crucial reminder of how cloud pricing models can be counterintuitive, forcing you to pay for resources you don't use.

## Conclusion: it's all about UX & the data flow

For a simple, open-source project, WASM might actually work, as it strips away a core dependency and offers a plug-and-play experience, without the hassle of setting up a server - see our WebR ggplot demo.

If you are happy with keeping your context engineering in the frontend, it might be a good fit - and a lot of things are moving in that direction - see Mozilla's recent post, Wasm-agents: AI agents running in your browser.

WebAssembly is a powerful solution and has clear use cases. One of the author's other projects, Virtual Lab by Quantum Flytrap, runs its core quantum mechanics simulations in the browser using high-performance, lightweight Rust code compiled to WASM. It is scalable – if a major university or learning platform uses it, it works no matter how many users there are. In that case, where real-time experience is key, sending data to a backend for simulation would have been a major bottleneck. But critically, at no point in the code execution do we need back-and-forth communication with a backend.

The case of chart generation was different. The bottlenecks were different, the data flow was different, and so, not surprisingly, a different solution was needed.
