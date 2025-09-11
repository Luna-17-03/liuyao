// 文件路径: netlify/functions/get-ai-interpretation.js (支持对话的最终版)
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { question, hexagram, chatHistory } = JSON.parse(event.body);
    const apiKey = process.env.DEEPSEEK_API_KEY;

    let messages = [];

    if (chatHistory && chatHistory.length > 0) {
        // 如果是追问，就构建完整的对话历史
        messages = chatHistory;
    } else {
        // 如果是第一次提问，构建初始指令
        const initialPrompt = `你是一位精通《易经》和《增删卜易》等一切六爻所需知识的智者。请根据用户的问题和抽到的卦象信息，为用户提供一段充满智慧、积极正向且专业深刻的决策建议。用户的问题是：“${question}”。抽到的卦象是【${hexagram.name}】，它的核心释义是：“${hexagram.meaning}”，关键词包括：${hexagram.keywords.join('、')}。它的一般性解读是：“${hexagram.interpretation.general}”。请综合以上信息，生成一段200字左右的、高度定制化的解读。`;
        messages.push({ role: "user", content: initialPrompt });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages, // 发送包含上下文的完整对话
      })
    });

    if (!response.ok) throw new Error('AI service failed.');
    const data = await response.json();
    const aiInterpretation = data.choices[0].message.content;
    return { statusCode: 200, body: JSON.stringify({ interpretation: aiInterpretation }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
