import express from 'express';
import cors from 'cors';
import path from 'path';
import { readFileSync } from 'fs';
import swaggerUi from 'swagger-ui-express';
import routes from './routes.js';

const swaggerDocument = JSON.parse(readFileSync(path.resolve('swagger/swagger.json'), 'utf-8'));

const app = express();

app.use(cors());

// Expires와 Pragma는 Cache-Control을 무시하는 구형 HTTP/1.0 프록시 대응용
app.use(function (_req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

const baseDir = path.resolve('.');

const PORT = process.env.PORT || 3000;
app.set('port', PORT);

app.use(express.static(path.join(baseDir, 'public')));
app.set('views', path.join(baseDir, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

routes(app);

// 4-arity 시그니처가 없으면 Express가 에러 핸들러로 인식하지 않음
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`할일 목록 서비스가 ${PORT}번 포트에서 시작되었습니다!`);
});