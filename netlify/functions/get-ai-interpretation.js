// 文件路径: netlify/functions/get-ai-interpretation.js
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { question, hexagram } = JSON.parse(event.body);
    const prompt = `你是一位精通《易经》和《增删卜易》等一切六爻所需知识的智者。请根据用户的问题和抽到的卦象信息，为用户提供一段充满智慧、积极正向且通俗易懂的决策建议。用户的问题是："${question}"。抽到的卦象是【${hexagram.name}】，它的核心释义是："${hexagram.meaning}"，关键词包括：${hexagram.keywords.join('、')}。它的一般性解读是："${hexagram.interpretation.general}"。请综合以上信息，生成一段200字左右的、高度定制化的解读。`;
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ "role": "user", "content": prompt }],
        max_tokens: 500,
        temperature: 0.7,
      })
    });
    if (!response.ok) throw new Error('Failed to fetch AI interpretation.');
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify({ interpretation: data.choices[0].message.content }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};