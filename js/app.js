document.addEventListener('DOMContentLoaded', () => {
    const inputs = {
        attackerIp: document.getElementById('attacker-ip'),
        victimIp: document.getElementById('victim-ip'),
        port: document.getElementById('port'),
        domain: document.getElementById('domain'),
        wordlist: document.getElementById('wordlist')
    };
    const defaults = Object.fromEntries(Object.values(inputs).map(input => [input.id, input.value]));
    const commandContainer = document.getElementById('command-container');
    const navigation = document.getElementById('navigation');
    const searchInput = document.getElementById('snippet-search');
    const pageTitle = document.getElementById('page-title');
    const resetButton = document.getElementById('reset-inputs');
    const tagFilters = document.getElementById('tag-filters');
    const phaseFilters = document.getElementById('phase-filters');
    const customForm = document.getElementById('custom-snippet-form');
    const linksView = document.getElementById('links-view');
    const portfolioView = document.getElementById('portfolio-view');
    const bootLogText = document.getElementById('boot-log-text');
    const toolRow = document.querySelector('.tool-row');
    const hero = document.querySelector('.hero');
    const paramsPanel = document.querySelector('.params-panel');
    const searchWrap = document.querySelector('.search-wrap');
    const brand = document.querySelector('.brand');
    const navToggle = document.getElementById('nav-toggle');
    const tags = ['All', 'Linux', 'Windows', 'AD', 'Web', 'PrivEsc'];
    let activeCategory = 'All';
    let activeTag = 'All';
    let activePhase = 'All';
    let customSnippets = loadCustomSnippets();
    const bootSets = [
        [
            '> mount /dev/operator -- OK',
            '> decrypt dossier.enc -- OK',
            '> resolve identity -- OK',
            '> handshake established --',
            '> READY.'
        ],
        [
            'IP=10.10.10.10; HOST=$(nmap -Pn -p445 --script smb-os-discovery "$IP" | awk -F\': \' \'/FQDN/{print tolower($2); exit} /Computer name/{h=tolower($2)} /Domain name/{d=tolower($2)} END{if(h!="") print d!="" ? h"."d : h}\'); echo "$IP $HOST" | sudo tee -a /etc/hosts; sudo ntpdate -u "$IP"',
            'nmap -Pn -sC -sV -oN nmap_$HOST.txt "$IP"',
            'Ready.'
        ],
        [
            'sudo apt update && sudo apt -y full-upgrade',
            'sudo apt install -y rustscan seclists ffuf bloodhound rlwrap ligolo-mp',
            'sudo apt autoremove -y',
            'Ready'
        ],
        [
            'ffuf -u http://$VictimIP:$Port/FUZZ -w $Wordlist -t 40',
            'ffuf -u http://$VictimIP:$Port -H "Host: FUZZ.$Domain" -w $Wordlist -fs SIZE',
            'ffuf -u http://$VictimIP:$Port/FUZZ -w $Wordlist -e .php,.txt,.html',
            'Ready'
        ],
        [
            'git clone https://github.com/stealthsploit/OneRuleToRuleThemStill.git',
            'cd OneRuleToRuleThemStill',
            'hashcat -m [hash_type] -a 0 -r rules/OneRuleToRuleThemStill.rule [hash_file.txt] [wordlist.txt]',
            'Ready'
        ]
    ];

    const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
    const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    function inferTags(mainCategory, section, cmd) {
        const text = `${mainCategory} ${section.category} ${cmd.title} ${cmd.description} ${cmd.template}`.toLowerCase();
        const found = [];
        if (/linux|bash|sudo|suid|linpeas|cron|\/etc|\/home|\/var|wget|chmod/.test(text)) found.push('Linux');
        if (/windows|powershell|cmd|wmic|registry|winpeas|powerup|certutil/.test(text)) found.push('Windows');
        if (/ad |domain|kerberoast|as-rep|bloodhound|dcsync|smb|nxc|ldap|secretsdump/.test(text)) found.push('AD');
        if (/web|http|https|gobuster|ferox|ffuf|nikto|whatweb|curl/.test(text)) found.push('Web');
        if (/privesc|sudo|suid|capabilities|linpeas|cron|whoami \/all|alwaysinstallelevated/.test(text)) found.push('PrivEsc');
        return found.length ? found : ['Linux'];
    }

    function loadCustomSnippets() {
        try {
            return JSON.parse(localStorage.getItem('custom-snippets') || '[]');
        } catch {
            return [];
        }
    }

    function saveCustomSnippets() {
        localStorage.setItem('custom-snippets', JSON.stringify(customSnippets));
    }

    function getData() {
        if (!customSnippets.length) return commandsData;
        return {
            ...commandsData,
            Custom: [{
                category: 'Custom Snippets',
                commands: customSnippets
            }]
        };
    }

    function loadInputsFromLocalStorage() {
        Object.values(inputs).forEach(input => {
            const savedValue = localStorage.getItem(input.id);
            if (savedValue !== null) input.value = savedValue;
        });
    }

    function renderNavigation() {
        const links = ['All', ...Object.keys(getData()), 'Links'];
        navigation.innerHTML = links.map(name => `
            <li>
                <a href="#" class="nav-link${name === activeCategory ? ' active' : ''}" data-category="${escapeHtml(name)}">
                    ${escapeHtml(name)}
                </a>
            </li>
        `).join('');
    }

    function renderTagFilters() {
        tagFilters.innerHTML = tags.map(tag => `
            <button type="button" class="tag-filter${tag === activeTag ? ' active' : ''}" data-tag="${tag}">
                ${tag}
            </button>
        `).join('');
    }

    function renderPhaseFilters() {
        const phases = ['All', ...Object.keys(getData())];
        phaseFilters.innerHTML = phases.map(phase => `
            <button type="button" class="phase-filter${phase === activePhase ? ' active' : ''}" data-phase="${escapeHtml(phase)}">
                ${escapeHtml(phase)}
            </button>
        `).join('');
    }

    function renderCommands() {
        commandContainer.innerHTML = Object.entries(getData()).flatMap(([mainCategory, sections]) =>
            sections.map(section => {
                const categoryId = slug(`${mainCategory}-${section.category}`);
                const commandsHtml = section.commands.map(cmd => {
                    const cardTags = cmd.tag ? [cmd.tag] : inferTags(mainCategory, section, cmd);
                    const search = `${mainCategory} ${section.category} ${cardTags.join(' ')} ${cmd.title} ${cmd.description} ${cmd.template}`.toLowerCase();
                    return `
                        <article class="command-card" data-tags="${cardTags.join(' ')}" data-search="${escapeHtml(search)}">
                            <div class="card-top">
                                <h3>${escapeHtml(cmd.title)}</h3>
                                <div class="tag-list">${cardTags.map(tag => `<span class="tag" data-tag="${tag}">${escapeHtml(tag)}</span>`).join('')}</div>
                                ${mainCategory === 'Custom' ? `<button class="custom-delete" type="button" data-id="${escapeHtml(cmd.id)}">DEL</button>` : ''}
                            </div>
                            <p>${escapeHtml(cmd.description || 'Custom local snippet.')}</p>
                            <div class="command-box" role="button" tabindex="0" aria-label="Copy ${escapeHtml(cmd.title)} command">
                                <code class="command-text" data-template="${escapeHtml(cmd.template)}"></code>
                                <span class="copy-label">COPY</span>
                            </div>
                        </article>
                    `;
                }).join('');

                return `
                    <section id="section-${categoryId}" class="command-section" data-main="${escapeHtml(mainCategory)}">
                        <div class="section-head">
                            <span>[${escapeHtml(mainCategory)}]</span>
                            <h2>${escapeHtml(section.category)}</h2>
                            <div class="snippet-count">${section.commands.length} SNIPPETS</div>
                        </div>
                        <div class="command-grid">${commandsHtml}</div>
                    </section>
                `;
            })
        ).join('') + '<div class="empty-state">No snippets match this filter.</div>';
    }

    function updateAllCommandText() {
        const values = {
            AttackerIP: inputs.attackerIp.value || 'ATTACKER_IP',
            VictimIP: inputs.victimIp.value || 'VICTIM_IP',
            Port: inputs.port.value || 'PORT',
            Wordlist: inputs.wordlist.value || 'WORDLIST_PATH',
            Domain: inputs.domain.value || 'DOMAIN'
        };

        document.querySelectorAll('.command-text').forEach(codeElement => {
            const text = codeElement.dataset.template.replace(/\$(AttackerIP|VictimIP|Port|Wordlist|Domain)/g, match => values[match.slice(1)]);
            codeElement.innerHTML = escapeHtml(text).replace(/(10\.\d+\.\d+\.\d+|htb\.local|domainname\.com|\/usr\/share\/wordlists\/rockyou\.txt|4444|443)/g, '<mark>$1</mark>');
        });
    }

    function applyFilters() {
        const linksActive = activeCategory === 'Links';
        const portfolioActive = activeCategory === 'Portfolio';
        commandContainer.hidden = linksActive || portfolioActive;
        toolRow.hidden = linksActive || portfolioActive;
        hero.hidden = portfolioActive;
        paramsPanel.hidden = linksActive || portfolioActive;
        searchWrap.hidden = linksActive || portfolioActive;
        linksView.hidden = !linksActive;
        portfolioView.hidden = !portfolioActive;
        if (portfolioActive) {
            pageTitle.textContent = 'Portfolio';
            return;
        }
        if (linksActive) {
            pageTitle.textContent = 'Link Collection';
            return;
        }

        const query = searchInput.value.trim().toLowerCase();
        let visibleSections = 0;

        document.querySelectorAll('.command-section').forEach(section => {
            const inCategory = activeCategory === 'All' || section.dataset.main === activeCategory;
            const inPhase = activePhase === 'All' || section.dataset.main === activePhase;
            let visibleCards = 0;

            section.querySelectorAll('.command-card').forEach(card => {
                const inTag = activeTag === 'All' || card.dataset.tags.split(' ').includes(activeTag);
                const match = inCategory && inPhase && inTag && card.dataset.search.includes(query);
                card.classList.toggle('is-filtered-out', !match);
                if (match) visibleCards++;
            });

            section.classList.toggle('is-filtered-out', visibleCards === 0);
            if (visibleCards > 0) visibleSections++;
        });

        document.querySelector('.empty-state').style.display = visibleSections ? 'none' : 'block';
        pageTitle.textContent = activeCategory === 'All' ? 'All Commands' : activeCategory;
    }

    function transitionView(callback) {
        document.body.classList.add('is-transitioning');
        window.setTimeout(() => {
            callback();
            requestAnimationFrame(() => document.body.classList.remove('is-transitioning'));
        }, 120);
    }

    function rerender() {
        renderNavigation();
        renderTagFilters();
        renderPhaseFilters();
        renderCommands();
        updateAllCommandText();
        applyFilters();
    }

    function startBootLog() {
        let bootLines = bootSets[Math.floor(Math.random() * bootSets.length)];
        let line = 0;
        let char = 0;
        const shown = Array(5).fill('');

        const tick = () => {
            if (!bootLogText) return;
            const current = bootLines[line];
            shown[line] += current[char++] || '';
            bootLogText.innerHTML = shown.map((text, index) => {
                const cursor = index === line ? '█' : '';
                const content = escapeHtml(text + cursor);
                return index === bootLines.length - 1 ? `<span class="ready-line">${content}</span>` : content;
            }).join('\n');

            if (char <= current.length) {
                setTimeout(tick, 30);
                return;
            }

            char = 0;
            line = (line + 1) % bootLines.length;
            if (line === 0) {
                const previous = bootLines;
                shown.fill('');
                do {
                    bootLines = bootSets[Math.floor(Math.random() * bootSets.length)];
                } while (bootSets.length > 1 && bootLines === previous);
            }
            setTimeout(tick, line === 0 ? 1400 : 300);
        };

        tick();
    }

    function setupAutoHideNav() {
        const nav = document.getElementById('nav');
        let lastScrollTop = 0;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            nav.classList.toggle('nav-hidden', scrollTop > 80 && scrollTop > lastScrollTop);
            lastScrollTop = Math.max(scrollTop, 0);
        }, { passive: true });
    }

    navigation.addEventListener('click', event => {
        const link = event.target.closest('a[data-category]');
        if (!link) return;
        event.preventDefault();
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        transitionView(() => {
            activeCategory = link.dataset.category;
            activePhase = 'All';
            renderNavigation();
            renderPhaseFilters();
            applyFilters();
        });
    });

    brand.addEventListener('click', event => {
        event.preventDefault();
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        transitionView(() => {
            activeCategory = 'Portfolio';
            activePhase = 'All';
            renderNavigation();
            renderPhaseFilters();
            applyFilters();
        });
    });

    navToggle.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            document.body.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    tagFilters.addEventListener('click', event => {
        const button = event.target.closest('button[data-tag]');
        if (!button) return;
        transitionView(() => {
            activeTag = button.dataset.tag;
            renderTagFilters();
            applyFilters();
        });
    });

    phaseFilters.addEventListener('click', event => {
        const button = event.target.closest('button[data-phase]');
        if (!button) return;
        transitionView(() => {
            activePhase = button.dataset.phase;
            activeCategory = 'All';
            renderNavigation();
            renderPhaseFilters();
            applyFilters();
        });
    });

    customForm.addEventListener('submit', event => {
        event.preventDefault();
        customSnippets.push({
            id: window.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
            title: document.getElementById('custom-title').value.trim(),
            description: document.getElementById('custom-description').value.trim(),
            template: document.getElementById('custom-template').value.trim(),
            tag: document.getElementById('custom-tag').value
        });
        saveCustomSnippets();
        customForm.reset();
        activeCategory = 'Custom';
        activePhase = 'All';
        rerender();
    });

    searchInput.addEventListener('input', applyFilters);
    document.addEventListener('keydown', event => {
        if (event.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            event.preventDefault();
            searchInput.focus();
        }
    });

    Object.values(inputs).forEach(input => {
        input.addEventListener('input', () => {
            localStorage.setItem(input.id, input.value);
            updateAllCommandText();
        });
    });

    resetButton.addEventListener('click', () => {
        Object.values(inputs).forEach(input => {
            input.value = defaults[input.id];
            localStorage.removeItem(input.id);
        });
        updateAllCommandText();
    });

    commandContainer.addEventListener('click', event => {
        const deleteButton = event.target.closest('.custom-delete');
        if (deleteButton) {
            customSnippets = customSnippets.filter(cmd => cmd.id !== deleteButton.dataset.id);
            saveCustomSnippets();
            if (!customSnippets.length && (activeCategory === 'Custom' || activePhase === 'Custom')) {
                activeCategory = 'All';
                activePhase = 'All';
            }
            rerender();
            return;
        }

        const commandBox = event.target.closest('.command-box');
        if (!commandBox) return;

        navigator.clipboard.writeText(commandBox.querySelector('.command-text').textContent).then(() => {
            const label = commandBox.querySelector('.copy-label');
            label.textContent = 'DONE';
            commandBox.classList.add('copied');
            setTimeout(() => {
                label.textContent = 'COPY';
                commandBox.classList.remove('copied');
            }, 1200);
        });
    });

    commandContainer.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('command-box')) {
            event.preventDefault();
            event.target.click();
        }
    });

    loadInputsFromLocalStorage();
    rerender();
    startBootLog();
    setupAutoHideNav();
});
