---
layout: default
title: "Blog"
permalink: /blog/
description: "Articles, tips, and updates from the ToolsVault team."
---
<div class="blog-index container">
    <h1>Blog</h1>
    <p class="blog-intro">Articles, tips, and updates from the ToolsVault team.</p>
    <div class="post-list">
        {% assign posts = site.blog | sort: 'date' | reverse %}
        {% for post in posts %}
        <a href="{{ post.url | relative_url }}" class="post-card">
            <h2>{{ post.title }}</h2>
            <p class="blog-meta">{{ post.date | date: "%B %-d, %Y" }}{% if post.author %} &middot; {{ post.author }}{% endif %}</p>
            <p>{{ post.excerpt | strip_html | truncate: 160 }}</p>
        </a>
        {% endfor %}
    </div>
</div>
