---
layout: default
title: "Games"
permalink: /games/
description: "Game-specific tools, including Minecraft, Star Citizen, and more."
---

<div class="container">
    <div class="hero">
        <h1>Games</h1>
        <p>Tools and utilities for your favorite games</p>
    </div>

    <div class="disclaimer" role="note">
        <strong>Not affiliated:</strong> ToolsVault is an independent project and is not affiliated with, endorsed by, or sponsored by Mojang, Microsoft, Minecraft, Star Citizen, Cloud Imperium Games, FiveM, Rockstar Games, or any other company whose games or services these tools interact with. All trademarks and game assets belong to their respective owners.
    </div>

    <section class="filter-section" id="filter-section">
        <button class="filter-btn active" data-category="all">All Games</button>
        {% assign game_categories = "Minecraft,Star Citizen,Games,FiveM" | split: ',' %}
        {% comment %} Games category lists playable retro games {% endcomment %}
        {% for cat in game_categories %}
        {% assign cat_tools = site.tools | where: 'category', cat %}
        {% if cat_tools.size > 0 %}
        <button class="filter-btn" data-category="{{ cat | downcase | escape }}">{{ cat }}</button>
        {% endif %}
        {% endfor %}
    </section>

    {% assign game_categories = "Minecraft,Star Citizen,Games,FiveM" | split: ',' %}
    {% for cat in game_categories %}
    {% assign cat_tools = site.tools | where: 'category', cat | sort: 'title' %}
    {% if cat_tools.size > 0 %}
    <section class="category-section" data-category="{{ cat | downcase | escape }}" style="margin-top:2rem">
        <div class="category-header">
            <h2>{{ cat }}</h2>
            <span class="category-count">{{ cat_tools.size }} tool{% if cat_tools.size != 1 %}s{% endif %}</span>
        </div>
        <div class="tools-grid">
            {% for tool in cat_tools %}
            <a href="{{ tool.url | relative_url }}" class="tool-card"
               data-title="{{ tool.title | escape | downcase }}"
               data-description="{{ tool.description | escape | downcase }}"
               data-tags="{{ tool.tags | join: ' ' | escape | downcase }}"
               data-category="{{ cat | downcase | escape }}"
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
                <span class="btn-link">Open tool &rarr;</span>
            </a>
            {% endfor %}
        </div>
    </section>
    {% endif %}
    {% endfor %}
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var filterBtns = document.querySelectorAll('#filter-section .filter-btn');
    var sections = document.querySelectorAll('.category-section');
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var cat = btn.getAttribute('data-category');
            sections.forEach(function(sec) {
                if (cat === 'all') {
                    sec.style.display = '';
                } else {
                    sec.style.display = sec.getAttribute('data-category') === cat ? '' : 'none';
                }
            });
            var cards = document.querySelectorAll('.tools-grid .tool-card');
            cards.forEach(function(card) {
                if (cat === 'all') {
                    card.style.display = '';
                } else {
                    card.style.display = card.getAttribute('data-category') === cat ? '' : 'none';
                }
            });
        });
    });
});
</script>
