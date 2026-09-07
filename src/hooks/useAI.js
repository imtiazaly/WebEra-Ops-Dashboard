import { useState, useCallback } from "react";
import {
  callAIModel,
  LEAD_BRIEF_PROMPT,
  FOLLOW_UP_PROMPT,
} from "../utils/aiClient";

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateLeadBrief = useCallback(async (rawMessage) => {
    if (!rawMessage || !rawMessage.trim()) {
      setError("Please enter a raw message first.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const prompt = LEAD_BRIEF_PROMPT.replace("{{rawMessage}}", rawMessage);
      const rawResult = await callAIModel(prompt);

      // Clean markdown code blocks if AI included them
      let cleaned = rawResult
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      setLoading(false);
      return parsed;
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to generate lead brief with AI");
      return null;
    }
  }, []);

  const generateFollowUp = useCallback(async (contact) => {
    setLoading(true);
    setError(null);
    try {
      let prompt = FOLLOW_UP_PROMPT.replace(
        "{{clientName}}",
        contact.clientName || "Client",
      )
        .replace("{{serviceType}}", contact.serviceType || "Development")
        .replace("{{status}}", contact.status || "Active")
        .replace(
          "{{notesOrRequirements}}",
          contact.notes ||
            (contact.requirements
              ? contact.requirements.join(", ")
              : "Web inquiry"),
        );

      const message = await callAIModel(prompt);
      setLoading(false);
      return message;
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to generate follow-up message");
      return null;
    }
  }, []);

  return { loading, error, generateLeadBrief, generateFollowUp };
}
