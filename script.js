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

    for (const [title, codeText] of Object.entries(data)) {
        const block = document.createElement('div');
        block.className = 'code-block';
        block.setAttribute('data-title', title.toLowerCase());

        block.innerHTML = `
            <h2>${title}</h2>
            <pre><code><span class="string">${escapeHtml(codeText)}</span></code></pre>
            <button class="copy-button" onclick="copyCode(this)">Copy</button>
        `;

        container.appendChild(block);
    }
    
    // Add scroll hint if there are many scripts
    if (Object.keys(data).length > 3) {
        addScrollHint();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function searchCode() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const codeBlocks = document.querySelectorAll('.code-block');

    codeBlocks.forEach(block => {
        const title = block.getAttribute('data-title');
        const codeElement = block.querySelector('code');
        const codeText = codeElement ? codeElement.textContent.toLowerCase() : '';
        
        const matches = title.includes(input) || codeText.includes(input);
        block.classList.toggle('hidden', !matches);
    });
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

function addScrollHint() {
    if (document.querySelector('.scroll-hint')) return;
    
    const hint = document.createElement('div');
    hint.className = 'scroll-hint';
    hint.textContent = '← Scroll →';
    hint.onclick = () => {
        document.getElementById('codeContainer').scrollBy({ left: 300, behavior: 'smooth' });
    };
    
    document.body.appendChild(hint);
    
    // Remove hint after 10 seconds
    setTimeout(() => {
        if (hint.parentNode) {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 500);
        }
    }, 10000);
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
    
    // Add keyboard navigation for horizontal scrolling
    document.addEventListener('keydown', function(e) {
        const container = document.getElementById('codeContainer');
        if (!container) return;
        
        if (e.key === 'ArrowLeft') {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        }
    });
    
    // Add touch/swipe support for mobile
    let startX = 0;
    const container = document.getElementById('codeContainer');
    
    if (container) {
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!startX) return;
            
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (Math.abs(diff) > 50) {
                container.scrollBy({ left: diff * 2, behavior: 'smooth' });
                startX = currentX;
            }
        });
        
        container.addEventListener('touchend', () => {
            startX = 0;
        });
    }
});
