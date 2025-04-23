const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const dns = require("dns").promises;

const app = express();
app.use(cors());
app.use(express.json());

// Clean URL into hostname + full http(s) version
function cleanDomain(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    return {
      host: parsed.hostname, // e.g., store-signature.com
      full: inputUrl.startsWith("http") ? inputUrl : `http://${parsed.hostname}`,
      isHttps: parsed.protocol === "https:"
    };
  } catch (e) {
    return { host: inputUrl, full: `http://${inputUrl}`, isHttps: false };
  }
}

// Resolve IP from hostname
async function resolveIP(hostname) {
  try {
    const result = await dns.lookup(hostname);
    return result.address;
  } catch (e) {
    return null;
  }
}

app.post("/scan", async (req, res) => {
  const input = req.body.domain;
  if (!input) {
    return res.status(400).json({ status: "error", message: "No domain provided" });
  }

  const { host, full, isHttps } = cleanDomain(input);
  const ip = await resolveIP(host);

  if (!ip) {
    return res.status(400).json({ status: "error", message: "Could not resolve IP for domain" });
  }

  const tools = [
    `whatweb ${full}`,
    `nmap -F ${ip}`,
    `nikto -h ${full}`,
    `dirb http://${host}`,
    `whois ${host.replace(/^www\./, '')}`,
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
