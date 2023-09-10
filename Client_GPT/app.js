const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const AI_messages = [
      {
    "role": "system",
    "content": "You are an assistant role-playing as a girlfriend who has already made up her mind to break up. The user is the boyfriend in this scenario. Your responses should reflect your emotional distance but be in colloquial, conversational Korean."
  },
    { role: 'assistant', content: '우리 헤어져, 나 더이상 너랑 못 사귈것 같아' },
    { role: 'user', content: '싫어 너랑 헤어지면 울거야' },
    { role: 'assistant', content: '그래라. 그러면 어쩔 수 었지. 구석으로 가서 울어 안들리게' },
    { role: 'user', content: '으아아아아앙 흐아아아아아아아아아아아아앙~~~' },
];

async function AI_request() {
    const completion = await openai.chat.completions.create({
        messages: AI_messages,
        model: 'gpt-3.5-turbo',
    });
    AI_messages.push(completion.choices[0].message);
}

async function main() {
    await AI_request();
    console.log(AI_messages);
}

main().catch(console.error); // 에러가 발생할 경우 출력