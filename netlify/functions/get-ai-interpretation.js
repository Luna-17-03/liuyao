// 文件路径: netlify/functions/get-ai-interpretation.js
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
   
const categoryInterpretation = hexagram.interpretation[this.selectedCategory] || hexagram.interpretation.general;

const prompt = `你是一位精通《易经》和《增删卜易》等一切六爻所需知识的智者。请根据用户的问题和抽到的卦象信息，为用户提供一段充满智慧、积极正向且通俗易懂的决策建议。

用户的问题是：“${question}”

抽到的卦象是【${hexagram.name}】，它的核心释义是：“${hexagram.meaning}”，关键词包括：${hexagram.keywords.join('、')}。针对用户关心的问题，卦象的解读是：“${categoryInterpretation}”。

请综合以上信息，生成一段200字左右的、高度定制化的解读。`;
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ "role": "user", "content": prompt }],
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API Error:', errorData);
      throw new Error('Failed to fetch AI interpretation.');
    }
    const data = await response.json();
    const aiInterpretation = data.choices[0].message.content;
    return { statusCode: 200, body: JSON.stringify({ interpretation: aiInterpretation }) };
  } catch (error) {
    console.error('Function Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
