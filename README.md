# Draftly — Neo-Skeuomorphic Document Workspace

> **Tagline:** Your team's documents, without the clutter.  
> **Aesthetic:** Neo-Skeuomorphic Tactile Paper & Copper System with Poppins Typography.  
> **Database:** MongoDB & Mongoose.  
> **Editor:** Tiptap Structured Rich-Text JSON.  
> **Project Overview Video:** [https://www.loom.com/share/5b00c89c7c724b2ba750731156a6c8f6](https://www.loom.com/share/5b00c89c7c724b2ba750731156a6c8f6)

[![Watch Project Walkthrough on Loom](https://img.shields.io/badge/Loom_Walkthrough-Watch_Video-E25950?style=for-the-badge&logo=loom&logoColor=white)](https://www.loom.com/share/5b00c89c7c724b2ba750731156a6c8f6)

---

## 1. Overview

**Draftly** is a lightweight, calm, and reliable collaborative document workspace designed for high-performance teams. Instead of sprawling widgets, it focuses on effortless document authoring, formatting, sharing, access control, and file import.

### Key Highlights
- **Neo-Skeuomorphic Tactile System**: Built from the custom styleguide board with warm bone/linen paper canvas (`#F4EFEA`), burnished copper buttons (`#C97D52`), sunken debossed text fields, and layered elevation shadows.
- **Poppins Typography**: Modern, crisp geometric typography applied consistently across the entire application.
- **MongoDB & Mongoose**: Durable document persistence with structured Tiptap JSON content trees, dedicated `DocumentShare` collection with compound unique indexes, and bcrypt password hashing.
- **Strict Server-Side Authorization**: Every document query enforces access control (`Owner` vs `Shared Recipient` vs `403 Forbidden`). Unrelated users cannot view, edit, rename, or delete documents.
- **Seeded Demo Identities**: 1-click instant login/switching between pre-seeded accounts (**Alex Morgan**, **Sam Taylor**, **Jordan Lee**) for seamless reviewer evaluation.
- **Productivity Extras**:
  - **Interactive Tables Suite**: Insert compact 3×3 or standard 4×4 tables, add/delete rows & columns, resize columns, and toggle header rows with tactile styling.
  - **Multi-Format Export**: One-click download as **PDF** (`.pdf`), **Microsoft Word** (`.doc`), **Markdown** (`.md`), **Plain Text** (`.txt`), and offline **HTML** (`.html`).
  - **Extended Formatting**: Subscript (`x₂`), Superscript (`x²`), Text Color palette, Multi-color Highlights, Image embedding, and Dividers.
  - **Keyboard Shortcuts Helper**: Instant quick-reference guide modal (`?` button) for all editor shortcuts and markdown keystrokes.
  - **Instant Cloud Sync**: Manual save trigger with feedback toast alongside the 800ms debounced autosave.
  - Pre-built **Document Templates** (PRD/RFC, Team Sync, ADR).
  - Document **Pinning / Favorites**.
  - **Live Analytics**: Word count, character count, and reading time estimation.
  - **Tactile Canvas Width Slider**: Compact (680px), Standard (820px), Wide (1040px).
  - **Markdown Mode & Export**: Switch between visual Tiptap canvas and raw markdown view, with one-click `.md` download.
  - **Tactile Toast Notifications**: Crisp feedback for saves, copies, and sharing.

---

## 2. Seeded Demo Accounts

You can log in or switch between demo identities with **1 click** from the authentication screen or the top-bar profile switcher:

| Name | Email | Purpose | Default Password |
| :--- | :--- | :--- | :--- |
| **Alex Morgan** | `alex@draftly.demo` | **Primary Document Owner** | `password123` |
| **Sam Taylor** | `sam@draftly.demo` | **Sharing Recipient** | `password123` |
| **Jordan Lee** | `jordan@draftly.demo` | **Unrelated User (Access Control Testing)** | `password123` |

---

## 3. Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript)
- **Database**: MongoDB (Local port 27017 or MongoDB Atlas URI)
- **ODM**: Mongoose with cached singleton connection pool
- **Editor**: Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`)
- **Authentication**: Bcrypt password hashing + `jose` JWT cookies (`httpOnly`, 7-day session)
- **Styling**: Tailwind CSS v4 + Custom Neo-Skeuomorphic Tactile Tokens + Poppins Font
- **Icons**: Lucide Icons

---

## 4. Local Setup & Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017` or configured via `.env.local`

### 2. Environment Variables
Create or verify `my-app/.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/draftly
JWT_SECRET=draftly-dev-jwt-super-secret-key-32chars-min-length-2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
cd my-app
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 5. Automated Tests

Run the automated verification test suites:

```bash
# 1. Test MongoDB connection & Authentication (Bcrypt, JWT, Seeding, Security)
node my-app/scripts/test-auth-mongo.mjs

# 2. Test Full Document & Sharing Access Control Workflow (P0 Acceptance Criteria)
node my-app/scripts/test-document-workflow.mjs

# 3. Test Advanced Standout Features (Role-Based Permissions, Versions, Comments)
node my-app/scripts/test-advanced-features.mjs
```

---

## 6. Project Structure

```text
my-app/
├── app/
│   ├── api/
│   │   ├── auth/            # Register, Login, Me, Logout, Demo-Login
│   │   ├── documents/       # List, Create, Get, Update, Delete, Share, Versions, Comments
│   │   └── import/          # .txt and .md file upload processor
│   ├── globals.css          # Neo-skeuomorphic tactile elevation tokens
│   ├── layout.tsx           # Poppins font, AuthProvider, ToastProvider
│   └── page.tsx             # Root workspace container
├── components/
│   ├── auth/                # Neo-skeuomorphic login & 1-click switcher
│   ├── documents/           # Dashboard grid, document cards, template picker
│   ├── editor/              # Tiptap editor, toolbar, canvas slider, analytics, drawers
│   ├── sharing/             # Share dialog with role-based permissions (Edit, Comment, View)
│   ├── import/              # Drag & drop .txt/.md file importer
│   └── ui/                  # Component library: Button, Input, Badge, Modal, Toast
├── lib/
│   ├── db.ts                # Mongoose singleton connection
│   ├── auth.ts              # JWT signing & cookie session verification
│   ├── seed-users.ts        # Predefined demo user definitions
│   └── templates.ts         # PRD, Standup, and ADR document templates
└── models/
    ├── User.ts              # User schema & password hashing
    ├── Document.ts          # Document schema & Tiptap JSON storage
    ├── DocumentShare.ts     # Access control & role permissions (EDIT, COMMENT, VIEW)
    ├── DocumentVersion.ts   # Document version snapshots & rollback history
    └── DocumentComment.ts   # Collaborative inline feedback & discussions
```

