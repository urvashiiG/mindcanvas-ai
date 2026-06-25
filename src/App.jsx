import { useState, useEffect, useRef } from "react";
import { askNova } from "./utils/gemini";
import "./App.css";
const colorPickerStyle = `
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}
  @keyframes pulseGlow {
  0% {
    box-shadow: 0 0 4px rgba(168,85,247,0.15);
  }

  50% {
    box-shadow: 0 0 10px rgba(168,85,247,0.30);
  }

  100% {
    box-shadow: 0 0 4px rgba(168,85,247,0.15);
  }
}
  @keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

function App() {
  const chatEndRef = useRef(null);
  const [chat, setChat] = useState(
    JSON.parse(
      localStorage.getItem("mindcanvas-chat")
    ) || []
  );
  useEffect(() => {
    localStorage.setItem(
      "mindcanvas-chat",
      JSON.stringify(chat)
    );
  }, [chat]);
  const [activeTab, setActiveTab] = useState("home");
  const [message, setMessage] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState(
    JSON.parse(
      localStorage.getItem("mindcanvas-goals")
    ) || []
  );

  const [goalInput, setGoalInput] =
    useState("");
  useEffect(() => {
    localStorage.setItem(
      "mindcanvas-goals",
      JSON.stringify(goals)
    );
  }, [goals]);

  const [note, setNote] = useState(
    localStorage.getItem("mindcanvas-note") || ""
  );
  const [saveStatus, setSaveStatus] =
    useState("Saved");
  // NOTE: completedTasks now stores line INDEXES (numbers), not task text.
  // This is what makes duplicate-named tasks work correctly.
  const [completedTasks, setCompletedTasks] = useState(
    JSON.parse(
      localStorage.getItem("mindcanvas-completed")
    ) || []
  );
  useEffect(() => {
    localStorage.setItem(
      "mindcanvas-completed",
      JSON.stringify(completedTasks)
    );
  }, [completedTasks]);
  const [selectedColor, setSelectedColor] =
    useState("#7BDFF2");
  const [selectedDate, setSelectedDate] = useState("");
  const [eventText, setEventText] = useState("");

  const [events, setEvents] = useState(
    JSON.parse(
      localStorage.getItem("mindcanvas-events")
    ) || []
  );

  useEffect(() => {
    localStorage.setItem(
      "mindcanvas-events",
      JSON.stringify(events)
    );
  }, [events]);
  const savedStickyNotes = JSON.parse(
    localStorage.getItem("mindcanvas-sticky")
  );

  const [stickyNotes, setStickyNotes] = useState(
    savedStickyNotes && savedStickyNotes.length > 0
      ? savedStickyNotes
      : [
        {
          id: 1,
          title: "Portfolio Ideas",
          content: "",
          color: "#ee4ab7",
        },
        {
          id: 2,
          title: "Instagram Content",
          content: "",
          color: "#67c7f7",
        },
      ]
  );
  useEffect(() => {
    setSaveStatus("Saving...");

    const timer = setTimeout(() => {
      localStorage.setItem(
        "mindcanvas-note",
        note
      );

      setSaveStatus("Saved");
    }, 1000);

    return () => clearTimeout(timer);
  }, [note]);

  useEffect(() => {
    localStorage.setItem(
      "mindcanvas-sticky",
      JSON.stringify(stickyNotes)
    );
  }, [stickyNotes]);

  // FIX: tasks now carry their original line index (idx) as a stable ID.
  // This ID is what we use everywhere instead of task text, so duplicate
  // task names ("Exercise" twice) are tracked independently and correctly.
  const noteLines = note.split("\n");
  const tasks = noteLines
    .map((line, idx) => ({ line, idx }))
    .filter((item) => item.line.trim().startsWith("-"));

  const wordCount = note.trim()
    ? note.trim().split(/\s+/).length
    : 0;

  const charCount = note.length;
  const getTaskIcon = (task) => {
    const text = task.toLowerCase();

    if (text.includes("instagram")) return "📸";
    if (text.includes("github")) return "🐙";
    if (text.includes("linkedin")) return "💼";
    if (text.includes("youtube")) return "▶️";

    return "☐";
  };
  const handleSend = async () => {
    if (!message.trim()) return;
    const currentMessage = message;

    setMessage("");
    setLoading(true);

    const userMsg = {
      sender: "user",
      text: currentMessage,
    };

    setChat((prev) => [...prev, userMsg]);

    try {
      const aiReply = await askNova(currentMessage);
      const cleanReply = aiReply
        .replace(/\*\*/g, "")
        .replace(/\*/g, "•");

      const botMsg = {
        sender: "ai",
        text: cleanReply,
      };

      setChat((prev) => [...prev, botMsg]);
      setLoading(false);
    } catch (error) {
  console.error("NOVA ERROR:", error);

  const botMsg = {
    sender: "ai",
    text: "Sorry, Nova AI is unavailable right now.",
  };

  setChat((prev) => [...prev, botMsg]);
}
  };
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat, loading]);
  const upcomingEvent =
    events.length > 0
      ? events[events.length - 1]
      : null;
  const completedGoals =
    goals.filter((goal) => goal.done).length;

  const goalPercentage =
  goals.length
    ? Math.round(
        (completedGoals / goals.length) * 100
      )
    : 0;

const toggleGoal = (index) => {
  setGoals(
    goals.map((goal, i) =>
      i === index
        ? {
            ...goal,
            done: !goal.done,
          }
        : goal
    )
  );
};

const isMobile = window.innerWidth < 768;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{colorPickerStyle}</style>

      <div
        style={{
          minWidth: 0,
          overflow: "hidden",
          width: "100%",
          display: "grid",
          color: "white",
          background:
            "linear-gradient(135deg,#0B1020,#131A2E,#1A1233)",

          backgroundSize: "200% 200%",
          animation: "gradient 25s ease infinite",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "220px minmax(0,1fr) 280px",
          gridTemplateAreas: isMobile
            ? `
    "main"
    "nova"
  `
            : `"sidebar main nova"`,
          gap: "20px",
          padding: isMobile ? "10px" : "20px",
        }}
      >
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              position: "fixed",
              top: "8px",
              left: "8px",
              width: "36px",
              height: "36px",
              fontSize: "18px",
              zIndex: 9999,
              background: "#8B5CF6",
              border: "none",
              borderRadius: "10px",
              color: "white",
            }}
          >
            ☰
          </button>
        )}
        {isMobile && menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 998,
            }}
          />
        )}
        {/* Sidebar */}
        <div
          style={{
            background: "#1A2238",
            padding: "15px",
            borderRadius: isMobile ? "0" : "10px",
            width: isMobile ? "240px" : "220px",
            flexShrink: 0,
            overflowX: "hidden", minHeight: "100vh",
            position: isMobile ? "fixed" : "relative",
            top: 0,
            left: 0,
            gridArea: "sidebar",
            zIndex: 999,

            transform:
              isMobile && !menuOpen
                ? "translateX(-100%)"
                : "translateX(0)",

            transition: "0.3s ease",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              marginLeft: isMobile ? "28px" : "0",
              marginBottom: "20px",
              whiteSpace: "nowrap",
            }}
          >
            🌙 MindCanvas
          </h2>
          <p
            onClick={() => {
              setActiveTab("home");
              if (isMobile) setMenuOpen(false);
            }}
            style={{
              marginTop: isMobile ? "60px" : "0",
              padding: "8px 12px",
              borderRadius: "10px",
              background:
                activeTab === "home"
                  ? "rgba(139,92,246,0.15)"
                  : "transparent",
              transition: "0.3s",
              cursor: "pointer",
              color:
                activeTab === "home"
                  ? "#A78BFA"
                  : "white",
              fontWeight:
                activeTab === "home"
                  ? "bold"
                  : "normal",
            }}
          >
            🏠 Home
          </p>
          <p
            onClick={() => {
              setActiveTab("notes");
              if (isMobile) setMenuOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background:
                activeTab === "notes"
                  ? "rgba(139,92,246,0.15)"
                  : "transparent",
              transition: "0.3s",
              cursor: "pointer",
              color:
                activeTab === "notes"
                  ? "#A78BFA"
                  : "white",
              fontWeight:
                activeTab === "notes"
                  ? "bold"
                  : "normal",
            }}
          >
            📝 Notes
          </p>
          <p
            onClick={() => {
              setActiveTab("tasks");
              if (isMobile) setMenuOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background:
                activeTab === "tasks"
                  ? "rgba(139,92,246,0.15)"
                  : "transparent",
              transition: "0.3s",
              cursor: "pointer",
              color:
                activeTab === "tasks"
                  ? "#A78BFA"
                  : "white",
              fontWeight:
                activeTab === "tasks"
                  ? "bold"
                  : "normal",
            }}
          >
            ✅ Tasks
          </p>

          <p
            onClick={() => {
              setActiveTab("goals");
              if (isMobile) setMenuOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background:
                activeTab === "goals"
                  ? "rgba(139,92,246,0.15)"
                  : "transparent",
              transition: "0.3s",
              cursor: "pointer",
              color:
                activeTab === "goals"
                  ? "#A78BFA"
                  : "white",
              fontWeight:
                activeTab === "goals"
                  ? "bold"
                  : "normal",
            }}
          >
            🎯 Goals
          </p>

          <p
            onClick={() => {
              setActiveTab("calendar");
              if (isMobile) setMenuOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background:
                activeTab === "calendar"
                  ? "rgba(139,92,246,0.15)"
                  : "transparent",
              transition: "0.3s",
              cursor: "pointer",
              color:
                activeTab === "calendar"
                  ? "#A78BFA"
                  : "white",
              fontWeight:
                activeTab === "calendar"
                  ? "bold"
                  : "normal",
            }}
          >
            📅 Calendar
          </p>
          <p
            onClick={() => {
              setActiveTab("settings");
              if (isMobile) setMenuOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background:
                activeTab === "settings"
                  ? "rgba(139,92,246,0.15)"
                  : "transparent",
              transition: "0.3s",
              cursor: "pointer",
              color:
                activeTab === "settings"
                  ? "#A78BFA"
                  : "white",
              fontWeight:
                activeTab === "settings"
                  ? "bold"
                  : "normal",
            }}
          >
            ⚙️ Settings
          </p>
          <button
            onClick={() => {
              const blob = new Blob([note], {
                type: "text/plain",
              });

              const a = document.createElement("a");

              a.href = URL.createObjectURL(blob);

              a.download = "mindcanvas-notes.txt";

              a.click();
            }}
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "10px",
              border: "none",
              borderRadius: "10px",
              background: "#8B5CF6",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📥 Export Notes
          </button>
        </div>

        {/* Main Editor */}
        <div
          style={{
            minWidth: 0,
            paddingLeft: isMobile ? "0" : "10px",
            gridArea: "main",
          }}
        >
          {activeTab === "notes" && (
            <>
              <h1>📝 Notes</h1>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                spellCheck={false}
                placeholder="Write your notes..."
                style={{
                  order: isMobile ? 2 : 0,
                  gridArea: "main",
                  width: "100%",
                  height: "400px",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  borderRadius: "20px",
                  padding: "20px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginTop: "30px",
                  color: "#94A3B8",
                  fontSize: "14px",
                }}
              >
                <p
                  style={{
                    color:
                      saveStatus === "Saved"
                        ? "#22C55E"
                        : "#F59E0B",
                    fontSize: "14px",
                    marginBottom: "10px",
                  }}
                >
                  {saveStatus === "Saved"
                    ? "🟢 Saved"
                    : "🟡 Saving..."}
                </p>

                <span>📝 Words: {wordCount}</span>
                <span>🔤 Characters: {charCount}</span>
                <span>✅ Tasks: {tasks.length}</span>
              </div>
            </>
          )}
          {activeTab === "tasks" && (
            <>
              <h1>✅ Tasks</h1>
              <div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  }}
>
  <input
    value={taskInput}
    onChange={(e) => setTaskInput(e.target.value)}
    placeholder="Add Task..."
    style={{
      flex: 1,
      padding: "12px",
      borderRadius: "12px",
      border: "none",
      outline: "none",
    }}
  />

  <button
    onClick={() => {
      if (!taskInput.trim()) return;

      setNote((prev) => prev + "\n- " + taskInput);

      setTaskInput("");
    }}
    style={{
      padding: "12px 18px",
      border: "none",
      borderRadius: "12px",
      background: "#8B5CF6",
      color: "white",
      cursor: "pointer",
      fontWeight: "600",
    }}
  >
    Add
  </button>
</div>
              <div
                style={{
                  gridArea: "main",
                  background: "#1A2238",
                  padding: "20px",
                  borderRadius: "20px",
                }}
              >
                {tasks.map((task) => {
                  const cleanTask = task.line.replace("-", "").trim();
                  const isDone = completedTasks.includes(task.idx);

                  return (
                    <div
  key={task.idx}
  className={`task-card ${isDone ? "completed" : ""}`}
  onClick={() => {
    if (isDone) {
      setCompletedTasks(
        completedTasks.filter((id) => id !== task.idx)
      );
    } else {
      setCompletedTasks([...completedTasks, task.idx]);
    }
  }}
>
                      {isDone ? "☑" : getTaskIcon(cleanTask)}

                      {" "}
                      {cleanTask}
                     <button
  className="delete-task"
  onClick={(e) => {
    e.stopPropagation();

    // Remove this exact line by its index (not by matching text),
    // so duplicate-named tasks aren't all deleted together.
    const updatedLines = noteLines.filter(
      (_, i) => i !== task.idx
    );

    setNote(updatedLines.join("\n"));

    // Shift down any completed IDs that were below the deleted line,
    // since their line index just decreased by 1. This keeps the
    // completed count accurate after deletion.
    setCompletedTasks(
      completedTasks
        .filter((id) => id !== task.idx)
        .map((id) => (id > task.idx ? id - 1 : id))
    );
  }}
>
  ✕
</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {activeTab === "goals" && (
            <>
              <h1>
  🎯 Goals
  <span
    style={{
      color:"#A78BFA",
      fontSize:"18px",
      marginLeft:"10px"
    }}
  >
    ({goals.length})
  </span>
</h1>

              <div
                style={{
                  gridArea: "main",
                  background: "#1A2238",
                  padding: "20px",
                  borderRadius: "20px",
                }}
              >
                <>
  <div
    style={{
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginBottom: "25px",
      flexWrap: "wrap",
    }}
  >
    <input
      type="search"
      value={goalInput}
      onChange={(e) =>
        setGoalInput(e.target.value)
      }
      placeholder="Add Goal..."
      spellCheck={false}
      style={{
        padding: "14px 18px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        width: "320px",
        outline: "none",
      }}
    />

    <button
      onClick={() => {
        if (!goalInput.trim()) return;

        setGoals([
          ...goals,
          {
            text: goalInput,
            done: false,
          },
        ]);

        setGoalInput("");
      }}
      style={{
    padding: "8px 14px",
    fontSize: "13px",
    borderRadius: "12px",
    border: "none",
    background:
      "linear-gradient(135deg,#8B5CF6,#6D28D9)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow:
      "0 0 15px rgba(139,92,246,0.35)",
  }}
>
  <span style={{ marginRight: "6px" }}>+</span>
  Add Goal
</button>
  </div>

  <div style={{ marginTop: "20px" }}>
                    <div className="goals-list">
  {goals.map((goal, index) => (
    <div
      key={index}
      className={`goal-card ${
        goal.done ? "completed" : ""
      }`}
    >
      <div className="goal-left">
        <span
  onClick={() => toggleGoal(index)}
  style={{
    cursor: "pointer",
    fontSize: "22px",
  }}
>
  {goal.done ? "✅" : "🎯"}
</span>

        <span className="goal-text">
          {goal.text}
        </span>
      </div>

      <button
        className="delete-goal"
        onClick={() =>
          setGoals(
            goals.filter((_, i) => i !== index)
          )
        }
      >
        ✕
      </button>
    </div>
  ))}
</div>
                  </div>
                </>
              </div>
            </>
          )}
          {activeTab === "calendar" && (
            <>
              <h1>📅 Calendar</h1>

              <div
                style={{
                  gridArea: "main",
                  background: "#1A2238",
                  padding: "20px",
                  borderRadius: "20px",
                }}
              >
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    marginRight: "10px",
                  }}
                />

                <input
                  value={eventText}
                  onChange={(e) =>
                    setEventText(e.target.value)
                  }
                  placeholder="Event title..."
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    width: "250px",
                  }}
                />

                <button
                  onClick={() => {
                    if (!selectedDate || !eventText)
                      return;

                    setEvents([
                      ...events,
                      {
                        date: selectedDate,
                        title: eventText,
                      },
                    ]);

                    setEventText("");
                  }}
                  style={{
                    marginLeft: "10px",
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#8B5CF6",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Add Event
                </button>

                <div style={{ marginTop: "25px" }}>
                  {events.map((event, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#111827",
                        padding: "12px",
                        borderRadius: "12px",
                        marginBottom: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        📅 {event.date} — {event.title}
                      </span>

                      <button
                        onClick={() => {
                          setEvents(
                            events.filter((_, i) => i !== index)
                          );
                        }}
                        style={{
                          border: "none",
                          background: "rgba(239,68,68,0.15)",
                          color: "#EF4444",
                          cursor: "pointer",
                          borderRadius: "10px",
                          padding: "8px 12px",
                          fontSize: "18px",
                          transition: "0.3s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(239,68,68,0.30)";
                        }}

                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(239,68,68,0.15)";
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {activeTab === "settings" && (
            <>
              <h1>⚙️ Settings</h1>

              <div
                style={{
                  background: "#1A2238",
                  padding: "35px",
                  borderRadius: "20px",
                  maxWidth: "850px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "20px",
                    fontSize: "24px",
                  }}
                >
                  App Settings
                </h3>

                <p
                  style={{
                    marginBottom: "12px",
                    fontSize: "18px",
                  }}
                >
                  📝 Notes Saved: {note.length > 0 ? "Yes" : "No"}
                </p>

                <p
                  style={{
                    marginBottom: "12px",
                    fontSize: "18px",
                  }}
                >
                  ✅ Tasks: {tasks.length}
                </p>

                <p
                  style={{
                    marginBottom: "12px",
                    fontSize: "18px",
                  }}
                >
                  🎯 Goals: {goals.length}
                </p>

                <p
                  style={{
                    marginBottom: "12px",
                    fontSize: "18px",
                  }}
                >
                  📅 Events: {events.length}
                </p>

                <button
                  onClick={() => {
                    setCompletedTasks([]);
                  }}
                  style={{
                    marginTop: "30px",
                    marginRight: "10px",
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#F59E0B",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Clear Completed Tasks
                </button>

                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  style={{
                    marginTop: "30px",
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#DC2626",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  🗑 Reset Workspace
                </button>
              </div>
            </>
          )}
          {activeTab === "home" && (
            <>
              <h1
                style={{
                  fontSize: isMobile ? "28px" : "48px",
                  margin: 0,
                  paddingTop: isMobile ? "55px" : "0",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                MindCanvas AI
              </h1>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                spellCheck={false}
                placeholder={`Write notes, tasks, goals...

