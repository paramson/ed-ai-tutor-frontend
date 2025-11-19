// -----------------------------
//  IMPORT MARKDOWN RENDERER
// -----------------------------
import MarkdownIt from "https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.esm.js";
const md = new MarkdownIt();

// -----------------------------
//  GET DOM ELEMENTS
// -----------------------------
const sendBtn = document.getElementById("send-btn");
const inputEl = document.getElementById("user-input");
const messagesEl = document.getElementById("messages");

// -----------------------------
//  EVENT LISTENERS
// -----------------------------
sendBtn.addEventListener("click", sendMessage);

inputEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// -----------------------------
//  SEND MESSAGE (STREAMING)
// -----------------------------
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  // Show user message
  addMessage(text, "user");
  inputEl.value = "";

  // Assistant message placeholder
  let assistantDiv = addMessage("", "assistant");

  // Payload
  const payload = {
    message: text,
    model: "gpt-4.1",
    engine: "default"
  };

  // Backend call
  const response = await fetch("https://ed-ai-tutor-backend.vercel.app/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  // Buffer for streaming markdown text
  let rawMarkdown = "";

  // STREAMING LOOP
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;

      let token = line.replace("data:", "").trim();

      if (token === "[END]") continue;
      if (!token) continue;

      // Accumulate raw markdown tokens into buffer
      rawMarkdown += token + " ";

      // Render markdown → HTML live
      assistantDiv.innerHTML = md.render(rawMarkdown);

      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }
}

// -----------------------------
//  ADD MESSAGE TO UI
// -----------------------------
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;

  // USER messages as plain text
  if (sender === "user") {
    div.textContent = text;
  } else {
    // ASSISTANT messages allow HTML
    div.innerHTML = text;
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return div;
}
