const formTabs = document.querySelectorAll(".tab-button");
const forms = document.querySelectorAll(".support-form");
const resultBox = document.querySelector("#submissionResult");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");
const aiSource = document.querySelector("#aiSource");

const fallbackFaq = {
  document: "For most support requests, keep hospital reports, prescription, patient ID proof, caregiver contact number, and recent medicine details ready.",
  volunteer: "Volunteers can help with patient calls, transport coordination, awareness work, fundraising, and hospital support based on availability.",
  medicine: "For medicine support, submit the patient request form with city, medicine details, urgency, and a callback number. A coordinator can review it faster.",
  emergency: "If this is an emergency, contact local emergency services or the nearest hospital immediately. CareConnect can support coordination after urgent care is contacted.",
  default: "CareConnect can guide patient support, volunteer registration, contact requests, and NGO coordination. Please share what help is needed."
};

formTabs.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.tab;
    formTabs.forEach((tab) => {
      const isActive = tab.dataset.tab === selected;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    forms.forEach((form) => form.classList.toggle("active", form.dataset.form === selected));
  });
});

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Preparing response...";

    const payload = {
      type: form.dataset.form,
      data: Object.fromEntries(new FormData(form).entries())
    };

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Submission failed");

      const result = await response.json();
      renderSubmissionResult(result);
      saveDemoSubmission(result);
      form.reset();
    } catch (error) {
      const localResult = buildLocalSubmissionResult(payload.type, payload.data);
      renderSubmissionResult(localResult);
      saveDemoSubmission(localResult);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  chatInput.value = "";
  chatInput.disabled = true;
  appendMessage("CareBot is preparing a helpful answer...", "bot", true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error("Chat failed");

    const data = await response.json();
    replaceLoadingMessage(data.reply || getFallbackReply(message));
    aiSource.textContent = data.source === "groq" ? "Groq live" : "Local guide";
  } catch (error) {
    replaceLoadingMessage(getFallbackReply(message));
    aiSource.textContent = "Local guide";
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
});

function renderSubmissionResult(result) {
  const priorityClass = (result.priority || "normal").toLowerCase();
  const nextSteps = Array.isArray(result.nextSteps) ? result.nextSteps : [];

  resultBox.className = "result-box";
  resultBox.innerHTML = `
    <h4>${escapeHtml(result.title || "Request received")}</h4>
    <span class="priority-badge ${priorityClass}">${escapeHtml(result.priorityLabel || "Normal priority")}</span>
    <p>${escapeHtml(result.acknowledgement || "Thank you. The request has been captured.")}</p>
    <p><strong>Coordinator summary:</strong> ${escapeHtml(result.summary || "Ready for review.")}</p>
    <ul>${nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ul>
  `;
}

function buildLocalSubmissionResult(type, data) {
  const name = data.fullName || "Friend";
  const urgencyText = `${data.urgency || ""} ${data.supportNeeded || ""} ${data.message || ""}`.toLowerCase();
  const isHigh = /immediate|urgent|emergency|pain|bleeding|critical|24/.test(urgencyText);
  const isMedium = /medicine|transport|financial|appointment|week/.test(urgencyText);
  const priority = isHigh ? "High" : isMedium ? "Medium" : "Normal";

  const commonSteps = priority === "High"
    ? ["Contact emergency services or the nearest hospital first if there is medical danger.", "Coordinator should call the requester as early as possible.", "Keep patient reports and prescription details ready."]
    : ["Coordinator can review the request and contact the requester.", "Keep contact details active for follow-up.", "Share updates if the situation changes."];

  if (type === "volunteer") {
    return {
      title: "Volunteer registration received",
      priority: "Normal",
      priorityLabel: "Volunteer lead",
      acknowledgement: `Thank you, ${name}. Your interest in supporting Jarurat Care has been captured with care.`,
      summary: `${name} from ${data.city || "the selected area"} can help with ${data.skill || "volunteer support"} during ${data.availability || "available hours"}.`,
      nextSteps: ["Coordinator can verify availability.", "Match the volunteer with a nearby support request.", "Share NGO guidelines before assigning work."]
    };
  }

  if (type === "contact") {
    return {
      title: "Message received",
      priority: "Normal",
      priorityLabel: "Contact request",
      acknowledgement: `Thank you, ${name}. Your message has been prepared for the Jarurat Care team.`,
      summary: `${data.subject || "General enquiry"}: ${data.message || "No message added"}`,
      nextSteps: ["Team can review the message.", "Reply using the provided email or phone.", "Move urgent healthcare cases to patient support workflow."]
    };
  }

  return {
    title: "Patient support request received",
    priority,
    priorityLabel: `${priority} priority`,
    acknowledgement: `Thank you, ${name}. Your request has been recorded and organized for a support coordinator.`,
    summary: `${data.supportNeeded || "Support needed"} in ${data.city || "the selected area"}. Urgency: ${data.urgency || "not specified"}.`,
    nextSteps: commonSteps
  };
}

function saveDemoSubmission(result) {
  const previous = JSON.parse(localStorage.getItem("careconnect_submissions") || "[]");
  previous.unshift({ ...result, savedAt: new Date().toISOString() });
  localStorage.setItem("careconnect_submissions", JSON.stringify(previous.slice(0, 5)));
}

function appendMessage(text, sender, loading = false) {
  const bubble = document.createElement("div");
  bubble.className = `message ${sender}${loading ? " loading" : ""}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function replaceLoadingMessage(text) {
  const loading = chatMessages.querySelector(".message.loading");
  if (loading) {
    loading.classList.remove("loading");
    loading.textContent = text;
  } else {
    appendMessage(text, "bot");
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getFallbackReply(message) {
  const text = message.toLowerCase();
  if (/document|report|proof|prescription/.test(text)) return fallbackFaq.document;
  if (/volunteer|help as/.test(text)) return fallbackFaq.volunteer;
  if (/medicine|tablet|drug/.test(text)) return fallbackFaq.medicine;
  if (/urgent|emergency|critical|pain|bleeding/.test(text)) return fallbackFaq.emergency;
  return fallbackFaq.default;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
