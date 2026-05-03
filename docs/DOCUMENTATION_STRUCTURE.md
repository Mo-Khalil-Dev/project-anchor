# Documentation Structure Proposal for SAFE

## Current State (Messy)
```
project-anchor/
├── CLAUDE.md (project instructions)
├── README.md (root)
├── frontend/
│   ├── README.md
│   ├── package.json
│   ├── ...
├── backend/
│   ├── README.md
│   ├── package.json
│   ├── ...
├── docs/
│   ├── wireframes/
│   ├── architecture/ (maybe)
│   └── ...
├── .claude/
│   ├── plans/ (implementation plans scattered here)
│   ├── blog-outline-architectures.md (floating)
│   └── ...
```

**Problem:** Markdown files scattered everywhere = hard to find, maintain, and discover

---

## Proposed Structure (Clean & Organized)

```
project-anchor/
│
├── docs/                           # 📚 SINGLE SOURCE OF TRUTH
│   ├── README.md                   # Documentation index/home
│   ├── GETTING_STARTED.md          # First-time setup
│   │
│   ├── guides/                     # Step-by-step walkthroughs
│   │   ├── local-setup.md          # "How to run locally"
│   │   ├── deployment.md           # "How to deploy to AWS"
│   │   ├── white-labeling.md       # "How to white-label"
│   │   ├── testing.md              # "How to test"
│   │   └── contributing.md         # "How to contribute"
│   │
│   ├── architecture/               # Design & patterns
│   │   ├── overview.md             # System architecture
│   │   ├── white-label.md          # White-label architecture details
│   │   ├── pluggable-services.md   # Pluggable service pattern
│   │   ├── database.md             # Data model & schema
│   │   ├── api-design.md           # API conventions
│   │   └── security.md             # Security architecture
│   │
│   ├── api/                        # API documentation
│   │   ├── overview.md             # API intro
│   │   ├── authentication.md       # Auth flow
│   │   ├── reference/
│   │   │   ├── assessments.md      # /api/assessments endpoint
│   │   │   ├── payment-plans.md    # /api/payment-plans endpoint
│   │   │   ├── customers.md        # /api/customers endpoint
│   │   │   └── ...
│   │   └── webhooks.md             # Webhook events
│   │
│   ├── backend/                    # Backend-specific docs
│   │   ├── features.md             # Feature structure
│   │   ├── repository-pattern.md   # Data access layer
│   │   ├── use-cases.md            # Use case implementation
│   │   ├── error-handling.md       # Error strategy
│   │   └── testing.md              # Backend testing
│   │
│   ├── frontend/                   # Frontend-specific docs
│   │   ├── components.md           # Component structure
│   │   ├── hooks.md                # Custom hooks
│   │   ├── styling.md              # CSS/Tailwind conventions
│   │   ├── state-management.md     # Redux setup
│   │   ├── journeys.md             # User journey flows
│   │   └── testing.md              # Frontend testing
│   │
│   ├── deployment/                 # DevOps & deployment
│   │   ├── aws-setup.md            # AWS account setup
│   │   ├── docker.md               # Docker & containers
│   │   ├── ci-cd.md                # GitHub Actions / CI pipeline
│   │   ├── monitoring.md           # CloudWatch, logging
│   │   ├── scaling.md              # Horizontal scaling
│   │   └── disaster-recovery.md    # Backup, recovery
│   │
│   ├── operations/                 # Running the platform
│   │   ├── monitoring.md           # Health checks
│   │   ├── alerting.md             # Alert configuration
│   │   ├── maintenance.md          # Scheduled maintenance
│   │   ├── troubleshooting.md      # Common issues & fixes
│   │   └── runbooks.md             # Incident response
│   │
│   ├── business/                   # Business & product docs
│   │   ├── product.md              # Product overview
│   │   ├── roadmap.md              # Feature roadmap
│   │   ├── compliance.md           # Regulatory (FCA, Ofgem)
│   │   ├── sso.md                  # White-label SSO
│   │   └── pricing.md              # Pricing model
│   │
│   ├── knowledge-base/             # FAQs & tips
│   │   ├── faq.md                  # Frequently asked questions
│   │   ├── glossary.md             # Terms & definitions
│   │   ├── best-practices.md       # Dev best practices
│   │   └── troubleshooting.md      # Common problems
│   │
│   ├── blog/                       # Blog posts (technical)
│   │   ├── white-label-architecture.md
│   │   ├── pluggable-services-architecture.md
│   │   ├── multi-tenant-sas.md
│   │   └── ...
│   │
│   └── decisions/                  # Architecture Decision Records (ADRs)
│       ├── 001-vertical-slice-architecture.md
│       ├── 002-white-label-model.md
│       ├── 003-pluggable-services.md
│       └── ...
│
├── .claude/                        # Claude-specific (meta)
│   ├── CLAUDE.md                   # Project instructions (stays here)
│   ├── memory/
│   └── plans/                      # Implementation plans (stays here, internal use)
│
├── README.md                       # Root README (brief, links to docs/README.md)
├── CONTRIBUTING.md                 # Points to docs/guides/contributing.md
├── SECURITY.md                     # Points to docs/architecture/security.md
│
├── frontend/
│   └── README.md                   # "See ../../docs/frontend/"
│
└── backend/
    └── README.md                   # "See ../../docs/backend/"
```

---

## Key Principles

### **1. Single Source of Truth**
- ✅ All documentation lives in `/docs`
- ❌ No READMEs scattered in subdirectories (just pointers)
- ✅ Easy to find, easy to maintain

