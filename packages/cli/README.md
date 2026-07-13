# @subdns/cli

CLI for [SubDNS](https://subdns.io) — manage subdomains and DNS records from the terminal.

## Install

```bash
npm install -g @subdns/cli
```

## Setup

```bash
subdns login              # interactive API key entry
subdns login --key sk_xxx # pass key inline
subdns status             # verify your session
```

Credentials are stored in `~/.subdns/config.json`.

## Commands

| Command | Description |
|---------|-------------|
| `login` | Authenticate with an API key |
| `logout` | Clear stored credentials |
| `status` | Show account and session info |
| `config` | Show or edit configuration |
| `claim <name>` | Create a subdomain |
| `list` / `ls` | List all subdomains |
| `info <id>` | Show subdomain details |
| `release <id>` | Delete a subdomain |
| `dns add <subdomainId>` | Add a DNS record |
| `dns rm <recordId>` | Delete a DNS record |
| `logs` | Show account activity |

### Examples

```bash
subdns claim my-project
subdns ls
subdns dns add <id> --type A --name @ --value 1.2.3.4 --ttl 300
subdns dns rm <recordId>
subdns logs
subdns logout
```

## License

MIT
