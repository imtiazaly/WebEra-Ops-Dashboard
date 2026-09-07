export const LEAD_BRIEF_PROMPT = `You are an assistant for a web development agency called WebEra Solutions PK.
The agency offers these services only: WordPress Development, Shopify Development, UI/UX Design, Full-Stack Development.

You will be given a raw, informal client inquiry message.
Your job is to extract a structured brief from it.

Return ONLY a valid JSON object with no markdown formatting, no code fences, and no explanation text:

{
  "serviceType": "WordPress" | "Shopify" | "UI/UX" | "Full-Stack",
  "requirements": ["short requirement point", "short requirement point"],
  "complexity": "Simple" | "Medium" | "Complex",
  "suggestedPriceRange": "a short price range string, e.g. \\"PKR 15,000 - 25,000\\""
}

Client's raw message:
"""
{{rawMessage}}
"""`;

export const FOLLOW_UP_PROMPT = `You are writing a short, friendly, professional WhatsApp follow-up message on behalf of WebEra Solutions PK, a web development agency.

Context about this contact:
- Name: {{clientName}}
- Service type: {{serviceType}}
- Current status: {{status}}
- Project/lead notes: {{notesOrRequirements}}

Write ONE short follow-up message (3-5 sentences max) appropriate for their current status.
Return ONLY the message text itself, no quotation marks, no labels, no JSON — just plain text ready to copy.`;

// Helper: Fetch available models dynamically for the user's API key
async function fetchWorkingModel(apiKey, preferredModel) {
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      const models = listData.models || [];

      const generateModels = models
        .filter((m) =>
          m.supportedGenerationMethods?.includes("generateContent"),
        )
        .map((m) => m.name.replace("models/", ""));

      console.log("Active Gemini Models:", generateModels);

      // Preferred active priority models
      const priorityList = [
        "gemini-3.6-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
      ];

      for (const p of priorityList) {
        if (generateModels.includes(p)) return p;
      }

      if (generateModels.length > 0) return generateModels[0];
    }
  } catch (e) {
    console.warn("Could not list models dynamically:", e);
  }

  return "gemini-3.6-flash";
}

export async function callAIModel(promptText) {
  const savedSettings = localStorage.getItem("webera_ai_settings");
  const settings = savedSettings ? JSON.parse(savedSettings) : {};
  const apiKey = (settings.apiKey || "").trim();
  let selectedModel = settings.model || "gemini-3.6-flash";

  // Offline mock mode when no API Key is set
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (
      promptText.includes("LEAD_BRIEF_PROMPT") ||
      promptText.includes("rawMessage")
    ) {
      const lower = promptText.toLowerCase();
      let serviceType = "WordPress";
      let complexity = "Medium";
      let price = "PKR 35,000 - 50,000";

      if (
        lower.includes("shopify") ||
        lower.includes("store") ||
        lower.includes("e-commerce")
      ) {
        serviceType = "Shopify";
        price = "PKR 50,000 - 75,000";
      } else if (
        lower.includes("figma") ||
        lower.includes("ui") ||
        lower.includes("ux")
      ) {
        serviceType = "UI/UX";
        complexity = "Complex";
        price = "PKR 70,000 - 100,000";
      } else if (lower.includes("saas") || lower.includes("full-stack")) {
        serviceType = "Full-Stack";
        complexity = "Complex";
        price = "PKR 120,000 - 180,000";
      }

      return JSON.stringify({
        serviceType,
        requirements: [
          "Mobile-responsive layout design",
          "Fast page loading speed optimization",
          "Contact & inquiry form integration",
          "SEO setup & basic analytics tracking",
        ],
        complexity,
        suggestedPriceRange: price,
      });
    }

    return `Hi there! 👋 Hope you're having a great day. Just following up from WebEra Solutions PK regarding your inquiry. Let us know if you have any questions!`;
  }

  // Auto-detect best active model
  const targetModel = await fetchWorkingModel(apiKey, selectedModel);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
  });

  const data = await response.json();

  if (!response.ok) {
    const googleErrorMsg =
      data.error?.message || `HTTP status ${response.status}`;
    throw new Error(`Google API Error: ${googleErrorMsg}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini AI model");
  return text.trim();
}