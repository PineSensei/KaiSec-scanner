const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Main scan route
app.post("/scan", (req, res) => {
  const domain = req.body.domain;
  if (!domain) {
    return res.status(400).json({ status: "error", message: "No domain provided" });
  }

  const tools = [
    `whatweb ${domain}`,
    `nmap ${domain}`,
    `nikto -h ${domain}`,
    `dirb http://${domain}`,
    `whois ${domain}`,
    `nslookup ${domain}`
  ];

  let results = [];
  let current = 0;

  const runNext = () => {
    if (current >= tools.length) {
      return res.json({ status: "ok", results });
    }

    const command = tools[current];
    exec(command, (err, stdout, stderr) => {
      results.push({
        tool: command.split(" ")[0],
        command,
        output: stdout || stderr || err?.message || "No output"
      });
      current++;
      runNext();
    });
  };

  runNext();
});

// Listen on port 8080 (Railway default)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`KaiSec scanner is running on port ${PORT}`);
});
