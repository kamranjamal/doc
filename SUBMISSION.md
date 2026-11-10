# Draftly — Submission & Evaluation Cheatsheet

### Project Details
- **Project Name:** Draftly
- **Timebox:** Delivered within 4–6 hours
- **Local URL:** `http://localhost:3000`
- **Database:** MongoDB (`mongodb://127.0.0.1:27017/draftly`)
- **Primary Aesthetic:** Neo-Skeuomorphic Tactile Paper & Copper Board + Poppins Typography

---

## 1. Quick Reviewer Tour (Verify in Under 2 Minutes)

1. **Launch & Log In:**
   - Open [http://localhost:3000](http://localhost:3000).
   - Click **Alex Morgan** under *Instant Demo Accounts* for 1-click login.
2. **Create & Edit:**
   - Click **+ New Document** (or pick a template from **Templates**).
   - Write formatted text using the toolbar (H1, H2, Bold, Italic, Underline, Bulleted/Numbered lists).
   - Observe the **Saving...** &rarr; **Saved** status transition in the top bar.
3. **Share:**
   - Click **Share** in the top bar.
   - Click **+ Add** next to **Sam Taylor**.
4. **Verify Recipient Access:**
   - Open the profile menu in the top right and click **Sam Taylor**.
   - Navigate to **Shared With Me** in the left sidebar &rarr; Open the shared document.
5. **Verify Access Control (403 Forbidden):**
   - Switch to **Jordan Lee** (Unrelated User).
   - Notice the document is **not** present in Jordan's list.
   - Attempting to access the document URL directly triggers a strict **403 Forbidden** server response.
6. **File Import:**
   - Click **Import .txt / .md** in the sidebar and upload any text or markdown file.

---

## 2. Test Commands

```bash
# Automated MongoDB & Authentication Test
node my-app/scripts/test-auth-mongo.mjs

# Automated Document Creation, Sharing & Access Control Test
node my-app/scripts/test-document-workflow.mjs
```

---

## 3. P0 & P1 Acceptance Matrix

| Requirement | Status | Verification |
| :--- | :---: | :--- |
| **Demo Identity Switching** | ✅ Complete | Top-bar and login 1-click switcher |
| **Dashboard (Owned / Shared)** | ✅ Complete | Filter tabs and sidebar navigation |
| **Creation & Rename** | ✅ Complete | Persisted to MongoDB and editable inline |
| **Rich-Text Editor (Tiptap)** | ✅ Complete | Headings, bold, italic, underline, lists |
| **Debounced Autosave** | ✅ Complete | 800ms debounce with visual status |
| **Reopen & Persistence** | ✅ Complete | Full AST formatting restored from MongoDB |
| **Import .txt / .md** | ✅ Complete | Validated format and size limit |
| **Sharing Access Control** | ✅ Complete | Server-side 403 enforcement verified |
| **Automated Tests** | ✅ Complete | 2 automated suites running and passing |
| **Poppins Font Family** | ✅ Complete | Loaded and applied globally |
| **Neo-Skeuomorphic Theme** | ✅ Complete | Paper canvas, copper buttons, inset channels |
| **Templates Library** | ✅ Complete | PRD, Standup, and ADR templates |
| **Document Pinning** | ✅ Complete | Toggle pin to keep priority docs on top |
| **Reading Analytics** | ✅ Complete | Live words, characters, reading time |
| **Markdown Source Mode & Export** | ✅ Complete | Visual/Markdown toggle and .md download |
| **Multi-Format Export Suite** | ✅ Complete | PDF (.pdf), Word (.doc), Markdown (.md), Text (.txt), HTML (.html) |
| **Interactive Tables Suite** | ✅ Complete | Inset tactile tables: insert 3x3/4x4, add/del rows & cols, header toggle |
| **Formatting Expansion** | ✅ Complete | Subscript, Superscript, Text Colors, Highlights, Images, Dividers |
| **Keyboard Shortcuts Reference** | ✅ Complete | Quick-access hotkey guide dialog (?) |
| **Instant Cloud Sync** | ✅ Complete | Manual MongoDB sync button with confirmation toasts |
| **Tactile Toasts** | ✅ Complete | Animated feedback for saves, copies, shares |

