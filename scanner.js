const express = require("express");
const { exec } = require("child_process");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/scan", async (req, res) => {
  const domain = req.body.domain;
  if (!domain) return res.status(400).json({ error: "No domain provided." });

  const tools = {
    whatweb: `whatweb ${domain}`,
    nuclei: `nuclei -u ${domain} -silent`,
    nikto: `nikto -h ${domain}`,
    sslyze: `python3 tools/sslyze/sslyze/__main__.py --regular ${domain}`,
    httpx: `echo ${domain} | httpx -silent`,
    dirsearch: `python3 /usr/local/bin/dirsearch -u ${domain} -e php,html,txt -x 403 -t 5`,
    waybackurls: `echo ${domain} | tools/waybackurls/waybackurls`,
    subfinder: `subfinder -d ${domain} -silent`
  };

  const results = {};

  const runCommand = (name, cmd) => {
    return new Promise((resolve) => {
      exec(cmd, { maxBuffer: 1024 * 5000 }, (err, stdout, stderr) => {
        results[name] = stdout || stderr || "No output";
        resolve();
      });
    });
  };

  for (let [name, cmd] of Object.entries(tools)) {
    await runCommand(name, cmd);
  }

  res.json({ scanned: domain, results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KaiSec scanner running on port ${PORT}`));

