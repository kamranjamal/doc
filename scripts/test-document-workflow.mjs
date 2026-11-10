import mongoose from "mongoose";

const BASE_URL = "http://localhost:3000";

console.log("==================================================");
console.log("📑 TESTING DRAFTLY DOCUMENT & SHARING WORKFLOW");
console.log("==================================================");

async function runTests() {
  try {
    // Helper for fetch with cookie jar
    function makeClient() {
      let cookie = "";
      return {
        async fetch(url, options = {}) {
          const headers = { ...(options.headers || {}) };
          if (cookie) {
            headers["Cookie"] = cookie;
          }
          const res = await fetch(`${BASE_URL}${url}`, {
            ...options,
            headers,
          });
          const setCookie = res.headers.get("set-cookie");
          if (setCookie) {
            cookie = setCookie.split(";")[0];
          }
          let data = null;
          try {
            data = await res.json();
          } catch {}
          return { status: res.status, ok: res.ok, data };
        },
      };
    }

    const alexClient = makeClient();
    const samClient = makeClient();
    const jordanClient = makeClient();

    // 1. Log in as Alex Morgan
    console.log("1. Authenticating as Alex Morgan (Owner)...");
    const loginAlex = await alexClient.fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "alex@draftly.demo" }),
    });
    if (!loginAlex.ok) throw new Error("Failed to log in as Alex");
    console.log(`   ✅ Logged in as: ${loginAlex.data.user.name}`);

    // 2. Create a blank document as Alex
    console.log("2. Creating document as Alex...");
    const createDoc = await alexClient.fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Q4 Engineering Strategy" }),
    });
    if (!createDoc.ok) throw new Error("Failed to create document");
    const docId = createDoc.data.document.id;
    console.log(`   ✅ Created document: "${createDoc.data.document.title}" (ID: ${docId})`);

    // 3. Rename document
    console.log("3. Renaming document...");
    const renameDoc = await alexClient.fetch(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Q4 Engineering Strategy (Final)" }),
    });
    if (!renameDoc.ok || renameDoc.data.document.title !== "Q4 Engineering Strategy (Final)") {
      throw new Error("Failed to rename document");
    }
    console.log(`   ✅ Renamed to: "${renameDoc.data.document.title}"`);

    // 4. Update rich-text Tiptap JSON content
    console.log("4. Updating Tiptap JSON content...");
    const newContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Q4 Engineering Objectives" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Ship MongoDB Neo-Skeuomorphic workspace." }],
        },
      ],
    };
    const updateContent = await alexClient.fetch(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    });
    if (!updateContent.ok) throw new Error("Failed to update content");
    console.log("   ✅ Content persisted to MongoDB successfully.");

    // 5. Test Access Control: Jordan Lee (Unrelated User) tries to access Alex's document
    console.log("5. Testing Access Control before sharing (Jordan Lee)...");
    await jordanClient.fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "jordan@draftly.demo" }),
    });
    const jordanRead = await jordanClient.fetch(`/api/documents/${docId}`);
    if (jordanRead.status === 403) {
      console.log("   ✅ Access Control Verified: Unrelated user received 403 Forbidden!");
    } else {
      throw new Error(`Expected 403 Forbidden, but received ${jordanRead.status}`);
    }

    // 6. Share document with Sam Taylor
    console.log("6. Sharing document with Sam Taylor...");
    const shareRes = await alexClient.fetch(`/api/documents/${docId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sam@draftly.demo", permission: "EDIT" }),
    });
    if (!shareRes.ok) throw new Error("Failed to share document");
    console.log(`   ✅ Shared with Sam Taylor: ${shareRes.data.message}`);

    // 7. Verify Sam Taylor can now read and edit the document
    console.log("7. Verifying Sam Taylor can read and edit shared document...");
    await samClient.fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sam@draftly.demo" }),
    });
    const samRead = await samClient.fetch(`/api/documents/${docId}`);
    if (samRead.ok && samRead.data.document.title === "Q4 Engineering Strategy (Final)") {
      console.log(`   ✅ Sam opened shared document successfully! Permission: ${samRead.data.document.permission}`);
    } else {
      throw new Error("Sam Taylor failed to open shared document");
    }

    // 8. Test Sam in Dashboard (Document should appear in "Shared with Me")
    const samDocs = await samClient.fetch("/api/documents");
    const foundInShared = samDocs.data.shared.some((d) => d.id === docId);
    if (foundInShared) {
      console.log("   ✅ Document correctly listed under 'Shared with Me' for Sam.");
    } else {
      throw new Error("Document not found in Sam's shared list");
    }

    // 9. Jordan still receives 403 Forbidden
    const jordanReadAgain = await jordanClient.fetch(`/api/documents/${docId}`);
    if (jordanReadAgain.status === 403) {
      console.log("   ✅ Access Control Re-verified: Jordan is still 403 Forbidden.");
    } else {
      throw new Error("Jordan was improperly allowed access");
    }

    // 10. Revoke access from Sam Taylor
    console.log("8. Revoking access from Sam Taylor...");
    const samUserId = samRead.data.document.permission ? samClient : null;
    const shareList = await alexClient.fetch(`/api/documents/${docId}/share`);
    const samShare = shareList.data.shares.find((s) => s.email === "sam@draftly.demo");
    const revokeRes = await alexClient.fetch(`/api/documents/${docId}/share/${samShare.userId}`, {
      method: "DELETE",
    });
    if (!revokeRes.ok) throw new Error("Failed to revoke access");
    console.log("   ✅ Access revoked successfully.");

    // 11. Verify Sam is now forbidden
    const samReadAfterRevoke = await samClient.fetch(`/api/documents/${docId}`);
    if (samReadAfterRevoke.status === 403) {
      console.log("   ✅ Sam Taylor correctly denied (403 Forbidden) after revocation!");
    } else {
      throw new Error("Revocation did not restrict access!");
    }

    console.log("==================================================");
    console.log("🎉 ALL DOCUMENT & SHARING ACCESS TESTS PASSED!");
    console.log("==================================================");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

runTests();

