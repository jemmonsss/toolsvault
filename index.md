---
permalink: /
title: "ToolsVault"
description: "A curated vault of developer tools and resources"
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
            <a href="/tools/" class="text-btn">&#128269; Browse all tools</a>
            <a href="/games/" class="text-btn">&#127918; Games</a>
            <a href="/blog/" class="text-btn">&#128197; Blog</a>
        </div>
    </section>

    <section class="category-section" style="margin-top:3rem">
        <div class="category-header">
            <h2>Explore</h2>
        </div>
        <div class="tools-grid">
            <a href="/tools/" class="tool-card" data-category="tools">
                <div class="tool-header">
                    <h3>&#128269; All Tools</h3>
                </div>
                <div class="tool-description">Browse all developer tools organized by category.</div>
                <div class="tool-footer">
                    <div class="tool-tags">
                        <span class="tag">Converters</span>
                        <span class="tag">Generators</span>
                        <span class="tag">Security</span>
                        <span class="tag">Web & Dev</span>
                    </div>
                </div>
                <span class="btn-link">Browse tools &rarr;</span>
            </a>
            <a href="/games/" class="tool-card" data-category="games">
                <div class="tool-header">
                    <h3>&#127918; Games</h3>
                </div>
                <div class="tool-description">Minecraft, Star Citizen, FiveM, and game-specific utilities powered by live APIs.</div>
                <div class="tool-footer">
                    <div class="tool-tags">
                        <span class="tag">Minecraft</span>
                        <span class="tag">Star Citizen</span>
                        <span class="tag">FiveM</span>
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
<script>
document.getElementById('tool-search')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        var q = this.value.trim();
        if (q) window.location.href = '/tools/';
    }
});
</script>
