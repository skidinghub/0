const dataUrl = "https://raw.githubusercontent.com/skidinghub/0/refs/heads/main/Scripts";

async function fetchData() {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        renderCodeBlocks(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Failed to load scripts. Please try again later.');
    }
}

function renderCodeBlocks(data) {
    const container = document.querySelector('.scripts-grid');
    if (!container) return;
    
    container.innerHTML = '';

    // Convert object to array and render scripts
    const scripts = Object.entries(data);
    
    scripts.forEach(([title, codeText], index) => {
        const block = document.createElement('div');
        block.className = 'code-block';
        block.setAttribute('data-title', title.toLowerCase());

        block.innerHTML = `
            <h2>${title}</h2>
            <pre><code><span class="string">${escapeHtml(codeText)}</span></code></pre>
            <button class="copy-button" onclick="copyCode(this)">Copy</button>
        `;

        container.appendChild(block);
    });
    
    // Add "More Coming Soon" message
    const comingSoon = document.createElement('div');
    comingSoon.className = 'coming-soon';
    comingSoon.textContent = 'More scripts coming soon...';
    container.appendChild(comingSoon);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function searchCode() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const codeBlocks = document.querySelectorAll('.code-block');
    const comingSoon = document.querySelector('.coming-soon');

    let visibleCount = 0;

    codeBlocks.forEach(block => {
        if (block.classList.contains('coming-soon')) return;
        
        const title = block.getAttribute('data-title');
        const codeElement = block.querySelector('code');
        const codeText = codeElement ? codeElement.textContent.toLowerCase() : '';
        
        const matches = title.includes(input) || codeText.includes(input);
        block.classList.toggle('hidden', !matches);
        
        if (matches) visibleCount++;
    });

    // Show/hide "More Coming Soon" based on search
    if (comingSoon) {
        comingSoon.classList.toggle('hidden', input.length > 0);
    }
}

function copyCode(button) {
    const codeElement = button.previousElementSibling.querySelector('code');
    const text = codeElement.textContent.trim();
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        button.textContent = 'Failed!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}

function showError(message) {
    const container = document.getElementById('codeContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; color: var(--text-tertiary); padding: var(--space-3xl);">
            <div style="font-size: var(--font-size-xl); margin-bottom: var(--space-md);">⚠️</div>
            <div>${message}</div>
        </div>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchData();
});
