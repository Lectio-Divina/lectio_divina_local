import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles.css";

const STAGES = [
  { id: "statio", name: "Statio", description: "Settle into the cell of your heart." },
  { id: "lectio", name: "Lectio", description: "Read the Word slowly and attentively." },
  { id: "meditatio", name: "Meditatio", description: "Reflect on what touches your soul." },
  { id: "oratio", name: "Oratio", description: "Respond to God in your own words." },
  { id: "contemplatio", name: "Contemplatio", description: "Rest in God's presence beyond words." }
];

const DEFAULT_DURATIONS = {
  statio: 2,
  lectio: 2,
  meditatio: 2,
  oratio: 2,
  contemplatio: 2
};

const STORAGE_KEYS = {
  settings: "lectio-divina-settings-v1",
  journal: "lectio-divina-journal-v1"
};

const Icon = ({ children, size = 22, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconSettings = p => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>;
const IconPen = p => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></Icon>;
const IconEdit = p => <Icon {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>;
const IconTrash = p => <Icon {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></Icon>;
const IconRotate = p => <Icon {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></Icon>;
const IconChevron = p => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const IconX = p => <Icon {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Icon>;
const IconPlay = p => <Icon {...p} fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21 6 3"/></Icon>;
const IconPause = p => <Icon {...p} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></Icon>;
const IconExternalLink = p => <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>;

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function fetchLocalLectionary(setStatusMessage) {
  try {
    setStatusMessage("Loading Lectionary...");
    const response = await fetch("./Daily_Gospel.txt");
    if (!response.ok) throw new Error("Daily_Gospel.txt was not found");
    const text = await response.text();
    const lines = text.trim().split("\n");
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yyyy = now.getFullYear();
    const targetKey = `${mm}/${dd}/${yyyy}`;

    for (const line of lines) {
      const [datePart, ...rest] = line.split(":");
      if (datePart && datePart.trim() === targetKey) {
        setStatusMessage("Reading loaded.");
        return {
          reference: rest.join(":").trim(),
          dateFormatted: now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          error: false
        };
      }
    }
    return { reference: "Reading Not Found", dateFormatted: now.toLocaleDateString(), error: true };
  } catch {
    return {
      reference: "Network Error",
      dateFormatted: new Date().toLocaleDateString(),
      error: true,
      message: "Could not retrieve the reading list."
    };
  }
}

export default function App() {
  const savedSettings = readStorage(STORAGE_KEYS.settings, {});
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [durations, setDurations] = useState({ ...DEFAULT_DURATIONS, ...(savedSettings.durations || {}) });
  const [timeLeft, setTimeLeft] = useState((savedSettings.durations?.statio || 2) * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedText, setExportedText] = useState("");
  const [copyStatus, setCopyStatus] = useState(false);
  const [darkMode, setDarkMode] = useState(Boolean(savedSettings.darkMode));
  const [todayReading, setTodayReading] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [journalEntries, setJournalEntries] = useState(() => readStorage(STORAGE_KEYS.journal, []));
  const [newEntryText, setNewEntryText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const stepLock = useRef(false);
  const wakeLockRef = useRef(null);

  const currentStage = STAGES[currentStageIndex];
  const totalDuration = durations[currentStage.id] * 60;
  const progress = totalDuration ? timeLeft / totalDuration : 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ durations, darkMode }));
  }, [durations, darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.journal, JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    fetchLocalLectionary(setLoadingStatus).then(setTodayReading);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    document.title = "Lectio Divina Timer";
  }, [darkMode]);

  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {}
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch {}
  }, []);

  useEffect(() => {
    isActive ? requestWakeLock() : releaseWakeLock();
    return () => {};
  }, [isActive, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && isActive) requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isActive, requestWakeLock]);

  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev <= 1 ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const playBell = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.5, now);
      masterGain.connect(ctx.destination);
      [
        [0.5, .4, 5, 0], [1, .3, 4, 1], [1.19, .2, 3, -1],
        [1.51, .15, 2.5, 2], [2, .1, 2, 0], [3, .05, 1.5, 3], [4.2, .03, 1, -2]
      ].forEach(([ratio, gain, decay, detune]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220 * ratio, now);
        osc.detune.setValueAtTime(detune, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(gain, now + .02);
        g.gain.exponentialRampToValueAtTime(.0001, now + decay);
        osc.connect(g); g.connect(masterGain);
        osc.start(now); osc.stop(now + decay + 1);
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (timeLeft !== 0 || !isActive || stepLock.current) return;
    stepLock.current = true;
    playBell();
    const nextIndex = currentStageIndex + 1;
    if (nextIndex < STAGES.length) {
      setCurrentStageIndex(nextIndex);
      setTimeLeft(durations[STAGES[nextIndex].id] * 60);
      setTimeout(() => { stepLock.current = false; }, 1000);
    } else {
      setIsActive(false);
      stepLock.current = false;
    }
  }, [timeLeft, isActive, currentStageIndex, durations, playBell]);

