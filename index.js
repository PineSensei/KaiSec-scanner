const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

app.post('/scan', (req, res) => {
  const domain = req.body.domain;
  if (!domain) return res.status(400).send("No domain provided");

  exec(`whatweb -a 3 --log-json=- ${domain}`, (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr);
    try {
      const jsonOutput = JSON.parse(stdout);
      res.json({ result: jsonOutput });
    } catch (e) {
      res.status(500).send("Failed to parse output: " + stdout);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KaiSec Scanner running on port ${PORT}`));
