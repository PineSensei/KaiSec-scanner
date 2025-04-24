const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const summarize = require("./summarize");

const app = express();
app.use(cors());
app.use(express.json());

function extractIPFromWhatWeb(output) {
  const ipMatch = output.match(/IP\[[^\[\]]*([\d.]+)[^\[\]]*\]/);
  return ipMatch ? ipMatch[1] : null;
}

function cleanOutput(tool, output) {
  if (tool === "dirb") {
    return output
      .split("\n")
      .filter((line) => !line.trim().startsWith("--> Testing:"))
      .join("\n");
  }
  return output;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post("/scan", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });

  const tools = [
    {
      name: "whatweb",
      command: `whatweb ${domain}`,
    },
    {
      name: "nmap",
      command: "",
    },
    {
      name: "nikto",
      command: `nikto -h ${domain}`,
      heavy: true,
    },
    {
      name: "dirb",
      command: `dirb http://${domain.replace(/^https?:\/\//, "")} /usr/share/dirb/wordlists/small.txt -f`,
      heavy: true,
    },
    {
      name: "whois",
      command: `whois ${domain.replace(/^https?:\/\//, "").replace(/\/.*/, "")}`,
    },
    {
      name: "nslookup",
      command: `nslookup ${domain.replace(/^https?:\/\//, "").replace(/\/.*/, "")}`,
    },
  ];

  const results = [];

  for (const tool of tools) {
    let output = "";
    try {
      if (tool.name === "nmap") {
        const whatwebResult = results.find((r) => r.tool === "whatweb");
        const ip = extractIPFromWhatWeb(whatwebResult?.output || "");
        if (ip) {
          tool.command = `nmap -F ${ip}`;
        } else {
          throw new Error("IP address not found for nmap");
        }
      }

      output = await new Promise((resolve) => {
        exec(tool.command, { timeout: 20000 }, (error, stdout, stderr) => {
          if (error) {
            resolve(`Error: ${stderr || error.message}`);
          } else {
            resolve(stdout);
          }
        });
      });

      if (tool.heavy) {
        await delay(1000);
      }
    } catch (err) {
      output = `Execution error: ${err.message}`;
    }

    results.push({
      tool: tool.name,
      command: tool.command,
      output: cleanOutput(tool.name, output),
    });
  }

  const summary = await summarize(results);
  res.json({ status: "ok", summary, results });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Scanner API running on port ${PORT}`);
});