### **2. Logical Grouping**
- **guides/** → How to do things (procedural)
- **architecture/** → Why we do things (conceptual)
- **api/** → What the endpoints do (reference)
- **deployment/** → How to run it (operational)

### **3. Naming Convention**
- Use `kebab-case` for file names
- Use `#` (H1) sparingly — one per file
- Start each file with context: what, why, where

### **4. Cross-Linking**
```markdown
# Setup Guide
See also: [Local Development](guides/local-setup.md) | [Deployment](deployment/aws-setup.md)
```

### **5. Navigation**
Main `docs/README.md` acts as hub:
```markdown
# SAFE Documentation

## Quick Start
- [Getting Started](GETTING_STARTED.md)
- [Local Setup](guides/local-setup.md)

## For Developers
- [Backend Architecture](architecture/overview.md)
- [Frontend Guide](frontend/components.md)

## For DevOps
- [Deployment Guide](deployment/aws-setup.md)
- [Monitoring](operations/monitoring.md)

## Learn More
- [Blog Posts](blog/)
- [Architecture Decisions](decisions/)
```

---

## File Consolidation Plan

### **Phase 1: Create `/docs` Structure** (30 mins)
```bash
mkdir -p docs/{guides,architecture,api/reference,backend,frontend,deployment,operations,business,knowledge-base,blog,decisions}
```

### **Phase 2: Move & Consolidate** (2-3 hours)

#### Move these:
```
CLAUDE.md → Stay in .claude/ (project meta)

docs/wireframes/ → docs/design/ (rename)

.claude/plans/ → docs/architecture/implementation-plans/

.claude/blog-outline-architectures.md → docs/blog/architectural-patterns/ (when written)

frontend/README.md → docs/frontend/README.md
backend/README.md → docs/backend/README.md

Any scattered architecture docs → docs/architecture/
Any API docs → docs/api/reference/
Any setup guides → docs/guides/
Any deployment docs → docs/deployment/
```

#### Create pointers:
```
# frontend/README.md
See the [Frontend Documentation](../docs/frontend/)

# backend/README.md
See the [Backend Documentation](../docs/backend/)

# README.md (root)
See the [Full Documentation](docs/)
```

### **Phase 3: Create Missing Docs** (3-4 hours)

**Must-Have:**
- [ ] `docs/GETTING_STARTED.md` — First-time setup
- [ ] `docs/guides/local-setup.md` — How to run locally
- [ ] `docs/architecture/overview.md` — System diagram
- [ ] `docs/api/reference/assessments.md` — API endpoints
- [ ] `docs/guides/white-labeling.md` — Multi-tenant setup

**Should-Have:**
- [ ] `docs/deployment/aws-setup.md`
- [ ] `docs/backend/features.md`
- [ ] `docs/frontend/components.md`
- [ ] `docs/operations/monitoring.md`

### **Phase 4: Index & Navigation** (1 hour)
- [ ] Main `docs/README.md` (navigation hub)
- [ ] Add breadcrumbs: `← [Home](../README.md) | [Guides](../guides/)`
- [ ] Create `docs/NAVIGATION.md` (site map)

---

## Final Structure

```
docs/README.md
├── 📖 Guides (How-to)
├── 🏗️ Architecture (Why & Design)
├── 🔌 API (What endpoints do)
├── 🚀 Deployment (How to run)
├── 👨‍💼 Operations (Running live)
├── 💼 Business (Product & compliance)
├── ❓ Knowledge Base (FAQs)
├── 📝 Blog (Long-form articles)
└── 📋 Decisions (ADRs - why we chose X)
```

---

## Tools to Maintain It

### **1. Markdown Linter**
```bash
npm install -D markdownlint-cli
npx markdownlint docs/**/*.md
```

### **2. Link Checker**
```bash
npm install -D markdown-link-check
find docs -name "*.md" -exec markdown-link-check {} \;
```

### **3. Documentation Site Generator (Optional)**
Generate searchable HTML site:
```bash
# Option A: MkDocs (Python)
mkdocs new site
mkdocs serve

# Option B: Docusaurus (React)
npx create-docusaurus@latest my-docs

# Option C: Starlight (Astro)
npm create astro@latest -- --template starlight
```

### **4. Pre-commit Hook**
Validate docs before commit:
```bash
# .husky/pre-commit
markdownlint docs/**/*.md
```

---

## Benefits of This Approach

| Benefit | How |
|---------|-----|
| **Discoverability** | All docs in one place, easy to find |
| **Maintainability** | Single source of truth, no duplicates |
| **Onboarding** | New devs follow `docs/GETTING_STARTED.md` |
| **SEO** | Blog posts auto-discoverable |
| **Professionalism** | Well-organized docs impress customers |
| **Searchability** | Can add search (Algolia, local) |
| **Version Control** | Docs evolve with code |
| **Collaboration** | Clear structure for contributions |

---

## Migration Checklist

- [ ] Create `/docs` directory structure
- [ ] Move existing docs to appropriate locations
- [ ] Create `docs/README.md` (navigation hub)
- [ ] Update root `README.md` (point to `/docs`)
- [ ] Replace scattered READMEs with pointers
- [ ] Create missing critical docs
- [ ] Add cross-links between documents
- [ ] Set up markdown linter in CI/CD
- [ ] Document the structure itself (this file)
- [ ] Train team on new structure

---

## Estimated Time
- **Phase 1:** 30 mins (create structure)
- **Phase 2:** 2-3 hours (move & consolidate)
- **Phase 3:** 3-4 hours (write missing docs)
- **Phase 4:** 1 hour (indexing)
- **Total:** ~7 hours (can spread over 2-3 days)

---

## Next Steps

1. ✅ Approve this structure
2. Run Phase 1 (mkdir)
3. Run Phase 2 (move files)
4. Run Phase 3 (write docs)
5. Set up linting + CI checks
6. Consider: Generate searchable site (MkDocs/Docusaurus)

**Ready to implement?**
