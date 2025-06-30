        document.addEventListener('DOMContentLoaded', () => {
            const inputs = {
                attackerIp: document.getElementById('attacker-ip'),
                victimIp: document.getElementById('victim-ip'),
                port: document.getElementById('port'),
                wordlist: document.getElementById('wordlist'),
                domain: document.getElementById('domain')
            };
            const commandContainer = document.getElementById('command-container');

            function renderCommands() {
                let allHtml = '';
                for (const section of commandsData) {
                    const commandsHtml = section.commands.map(cmd => `
                        <div class="command-card rounded-xl p-6 shadow-md border border-gray-700">
                            <h3 class="font-semibold text-lg text-amber-400 mb-2">${cmd.title}</h3>
                            <p class="text-sm text-white-400 mb-4 flex-grow">${cmd.description}</p>
                            <div class="command-box bg-gray-900 rounded-md p-3 cursor-pointer">
                                <code class="text-sm break-words command-text" data-template="${cmd.template.replace(/"/g, '&quot;')}"></code>
                            </div>
                        </div>
                    `).join('');

                    allHtml += `
                        <section class="card-bg p-6">
                            <h2 class="text-3xl font-bold text-white mb-6 flex items-center">
                                ${section.category}
                            </h2>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                ${commandsHtml}
                            </div>
                        </section>
                    `;
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

            // --- Event Listeners Setup ---
            Object.values(inputs).forEach(input => input.addEventListener('input', updateAllCommandText));

            commandContainer.addEventListener('click', (event) => {
                const commandBox = event.target.closest('.command-box');
                if (commandBox) {
                    if (commandBox.classList.contains('copied')) return;
                    const commandText = commandBox.querySelector('.command-text').innerText;
                    
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(commandText).then(() => {
                            commandBox.classList.add('copied');
                            setTimeout(() => commandBox.classList.remove('copied'), 2000);
                        });
                    } else { 
                        const textArea = document.createElement('textarea');
                        textArea.value = commandText;
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                            document.execCommand('copy');
                            commandBox.classList.add('copied');
                            setTimeout(() => commandBox.classList.remove('copied'), 2000);
                        } catch (err) {
                            console.error('Fallback: Oops, unable to copy', err);
                        }
                        document.body.removeChild(textArea);
                    }
                }
            });
            
            // --- Initial Load ---
            renderCommands();
            updateAllCommandText();
        });