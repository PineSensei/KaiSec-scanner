const express = require("express");
const app = express();
const { exec } = require("child_process");

app.use(express.json());

app.post("/scan", async (req, res) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ status: "error", message: "No domain provided" });
  }

  const tools = [
    `nmap -F ${domain}`,
    `whatweb ${domain}`,
    `nikto -h ${domain}`,
    `curl -I http://${domain}`,
    `host ${domain}`,
    `whois ${domain}`,
    `nslookup ${domain}`
  ];

  const results = [];

  for (const cmd of tools) {
    try {
      const output = await new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error) return resolve(`[Error] ${cmd}: ${stderr}`);
          return resolve(`[OK] ${cmd}:\n${stdout}`);
        });
      });
      results.push(output);
    } catch (e) {
      results.push(`[Fail] ${cmd}`);
    }
  }

  res.json({
    status: "success",
    domain,
    report: results.join("\n\n")
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KaiSec scanner running on port ${PORT}`);
});
