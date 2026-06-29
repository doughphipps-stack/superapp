import { useState, useEffect, useRef } from "react";

//  Helpers 
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtShort = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

function daysDiff(dateStr) {
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.floor((t - d) / 86400000);
}

function parseDue(val) {
  const v = val.trim().toLowerCase();
  if (!v || v === "daily") return null;
  const now = new Date(); now.setHours(0,0,0,0);
  if (v === "today") return now.toISOString().slice(0,10);
  if (v === "tomorrow") { const d = new Date(now); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); }
  if (v === "weekly") { const d = new Date(now); d.setDate(d.getDate()+7); return d.toISOString().slice(0,10); }
  if (v === "monthly") { const d = new Date(now); d.setMonth(d.getMonth()+1); return d.toISOString().slice(0,10); }
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const dayIdx = days.indexOf(v);
  if (dayIdx !== -1) {
    const d = new Date(now);
    const diff = (dayIdx - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0,10);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(v)) {
    const parts = v.split("/");
    const yr = parts[2] ? (parts[2].length===2?"20"+parts[2]:parts[2]) : new Date().getFullYear();
    return `${yr}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`;
  }
  return null;
}

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

//  Palette 
const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceHigh: "#222538",
  border: "#2e3148",
  accent: "#6c63ff",
  accentSoft: "#6c63ff22",
  accentHover: "#7c73ff",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  text: "#e8e9f0",
  muted: "#8b8fa8",
  card: "#1e2132",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&family=Lato:wght@300;400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Lato', sans-serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
  input, textarea, select { background: ${C.surfaceHigh}; border: 1px solid ${C.border}; color: ${C.text}; border-radius: 8px; padding: 8px 12px; font-family: inherit; font-size: 14px; outline: none; }
  input:focus, textarea:focus, select:focus { border-color: ${C.accent}; }
  button { cursor: pointer; font-family: inherit; border: none; }
  .app { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 200px; min-width: 200px; background: ${C.surface}; border-right: 1px solid ${C.border}; display: flex; flex-direction: column; padding: 20px 0; }
  .sidebar-logo { padding: 0 20px 24px; font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 800; color: ${C.text}; letter-spacing: -.3px; }
  .sidebar-logo span { color: ${C.accent}; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 20px; font-size: 14px; font-weight: 500; color: ${C.muted}; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; }
  .nav-item:hover { color: ${C.text}; background: ${C.surfaceHigh}; }
  .nav-item.active { color: ${C.text}; background: ${C.accentSoft}; border-left-color: ${C.accent}; }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .page { flex: 1; overflow-y: auto; padding: 28px 32px; }
  .page-title { font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 24px; }
  .btn { padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; transition: all .15s; }
  .btn-primary { background: ${C.accent}; color: #fff; }
  .btn-primary:hover { background: ${C.accentHover}; }
  .btn-ghost { background: transparent; color: ${C.muted}; border: 1px solid ${C.border}; }
  .btn-ghost:hover { color: ${C.text}; border-color: ${C.accent}; }
  .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 16px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .tag-green { background: #22c55e22; color: ${C.green}; }
  .tag-red { background: #ef444422; color: ${C.red}; }
  .tag-amber { background: #f59e0b22; color: ${C.amber}; }
  .tag-purple { background: ${C.accentSoft}; color: ${C.accent}; }
`;

//  TODO 
const TODO_COLS = [
  { id: "habits", label: "Daily Habits", icon: "" },
  { id: "personal", label: "Personal", icon: "" },
  { id: "urgent", label: "Work: Signal - Must Get Done Today", icon: "" },
  { id: "priority", label: "Work: Noise - Delegate, De-prioritize, or Do Later", icon: "" },
  { id: "longterm", label: "Work Long-Term", icon: "" },
];

function TaskCard({ task, onToggle, onDelete }) {
  const diff = task.due ? daysDiff(task.due) : null;
  const isToday = diff === 0;
  const isOverdue = diff !== null && diff > 0 && !task.done;
  const dueLabelColor = isOverdue ? C.red : isToday ? C.green : C.muted;

  function dueLabel() {
    if (!task.due) return task.cadence === "daily" ? "Daily" : null;
    if (isToday) return "Today";
    if (diff === 1) return "Yesterday";
    if (isOverdue) return fmtShort(task.due);
    return fmtShort(task.due);
  }

  return (
    <div style={{
      background: C.surfaceHigh,
      border: `1px solid ${isOverdue ? C.red+"44" : isToday ? C.green+"44" : task.done ? C.border+"44" : C.border}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 8,
      opacity: task.done ? .5 : 1, transition: "opacity .2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div onClick={() => onToggle(task.id)} style={{
          width: 18, height: 18, borderRadius: 5,
          border: `2px solid ${task.done ? C.accent : C.border}`,
          background: task.done ? C.accent : "transparent",
          flexShrink: 0, marginTop: 2, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "#fff", transition: "all .15s",
        }}>{task.done ? "✓" : ""}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, textDecoration: task.done ? "line-through" : "none", color: task.done ? C.muted : C.text, wordBreak: "break-word" }}>
            {task.text}
          </div>
          {dueLabel() && (
            <div style={{ fontSize: 11, fontWeight: isOverdue || isToday ? 600 : 400, color: dueLabelColor, marginTop: 3 }}>
              {isOverdue ? `Overdue — ${dueLabel()}` : dueLabel()}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(task.id)} style={{ background: "none", color: C.muted, fontSize: 14, padding: "0 4px", flexShrink: 0 }}×</button>
      </div>
    </div>
  );
}

