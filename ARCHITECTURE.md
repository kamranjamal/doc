# Draftly — Architecture & Technical Decision Record

## 1. Executive Summary

Draftly was designed to provide a lightweight, calm, and reliable collaborative document workspace. The primary goal was delivering a robust, secure, and delightful document workflow rather than a brittle feature clone.

---

## 2. Key Architecture Decisions & Tradeoffs

### Decision 1: MongoDB & Mongoose instead of PostgreSQL & Prisma
- **Context:** The original product specification suggested PostgreSQL with Prisma.
- **Decision:** Migrated to **MongoDB** using **Mongoose**.
- **Rationale:**
  1. **Document-Oriented Alignment:** Tiptap represents rich-text documents as deep JSON AST trees (`{ type: "doc", content: [...] }`). Storing native JSON in MongoDB avoids relational column impedance and eliminates JSON serialization/deserialization penalties.
  2. **Schema Flexibility with Invariants:** Mongoose gives us strict validation for core metadata (`title`, `owner`, `isPinned`, `timestamps`) while providing schema flexibility for evolving editor nodes without database migrations.
  3. **High-Performance Connection Pooling:** Implemented a resilient global singleton cache in `lib/db.ts` to prevent connection exhaustion during Next.js App Router hot-module replacement (HMR).

### Decision 2: Access Control & Sharing Architecture
- **Structure:** Documents and shares are modeled in two collections:
  - `Document`: Stores document metadata and Tiptap content, owned by `owner: ObjectId -> User`.
  - `DocumentShare`: Connects `documentId` and `userId` with a compound unique index on `{ documentId: 1, userId: 1 }`.
- **Security Invariant:** Hiding UI buttons is *not* access control. Every single API route (`/api/documents/[id]`, `/api/documents/[id]/share`) resolves the authenticated user session from the HTTP-only JWT cookie and verifies:
  - Is the user the document owner? &rarr; Allowed (Read, Update, Rename, Share, Revoke, Delete).
  - Does the user possess a `DocumentShare` record? &rarr; Allowed (Read, Edit content).
  - Unrelated user? &rarr; **403 Forbidden**. Document content is never leaked in error responses.

### Decision 3: Next.js Route Handlers vs. Standalone Express/NestJS Backend
- **Context:** Deciding between a mono-repo Next.js App Router or a split NestJS backend.
- **Decision:** Implemented backend Route Handlers inside Next.js.
- **Rationale:** Within the assignment timebox, Route Handlers allowed single-command deployment and zero CORS friction, while maintaining strict service boundaries, typed models, and cookie-based authentication.

### Decision 4: Autosave Architecture & Conflict Prevention
- **Implementation:**
  1. Tiptap editor detects DOM mutations and fires `onUpdate`.
  2. Debounced by **800ms** to minimize database load.
  3. UI transitions between `Saving...`, `Saved`, and `Couldn't save`.
  4. The UI **never** shows `Saved` until MongoDB confirms HTTP 200 persistence.

### Decision 5: Neo-Skeuomorphic Tactile System Design
- **Material Theme:** Warm cream/linen paper `#F4EFEA` combined with burnished copper `#C97D52`.
- **Tactile Dimensions:**
  - Inset bevels (`.tactile-inset`) for sunken text fields and tab tracks.
  - Multi-tier elevation drop shadows (`Level 1`, `Level 2`, `Level 3`).
  - High-contrast copper medallion avatars with bold initials.
  - **Poppins** geometric typography for optimal readability across interface and canvas.

### Decision 6: Extensible Tiptap Node Schema & Multi-Format Document Pipeline
- **Interactive Tables**: Utilizes `@tiptap/extension-table` with row, cell, and header sub-nodes. Renders as responsive neo-skeuomorphic compact tables matching the styleguide board.
- **Client-Side Document Serialization**:
  - **PDF**: Pure print-to-PDF pipeline with `@media print` CSS optimization, zero external binary dependencies.
  - **Word (.doc)**: Emits compliant Microsoft Word XML/HTML MIME blobs that preserve typography, tables, and colors in native desktop and cloud word processors.
  - **Markdown & HTML**: Bidirectional AST transformations for seamless imports and exports.

### Decision 7: UI Component Library Architecture & Reuse
- **Component Primitives (`components/ui/`)**:
  - `button.tsx`: Reusable button supporting tactile variants (`primary`/copper, `secondary`, `danger`, `ghost`, `inset`) with loading spinners and accessible size variants.
  - `input.tsx`: Sunken debossed tactile input (`tactile-inset`) with custom labels, left/right icon slots, and inline error states.
  - `badge.tsx`: Role and status indicator badges (`copper`, `success`, `neutral`, `warning`, `danger`).
  - `modal.tsx`: Backdrop-blurred dialog with Escape-key dismiss, header iconography, and smooth elevation zoom animation.
  - `toast.tsx`: Tactile floating notification stack with auto-dismiss timer.
- **Benefits**: Enforces UI consistency across Dashboard, Document Editor, Sharing Dialog, Template Selector, and Confirmation Modals.

### Decision 8: Advanced Collaboration & Governance Suite
- **Granular Role-Based Access Control**:
  - Permissions: `EDIT` (full editing and autosave), `COMMENT` (can view and submit feedback comments), and `VIEW` (read-only document protection).
  - Enforced at both the MongoDB API layer (returns 403 Forbidden on unauthorized writes) and client UI layer (`editor.setEditable(false)` with role notification banner).
  - Document owners can update or revoke permissions dynamically via PATCH `/api/documents/[id]/share/[userId]`.
- **Document Version History**:
  - `DocumentVersionModel`: Captures version snapshots with sequential version numbers, author provenance, word count, timestamps, and full AST tree snapshots.
  - One-click version rollback restores any historical state into the active Tiptap editor.
- **Document Commenting & Feedback Mode**:
  - `DocumentCommentModel`: Persists collaborative inline feedback, timestamps, author details, and resolution status (`isResolved`).
  - Allows team members to comment, resolve discussions, or reopen items in a dedicated side drawer.
- **Real-Time Presence Indicators**:
  - Active collaborator pill with pulsing status indicator and concentric avatars in the editor header.


