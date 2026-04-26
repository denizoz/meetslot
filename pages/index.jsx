import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

// ── Constants ──────────────────────────────────────────────────────────────
const TIMES = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM",
  "4:00 PM","5:00 PM","6:00 PM","7:00 PM",
];

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay    = (y, m) => new Date(y, m, 1).getDay();
const toKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const fmtDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
};
const fmtShort = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
};

// ── API helpers ────────────────────────────────────────────────────────────
async function apiCreate(payload) {
  const r = await fetch("/api/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Create failed");
  return r.json(); // { id, meeting }
}

async function apiFetch(id) {
  const r = await fetch(`/api/meeting/${id}`);
  if (!r.ok) return null;
  return r.json();
}

async function apiVote(id, name, slots) {
  const r = await fetch(`/api/meeting/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, slots }),
  });
  if (!r.ok) throw new Error("Vote failed");
  return r.json();
}

// ── Styles ─────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh", background: "#0d1117",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  card: {
    background: "#161b22", border: "1px solid #30363d",
    borderRadius: 16, padding: 32, width: "100%", maxWidth: 520,
    marginTop: 12, boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
  },
  wideCard: {
    background: "#161b22", border: "1px solid #30363d",
    borderRadius: 16, padding: 32, width: "100%", maxWidth: 820,
    marginTop: 12, boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
  },
  logo: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 38, fontWeight: 900, color: "#e6edf3", letterSpacing: -1, margin: 0,
  },
  tagline: { color: "#8b949e", fontSize: 14, margin: "4px 0 0", fontStyle: "italic" },
  h2: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 26, fontWeight: 700, color: "#e6edf3", margin: "0 0 6px",
  },
  label: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#8b949e", letterSpacing: 1.5,
    textTransform: "uppercase", marginBottom: 10,
  },
  input: {
    width: "100%", padding: "12px 14px",
    background: "#0d1117", border: "1px solid #30363d",
    borderRadius: 10, fontSize: 14, color: "#e6edf3",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  },
  primaryBtn: {
    width: "100%", padding: "13px",
    background: "linear-gradient(135deg,#238636,#2ea043)",
    color: "#fff", border: "none", borderRadius: 10,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", letterSpacing: 0.3,
  },
  ghostBtn: {
    padding: "12px 18px",
    background: "#21262d", color: "#c9d1d9",
    border: "1px solid #30363d", borderRadius: 10,
    fontSize: 13, cursor: "pointer", fontFamily: "inherit",
  },
  pill: {
    display: "inline-flex", alignItems: "center",
    padding: "5px 12px", background: "#1f3d2a", color: "#56d364",
    border: "1px solid #238636", borderRadius: 20, fontSize: 12, gap: 6,
  },
  codeBox: {
    background: "#0d1117", border: "1px solid #30363d",
    borderRadius: 10, padding: "14px 16px",
    fontFamily: "monospace", fontSize: 13, color: "#79c0ff",
    wordBreak: "break-all", lineHeight: 1.6,
  },
};

const navBtn = {
  background: "#21262d", border: "1px solid #30363d",
  borderRadius: 6, color: "#c9d1d9", width: 28, height: 28,
  cursor: "pointer", fontSize: 16, lineHeight: "28px", textAlign: "center",
};

// ── Calendar picker ────────────────────────────────────────────────────────
function CalendarPicker({ selectedDates, onToggle }) {
  const today = new Date();
  const [cal, setCal] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const daysInMonth = getDaysInMonth(cal.y, cal.m);
  const firstDay    = getFirstDay(cal.y, cal.m);
  const todayKey    = toKey(today.getFullYear(), today.getMonth(), today.getDate());
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const nav = (dir) =>
    setCal(({ y, m }) => {
      const nm = m + dir;
      return nm < 0 ? { y: y - 1, m: 11 } : nm > 11 ? { y: y + 1, m: 0 } : { y, m: nm };
    });
  const monthLabel = new Date(cal.y, cal.m).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button style={navBtn} onClick={() => nav(-1)}>‹</button>
        <span style={{ color: "#e6edf3", fontSize: 14, fontWeight: 600 }}>{monthLabel}</span>
        <button style={navBtn} onClick={() => nav(+1)}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, textAlign: "center" }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={{ fontSize: 11, color: "#484f58", padding: "4px 0", fontWeight: 600 }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key  = toKey(cal.y, cal.m, day);
          const past = key < todayKey;
          const sel  = selectedDates.includes(key);
          return (
            <button key={key} disabled={past} onClick={() => !past && onToggle(key)} style={{
              padding: "8px 2px", border: "none", borderRadius: 8,
              background: sel ? "#238636" : "transparent",
              color: past ? "#484f58" : sel ? "#fff" : "#c9d1d9",
              cursor: past ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: sel ? 700 : 400, outline: "none",
            }}>{day}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── Slot grid ──────────────────────────────────────────────────────────────
function SlotGrid({ dates, times, selected, onToggle, readOnly = false, responses = null }) {
  const total = responses ? Object.keys(responses).length : 0;
  const getCount = (d, t) =>
    !responses ? 0 : Object.values(responses).filter(r => r[`${d}|${t}`]).length;
  const max = responses
    ? Math.max(1, ...dates.flatMap(d => times.map(t => getCount(d, t))))
    : 1;
  const heatColor = (n) => {
    if (n === 0) return "#0d1117";
    const r = n / max;
    return r < 0.34 ? "#1a3d2a" : r < 0.67 ? "#196c2e" : "#238636";
  };
  const th = { padding: "8px 4px", textAlign: "center", color: "#8b949e", fontSize: 11, fontWeight: 600 };
  const td = { padding: "3px", textAlign: "center" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={th}></th>
            {dates.map(d => (
              <th key={d} style={{ ...th, minWidth: 74 }}>
                <div style={{ fontSize: 10, color: "#8b949e" }}>{fmtShort(d).split(" ")[0]}</div>
                <div style={{ fontSize: 13, color: "#e6edf3", fontWeight: 600 }}>{fmtShort(d).split(" ")[1]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map(time => (
            <tr key={time}>
              <td style={{ ...td, fontFamily: "monospace", fontSize: 11, color: "#484f58", whiteSpace: "nowrap", paddingRight: 10 }}>{time}</td>
              {dates.map(date => {
                const k = `${date}|${time}`;
                const isSel = selected?.[k];
                const count = getCount(date, time);
                return (
                  <td key={date} style={td}>
                    {readOnly ? (
                      <div title={`${count}/${total} available`} style={{
                        height: 32, borderRadius: 6, background: heatColor(count),
                        border: "1px solid #30363d",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                        color: count > max / 2 ? "#56d364" : "#484f58",
                      }}>
                        {count > 0 ? count : ""}
                      </div>
                    ) : (
                      <button onClick={() => onToggle(k)} style={{
                        width: "100%", height: 32, border: "1px solid",
                        borderColor: isSel ? "#238636" : "#30363d",
                        borderRadius: 6, background: isSel ? "#1f3d2a" : "#0d1117",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {isSel && <span style={{ color: "#56d364", fontSize: 13 }}>✓</span>}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const router = useRouter();
  const [view,      setView]      = useState("home");
  const [meeting,   setMeeting]   = useState(null);
  const [meetingId, setMeetingId] = useState("");
  const [creating,  setCreating]  = useState({ title: "", dates: [], times: TIMES.slice(1, 7) });
  const [userName,  setUserName]  = useState("");
  const [selSlots,  setSelSlots]  = useState({});
  const [joinCode,  setJoinCode]  = useState("");
  const [copied,    setCopied]    = useState(false);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  // Handle ?m=CODE in URL
  useEffect(() => {
    const m = router.query.m;
    if (m) handleJoin(m);
  }, [router.query.m]);

  const handleJoin = async (id) => {
    setLoading(true); setError("");
    const data = await apiFetch(id.toUpperCase());
    setLoading(false);
    if (!data) { setError("Meeting not found. Double-check the code."); return; }
    setMeeting(data); setMeetingId(id.toUpperCase()); setView("vote");
  };

  const handleCreate = async () => {
    if (!creating.title || !creating.dates.length || !creating.times.length) return;
    setLoading(true);
    try {
      const { id, meeting } = await apiCreate({
        title: creating.title.trim(),
        dates: [...creating.dates].sort(),
        times: creating.times,
      });
      setMeeting(meeting); setMeetingId(id); setView("share");
    } catch { setError("Could not create meeting. Try again."); }
    setLoading(false);
  };

  const submitVote = async () => {
    if (!userName.trim()) return;
    setLoading(true);
    try {
      const updated = await apiVote(meetingId, userName.trim(), selSlots);
      setMeeting(updated); setView("results");
    } catch { setError("Could not save your response. Try again."); }
    setLoading(false);
  };

  const shareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/?m=${meetingId}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl()).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  };

  const toggleDate = (k) =>
    setCreating(p => ({
      ...p, dates: p.dates.includes(k) ? p.dates.filter(d => d !== k) : [...p.dates, k],
    }));

  const toggleTime = (t) =>
    setCreating(p => ({
      ...p, times: p.times.includes(t) ? p.times.filter(x => x !== t) : [...p.times, t],
    }));

  const respondersCount = Object.keys(meeting?.responses || {}).length;

  // ── Derived: best slot ─────────────────────────────────────────────────
  let bestSlot = null, bestCount = 0;
  (meeting?.dates || []).forEach(d =>
    (meeting?.times || []).forEach(t => {
      const k = `${d}|${t}`;
      const c = Object.values(meeting?.responses || {}).filter(r => r[k]).length;
      if (c > bestCount) { bestCount = c; bestSlot = { d, t }; }
    })
  );

  // ── Views ──────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>MeetSlot – Find when everyone's free</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      {view === "home" && (
        <div style={S.page}>
          <div style={S.card}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 44, marginBottom: 6 }}>📅</div>
              <h1 style={S.logo}>MeetSlot</h1>
              <p style={S.tagline}>Find when everyone's free — effortlessly.</p>
            </div>
            <button style={S.primaryBtn} onClick={() => setView("create")}>
              + Create a New Meeting
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0", color: "#484f58", fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#30363d" }} />
              <span>or join with a code</span>
              <div style={{ flex: 1, height: 1, background: "#30363d" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...S.input, flex: 1, letterSpacing: 2, textTransform: "uppercase" }}
                placeholder="MEETING CODE"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={e => e.key === "Enter" && joinCode && handleJoin(joinCode)}
              />
              <button style={{ ...S.ghostBtn, whiteSpace: "nowrap" }}
                onClick={() => joinCode && handleJoin(joinCode)}>
                {loading ? "…" : "Join →"}
              </button>
            </div>
            {error && <p style={{ color: "#f85149", fontSize: 13, marginTop: 10 }}>{error}</p>}
          </div>
        </div>
      )}

      {view === "create" && (
        <div style={S.page}>
          <div style={S.card}>
            <h2 style={S.h2}>New Meeting</h2>
            <p style={{ color: "#8b949e", fontSize: 13, marginBottom: 24 }}>
              Pick dates & times, then share the link with everyone.
            </p>
            <div style={{ marginBottom: 22 }}>
              <label style={S.label}>Meeting title</label>
              <input style={S.input} placeholder="e.g. Team lunch, Birthday dinner…"
                value={creating.title}
                onChange={e => setCreating(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={S.label}>Select possible dates</label>
              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 12, padding: 16, marginBottom: 10 }}>
                <CalendarPicker selectedDates={creating.dates} onToggle={toggleDate} />
              </div>
              {creating.dates.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[...creating.dates].sort().map(d => (
                    <span key={d} style={S.pill}>
                      {fmtDate(d)}
                      <span style={{ cursor: "pointer", opacity: .6 }} onClick={() => toggleDate(d)}>×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={S.label}>Time slots</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {TIMES.map(t => {
                  const on = creating.times.includes(t);
                  return (
                    <button key={t} onClick={() => toggleTime(t)} style={{
                      padding: "6px 13px",
                      background: on ? "#1f3d2a" : "#21262d",
                      color: on ? "#56d364" : "#8b949e",
                      border: `1px solid ${on ? "#238636" : "#30363d"}`,
                      borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                    }}>{t}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={S.ghostBtn} onClick={() => setView("home")}>← Back</button>
              <button
                style={{ ...S.primaryBtn, flex: 1, opacity: (creating.title && creating.dates.length && creating.times.length) ? 1 : .4 }}
                disabled={!creating.title || !creating.dates.length || !creating.times.length || loading}
                onClick={handleCreate}>
                {loading ? "Creating…" : "Create & Get Link →"}
              </button>
            </div>
            {error && <p style={{ color: "#f85149", fontSize: 13, marginTop: 10 }}>{error}</p>}
          </div>
        </div>
      )}

      {view === "share" && (
        <div style={S.page}>
          <div style={S.card}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <h2 style={S.h2}>{meeting?.title}</h2>
              <p style={{ color: "#8b949e", fontSize: 13 }}>
                {meeting?.dates.length} dates · {meeting?.times.length} time slots
              </p>
            </div>
            <label style={S.label}>Shareable link</label>
            <div style={S.codeBox}>{shareUrl()}</div>
            <div style={{ textAlign: "center", margin: "16px 0", color: "#8b949e", fontSize: 13 }}>
              or share the code
              <div style={{ marginTop: 6 }}>
                <span style={{
                  fontFamily: "monospace", fontSize: 22, fontWeight: 900,
                  letterSpacing: 5, color: "#56d364",
                  background: "#0d1117", padding: "6px 18px",
                  borderRadius: 8, display: "inline-block",
                  border: "1px solid #238636",
                }}>{meetingId}</span>
              </div>
            </div>
            <button style={{ ...S.primaryBtn, marginBottom: 10 }} onClick={copyLink}>
              {copied ? "✓ Copied!" : "📋 Copy Link"}
            </button>
            <button style={{ ...S.ghostBtn, width: "100%" }}
              onClick={() => { setSelSlots({}); setUserName(""); setView("vote"); }}>
              Fill In My Own Availability →
            </button>
          </div>
        </div>
      )}

      {view === "vote" && (
        <div style={{ ...S.page, padding: "20px 12px" }}>
          <div style={S.wideCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              <div>
                <h2 style={S.h2}>{meeting?.title}</h2>
                <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
                  {respondersCount} {respondersCount === 1 ? "person" : "people"} responded
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.ghostBtn} onClick={copyLink}>{copied ? "✓ Copied" : "Share"}</button>
                <button style={S.ghostBtn} onClick={() => setView("results")}>Results →</button>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>Your name</label>
              <input style={{ ...S.input, maxWidth: 280 }}
                placeholder="Enter your name"
                value={userName}
                onChange={e => setUserName(e.target.value)} />
            </div>
            <label style={S.label}>Click slots when you're free</label>
            <SlotGrid
              dates={meeting?.dates || []} times={meeting?.times || []}
              selected={selSlots} onToggle={k => setSelSlots(p => ({ ...p, [k]: !p[k] }))}
            />
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                style={{ ...S.primaryBtn, maxWidth: 200, opacity: userName.trim() ? 1 : .4 }}
                disabled={!userName.trim() || loading}
                onClick={submitVote}>
                {loading ? "Saving…" : "Submit →"}
              </button>
            </div>
            {error && <p style={{ color: "#f85149", fontSize: 13, marginTop: 10 }}>{error}</p>}
          </div>
        </div>
      )}

      {view === "results" && (
        <div style={{ ...S.page, padding: "20px 12px" }}>
          <div style={S.wideCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              <div>
                <h2 style={S.h2}>{meeting?.title}</h2>
                <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
                  {respondersCount} {respondersCount === 1 ? "person" : "people"} responded
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.ghostBtn} onClick={() => { setSelSlots({}); setUserName(""); setView("vote"); }}>
                  + Add Availability
                </button>
                <button style={S.ghostBtn} onClick={copyLink}>
                  {copied ? "✓ Copied" : "Share Link"}
                </button>
              </div>
            </div>

            {bestSlot && respondersCount > 0 && (
              <div style={{
                background: "#1f3d2a", border: "1px solid #238636",
                borderRadius: 12, padding: "14px 18px", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <div>
                  <div style={{ color: "#56d364", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Best Slot</div>
                  <div style={{ color: "#e6edf3", fontSize: 15, fontWeight: 600 }}>
                    {fmtDate(bestSlot.d)} at {bestSlot.t}
                  </div>
                </div>
                <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: "#0d1117", color: "#56d364", border: "1px solid #238636" }}>
                  {bestCount}/{respondersCount} available
                </span>
              </div>
            )}

            <label style={S.label}>Availability heatmap (hover for count)</label>
            <SlotGrid
              dates={meeting?.dates || []} times={meeting?.times || []}
              selected={{}} onToggle={() => {}}
              readOnly responses={meeting?.responses || {}}
            />

            <div style={{ marginTop: 20, borderTop: "1px solid #30363d", paddingTop: 16 }}>
              <label style={S.label}>Responded ({respondersCount})</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.keys(meeting?.responses || {}).length === 0
                  ? <span style={{ color: "#484f58", fontSize: 13 }}>No responses yet.</span>
                  : Object.keys(meeting.responses).map(n => (
                      <span key={n} style={{
                        padding: "5px 14px", borderRadius: 20,
                        background: "#21262d", border: "1px solid #30363d",
                        color: "#c9d1d9", fontSize: 13,
                      }}>{n}</span>
                    ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
