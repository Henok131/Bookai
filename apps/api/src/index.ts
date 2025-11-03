import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 8080);
const domain = process.env.DOMAIN || 'bookai.asenaytech.com';

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api', domain });
});

app.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on ${port}`);
});
