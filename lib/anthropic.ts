type MessageBlock = {
  type: string;
  text?: string;
  source?: {
    type: string;
    media_type: string;
    data: string;
  };
};

async function anthropicRequest(messages: Array<{ role: "user" | "assistant"; content: MessageBlock[] }>, system: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      system,
      max_tokens: 1500,
      temperature: 0.2,
      messages
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic request failed: ${text}`);
  }

  const json = await response.json();
  const text = json.content?.map((item: { text?: string }) => item.text || "").join("\n") || "";
  return text;
}

export async function runClaudeJson(system: string, payload: unknown) {
  const text = await anthropicRequest(
    [
      {
        role: "user",
        content: [{ type: "text", text: JSON.stringify(payload) }]
      }
    ],
    `${system}\nRespond with valid JSON only.`
  );

  const sanitized = text.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```\s*$/m, "").trim();
  try {
    return JSON.parse(sanitized);
  } catch {
    throw new Error("AI returned malformed JSON.");
  }
}

export async function runClaudeVision(system: string, imageBase64: string, prompt: string, mediaType = "image/png") {
  const text = await anthropicRequest(
    [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64
            }
          },
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ],
    `${system}\nRespond with valid JSON only.`
  );

  const sanitized = text.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```\s*$/m, "").trim();
  try {
    return JSON.parse(sanitized);
  } catch {
    throw new Error("AI returned malformed JSON.");
  }
}
