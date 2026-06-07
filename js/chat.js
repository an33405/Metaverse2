async function sendMessage() {

  const input = document.getElementById("chatInput");
  const text = input.value.trim();

  if (!text) return;

  addUserMessage(text);
  input.value = "";

  try {

    const reply = await askGemini(text);

    addBotMessage(reply);

  } catch (error) {

    console.error(error);

    addBotMessage("현재 Master Tao와 연결할 수 없습니다.");
  }
}

async function quickAsk(text) {

  addUserMessage(text);

  try {

    const reply = await askGemini(text);

    addBotMessage(reply);

  } catch (error) {

    console.error(error);

    addBotMessage("현재 Master Tao와 연결할 수 없습니다.");
  }
}

function addUserMessage(text) {

  const chatWindow = document.getElementById("chatWindow");

  const row = document.createElement("div");

  row.className = "chat-row user-chat";

  row.innerHTML = `
    <div class="bubble">${text}</div>
  `;

  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addBotMessage(text) {

  const chatWindow = document.getElementById("chatWindow");

  const row = document.createElement("div");

  row.className = "chat-row bot-chat";

  row.innerHTML = `
    <div class="avatar">T</div>
    <div class="bubble">${text}</div>
  `;

  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function handleEnter(event) {

  if (event.key === "Enter") {
    sendMessage();
  }
}
