// 文件路径: netlify/functions/get-ai-interpretation.js (最终生产版)
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 这一行代码被重新加了回来，它会从前端请求中正确地获取 question 和 hexagram
    const { question, hexagram } = JSON.parse(event.body);

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error("环境变量 DEEPSEEK_API_KEY 未设置!");
      throw new Error("API key is not configured.");
    }

    // 构造一个健壮的指令，确保所有变量都已定义
    const prompt = `你是一位精通《易经》和《增删卜易》等一切六爻所需知识的智者。请根据用户的问题和抽到的卦象信息，为用户提供一段充满智慧、积极正向且通俗易懂的决策建议。

    用户的问题是：“${question}”

    抽到的卦象是【${hexagram.name}】，它的核心释义是：“${hexagram.meaning}”，关键词包括：${hexagram.keywords.join('、')}。针对用户关心的问题，卦象的解读是：“${hexagram.interpretation.general}”。

    请综合以上信息，生成一段200字左右的、高度定制化的解读。`;

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ "role": "user", "content": prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API 返回错误:', errorData);
      throw new Error('Failed to fetch from DeepSeek API.');
    }

    const data = await response.json();
    const aiInterpretation = data.choices[0].message.content;

    // 成功！将AI的解读返回给前端
    return {
      statusCode: 200,
      body: JSON.stringify({ interpretation: aiInterpretation })
    };

  } catch (error) {
    console.error('函数执行过程中出错:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