const toggleTimer = () => {
  if (!isActive) {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }

  setIsActive(v => !v);
};

  const handleReset = () => {
    setIsActive(false);
    stepLock.current = false;
    clearInterval(timerRef.current);
    setCurrentStageIndex(0);
    setTimeLeft(durations.statio * 60);
  };

  const handleSkip = () => {
    if (stepLock.current) return;
    playBell();
    const nextIndex = (currentStageIndex + 1) % STAGES.length;
    setCurrentStageIndex(nextIndex);
    setTimeLeft(durations[STAGES[nextIndex].id] * 60);
  };

  const saveJournal = () => {
    const text = newEntryText.trim();
    if (!text) return;
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      date: todayReading?.dateFormatted || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      reference: todayReading?.reference || "Journal Entry",
      text,
      createdAt: Date.now()
    };
    setJournalEntries(prev => [entry, ...prev]);
    setNewEntryText("");
  };

  const updateJournal = id => {
    const text = editText.trim();
    if (!text) return;
    setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, text } : e));
    setEditingId(null);
    setEditText("");
  };

  const deleteJournal = id => setJournalEntries(prev => prev.filter(e => e.id !== id));

  const generateExportText = () => {
    if (!journalEntries.length) return "";
    return journalEntries.map((entry, idx) =>
      `[Entry ${journalEntries.length - idx}] Date: ${entry.date}\nReading: ${entry.reference}\nReflection:\n${entry.text}\n--------------------------------------------------\n`
    ).join("\n");
  };

  const handleOpenExport = () => {
    setExportedText(generateExportText());
    setCopyStatus(false);
    setShowExportModal(true);
  };

  const handleCopyExport = async () => {
    try { await navigator.clipboard.writeText(exportedText); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = exportedText; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 3000);
  };

  const formatTime = seconds => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="app-shell">
      <header className="header">
        <button className="icon-button" onClick={() => setShowJournal(true)} title="Journal">
          <IconPen size={20}/>
          {journalEntries.length > 0 && <span className="journal-dot"/>}
        </button>

        <div className="title-area">
          <h1>Lectio Divina</h1>
          <a href="https://bible.usccb.org/daily-bible-reading" target="_blank" rel="noopener noreferrer" className="reading-link">
            <span>{todayReading ? (todayReading.error ? "Reading Error" : todayReading.reference) : loadingStatus}</span>
            <IconExternalLink size={10}/>
          </a>
        </div>

        <button className="icon-button" onClick={() => setShowSettings(true)} title="Settings">
          <IconSettings size={22}/>
        </button>
      </header>

      <main className="main">
        <section className="stage-heading">
          <h2>{currentStage.name}</h2>
          <p>{currentStage.description}</p>
        </section>

        <button className="timer" onClick={toggleTimer} aria-label={isActive ? "Pause timer" : "Start timer"}>
          <svg className="progress-ring" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="122" className="ring-bg"/>
            <circle cx="128" cy="128" r="122" className="ring-progress"
              strokeDasharray="766" strokeDashoffset={766 * (1 - progress)}/>
          </svg>
          <span className="time">{formatTime(timeLeft)}</span>
          <span className="play-icon">{isActive ? <IconPause size={18}/> : <IconPlay size={18}/>}</span>
        </button>

        <div className="controls">
          <button onClick={handleReset}><IconRotate size={18}/><span>Reset</span></button>
          <button onClick={handleSkip}><IconChevron size={18}/><span>Skip</span></button>
        </div>
      </main>

     <footer className="main-footer">
  <div className="stage-dots">
    {STAGES.map((_, i) => (
      <div
        key={i}
        className={`stage-dot ${i === currentStageIndex ? "active" : ""}`}
      />
    ))}
  </div>

  <div className="copyright-notice">
    © 2026 Lectio Divina · CC BY-NC Support: octave.resolve.0g@icloud.com
  </div>
