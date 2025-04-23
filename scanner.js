const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

function cleanDomain(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    return {
      host: parsed.hostname, // store-signature.com
      full: inputUrl.startsWith("http") ? inputUrl : `http://${parsed.hostname}`
    };
  } catch (e) {
    return { host: inputUrl, full: `http://${inputUrl}` };
  }
}

app.post("/scan", (req, res) => {
  const input = req.body.domain;
  if (!input) return res.status(400).json({ status: "error", message: "No domain provided" });

  const { host, full } = cleanDomain(input);

  const tools = [
    `whatweb ${full}`,
    `nmap ${host}`,
    `nikto -h ${full}`,
    `dirb ${full}`,
    `whois ${host}`,
    `nslookup ${host}`
  ];

  const results = [];
  let current = 0;

  const runNext = () => {
    if (current >= tools.length) {
      return res.json({ status: "ok", results });
    }

    const command = tools[current];
    exec(command, { timeout: 20000 }, (err, stdout, stderr) => {
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`KaiSec scanner running on port ${PORT}`);
});
