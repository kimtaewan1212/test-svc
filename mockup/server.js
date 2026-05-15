import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World - 목업 서버 실행 중!');
});

app.listen(PORT, () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`🔗 http://localhost:${PORT}로 접속하세요.`);
});