</footer>

      {showJournal && (
        <div className="overlay full-screen">
          <div className="panel">
            <div className="panel-header">
              <div><h2>Prayer Journal</h2><p>Reflect on the Word</p></div>
              <div className="panel-actions">
                {journalEntries.length > 0 && <button className="outline-button" onClick={handleOpenExport}>Export All</button>}
                <button className="close-button" onClick={() => setShowJournal(false)}><IconX size={22}/></button>
              </div>
            </div>

            <div className="scroll-area">
              <div className="entry-card new-entry">
                <label>New Entry • {todayReading?.reference || "Today's Gospel"}</label>
                <textarea rows="3" value={newEntryText} onChange={e => setNewEntryText(e.target.value)}
                  placeholder="Write your meditation, conversation with God, or insights..."/>
                <div className="right"><button className="primary-button" disabled={!newEntryText.trim()} onClick={saveJournal}>Save Entry</button></div>
              </div>

              <h3 className="section-label">Past Reflections ({journalEntries.length})</h3>
              {journalEntries.length === 0 ? <p className="empty">No journal entries saved yet.</p> :
                journalEntries.map(entry => (
                  <div className="entry-card" key={entry.id}>
                    <div className="entry-meta"><span>{entry.date}</span><span>{entry.reference}</span>
                      <span className="entry-tools">
                        {editingId !== entry.id && <>
                          <button onClick={() => {setEditingId(entry.id); setEditText(entry.text)}}><IconEdit size={14}/></button>
                          <button onClick={() => deleteJournal(entry.id)}><IconTrash size={14}/></button>
                        </>}
                      </span>
                    </div>
                    {editingId === entry.id ? (
                      <>
                        <textarea rows="3" value={editText} onChange={e => setEditText(e.target.value)}/>
                        <div className="right gap"><button className="outline-button" onClick={() => setEditingId(null)}>Cancel</button>
                          <button className="primary-button" onClick={() => updateJournal(entry.id)}>Save</button></div>
                      </>
                    ) : <p className="reflection">{entry.text}</p>}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="overlay modal-overlay">
          <div className="modal">
            <div className="panel-header"><h2>Export Journal Log</h2><button className="close-button" onClick={() => setShowExportModal(false)}><IconX size={20}/></button></div>
            <p className="muted">Copy your complete prayer journal history below:</p>
            <textarea readOnly value={exportedText} rows="10"/>
            <div className="right gap"><button className="outline-button" onClick={() => setShowExportModal(false)}>Close</button>
              <button className="primary-button" onClick={handleCopyExport}>{copyStatus ? "Copied to Clipboard!" : "Copy All"}</button></div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="overlay full-screen">
          <div className="panel settings-panel">
            <div className="panel-header"><h2>Preferences</h2>
              <button className="outline-button" onClick={() => setShowSettings(false)}>Done</button>
            </div>
            <div className="scroll-area">
              <div className="setting-row"><span>Dark Mode</span>
                <button className={`switch ${darkMode ? "on" : ""}`} onClick={() => setDarkMode(v => !v)}><span/></button>
              </div>

              <h3 className="section-label">Timer Durations</h3>
              <div className="sync-card">
                <div><strong>Sync All Stages</strong><strong>{durations.statio} min</strong></div>
                <input type="range" min="1" max="30" value={durations.statio} onChange={e => {
                  const val = Number(e.target.value);
                  const next = Object.fromEntries(STAGES.map(s => [s.id, val]));
                  setDurations(next);
                  if (!isActive) setTimeLeft(val * 60);
                }}/>
              </div>

              {STAGES.map(stage => <div className="range-row" key={stage.id}>
                <div><span>{stage.name}</span><strong>{durations[stage.id]} min</strong></div>
                <input type="range" min="1" max="30" value={durations[stage.id]} onChange={e => {
                  const val = Number(e.target.value);
                  setDurations(prev => ({...prev, [stage.id]: val}));
                  if (stage.id === currentStage.id && !isActive) setTimeLeft(val * 60);
                }}/>
              </div>)}
<div className="install-card">
  <h3>Install This App</h3>

  <p>
    Add Lectio Divina to your home screen for a faster, app-like experience.
  </p>

  <strong>iPhone / iPad</strong>
  <p>
    Tap the Share button
    <br />
    then choose <b>Add to Home Screen</b>.
  </p>

  <strong>Android</strong>
  <p>
    Tap the browser menu
    <br />
    then choose <b>Install App</b> or <b>Add to Home Screen</b>.
  </p>
</div>
              <p className="storage-note">Your settings and journal are stored only in this browser using local storage. No Firebase account or cloud database is used.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
