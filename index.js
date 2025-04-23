const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/scan', (req, res) => {
  const domain = req.body.domain;
  if (!domain) return res.status(400).send("No domain provided");

  exec(`whatweb --log-json=- ${domain}`, (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr || err.message);

    try {
      const parsed = JSON.parse(stdout);
      res.json({ result: parsed });
    } catch (e) {
      res.status(500).send("Error parsing scan output:\n" + stdout);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KaiSec scanner ready on port ${PORT}`));
