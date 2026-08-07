

const POLL_INTERVAL_MS = 3000;

function flash(el){
    if(!el) return;
    el.classList.remove("flash");
    // force reflow so the animation can restart
    void el.offsetWidth;
    el.classList.add("flash");
}

function setText(id, value){
    const el = document.getElementById(id);
    if(!el) return;
    if(el.textContent !== String(value)){
        el.textContent = value;
        flash(el);
    }
}

async function refresh(){
    try{
        const res = await fetch("/api/info");
        if(!res.ok) throw new Error("bad response");
        const data = await res.json();

        setText("pod-name", data.podName);
        setText("pod-name-2", data.podName);
        setText("footer-pod", data.podName);
        setText("hostname", data.hostname);
        setText("current-time", data.currentTime);
        setText("current-time-2", data.currentTime);
        setText("uptime", data.uptimeSeconds + "s");
        setText("uptime-2", data.uptimeSeconds + " seconds");
        setText("mem-used", data.memory.usedMB + " MB");
        setText("load-avg", data.loadAvg);
    }catch(err){
        const pill = document.getElementById("status-pill");
        if(pill){
            pill.style.color = "#ff5c5c";
            pill.querySelector("span:last-child").textContent = "CONNECTION LOST";
        }
        console.error("Failed to refresh dashboard data:", err);
    }
}

refresh();
setInterval(refresh, POLL_INTERVAL_MS);
