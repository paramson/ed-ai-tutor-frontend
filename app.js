// -----------------------------
//  GET DOM ELEMENTS
// -----------------------------
const sendBtn = document.getElementById("send-btn");
const inputEl = document.getElementById("user-input");
const messagesEl = document.getElementById("messages");

// NEW controls
const modelEl = document.getElementById("model-select");
const engineEl = document.getElementById("engine-select");
const guidelineBtn = document.getElementById("guideline-btn");
const clearBtn = document.getElementById("clear-btn");

// -----------------------------
//  EVENT LISTENERS
// -----------------------------
sendBtn.addEventListener("click", sendMessage);

guidelineBtn.addEventListener("click", () => {
  inputEl.value = "FETCH_GUIDELINE";
  sendMessage();
});

clearBtn.addEventListener("click", () => {
  messagesEl.innerHTML = "";
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

  // Prepare POST payload
  const payload = {
    message: text,
    model: modelEl.value,
    engine: engineEl.value
  };

  // Call backend (fixed permanent backend URL)
  const response = await fetch("https://ed-ai-tutor-backend.vercel.app/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  // Stream reader setup
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let assistantDiv = addMessage("", "assistant");

  // Stream tokens
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const token = line.replace("data:", "").trim();
        if (token) {
          assistantDiv.textContent += token;
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
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
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}
