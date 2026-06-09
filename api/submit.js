async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = await readJson(req);
    const result = buildSubmissionResponse(body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message || "Invalid submission" });
  }
}

function buildSubmissionResponse(body = {}) {
  const type = sanitize(body.type || "patient").toLowerCase();
  const data = normalizeData(body.data || {});

  if (!data.fullName || data.fullName.length < 2) throw new Error("Full name is required");
  if (type === "volunteer") {
    validateVolunteer(data);
    return volunteerResponse(data);
  }
  if (type === "contact") {
    validateContact(data);
    return contactResponse(data);
  }

  validatePatient(data);
  return patientResponse(data);
}

function patientResponse(data) {
  const urgencyText = `${data.urgency} ${data.supportNeeded} ${data.message}`.toLowerCase();
  const highWords = /immediate|urgent|emergency|critical|bleeding|breath|severe|danger|24/;
  const mediumWords = /medicine|transport|financial|appointment|week|pain|support/;
  const priority = highWords.test(urgencyText) ? "High" : mediumWords.test(urgencyText) ? "Medium" : "Normal";

  const nextSteps = priority === "High"
    ? [
        "If there is medical danger, contact local emergency services or the nearest hospital immediately.",
        "Coordinator should call the requester as early as possible.",
        "Keep prescription, hospital report, patient ID proof, and caregiver phone number ready."
      ]
    : [
        "Coordinator can review the request and contact the requester.",
        "Keep the phone number active for follow-up.",
        "Update the NGO if support need or urgency changes."
      ];

  return {
    title: "Patient support request received",
    priority,
    priorityLabel: `${priority} priority`,
    acknowledgement: `Thank you, ${data.fullName}. Your request has been captured respectfully and organized for Jarurat Care support follow-up.`,
    summary: `${data.supportNeeded} requested in ${data.city}. Urgency: ${data.urgency}. Situation note: ${data.message}`,
    nextSteps
  };
}

function volunteerResponse(data) {
  return {
    title: "Volunteer registration received",
    priority: "Normal",
    priorityLabel: "Volunteer lead",
    acknowledgement: `Thank you, ${data.fullName}. Your interest in supporting patients through Jarurat Care has been recorded.`,
    summary: `${data.fullName} from ${data.city} can help with ${data.skill}. Availability: ${data.availability}. Contact: ${data.email || data.phone}.`,
    nextSteps: [
      "Coordinator can verify the volunteer details.",
      "Match the volunteer with nearby or remote support needs.",
      "Share NGO guidelines before assigning any patient-facing work."
    ]
  };
}

function contactResponse(data) {
  return {
    title: "Message received",
    priority: "Normal",
    priorityLabel: "Contact request",
    acknowledgement: `Thank you, ${data.fullName}. Your message is ready for the Jarurat Care team.`,
    summary: `${data.subject}. Message: ${data.message}. Reply contact: ${data.contact}.`,
    nextSteps: [
      "Team can review the message and reply through the provided contact.",
      "Move patient-specific needs to the patient support workflow.",
      "Use the AI FAQ assistant for quick general guidance."
    ]
  };
}

function validatePatient(data) {
  required(data, ["phone", "city", "supportNeeded", "urgency", "message"]);
  if (!/^[0-9+\-\s()]{10,15}$/.test(data.phone)) throw new Error("Phone number should be 10 to 15 characters");
}

function validateVolunteer(data) {
  required(data, ["email", "phone", "city", "skill", "availability", "message"]);
  if (!/^\S+@\S+\.\S+$/.test(data.email)) throw new Error("Valid email is required");
}

function validateContact(data) {
  required(data, ["contact", "subject", "message"]);
}

function required(data, keys) {
  const missing = keys.find((key) => !data[key]);
  if (missing) throw new Error(`${missing} is required`);
}

function normalizeData(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [sanitize(key), sanitize(value)]));
}

function sanitize(value) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, 700);
}

async function readJson(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = handler;
module.exports.buildSubmissionResponse = buildSubmissionResponse;
