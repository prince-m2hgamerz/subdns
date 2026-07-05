# Contributing to SubDNS

First off, thanks for taking the time to contribute! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/prince-m2hgamerz/subdns/issues)
2. If not, create a new issue using the **Bug Report** template
3. Include:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, CLI version)

### Suggesting Features

1. Check [Issues](https://github.com/prince-m2hgamerz/subdns/issues) for existing feature requests
2. Create a new issue using the **Feature Request** template
3. Describe:
   - What problem this solves
   - How it should work
   - Alternatives you've considered

### Pull Requests

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/subdns.git
   cd subdns
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
   Branch naming: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`
5. **Make your changes**
6. **Run tests:**
   ```bash
   npm run lint
   npm run typecheck
   ```
7. **Commit** using conventional commits:
   ```
   feat: add bulk subdomain creation
   fix: resolve memory leak in DNS watcher
   docs: update API reference
   ```
8. **Push** and open a Pull Request

### PR Requirements

- [ ] Code follows the existing style
- [ ] Tests pass (`npm run lint && npm run typecheck`)
- [ ] PR description clearly describes the change
- [ ] Related issue is linked
- [ ] Documentation is updated if needed
- [ ] No API keys, secrets, or credentials committed

## Development Setup

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+
- **Cloudflare** account (for DNS API)
- **(Optional)** Redis for caching

### Local Setup

1. Clone and install:
   ```bash
   git clone https://github.com/prince-m2hgamerz/subdns.git
   cd subdns
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Update `.env.local` with your credentials:
   ```env
   DATABASE_URL=postgresql://localhost:5432/subdns
   NEXTAUTH_SECRET=your-secret
   CLOUDFLARE_API_KEY=your-key
   CLOUDFLARE_ZONE_ID=your-zone
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Visit [http://localhost:3000](http://localhost:3000)

### CLI Development

```bash
cd cli
npm install
npm run build
node dist/index.js --help
```

## Project Structure

```
subdns/
├── cli/              # CLI tool (@subdns/cli)
├── docs/             # Documentation & tutorials
├── prisma/           # Database schema & migrations
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js App Router pages & API
│   ├── components/   # React components
│   ├── lib/          # Core libraries
│   └── types/        # TypeScript types
├── SubDNS/           # Obsidian vault
├── docker/           # Docker config
└── data/             # App settings
```

## Questions?

- Open a [Discussion](https://github.com/prince-m2hgamerz/subdns/discussions)
- Check the [Docs](https://subdns.m2hio.in/docs)
- File an [Issue](https://github.com/prince-m2hgamerz/subdns/issues)