Example:
- Learn React
- Build Portfolio
- Post on Instagram`}
                style={{
                  boxShadow:
                    "0 0 60px rgba(139,92,246,0.20)",
                  outline: "none",
                  width: "100%",
                  height: isMobile ? "140px" : "180px",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(20px)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "20px",
                  marginTop: "20px",
                  fontSize: "18px",
                }}
              />
              {tasks.length === 0 && (
                <p
                  style={{
                    color: "#94A3B8",
                    fontSize: "14px",
                    marginTop: "10px",
                  }}
                >
                  ✨ Tip: Start a line with "-" to create a task card below
                </p>
              )}

              <h2 style={{ marginTop: "25px" }}>Today's Tasks</h2>

              <div
                style={{
                  background: "#1A2238",
                  padding: "20px",
                  borderRadius: "20px",
                  minHeight: isMobile ? "120px" : "200px",
                }}
              >
                {tasks.length === 0 && (
                  <p
                    style={{
                      color: "#94A3B8",
                      textAlign: "center",
                      marginTop: "70px",
                    }}
                  >
                    🚀 No tasks yet. Add tasks in Notes using "-"
                  </p>
                )}
                {tasks.map((task) => {
                  const cleanTask = task.line.replace("-", "").trim();
                  const isDone = completedTasks.includes(task.idx);

                  return (
                  <div
                    key={task.idx}
                    onClick={() => {
                      if (isDone) {
                        setCompletedTasks(
                          completedTasks.filter((id) => id !== task.idx)
                        );
                      } else {
                        setCompletedTasks([
                          ...completedTasks,
                          task.idx,
                        ]);
                      }
                    }}

                    style={{
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "14px",
                      borderRadius: "14px",
                      marginBottom: "12px",

                      textDecoration: isDone ? "line-through" : "none",

                      opacity: isDone ? 0.5 : 1,

                      transition: "0.3s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>
                        {isDone ? "☑" : getTaskIcon(cleanTask)}
                      </span>

                      <span>
                        {cleanTask}
                      </span>
                    </div>
                  </div>
                  );
                })}

              </div>
              {/* Sticky Notes */}
              <div style={{ marginTop: "30px" }}>
                <h2>🗒 Sticky Notes</h2>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) =>
                      setSelectedColor(e.target.value)
                    }
                    style={{
                      width: "40px",
                      height: "40px",
                      padding: "0",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      overflow: "hidden",
                      background: "transparent",
                    }}
                  />

                  <button
                    onClick={() => {
                      const newNote = {
                        id: Date.now(),
                        title: "New Sticky",
                        content: "",
                        color: selectedColor,
                      };

                      setStickyNotes([
                        ...stickyNotes,
                        newNote,
                      ]);
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#8B5CF6",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow:
                        "0 0 15px rgba(139,92,246,0.5)",
                    }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontSize: "22px",
                        fontWeight: "bold",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>

                    New Sticky
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                    justifyContent: isMobile ? "center" : "flex-start",
                    marginTop: "20px",
                  }}
                >
                  {stickyNotes.map((sticky) => (
                    <div
                      key={sticky.id}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-8px)";
                      }}

                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0)";
                      }}
                      style={{
                        position: "relative",
                        width: isMobile ? "100%" : "220px",
                        minHeight: "220px",
                        background: sticky.color,
                        color: "#ffffff",
                        padding: "15px",
                        border: "2px solid rgba(255,255,255,0.2)",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        boxShadow: `
            0 10px 30px rgba(0,0,0,0.25),
            0 0 25px ${sticky.color}
          `,
                        transition: "all 0.3s ease",

                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >

                        <input
                          value={sticky.title}
                          onChange={(e) => {
                            setStickyNotes(
                              stickyNotes.map((item) =>
                                item.id === sticky.id
                                  ? {
                                    ...item,
                                    title: e.target.value,
                                  }
                                  : item
                              )
                            );
                          }}
                          style={{
                            width: "85%",
                            border: "none",
                            background: "transparent",
                            fontWeight: "bold",
                            fontSize: "16px",
                            outline: "none",
                            color: "#111",
                            marginBottom: "20px",
                          }}
                        />

                        <button
                          onClick={() => {
                            setStickyNotes(
                              stickyNotes.filter(
                                (item) => item.id !== sticky.id
                              )
                            );
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            color: "#333",
                            padding: "0",
                            lineHeight: 1,
                            marginTop: "-18px",
                          }}
                        >
                          ✕
                        </button>
                      </div>


                      <textarea
                        value={sticky.content || ""}
                        onChange={(e) => {
                          setStickyNotes(
                            stickyNotes.map((item) =>
                              item.id === sticky.id
                                ? {
                                  ...item,
                                  content: e.target.value,
                                }
                                : item
                            )
                          );
                        }}
                        placeholder="Write note..."
                        style={{
                          width: "100%",
                          height: "100px",
                          border: "none",
                          resize: "none",
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: "12px",
                          padding: "10px",
                          outline: "none",
                          color: "#111",
                        }}
                      />

                    </div>
                  ))}
                </div>

              </div>
            </>
          )}
        </div>
        {/* Nova AI Panel */}
        <div
          style={{
            gridArea: "nova",

            background: "#111827",
            borderRadius: "20px",
            padding: "20px",
            order: isMobile ? 3 : 0,

          }}
        >
          <h2>✨ Nova AI</h2>

          {/* Progress Card */}
          <div
            style={{
              background: "#1A2238",
              borderRadius: "15px",
              padding: "15px",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            <h3>📊 Progress</h3>

            <p
              style={{
                color: "#E2E8F0",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {Math.min(completedTasks.length, tasks.length)} / {tasks.length} Tasks Completed (
              {tasks.length
                ? Math.min(
                    100,
                    Math.round(
                      (completedTasks.length / tasks.length) * 100
                    )
                  )
                : 0}
              %)
            </p>


            <div
              style={{
                width: "100%",
                height: "10px",
                background: "#111827",
                borderRadius: "20px",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  width: `${tasks.length
                    ? Math.min(100, (completedTasks.length / tasks.length) * 100)
                    : 0
                    }%`,
                  height: "100%",
                  background: "#8B5CF6",
                  boxShadow: "0 0 12px rgba(139,92,246,0.6)",
                  borderRadius: "20px",
                  transition: "0.3s",
                }}
              />
            </div>
          </div>
          {upcomingEvent && (
            <div
              style={{
                background: "#1A2238",
                borderRadius: "15px",
                padding: "15px",
                marginTop: "15px",
              }}
            >
              <p>📅 Upcoming Event</p>

              <small>
                {upcomingEvent.title}
              </small>

              <br />

              <small
                style={{
                  color: "#A78BFA",
                }}
              >
                {upcomingEvent.date}
              </small>
            </div>
          )}
          <div
            style={{
              background: "#1A2238",
              borderRadius: "15px",
              padding: "15px",
              marginTop: "15px",
            }}
          >
            <p>🎯 Focus Today</p>
            <small>
              Complete remaining{" "}
              {Math.max(0, tasks.length - completedTasks.length)} tasks.
            </small>
          </div>

          <div
            style={{
              background: "#1A2238",
              borderRadius: "15px",
              padding: "15px",
              marginTop: "15px",
            }}
          >
            <p>📈 Productivity</p>
            <small>
              {Math.max(0, tasks.length - completedTasks.length)} tasks pending.
            </small>
          </div>

          <div
            style={{
              background: "#1A2238",
              borderRadius: "15px",
              padding: "15px",
              marginTop: "15px",
            }}
          >
            <p>💡 Suggestion</p>
            <small>
              Break large goals into smaller tasks.
            </small>
          </div>
          <div
            style={{
              background: "#1A2238",
              borderRadius: "15px",
              padding: "15px",
              marginTop: "15px",
            }}
          >
            <p>🎯 Goals Progress</p>

            <small>
              {completedGoals} / {goals.length} Goals Completed
              ({goalPercentage}%)
            </small>

            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#111827",
                borderRadius: "20px",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  width: `${goalPercentage}%`,
                  height: "100%",
                  background: "#10B981",
                  borderRadius: "20px",
                  transition: "0.3s",
                }}
              />
            </div>
          </div>
          <div
            style={{
              background: "#1A2238",
              borderRadius: "15px",
              padding: "15px",
              marginTop: "15px",
            }}
          >
            <p>📊 Workspace Stats</p>

            <small>📝 Words: {wordCount}</small>
            <br />

            <small>✅ Tasks: {tasks.length}</small>
            <br />

            <small>📅 Events: {events.length}</small>
            <br />

            <small>🗒 Sticky Notes: {stickyNotes.length}</small>
          </div>
          {/* Nova AI Chat */}
          <div
            style={{
              gridArea: "nova",

              background: "#1A2238",
              borderRadius: "15px",
              padding: "15px",
              marginTop: "20px",
            }}
          >
            <h3>🤖 Chat</h3>

            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                marginBottom: "10px",
              }}
            >
              {chat.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    borderRadius: "10px",
                    background:
                      msg.sender === "user"
                        ? "#374151"
                        : "#8B5CF6",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>
                    {msg.sender === "user"
                      ? "You"
                      : "Nova"}
                    :
                  </strong>{" "}
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div
                  style={{
                    padding: "10px",
                    color: "#A78BFA",
                    fontStyle: "italic",
                  }}
                >
                  🤖 Nova is thinking...
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            <input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }

              placeholder="Ask Nova AI..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                outline: "none",
                marginBottom: "10px",
              }}
            />

            <button
              onClick={handleSend}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: "#8B5CF6",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
export default App;
