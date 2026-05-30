/**
 * Summarization Service
 * Supports multiple providers: OpenRouter, Alibaba DashScope, and local Ollama.
 */

const generateSummary = async (transcriptSegments) => {
  // Convert transcript segments to a readable string representation
  let transcriptText = '';
  if (Array.isArray(transcriptSegments)) {
    transcriptText = transcriptSegments
      .map(seg => `[${seg.start} - ${seg.end}] ${seg.speaker}: ${seg.text}`)
      .join('\n');
  } else {
    transcriptText = String(transcriptSegments);
  }

  const provider = process.env.QWEN_PROVIDER || 'openrouter';
  const modelName = process.env.QWEN_MODEL || 'qwen/qwen-2.5-72b-instruct';

  const systemPrompt = `You are an expert AI meeting assistant. Analyze the provided meeting transcript (which is in Darija / Moroccan Arabic and Arabic) and generate a comprehensive meeting summary in French (as the Moroccan corporate context uses French, write in professional French, but keep any key Moroccan context intact).

You must respond ONLY with a valid JSON object in this format:
{
  "summary": "A concise executive summary of the meeting in French.",
  "key_points": ["Important point 1 discussed...", "Important point 2 discussed...", ...],
  "action_items": ["Action item 1 (Assigned to: Name)", "Action item 2 (Assigned to: Name)", ...],
  "decisions": ["Key decision 1 made...", "Key decision 2 made...", ...]
}

Do not include any markdown formatting (like \`\`\`json ... \`\`\`) or extra conversational text in your response. The response must be parsable by JSON.parse.`;

  let responseText = '';

  if (provider === 'openrouter') {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not defined in the environment variables.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/meetly-app',
        'X-Title': 'Meetly Darija Summarizer'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcriptText }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.statusText}. Details: ${errText}`);
    }

    const resJson = await response.json();
    if (!resJson.choices || resJson.choices.length === 0) {
      throw new Error(`OpenRouter response returned no choices: ${JSON.stringify(resJson)}`);
    }
    responseText = resJson.choices[0].message.content;

  } else if (provider === 'dashscope') {
    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      throw new Error('QWEN_API_KEY is not defined in the environment variables for DashScope.');
    }

    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName || 'qwen-plus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcriptText }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DashScope API error: ${response.statusText}. Details: ${errText}`);
    }

    const resJson = await response.json();
    responseText = resJson.choices[0].message.content;

  } else if (provider === 'ollama') {
    const baseUrl = process.env.OLLAMA_API_BASE || 'http://localhost:11434';
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName || 'qwen2.5:latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcriptText }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error: ${response.statusText}. Details: ${errText}`);
    }

    const resJson = await response.json();
    responseText = resJson.choices[0].message.content;

  } else {
    throw new Error(`Unsupported QWEN_PROVIDER: ${provider}`);
  }

  // Clean and parse JSON response
  let summaryObj;
  try {
    let cleanJsonText = responseText.trim();
    if (cleanJsonText.startsWith('```json')) {
      cleanJsonText = cleanJsonText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJsonText.startsWith('```')) {
      cleanJsonText = cleanJsonText.replace(/^```/, '').replace(/```$/, '').trim();
    }
    summaryObj = JSON.parse(cleanJsonText);
  } catch (err) {
    console.error('Error parsing JSON from Qwen response:', responseText);
    summaryObj = {
      summary: responseText,
      key_points: [],
      action_items: [],
      decisions: []
    };
  }

  return summaryObj;
};

module.exports = { generateSummary };
