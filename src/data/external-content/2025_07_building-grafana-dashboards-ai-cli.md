---
title: "Building Grafana dashboards with AI, CLI and a bit of pragmatism"
date: 2025-07-14
author: Piotr Migdał, Piotr Grabowski
source: https://quesma.com/blog/building-grafana-dashboards-ai-cli
---

Do you like Grafana dashboards? Me too!

Do you enjoy creating Grafana dashboards? Me neither.

## Dashboarding is a full time job

That beautiful, intuitive dashboard didn't just appear. It represents hours of thankless work. Grafana supports multiple data sources – SQL databases, APIs, PromQL – and provides numerous visualization panels. But with great power comes great complexity. What starts as a simple request turns into hunting for a needle in a data haystack, wrestling with dozens of potential data sources, misleading column names, and cryptic metrics. Is `user_metric_v2_final` the one you need, or was it `prod_user_metrics`?

Then, there is maintenance. Data frequently changes, queries break, panels go stale. A quick ChatGPT check reveals over 10,000 job listings explicitly asking for Grafana expertise.

Luckily, AI doesn't mind such chores. It's fast, tireless, and doesn't need a word of appreciation (well, aside from a few coins per million tokens). Dashboard-building sounds like the ideal job – for an AI, anyway.

## Grafana with AI

At Quesma, we decided to see if we could create a chart automatically. We wanted AI to do the dirty work: exploring and transforming data, and then creating the panels. Just as we started, we saw Grafana released its own AI assistant. However, it's currently a private preview and, more importantly, doesn't support self-hosted solutions – arguably the most common way Grafana is deployed.

We got inspiration from CLI tools like Claude Code that do things for you. In this case, rather than implementing a conversation, we went for a single-stage process. All you need is to specify connection credentials and, if you like, give a specific prompt.

In our demo, we work with OpenAQ air quality data, loaded into a local ClickHouse instance, a common SQL database for analytics. But this approach works for other data sources, local or remote.

It explores your data source column by column, analyzing the content to understand what's there. We don't give it any specific instructions beyond the initial prompt – the LLM does all the heavy lifting for us. Querying a lot of data, especially across many columns, can take time. The database is typically the bottleneck, not the LLM. We used o4-mini, which we found to be the most cost-effective for this task.

Then, it comes with a proposal of panels for your dashboard. All we need to do is to refresh our Grafana browser tab. Not only do we get our panels, but they are interactive in a typical Grafana way. Feel free to zoom in on interesting times or adjust time buckets as you wish.

## Lessons learned

### Safety of query execution

Running LLM-generated code (and yes, including SQL queries) is inherently a dangerous operation, so we need to reduce risk as much as possible. SQL injections are one thing, but with LLM-generated code all hell can break loose.

First, we make sure that our connection is read-only to prevent any destructive operations. Second, we need to ensure it won't consume too many resources. Production databases can be huge, and we don't have humans in the loop who would perform a sanity check. Good prompts, like good intentions, pave the road to hell. So, on top of that, there is a deterministic script checking if these conditions are met – for example, if there is always a `LIMIT` statement with a reasonable value, or if there is always a time filter.

### Don't use LLM when a function would do the job

Next is to know when to use LLMs and when we are fine without them. Engineers are prone to many temptations, but overengineering is a classic one. Goldberg machines are cool, fun to build, and mesmerizing to watch. Yet, they are certainly not the easiest solution, nor the fastest. Plus, debugging them is an art in itself, much like their construction.

Since we are working with LLMs, it is tempting to use them for everything. But we saw that certain queries work just as well with old-school deterministic functions. In particular, checking each column for its content – both sample entries and summary statistics. Functions just work, are predictable, and give coherent results. Don't use an LLM for a job a simple function can do. After all, an LLM is a powerful new hammer, but not everything is a nail.

### The maze of custom JSON formats

JSON, when used in APIs, is often (though certainly not always) clean, minimal, and somewhat documented. This is not true when it comes to JSON used for saving and loading. Very often it is poorly documented, without a schema file, with possible redundancies or deprecated features, just loaded, not even validated. It is also the case for (some) Grafana panels.

Asking even the newest LLM models (we used Gemini 2.5 Pro and o4-mini) to generate JSON for panels and keeping your fingers crossed just won't work. It will most likely produce an error, let alone present the data nicely as we wish. This is no surprise: LLMs have memorized the most common patterns in data, which often don't account for obscure, proprietary JSON formats.

So, we picked a different approach: we decided to stick to time series line charts and single metric panels. Then, we ask the LLM to create only what we actually need (e.g., an SQL query with specific markers for time), and we generate the actual JSON in an old-school way, using code.

We are happy to make this tradeoff, trading generality for simplicity. Sure, it does mean we won't be able to do everything. But we'd rather build fewer components in a controlled, repeatable way. A more structured approach leads to a higher success rate and makes validation easier. All in all, we want to create dozens of panels, so consistency is key.

We think that there is a sliding scale between allowing an LLM to decide everything and writing all the code by hand. Oftentimes, the best decision is to find the sweet spot in the middle: allow the LLM to handle what it's good at (like generating a query or picking a chart type), but not more.

## The future is (partially) automated

Let's be honest: building dashboards by hand is a job that's begging to be automated away. Our little experiment shows it's possible, but it also reveals a crucial truth: the future isn't about AI doing everything. It's about AI doing the boring things.

The magic isn't in asking an LLM to build a dashboard; it's in knowing when to let it drive and when to take the wheel. In our pipeline, we lead with simple queries to map the data landscape, then let the AI take over for the creative exploration and panel suggestions, while we handle the final step – generating clean, structured JSON with deterministic code.

Our next step is to expand this approach to more panel types and data sources. We're curious – how do you create your Grafana dashboards? By hand, with AI assistance, or a mix of both?
