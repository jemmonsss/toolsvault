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
            <input type="text" id="tool-search" placeholder="Search all tools..." aria-label="Search tools">
        </div>
        <div class="search-extra">
            <button type="button" id="random-tool" class="text-btn">&#127922; Random tool</button>
            <a href="/games/" class="text-btn">&#127918; Games</a>
            <a href="/blog/" class="text-btn">&#128197; Blog</a>
        </div>
    </section>

    <section class="filter-section" id="filter-section">
        <button class="filter-btn active" data-category="all">Featured</button>
        <button class="filter-btn" data-category="favorites" id="favorites-filter">Favorites <span class="fav-count" id="fav-count">0</span></button>
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

    {% assign featured_tools = site.tools | where: 'featured', true | sort: 'title' %}
    {% if featured_tools.size > 0 %}
    <section class="category-section" data-category="featured">
        <div class="category-header">
            <h2>Featured Tools</h2>
            <span class="category-count">{{ featured_tools.size }} tool{% if featured_tools.size != 1 %}s{% endif %}</span>
        </div>
        <div class="tools-grid">
            {% for tool in featured_tools %}
            <a href="{{ tool.url | relative_url }}" class="tool-card"
               data-title="{{ tool.title | escape | downcase }}"
               data-description="{{ tool.description | escape | downcase }}"
               data-tags="{{ tool.tags | join: ' ' | escape | downcase }}"
               data-category="{{ tool.category | downcase | escape }}"
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
    {% endif %}

    <section class="category-section" style="margin-top:3rem">
        <div class="category-header">
            <h2>Explore</h2>
        </div>
        <div class="tools-grid">
            <a href="/games/" class="tool-card" data-category="games">
                <div class="tool-header">
                    <h3>&#127918; Games</h3>
                </div>
                <div class="tool-description">Minecraft, Star Citizen, and game-specific utilities powered by live APIs.</div>
                <div class="tool-footer">
                    <div class="tool-tags">
                        <span class="tag">Minecraft</span>
                        <span class="tag">Star Citizen</span>
                        <span class="tag">Free To Play</span>
                    </div>
                </div>
                <span class="btn-link">Browse games &rarr;</span>
            </a>
            <a href="/blog/" class="tool-card" data-category="blog">
                <div class="tool-header">
                    <h3>&#128197; Blog</h3>
                </div>
                <div class="tool-description">Articles, updates, and guides from the ToolsVault team.</div>
                <div class="tool-footer">
                    <div class="tool-tags">
                        <span class="tag">News</span>
                        <span class="tag">Guides</span>
                        <span class="tag">Updates</span>
                    </div>
                </div>
                <span class="btn-link">Read blog &rarr;</span>
            </a>
            <a href="/about/" class="tool-card" data-category="about">
                <div class="tool-header">
                    <h3>&#128100; About</h3>
                </div>
                <div class="tool-description">Learn more about ToolsVault, the project, and the team behind it.</div>
                <div class="tool-footer">
                    <div class="tool-tags">
                        <span class="tag">Info</span>
                        <span class="tag">Project</span>
                    </div>
                </div>
                <span class="btn-link">Learn more &rarr;</span>
            </a>
        </div>
    </section>
</div>
