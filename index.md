---
---
<div class="hero">
    <h1>ToolsVault</h1>
    <p>Curated collection of developer tools and resources</p>
</div>

<section class="search-section">
    <div class="search-bar">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="tool-search" placeholder="Search tools...">
    </div>
</section>

<section class="filter-section" id="filter-section">
    <button class="filter-btn active" data-tag="all">All</button>
    {% for tool in site.tools %}
        {% for tag in tool.tags %}
        <button class="filter-btn" data-tag="{{ tag | strip }}">{{ tag | strip }}</button>
        {% endfor %}
    {% endfor %}
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const filterSection = document.getElementById('filter-section');
    const seen = new Set(['all']);
    const buttons = filterSection.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        const tag = btn.dataset.tag;
        if (seen.has(tag)) {
            btn.remove();
        } else {
            seen.add(tag);
        }
    });
});
</script>

<section class="tools-grid">
    {% for tool in site.tools %}
    <a href="{{ tool.url | relative_url }}" class="tool-card">
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
</section>

<div id="no-results" style="display:none;">
    <p>No tools match your search.</p>
</div>
