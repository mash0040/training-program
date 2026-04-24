const DAYS = {
  1: { name: "Day 1 \u2014 Upper Push", exercises: [
    { name: "ISO Incline Press", target: "10 lbs/side" },
    { name: "MTS High Row", target: "50 lbs" },
    { name: "Converging Chest Press", target: "60 lbs" },
    { name: "MTS Low Row", target: "60 lbs/side" },
    { name: "Machine Lateral Raise", target: "30 lbs" },
    { name: "Seated Dip", target: "65 lbs" }
  ] },
  2: { name: "Day 2 \u2014 Lower Body", exercises: [
    { name: "Pendulum Squat", target: "25 lbs/side" },
    { name: "ISO Lateral Leg Press", target: "180 lbs" },
    { name: "Leg Extension", target: "85 lbs" },
    { name: "Leg Curl \u2B50", target: "15 lbs/side" },
    { name: "[Booty - Builder] Back Extension [Glute Focused]", target: "100 lbs" },
    { name: "Hip Abductor Machine", target: "70 lbs" }
  ] },
  3: { name: "Day 3 \u2014 Full Body Pull", exercises: [
    { name: "Assisted Pull-Up", target: "130 lbs assist" },
    { name: "Diverging Lat Pulldown", target: "95 lbs" },
    { name: "Diverging Seated Row", target: "85 lbs" },
    { name: "ISO Lateral Chest Press", target: "30 lbs/side" },
    { name: "Preacher Bicep Curl", target: "35 lbs" },
    { name: "Linear Leg Press", target: "160 lbs" }
  ] }
};

let currentDay = 1;
let currentStar = 0;

window.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("log-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  renderExerciseRows(1);
  renderHistory();
  bindEventHandlers();
});

function bindEventHandlers() {
  const sessionToggle = document.getElementById("session-toggle");
  if (sessionToggle) {
    sessionToggle.addEventListener("click", toggleSessionTracker);
  }

  document.querySelectorAll(".log-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const day = parseInt(btn.dataset.day, 10);
      if (!Number.isNaN(day)) {
        selectDay(day, btn);
      }
    });
  });

  const starRow = document.getElementById("star-row");
  if (starRow) {
    starRow.addEventListener("click", (event) => {
      const target = event.target.closest(".star");
      if (!target) return;
      const val = parseInt(target.dataset.v, 10);
      if (!Number.isNaN(val)) setStar(val);
    });
  }

  const saveBtn = document.getElementById("log-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveSession);
  }

  const clearBtn = document.getElementById("log-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearForm);
  }

  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportPDF);
  }

  const historyContainer = document.getElementById("log-history");
  if (historyContainer) {
    historyContainer.addEventListener("click", (event) => {
      const header = event.target.closest(".history-header");
      if (header && historyContainer.contains(header)) {
        const id = parseInt(header.dataset.id, 10);
        if (!Number.isNaN(id)) toggleHistory(id);
        return;
      }

      const deleteBtn = event.target.closest(".history-delete");
      if (deleteBtn && historyContainer.contains(deleteBtn)) {
        const id = parseInt(deleteBtn.dataset.id, 10);
        if (!Number.isNaN(id)) deleteSession(id);
      }
    });
  }
}

