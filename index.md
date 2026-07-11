---
---
<div class="container">
    <div class="hero">
        <h1>ToolsVault</h1>
        <p>Curated collection of developer tools and resources</p>
    </div>

    <section class="search-section">
        <div class="search-bar" role="search">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="tool-search" placeholder="Search tools..." aria-label="Search tools">
        </div>
        <div class="search-extra">
            <button type="button" id="random-tool" class="text-btn">&#127922; Random tool</button>
        </div>
    </section>

    <section class="filter-section" id="filter-section">
        <button class="filter-btn active" data-category="all">All</button>
        <button class="filter-btn" data-category="favorites" id="favorites-filter">Favorites <span class="fav-count" id="fav-count">0</span></button>
        {% assign categories = site.tools | map: 'category' | uniq | sort %}
        {% for category in categories %}
        <button class="filter-btn" data-category="{{ category | downcase | escape }}">{{ category }}</button>
        {% endfor %}
    </section>

    <div id="no-results" style="display:none;">
        <p>No tools match your search.</p>
    </div>

    <section id="favorites-view" class="category-section" style="display:none;">
        <div class="category-header">
            <h2>Favorites</h2>
            <span class="category-count" id="fav-total">0</span>
        </div>
        <div class="favorites-controls">
            <button type="button" id="clear-favorites" class="text-btn">Clear all favorites</button>
        </div>
        <div class="tools-grid" id="favorites-grid"></div>
    </section>

    {% assign categories = site.tools | map: 'category' | uniq | sort %}
    {% for category in categories %}
    <section class="category-section" data-category="{{ category | downcase | escape }}">
        <div class="category-header">
            <h2>{{ category }}</h2>
            <span class="category-count">{{ site.tools | where: 'category', category | size }}</span>
        </div>
        <div class="tools-grid">
            {% assign cat_tools = site.tools | where: 'category', category %}
            {% for tool in cat_tools %}
            <a href="{{ tool.url | relative_url }}" class="tool-card"
               data-title="{{ tool.title | escape | downcase }}"
               data-description="{{ tool.description | escape | downcase }}"
               data-tags="{{ tool.tags | join: ' ' | escape | downcase }}"
               data-category="{{ category | downcase | escape }}"
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
                <span class="btn-link">View details &rarr;</span>
            </a>
            {% endfor %}
        </div>
    </section>
    {% endfor %}
</div>
