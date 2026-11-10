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
      } catch (err) {
        // Not JSON
      }
      return { status: res.status, ok: res.ok, data };
    },
  };
}

async function run() {
  const alexClient = makeClient();
  const samClient = makeClient();

  // 1. Login as Alex (Owner)
  const loginAlex = await alexClient.fetch("/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alex@draftly.demo" }),
  });
  console.log("Alex login:", loginAlex.status, loginAlex.data);

  // 2. Create Document
  const createRes = await alexClient.fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Tactile Design Spec & Guidelines",
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Initial tactile spec." }] }],
      },
    }),
  });
  console.log("Create doc:", createRes.status, createRes.data);
  const doc = createRes.data?.document;

  // 3. Share with Sam as COMMENT
  const shareRes = await alexClient.fetch(`/api/documents/${doc.id}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "sam@draftly.demo",
      permission: "COMMENT",
    }),
  });
  console.log("Share res:", shareRes.status, shareRes.data);

  // Cleanup
  await alexClient.fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
}

run().catch(console.error);
