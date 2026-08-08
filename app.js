const express = require("express");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

app.set("view engine", "ejs");
app.use(express.static("public"));

function buildInfo() {
    return {
        appName: "Node AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApp Deployment -DevOps",

        version: process.env.APP_VERSION || "v6",
        buildNumber: process.env.BUILD_NUMBER || "local-dev",
        gitCommit: (process.env.GIT_COMMIT || "unknown").substring(0, 7),
        runtime: "Node.js " + process.version,
        container: "Docker",
        orchestrator: "Kubernetes",
        service: "NodePort",
        hostname: os.hostname(),
        podName: os.hostname(),
        currentTime: new Date().toLocaleString(),
        uptimeSeconds: Math.floor(process.uptime()),
        memory: {
            usedMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
            totalMB: Math.round(os.totalmem() / 1024 / 1024)
        },
        loadAvg: os.loadavg()[0].toFixed(2),
        cpus: os.cpus().length
    };
}

app.get("/", (req, res) => {
    res.render("index", buildInfo());
});

app.get("/api/info", (req, res) => {
    res.json(buildInfo());
});

app.get("/health", (req, res) => {
    res.json({
        status: "UP",
        uptimeSeconds: Math.floor(process.uptime())
    });
});

app.listen(PORT, () => {
    console.log(`Application started on port ${PORT}`);
});
