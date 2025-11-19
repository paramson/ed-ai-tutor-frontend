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

  // Show user message immediately
  addMessage(text, "user");
  inputEl.value = "";

  // Assistant placeholder bubble
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

  // STREAMING LOOP
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data:")) {
        let token = line.replace("data:", "").trim();

        // Ignore [END] marker
        if (token === "[END]") continue;

        // Handle newline
        if (token === "\\n" || token === "" || token === "\n") {
          assistantDiv.innerHTML += "<br>";
          continue;
        }

        // Add proper spacing between tokens
        assistantDiv.innerHTML += token + " ";
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    }
  }
}

// -----------------------------
//  ADD MESSAGE TO UI
// -----------------------------
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;

  // Allow HTML for assistant formatting
  div.innerHTML = text;

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return div;
}
