export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  iconName: string;
  defaultTitle: string;
  content: Record<string, unknown>;
}

export const WORKSPACE_TEMPLATES: DocumentTemplate[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start fresh with a clean, focused writing canvas.",
    iconName: "FileText",
    defaultTitle: "Untitled document",
    content: {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
  },
  {
    id: "prd",
    name: "Product Spec (PRD / RFC)",
    description: "Structured template with problem framing, scope, and acceptance criteria.",
    iconName: "Sparkles",
    defaultTitle: "Product Specification — ",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Product Specification / RFC" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "1. Problem & Executive Summary" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Explain the user problem this feature solves and why addressing it now is important.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "2. Scope & Core Requirements" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "P0 (Must-Have): Essential end-to-end functionality." }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "P1 (Nice-to-Have): Experience polish and convenience." }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "3. Technical Architecture" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Document data models, backend endpoints, and authorization invariants.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "standup",
    name: "Team Sync & Standup",
    description: "Keep meetings crisp with attendees, updates, and action items.",
    iconName: "Users",
    defaultTitle: "Weekly Team Sync — ",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Weekly Team Sync Notes" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Agenda & Discussion Points" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Review progress on active milestones." }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Address cross-functional blockers." }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Action Items & Ownership" }],
        },
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Follow up on MongoDB schema review." }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Finalize neo-skeuomorphic UI components." }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "adr",
    name: "Architecture Decision Record (ADR)",
    description: "Capture technical decisions, tradeoffs, and consequences.",
    iconName: "ShieldCheck",
    defaultTitle: "ADR-001: ",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "ADR: Architecture Decision Record" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Status: " },
            { type: "text", marks: [{ type: "bold" }], text: "Accepted" },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Context" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Explain the architectural context and problem forces leading to this decision.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Decision" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "We chose MongoDB and Mongoose over PostgreSQL to support structured Tiptap JSON document trees with natural document-oriented scalability.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Consequences" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Positive: Seamless storage of rich JSON without relational serialization friction." }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Positive: Document sharing managed through dedicated DocumentShare collection." }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
];

