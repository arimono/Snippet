document.addEventListener('DOMContentLoaded', () => {
    const inputs = {
        attackerIp: document.getElementById('attacker-ip'),
        victimIp: document.getElementById('victim-ip'),
        port: document.getElementById('port'),
        wordlist: document.getElementById('wordlist'),
        domain: document.getElementById('domain')
    };
    const commandContainer = document.getElementById('command-container');
    const navigation = document.getElementById('navigation');
    
    function loadInputsFromLocalStorage() {
        Object.keys(inputs).forEach(key => {
            const savedValue = localStorage.getItem(inputs[key].id);
            if (savedValue !== null) {
                inputs[key].value = savedValue;
            }
        });
    }
    
    function renderNavigation() {
        let navHtml = `<li><a href="#" class="nav-link text-gray-300 py-2 px-3 rounded-md text-sm font-medium active" data-category="All">All Commands</a></li>`;
        for (const mainCategory in commandsData) {
            navHtml += `<li class="relative dropdown-container">
                    <button class="nav-link text-gray-300 py-2 px-3 rounded-md text-sm font-medium flex items-center">
                        ${mainCategory}
                        <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="dropdown-menu hidden absolute left-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                        <div class="py-1">`;
            commandsData[mainCategory].forEach(subCategory => {
                const categoryId = subCategory.category.replace(/\s+/g, '-');
                navHtml += `<a href="#" class="dropdown-item block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" data-category="${categoryId}">${subCategory.category}</a>`;
            });
            navHtml += `<div class="sub-nav"></div></div></div></li>`;
        }
        navigation.innerHTML = navHtml;
    }
    
    function renderCommands() {
        let allHtml = '';
        for (const mainCategory in commandsData) {
            commandsData[mainCategory].forEach(section => {
                const categoryId = section.category.replace(/\s+/g, '-');
                const commandsHtml = section.commands.map(cmd => `
                        <div class="command-card rounded-xl p-6 shadow-md border border-gray-700">
                            <h3 class="font-semibold text-lg text-amber-400 mb-2">${cmd.title}</h3>
                            <p class="text-sm text-gray-300 mb-4 flex-grow">${cmd.description}</p>
                            <div class="command-box bg-gray-900 rounded-md p-3 cursor-pointer">
                                <code class="text-sm break-words command-text" data-template="${cmd.template.replace(/"/g, '&quot;')}"></code>
                            </div>
                        </div>
                    `).join('');
                    
                    allHtml += `
                        <section id="section-${categoryId}" class="command-section card-bg p-6 rounded-xl">
                            <h2 class="text-3xl font-bold text-white mb-6 flex items-center">
                                ${section.category}
                            </h2>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                ${commandsHtml}
                            </div>
                        </section>
                    `;
                });
            }
            commandContainer.innerHTML = allHtml;
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
                let text = codeElement.dataset.template;
                text = text.replace(/\$(AttackerIP|VictimIP|Port|Wordlist|Domain)/g, (match) => values[match.slice(1)]);
                codeElement.textContent = text;
            });
        }
        
        // --- EVENT LISTENERS ---
        
        // Handles dropdown toggling and closing
        document.addEventListener('click', (e) => {
            const isDropdownButton = e.target.closest('.dropdown-container > button');
            
            // Close all dropdowns that were not the one just clicked
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (!isDropdownButton || !menu.parentElement.contains(isDropdownButton)) {
                    menu.classList.add('hidden');
                }
            });
            
            // Toggle the clicked dropdown
            if (isDropdownButton) {
                isDropdownButton.nextElementSibling.classList.toggle('hidden');
            }
        });
        
        // Handles filtering when a nav link or dropdown item is clicked
        navigation.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            e.preventDefault();
            const categoryToShow = link.dataset.category;
            
            // Update active link styles
            navigation.querySelectorAll('.active').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show/hide command sections based on selection
            document.querySelectorAll('.command-section').forEach(section => {
                section.style.display = (categoryToShow === 'All' || section.id === `section-${categoryToShow}`) ? 'block' : 'none';
            });
        });
        
        Object.values(inputs).forEach(input => {
            input.addEventListener('input', () => {
                localStorage.setItem(input.id, input.value);
                updateAllCommandText();
            });
        });
        
        commandContainer.addEventListener('click', (event) => {
            const commandBox = event.target.closest('.command-box');
            if (!commandBox || commandBox.classList.contains('copied')) return;
            
            const commandText = commandBox.querySelector('.command-text').innerText;
            navigator.clipboard.writeText(commandText).then(() => {
                commandBox.classList.add('copied');
                setTimeout(() => commandBox.classList.remove('copied'), 2000);
            }).catch(err => console.error('Failed to copy text: ', err));
        });

     
                // Auto-hiding Navbar Logic
                const nav = document.getElementById('nav');
                let lastScrollTop = 0;
                let idleTimer = null;

                const handleNavbarVisibility = () => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    clearTimeout(idleTimer);

                    if (scrollTop < 50) {
                        nav.classList.remove('nav-hidden');
                        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                        return; 
                    }
                    if (scrollTop > lastScrollTop) {
                        nav.classList.add('nav-hidden');
                    } else {
                        nav.classList.remove('nav-hidden');
                    }
                    idleTimer = setTimeout(() => {
                        nav.classList.add('nav-hidden');
                    }, 2000);
                    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                };
                
                window.addEventListener('scroll', handleNavbarVisibility, false);
        
        // --- INITIAL LOAD ---
        loadInputsFromLocalStorage();
        renderCommands();
        updateAllCommandText();
        renderNavigation();
    });