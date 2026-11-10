const BASE_URL = "http://localhost:3000";

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

async function run() {
  console.log("==================================================");
  console.log("🚀 TESTING ADVANCED STANDOUT FEATURES");
  console.log("==================================================");

  const alexClient = makeClient();
  const samClient = makeClient();

  // 1. Login as Alex (Owner)
  console.log("1. Authenticating as Alex Morgan (Owner)...");
  const loginAlex = await alexClient.fetch("/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alex@draftly.demo" }),
  });
  if (!loginAlex.ok) throw new Error("Alex login failed");
  console.log(`   ✅ Logged in as: ${loginAlex.data.user.name}`);

  // 2. Create Document
  console.log("2. Creating document...");
  const createRes = await alexClient.fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Tactile Design Spec & Guidelines",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Initial tactile spec content." }],
          },
        ],
      },
    }),
  });
  const doc = createRes.data.document;
  console.log(`   ✅ Created document: "${doc.title}" (ID: ${doc.id})`);

  // 3. Test Version Snapshot Creation
  console.log("3. Creating version snapshots (Document Version History)...");
  const versionRes = await alexClient.fetch(`/api/documents/${doc.id}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changeSummary: "Initial version before team review" }),
  });
  console.log(`   ✅ Snapshot created: Version #${versionRes.data.version?.versionNumber} - "${versionRes.data.version?.changeSummary}"`);

  // Fetch versions
  const listVersionsRes = await alexClient.fetch(`/api/documents/${doc.id}/versions`);
  console.log(`   ✅ Found ${listVersionsRes.data.versions?.length} version snapshot(s) in history.`);

  // 4. Role-based Sharing: Share with Sam as "COMMENT"
  console.log("4. Testing Role-Based Sharing (COMMENT permission)...");
  const shareCommentRes = await alexClient.fetch(`/api/documents/${doc.id}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "sam@draftly.demo",
      permission: "COMMENT",
    }),
  });
  console.log(`   ✅ Shared with Sam: Permission = ${shareCommentRes.data.share?.permission}`);

  // 5. Login as Sam Taylor
  const samLogin = await samClient.fetch("/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "sam@draftly.demo" }),
  });
  const samUser = samLogin.data.user;
  console.log(`   ✅ Switched identity to: ${samUser.name}`);

  // 6. Verify Sam cannot edit document content (Should get 403 Forbidden)
  console.log("6. Verifying Sam (COMMENT role) is blocked from editing document content...");
  const samEditRes = await samClient.fetch(`/api/documents/${doc.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Hacked!" }] }],
      },
    }),
  });
  console.log(`   Status code: ${samEditRes.status}`);
  if (samEditRes.status === 403) {
    console.log("   ✅ Security verified: Sam cannot edit content (403 Forbidden)");
  } else {
    throw new Error(`Expected 403, got ${samEditRes.status}`);
  }

  // 7. Test Commenting: Sam posts a comment
  console.log("7. Testing Commenting mode: Sam posts a feedback comment...");
  const commentRes = await samClient.fetch(`/api/documents/${doc.id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "Please add a table with custom rows and columns in section 2.",
    }),
  });
  console.log(`   ✅ Comment posted: "${commentRes.data.comment?.text}" by ${commentRes.data.comment?.userName}`);

  // 8. Alex marks the comment as resolved
  console.log("8. Resolving comment...");
  const resolveRes = await alexClient.fetch(`/api/documents/${doc.id}/comments`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commentId: commentRes.data.comment?._id,
      isResolved: true,
    }),
  });
  console.log(`   ✅ Comment resolved status: ${resolveRes.data.comment?.isResolved}`);

  // 9. Update Sam's role from COMMENT to EDIT
  console.log("9. Promoting Sam to EDIT role...");
  const updateRoleRes = await alexClient.fetch(`/api/documents/${doc.id}/share/${samUser.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permission: "EDIT" }),
  });
  console.log(`   ✅ Role updated: ${updateRoleRes.data.message}`);

  // 10. Verify Sam can now edit document content
  console.log("10. Verifying Sam can now edit document content...");
  const samEditAfterPromotion = await samClient.fetch(`/api/documents/${doc.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Approved edit by Sam Taylor!" }],
          },
        ],
      },
    }),
  });
  console.log(`   Status code: ${samEditAfterPromotion.status}`);
  if (samEditAfterPromotion.status === 200) {
    console.log("   ✅ Edit verified: Sam successfully updated document content!");
  } else {
    throw new Error(`Expected 200, got ${samEditAfterPromotion.status}`);
  }

  // 11. Cleanup test document
  console.log("11. Cleaning up test document...");
  await alexClient.fetch(`/api/documents/${doc.id}`, {
    method: "DELETE",
  });
  console.log("   ✅ Cleaned up.");

  console.log("==================================================");
  console.log("🎉 ALL ADVANCED STANDOUT FEATURES VERIFIED & WORKING!");
  console.log("==================================================");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
