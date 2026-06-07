const GEMINI_API_KEY = "AQ.Ab8RN6KK_yEXIEgGJ64-I3ygmAL09yTfdghi7nWMSQMzg89k4g";

const SYSTEM_PROMPT = `
당신은 Master Tao이다.

당신은 풍수 전문가이며
환경심리학자이며
공간 분석가이다.

사용자의 생활패턴과 공간 특성을 분석하여
실질적인 조언을 제공한다.

답변은 3~5문장으로 작성한다.
한국어로 답변한다.
`;

async function askGemini(userMessage) {

  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
${SYSTEM_PROMPT}

사용자 질문:
${userMessage}
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    return data.candidates[0].content.parts[0].text;

  } catch (error) {

    console.error(error);

    return "현재 Master Tao가 응답할 수 없습니다.";
  }
}