const SCHEDULE_KEYWORDS = ["today","tomorrow","daily","weekly","monthly","sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

function extractSchedule(raw) {
  const parts = raw.trim().split(/\s+/);
  if (parts.length < 2) return { taskText: raw.trim(), whenWord: "" };
  const last = parts[parts.length - 1].toLowerCase();
  const isDate = /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(last) || /^\d{4}-\d{2}-\d{2}$/.test(last);
  if (SCHEDULE_KEYWORDS.includes(last) || isDate) {
    return { taskText: parts.slice(0, -1).join(" "), whenWord: last };
  }
  return { taskText: raw.trim(), whenWord: "" };
}

function AddTaskInput({ colId, onAdd }) {
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);

  const { taskText, whenWord } = extractSchedule(text);
  const parsedDue = whenWord ? parseDue(whenWord) : null;
  const isTomorrow = whenWord === "tomorrow";
  const isScheduled = !!whenWord && whenWord !== "daily";

  const chipColor = isTomorrow ? "#f97316" : C.green;

  function submit() {
    if (!taskText.trim()) return;
    const due = parseDue(whenWord);
    const cadence = whenWord || "daily";
    onAdd({ id: Date.now() + Math.random(), text: taskText.trim(), cadence, due, done: false, created: today(), col: colId });
    setText(""); setExpanded(false);
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {!expanded ? (
        <button onClick={() => setExpanded(true)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px dashed ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, fontWeight: 500 }}>
          + Add new task
        </button>
      ) : (
        <div style={{ background: C.surfaceHigh, border: `1px solid ${C.accent}`, borderRadius: 10, padding: 12 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Task name… end with: today · tomorrow · monday · 6/30"
            style={{ width: "100%", marginBottom: isScheduled ? 6 : 10 }}
            onKeyDown={e => e.key === "Enter" && submit()}
            autoFocus
          />
          {isScheduled && (
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: chipColor + "22", border: `1px solid ${chipColor}55` }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: chipColor }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: chipColor }}>
                  {whenWord.charAt(0).toUpperCase() + whenWord.slice(1)}{parsedDue ? ` — ${fmtShort(parsedDue)}` : ""}
                </span>
              </div>
              <span style={{ fontSize: 11, color: C.muted }}>" + taskText + ""</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: "7px 0" }} onClick={submit}>Add</button>
            <button className="btn btn-ghost" style={{ padding: "7px 14px" }} onClick={() => { setExpanded(false); setText(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TodoPage({ tasks, setTasks }) {
  function addTask(task) { setTasks(t => [...t, task]); }
  function toggleTask(id) { setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x)); }
  function deleteTask(id) { setTasks(t => t.filter(x => x.id !== id)); }

  return (
    <div>
      <div className="page-title">To Do</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, height: "calc(100vh - 120px)", overflowX: "auto" }}>
        {TODO_COLS.map(col => {
          const colTasks = tasks.filter(t => t.col === col.id);
          const done = colTasks.filter(t => t.done).length;
          return (
            <div key={col.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{col.label}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{done}/{colTasks.length}</span>
              </div>
              <AddTaskInput colId={col.id} onAdd={addTask} />
              <div style={{ flex: 1, overflowY: "auto", paddingRight: 2 }}>
                {colTasks.sort((a,b) => (a.done===b.done?0:a.done?1:-1)).map(t => (
                  <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarPage() {
  const [clientId, setClientId] = useState(() => localStorage.getItem("gcal_client_id") || "");
  const [inputId, setInputId] = useState("");
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function loadGapi(id) {
    return new Promise((resolve, reject) => {
      if (window.gapi) { resolve(); return; }
      const s = document.createElement("script");
      s.src = "https://apis.google.com/js/api.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function connect() {
    const id = inputId.trim();
    if (!id) return;
    setStatus("connecting"); setErrorMsg("");
    try {
      await loadGapi(id);
      await new Promise((res, rej) => window.gapi.load("client:auth2", { callback: res, onerror: rej }));
      await window.gapi.client.init({
        clientId: id,
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      });
      const auth = window.gapi.auth2.getAuthInstance();
      if (!auth.isSignedIn.get()) await auth.signIn();
      localStorage.setItem("gcal_client_id", id);
      setClientId(id);
      setStatus("connected");
      await fetchEvents();
    } catch(e) {
      setStatus("error");
      setErrorMsg(e?.error === "popup_blocked_by_browser"
        ? "Popup was blocked — allow popups for this site and try again."
        : e?.error === "access_denied"
        ? "Access denied. Make sure this URL is listed under Authorized JavaScript origins in your Google Cloud Console."
        : e?.details || e?.message || "Connection failed. Check your Client ID and try again.");
    }
  }

  async function fetchEvents() {
    try {
      const now = new Date();
      const end = new Date(now); end.setDate(end.getDate() + 14);
      const res = await window.gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: now.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 30,
      });
      setEvents(res.result.items || []);
    } catch(e) { console.error(e); }
  }

  function formatEventTime(e) {
    if (e.start.dateTime) {
      return new Date(e.start.dateTime).toLocaleString("en-US", { weekday:"short", month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
    }
    return new Date(e.start.date + "T00:00:00").toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" }) + " (all day)";
  }

  if (status === "connected" || clientId) {
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 24 }}>
          <div className="page-title" style={{ marginBottom: 0 }}>Calendar</div>
          <div style={{ display:"flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={fetchEvents}>Refresh</button>
            <button className="btn btn-ghost" style={{ color: C.red }} onClick={() => { localStorage.removeItem("gcal_client_id"); setClientId(""); setStatus("idle"); setEvents([]); }}>Disconnect</button>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="card" style={{ textAlign:"center", padding: 40, color: C.muted }}>
            No upcoming events in the next 14 days.<br />
            <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={fetchEvents}>Refresh</button>
          </div>
        ) : (
          <div style={{ display:"grid", gap: 10 }}>
            {events.map(e => (
              <div key={e.id} className="card" style={{ display:"flex", gap: 16, alignItems:"flex-start" }}>
                <div style={{ minWidth: 4, alignSelf:"stretch", borderRadius: 4, background: e.colorId ? "#888" : C.accent }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{e.summary}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{formatEventTime(e)}</div>
                  {e.location && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{e.location}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">Calendar</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ borderColor: C.accent + "55" }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Connect Google Calendar</div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
            Set up Google Calendar API access:
          </p>
          <ol style={{ color: C.muted, fontSize: 13, lineHeight: 2.2, paddingLeft: 18 }}>
            <li>Go to <span style={{ color: C.accent }}>console.cloud.google.com</span></li>
            <li>Create a project → Enable <strong style={{ color: C.text }}>Google Calendar API</strong></li>
            <li>Credentials → <strong style={{ color: C.text }}>OAuth 2.0 Client ID</strong> → Web application</li>
            <li>Add this page's URL under <strong style={{ color: C.text }}>Authorized JavaScript origins</strong></li>
            <li>Copy your Client ID and paste it below</li>
          </ol>
        </div>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Paste your Client ID</div>
          <input
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            placeholder="xxxxxxxxx.apps.googleusercontent.com"
            style={{ width: "100%", marginBottom: 10, fontFamily: "monospace", fontSize: 12 }}
          />
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={connect} disabled={status === "connecting"}>
            {status === "connecting" ? "Connecting…" : "Connect Google Calendar"}
          </button>
          {status === "error" && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#ef444422", border: `1px solid ${C.red}44`, borderRadius: 8, fontSize: 12, color: C.red, lineHeight: 1.6 }}>
              {errorMsg}
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
            Your credentials stay in your browser only. Make sure the URL you're viewing this on is added as an Authorized JavaScript origin in Google Cloud Console.
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionPage() {
  return <div><div className="page-title">Nutrition</div><p style={{ color: C.muted }}>Feature in development</p></div>;
}

function FitnessPage() {
  return <div><div className="page-title">Fitness</div><p style={{ color: C.muted }}>Feature in development</p></div>;
}

function ReadingPage() {
  return <div><div className="page-title">Reading</div><p style={{ color: C.muted }}>Feature in development</p></div>;
}

function ComedyPage() {
  return <div><div className="page-title">Comedy</div><p style={{ color: C.muted }}>Feature in development</p></div>;
}

const TABS = [
  { id: "todo", label: "To Do", icon: "" },
  { id: "calendar", label: "Calendar", icon: "" },
  { id: "nutrition", label: "Nutrition", icon: "" },
  { id: "fitness", label: "Fitness", icon: "" },
  { id: "reading", label: "Reading", icon: "" },
  { id: "comedy", label: "Comedy", icon: "" },
];

export default function App() {
  const [tab, setTab] = useState("todo");
  const [tasks, setTasks] = useLocalStorage("lt_tasks", []);
  const [nutrition, setNutrition] = useLocalStorage("lt_nutrition", []);
  const [runs, setRuns] = useLocalStorage("lt_runs", []);
  const [lifts, setLifts] = useLocalStorage("lt_lifts", []);
  const [weights, setWeights] = useLocalStorage("lt_weights", []);
  const [books, setBooks] = useLocalStorage("lt_books", []);
  const [bits, setBits] = useLocalStorage("lt_bits", []);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-logo">life<span>.</span>track</div>
          {TABS.map(t => (
            <div
              key={t.id}
              className={`nav-item ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </div>
          ))}
        </nav>
        <main className="main">
          <div className="page">
            {tab === "todo" && <TodoPage tasks={tasks} setTasks={setTasks} />}
            {tab === "calendar" && <CalendarPage />}
            {tab === "nutrition" && <NutritionPage />}
            {tab === "fitness" && <FitnessPage />}
            {tab === "reading" && <ReadingPage />}
            {tab === "comedy" && <ComedyPage />}
          </div>
        </main>
      </div>
    </>
  );
}
