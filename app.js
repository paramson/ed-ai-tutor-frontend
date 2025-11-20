// -----------------------------
//  INIT MARKDOWN RENDERER
// -----------------------------
const md = window.markdownit({
  html: true,
  breaks: true,
  linkify: true,
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
//  SEND MESSAGE (NON-STREAMING)
// -----------------------------
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  // add user message
  addMessage(text, "user");
  inputEl.value = "";

  // placeholder assistant bubble
  const assistantDiv = addMessage("...", "assistant");

  try {
    const response = await fetch(
      "https://ed-ai-tutor-backend.vercel.app/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      }
    );

    if (!response.ok) {
      assistantDiv.textContent = `Error: ${response.status}`;
      return;
    }

    const resultText = await response.text();

    // render markdown
    assistantDiv.innerHTML = md.render(resultText);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch (error) {
    console.error("Network error:", error);
    assistantDiv.textContent = "Network error. Please try again.";
  }
}

// -----------------------------
//  ADD MESSAGE TO CHAT UI
// -----------------------------
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;

  if (sender === "assistant") {
    div.innerHTML = text;
  } else {
    div.textContent = text;
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return div;
}