function selectDay(day, btn) {
  currentDay = day;
  document.querySelectorAll(".log-tab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  renderExerciseRows(day);
  const success = document.getElementById("log-success");
  if (success) success.classList.add("is-hidden");
}

function renderExerciseRows(day) {
  const exercises = DAYS[day].exercises;
  const container = document.getElementById("exercise-log-rows");
  if (!container) return;

  container.innerHTML =
    '<table class="ex-log-table"><thead><tr><th>Exercise</th><th>Weight Used</th><th>Set 1</th><th>Set 2</th><th>Set 3</th></tr></thead><tbody>' +
    exercises
      .map(
        (ex, i) =>
          '<tr><td><div class="ex-name-cell">' +
          ex.name +
          '</div><div class="ex-target">Target: ' +
          ex.target +
          '</div></td>' +
          '<td><input type="text" class="weight-input" id="weight-' +
          i +
          '" placeholder="' +
          ex.target +
          '"></td>' +
          '<td><input type="number" class="set-input" id="s1-' +
          i +
          '" placeholder="-" min="0" max="30"></td>' +
          '<td><input type="number" class="set-input" id="s2-' +
          i +
          '" placeholder="-" min="0" max="30"></td>' +
          '<td><input type="number" class="set-input" id="s3-' +
          i +
          '" placeholder="-" min="0" max="30"></td></tr>'
      )
      .join("") +
    "</tbody></table>";
}

function setStar(val) {
  currentStar = val;
  document.querySelectorAll(".star").forEach((s) => {
    s.classList.toggle("active", parseInt(s.dataset.v, 10) <= val);
  });
}

function saveSession() {
  const date = document.getElementById("log-date").value;
  if (!date) {
    alert("Please select a date.");
    return;
  }
  const exercises = DAYS[currentDay].exercises;
  const exData = exercises.map((ex, i) => ({
    name: ex.name,
    target: ex.target,
    weight: document.getElementById("weight-" + i).value || "-",
    s1: document.getElementById("s1-" + i).value || "-",
    s2: document.getElementById("s2-" + i).value || "-",
    s3: document.getElementById("s3-" + i).value || "-"
  }));
  const session = {
    id: Date.now(),
    date,
    day: currentDay,
    dayName: DAYS[currentDay].name,
    energy: currentStar,
    exercises: exData,
    notes: document.getElementById("log-notes").value.trim()
  };
  const logs = getLogs();
  logs.unshift(session);
  localStorage.setItem("nikolas_logs", JSON.stringify(logs));
  document.getElementById("log-success").classList.remove("is-hidden");
  clearForm();
  renderHistory();
}

function clearForm() {
  document.getElementById("log-notes").value = "";
  document.getElementById("log-success").classList.add("is-hidden");
  currentStar = 0;
  setStar(0);
  renderExerciseRows(currentDay);
  document.getElementById("log-date").value = new Date().toISOString().split("T")[0];
}

function getLogs() {
  try {
    return JSON.parse(localStorage.getItem("nikolas_logs")) || [];
  } catch {
    return [];
  }
}

function deleteSession(id) {
  if (!confirm("Delete this session log?")) return;
  const logs = getLogs().filter((l) => l.id !== id);
  localStorage.setItem("nikolas_logs", JSON.stringify(logs));
  renderHistory();
}

function renderHistory() {
  const logs = getLogs();
  const container = document.getElementById("log-history");
  if (!container) return;

  if (!logs.length) {
    container.innerHTML =
      '<p class="log-empty">No sessions logged yet. Your history will appear here.</p>';
    return;
  }
  container.innerHTML = logs
    .map((log) => {
      const stars = log.energy
        ? "\u2605".repeat(log.energy) + "\u2606".repeat(5 - log.energy)
        : "-";
      const exRows = log.exercises
        .map(
          (ex) =>
            '<div class="history-ex-row">' +
            '<div class="history-ex-name">' +
            escapeHTML(ex.name) +
            "</div>" +
            '<div class="history-ex-val"><span>Weight</span>' +
            escapeHTML(ex.weight) +
            "</div>" +
            '<div class="history-ex-val"><span>Set 1</span>' +
            escapeHTML(ex.s1) +
            "</div>" +
            '<div class="history-ex-val"><span>Set 2</span>' +
            escapeHTML(ex.s2) +
            "</div>" +
            '<div class="history-ex-val"><span>Set 3</span>' +
            escapeHTML(ex.s3) +
            "</div>" +
            "</div>"
        )
        .join("");
      const notesHtml = log.notes
        ? '<div class="history-notes">"' + escapeHTML(log.notes) + '"</div>'
        : "";
      return (
        '<div class="history-card">' +
        '<div class="history-header" data-id="' +
        log.id +
        '">' +
        '<div class="history-header-left">' +
        '<div class="history-day-badge">DAY ' +
        log.day +
        "</div>" +
        '<div class="history-date">' +
        escapeHTML(formatDate(log.date)) +
        "</div>" +
        '<div class="history-stars">' +
        stars +
        "</div>" +
        "</div>" +
        '<div class="history-toggle" id="toggle-' +
        log.id +
        '">\u25BC Expand</div>' +
        "</div>" +
        '<div class="history-body" id="body-' +
        log.id +
        '">' +
        exRows +
        notesHtml +
        '<button class="history-delete" data-id="' +
        log.id +
        '">Delete Entry</button>' +
        "</div></div>"
      );
    })
    .join("");
}

function toggleHistory(id) {
  const body = document.getElementById("body-" + id);
  const toggle = document.getElementById("toggle-" + id);
  if (!body || !toggle) return;
  const open = body.classList.toggle("open");
  toggle.textContent = open ? "\u25B2 Collapse" : "\u25BC Expand";
}

function toggleSessionTracker() {
  const body = document.getElementById("logger-body");
  const btn = document.getElementById("session-toggle");
  if (!body || !btn) return;
  const collapsed = body.classList.toggle("is-collapsed");
  btn.textContent = collapsed ? "Show Tracker" : "Hide Tracker";
  btn.setAttribute("aria-expanded", String(!collapsed));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function escapeHTML(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function exportPDF() {
  const logs = getLogs();
  if (!logs.length) {
    alert("No sessions to export yet.");
    return;
  }

  const sessionsHTML = logs
    .map((log) => {
      const stars = log.energy
        ? "\u2605".repeat(log.energy) + "\u2606".repeat(5 - log.energy)
        : "-";
      const exRows = log.exercises
        .map(
          (ex) =>
            "<tr>" +
            "<td>" +
            escapeHTML(ex.name) +
            "</td>" +
            "<td>" +
            escapeHTML(ex.target) +
            "</td>" +
            "<td>" +
            escapeHTML(ex.weight) +
            "</td>" +
            "<td>" +
            escapeHTML(ex.s1) +
            "</td>" +
            "<td>" +
            escapeHTML(ex.s2) +
            "</td>" +
            "<td>" +
            escapeHTML(ex.s3) +
            "</td>" +
            "</tr>"
        )
        .join("");
      const notes = log.notes
        ? '<p class="notes"><strong>Notes:</strong> ' + escapeHTML(log.notes) + "</p>"
        : "";
      return (
        '<div class="session">' +
        '<div class="session-head">' +
        "<h2>" +
        escapeHTML(log.dayName) +
        "</h2>" +
        '<div class="session-meta">' +
        escapeHTML(formatDate(log.date)) +
        " &nbsp;\u00B7&nbsp; Energy: <span class=\"stars\">" +
        stars +
        "</span></div>" +
        "</div>" +
        "<table>" +
        "<thead><tr><th>Exercise</th><th>Target</th><th>Weight Used</th><th>Set 1</th><th>Set 2</th><th>Set 3</th></tr></thead>" +
        "<tbody>" +
        exRows +
        "</tbody>" +
        "</table>" +
        notes +
        "</div>"
      );
    })
    .join("");

  const exportCssUrl = new URL("export.css", window.location.href).href;
  const html =
    "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" +
    "<title>Nikolas - Phase 1 Session Log</title>" +
    "<link rel=\"stylesheet\" href=\"" +
    escapeHTML(exportCssUrl) +
    "\"></head><body>" +
    "<div class=\"print-bar no-print\"><span>Use your browser's print dialog \u00B7 Save as PDF</span><button id=\"print-btn\">Print / Save PDF</button></div>" +
    "<h1>Nikolas - Phase 1 Session Log</h1>" +
    "<div class=\"subtitle\">Exported " +
    escapeHTML(new Date().toLocaleDateString()) +
    " &nbsp;\u00B7&nbsp; " +
    logs.length +
    " session" +
    (logs.length === 1 ? "" : "s") +
    "</div>" +
    sessionsHTML +
    "</body></html>";

  const w = window.open("about:blank", "_blank");
  if (!w) {
    alert("Please allow pop-ups to export your PDF.");
    return;
  }

  try {
    w.opener = null;
  } catch (e) {
    // Ignore if blocked.
  }

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();

  const printBtn = w.document.getElementById("print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => w.print());
  }

  setTimeout(() => {
    try {
      w.print();
    } catch (e) {
      // Ignore print errors.
    }
  }, 500);
}
