import express from 'express';

const app = express();
const PORT = 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Test health endpoint: http://localhost:${PORT}/health`);
});