// -----------------------------
//  INIT MARKDOWN RENDERER
// -----------------------------
const md = window.markdownit({
  html: true,
  breaks: true,
  linkify: true
});

// -----------------------------
//  DOM ELEMENTS
// -----------------------------
const sendBtn = document.getElementById("send-btn");
const inputEl = document.getElementById("user-input");
const messagesEl = document.getElementById("messages");

// -----------------------------
//  EVENTS
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

  // Add user bubble
  addMessage(text, "user");
  inputEl.value = "";

  // Add assistant bubble (empty for now)
  let assistantDiv = addMessage("", "assistant");

  // Payload to backend
  const payload = {
    message: text,
    model: "gpt-4.1",
    engine: "default"
  };

  // Call backend API
  const response = await fetch("https://ed-ai-tutor-backend.vercel.app/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  // Buffer for streamed text
  let markdownBuffer = "";

  // STREAMING LOOP
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;

      let token = line.replace("data:", "").trim();

      if (token === "[END]" || token === "") continue;

      // -----------------------------
      // FIX: no extra space between tokens
      // -----------------------------
      markdownBuffer += token;

      // Render markdown → HTML
      assistantDiv.innerHTML = md.render(markdownBuffer);

      // Auto scroll
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

  if (sender === "user") {
    div.textContent = text;
  } else {
    div.innerHTML = text;
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return div;
}
