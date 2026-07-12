---
layout: default
title: "Games"
permalink: /games/
description: "Game tools, puzzles, and fun utilities."
---

<div class="container">
    <div class="hero">
        <h1>Games</h1>
        <p>Interactive game tools, puzzles, and fun utilities</p>
    </div>

    <section class="filter-section" id="filter-section">
        <button class="filter-btn active" data-category="all">All Games</button>
        {% assign categories = site.tools | where: 'category', 'Games' | map: 'tags' | join: ' ' | split: ' ' | uniq | sort %}
        {% assign game_tags = categories %}
        {% for tag in game_tags %}
        <button class="filter-btn" data-category="{{ tag | downcase | escape }}">{{ tag }}</button>
        {% endfor %}
    </section>

    {% assign game_tools = site.tools | where: 'category', 'Games' | sort: 'title' %}
    {% if game_tools.size > 0 %}
    <div class="tools-grid">
        {% for tool in game_tools %}
        <a href="{{ tool.url | relative_url }}" class="tool-card"
           data-title="{{ tool.title | escape | downcase }}"
           data-description="{{ tool.description | escape | downcase }}"
           data-tags="{{ tool.tags | join: ' ' | escape | downcase }}"
           data-category="games"
           data-fav="{{ tool.url | relative_url }}">
            <button class="fav-btn" type="button" aria-label="Toggle favorite" data-fav="{{ tool.url | relative_url }}">&#9825;</button>
            <div class="tool-header">
                <h3>{{ tool.title }}</h3>
                {% if tool.icon %}<span class="tool-icon">{{ tool.icon }}</span>{% endif %}
            </div>
            <div class="tool-description">{{ tool.description }}</div>
            <div class="tool-footer">
                <div class="tool-tags">
                    {% for tag in tool.tags %}
                    <span class="tag">{{ tag }}</span>
                    {% endfor %}
                </div>
            </div>
            <span class="btn-link">Play &rarr;</span>
        </a>
        {% endfor %}
    </div>
    {% else %}
    <div id="no-results" style="display:block;">
        <p>No game tools yet. Check back soon!</p>
    </div>
    {% endif %}
</div>
