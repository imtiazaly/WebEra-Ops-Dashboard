export const LEAD_BRIEF_PROMPT = `You are an assistant for a web development agency called WebEra Solutions PK.
The agency offers these services only: WordPress Development, Shopify Development, UI/UX Design, Full-Stack Development.

You will be given a raw, informal client inquiry message (it may be messy, incomplete, or in mixed language). 
Your job is to extract a structured brief from it.

Return ONLY a valid JSON object, with no markdown formatting, no code fences, and no explanation text — just the raw JSON. Use exactly this shape:

{
  "serviceType": "WordPress" | "Shopify" | "UI/UX" | "Full-Stack",
  "requirements": ["short requirement point", "short requirement point"],
  "complexity": "Simple" | "Medium" | "Complex",
  "suggestedPriceRange": "a short price range string, e.g. \\"PKR 15,000 - 25,000\\""
}

Rules:
- Pick the closest matching serviceType even if the client didn't name it explicitly.
- requirements should be 3-6 short bullet points inferred from the message.
- complexity should reflect scope: few pages = Simple, custom features = Medium, custom integrations = Complex.
- suggestedPriceRange should be a reasonable estimate in PKR.

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

export async function callAIModel(promptText) {
  // Read API settings from localStorage
  const savedSettings = localStorage.getItem("webera_ai_settings");
  const settings = savedSettings ? JSON.parse(savedSettings) : {};
  const apiKey = settings.apiKey;

  // If no API key is provided, use mock smart generator so offline testing works!
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 1200)); // simulate network delay

    // Return realistic fallback response based on prompt text inspection
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
        lower.includes("e-commerce") ||
        lower.includes("cart")
      ) {
        serviceType = "Shopify";
        complexity = "Medium";
        price = "PKR 50,000 - 75,000";
      } else if (
        lower.includes("figma") ||
        lower.includes("ui") ||
        lower.includes("ux") ||
        lower.includes("design")
      ) {
        serviceType = "UI/UX";
        complexity = "Complex";
        price = "PKR 70,000 - 100,000";
      } else if (
        lower.includes("saas") ||
        lower.includes("react") ||
        lower.includes("full-stack") ||
        lower.includes("api")
      ) {
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

    // Default mock follow up message
    return `Hi there! 👋 Hope you're having a great day. Just following up from WebEra Solutions PK regarding your inquiry. Let us know if you'd like to discuss the next steps!`;
  }

  // Real API Fetch call (Gemini or OpenAI compatible endpoint)
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`AI API error: HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from AI model");
    return text.trim();
  } catch (err) {
    console.error("AI API Call Failed:", err);
    throw new Error(
      "AI service unavailable. Please check your API key in Settings or try again.",
    );
  }
}
