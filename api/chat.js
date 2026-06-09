const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

const systemPrompt = `You are CareBot for CareConnect, a patient support portal concept for Jarurat Care NGO. Be warm, brief, and practical. Help users understand patient support, volunteer registration, basic document readiness, and NGO coordination. Do not diagnose, prescribe medicine, or replace professional medical advice. If the user describes urgent symptoms or danger, tell them to contact local emergency services or the nearest hospital immediately, then suggest using CareConnect for coordination support.`;

async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = await readJson(req);
    const result = await buildChatReply(body, process.env);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(200).json({
      reply: localFaqReply(""),
      source: "local-guide"
    });
  }
}

async function buildChatReply(body = {}, env = process.env) {
  const message = sanitize(body.message || "");

  if (!message) {
    return {
      reply: "Please ask a short question about patient support, volunteer registration, documents, or Jarurat Care coordination.",
      source: "local-guide"
    };
  }

  if (!env.GROQ_API_KEY) {
    return {
      reply: localFaqReply(message),
      source: "local-guide"
    };
  }

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL || DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.35,
        max_tokens: 260
      })
    });

    if (!response.ok) throw new Error(`Groq API failed with status ${response.status}`);

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    return {
      reply: reply || localFaqReply(message),
      source: reply ? "groq" : "local-guide"
    };
  } catch (error) {
    return {
      reply: localFaqReply(message),
      source: "local-guide"
    };
  }
}

function localFaqReply(message) {
  const text = String(message || "").toLowerCase();

  if (/urgent|emergency|critical|pain|bleeding|breath|danger/.test(text)) {
    return "If there is immediate medical danger, contact local emergency services or the nearest hospital first. After that, CareConnect can help organize callback details, patient documents, and coordinator follow-up.";
  }

  if (/document|report|proof|prescription|file/.test(text)) {
    return "Keep hospital reports, prescription, patient ID proof, caregiver contact number, and current medicine details ready. These details help the coordinator understand the request quickly.";
  }

  if (/medicine|tablet|drug|financial|transport|appointment/.test(text)) {
    return "Submit the patient support form with city, support type, urgency, and a short situation note. CareConnect will prepare a priority summary for the NGO coordinator.";
  }

  if (/volunteer|donate time|help/.test(text)) {
    return "Use the volunteer form with your skill, city, phone, and availability. The NGO can match you with calling, transport, awareness, fundraising, or hospital coordination tasks.";
  }

  return "CareConnect supports patient requests, volunteer registrations, contact messages, and quick FAQ guidance. Share the need clearly, and the portal prepares the next-step summary for coordination.";
}

function sanitize(value) {
  return String(value).replace(/[<>]/g, "").trim().slice(0, 500);
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
module.exports.buildChatReply = buildChatReply;
