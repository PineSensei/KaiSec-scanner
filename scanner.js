const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const dns = require("dns").promises;

const app = express();
app.use(cors());
app.use(express.json());

// Clean input into hostname + full URL
function cleanDomain(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    return {
      host: parsed.hostname, // e.g. store-signature.com
      full: inputUrl.startsWith("http") ? inputUrl : `http://${parsed.hostname}`
    };
  } catch (e) {
    return { host: inputUrl, full: `http://${inputUrl}` };
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

  const { host, full } = cleanDomain(input);
  const ip = await resolveIP(host);

  if (!ip) {
    return res.status(400).json({ status: "error", message: "Could not resolve IP for domain" });
  }

  const tools = [
    `whatweb ${full}`,
    `nmap ${ip}`,
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
        output: stdout || stderr || err?.message
