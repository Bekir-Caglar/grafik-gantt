import React, { useState, useEffect } from 'react';
import { Settings, X, Plus, Trash2 } from 'lucide-react';
import './App.css';

const DEFAULT_TASKS = [
  { id: 1, name: "Ön değerlendirme raporu hazırlanması", activeParts: [0, 0.5, 1, 1.5] },
  { id: 2, name: "Ham veri toplama", activeParts: [2, 2.5, 3] },
  { id: 3, name: "Normalizasyon uygulaması", activeParts: [2.5, 3, 3.5, 4] },
];

const DEFAULT_HEADERS = ["Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim"];

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function App() {
  const [tasksData, setTasksData] = useLocalStorage('gantt_tasks_v3', DEFAULT_TASKS);
  const [weekHeaders, setWeekHeaders] = useLocalStorage('gantt_headers_v3', DEFAULT_HEADERS);
  const [chartTitle, setChartTitle] = useLocalStorage('gantt_title_v3', "EKOFİN YARIŞMA TAKVİMİ");

  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditor = () => setIsEditMode(!isEditMode);

  // Edit Handlers
  const addTask = () => {
    const newId = tasksData.length > 0 ? Math.max(...tasksData.map(t => t.id)) + 1 : 1;
    setTasksData([...tasksData, { id: newId, name: "Yeni Görev", start: 0, duration: 1 }]);
  };

  const removeTask = (id) => {
    setTasksData(tasksData.filter(t => t.id !== id));
  };

  const updateTask = (id, field, value) => {
    setTasksData(tasksData.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const moveTask = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= tasksData.length) return;
    const newTasks = [...tasksData];
    const temp = newTasks[index];
    newTasks[index] = newTasks[newIndex];
    newTasks[newIndex] = temp;
    setTasksData(newTasks);
  };

  const updateHeader = (index, value) => {
    const newHeaders = [...weekHeaders];
    newHeaders[index] = value;
    setWeekHeaders(newHeaders);
  };

  const removeHeader = (index) => {
    setWeekHeaders(weekHeaders.filter((_, i) => i !== index));
  };

  const addHeader = () => {
    setWeekHeaders([...weekHeaders, `Yeni Ay`]);
  };

  const resetToDefault = () => {
    if (window.confirm("Sıfırlansın mı?")) {
      setTasksData(DEFAULT_TASKS);
      setWeekHeaders(DEFAULT_HEADERS);
      setChartTitle("EKOFİN YARIŞMA TAKVİMİ");
    }
  };

  // Click-based fractional logic helpers
  const handleCellClick = (taskId, monthIdx, part) => {
    setTasksData(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const point = monthIdx + part;
      const parts = t.activeParts || [];
      const newParts = parts.includes(point)
        ? parts.filter(p => p !== point)
        : [...parts, point].sort((a, b) => a - b);
      return { ...t, activeParts: newParts };
    }));
  };

  return (
    <>
      <button className="edit-btn" onClick={toggleEditor} title="Düzenle">
        <Settings size={24} />
      </button>

      <div className={`edit-sidebar ${isEditMode ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Gantt Verileri</div>
          <button className="close-btn" onClick={toggleEditor}><X size={24} /></button>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Genel Ayarlar</div>
          <div className="form-group">
            <label>Ana Başlık</label>
            <input type="text" className="form-input" value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} />
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Aylar</div>
          {weekHeaders.map((header, idx) => (
            <div className="form-row" key={idx} style={{ marginBottom: 8 }}>
              <input type="text" className="form-input" value={header} onChange={(e) => updateHeader(idx, e.target.value)} />
              <button className="delete-btn" onClick={() => removeHeader(idx)}>X</button>
            </div>
          ))}
          <button className="action-btn outline" onClick={addHeader}>+ Yeni Ay Ekle</button>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Görevler</div>
          {tasksData.map((task, idx) => (
            <div className="card-container" key={task.id}>
              <div className="card-header">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div className="task-id">{idx + 1}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="small-btn" onClick={() => moveTask(idx, -1)} disabled={idx === 0}>↑</button>
                    <button className="small-btn" onClick={() => moveTask(idx, 1)} disabled={idx === tasksData.length - 1}>↓</button>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => removeTask(task.id)}><Trash2 size={14} /></button>
              </div>
              <div className="form-group">
                <label>Görev Adı</label>
                <input type="text" className="form-input" value={task.name} onChange={(e) => updateTask(task.id, 'name', e.target.value)} />
              </div>
              
              <div className="form-group">
                <label>Zamanlama (Yarım Ayları Seçin)</label>
                <div className="grid-selector">
                  {weekHeaders.map((_, mIdx) => (
                    <div key={mIdx} className="grid-cell-wrapper">
                       <div 
                         className={`grid-half-cell left ${task.activeParts?.includes(mIdx) ? 'active' : ''}`}
                         onClick={() => handleCellClick(task.id, mIdx, 0)}
                       ></div>
                       <div 
                         className={`grid-half-cell right ${task.activeParts?.includes(mIdx + 0.5) ? 'active' : ''}`}
                         onClick={() => handleCellClick(task.id, mIdx, 0.5)}
                       ></div>
                       <span className="cell-label">{mIdx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button className="action-btn" onClick={addTask}><Plus size={18} style={{ verticalAlign: 'middle', marginRight: 5 }} />Yeni Görev Ekle</button>
        </div>

        <div className="sidebar-section">
          <button className="action-btn outline" onClick={resetToDefault} style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}>Sıfırla</button>
        </div>
      </div>

      <div className={`main-container ${isEditMode ? 'blurred' : ''}`}>
        <div className="sidebar-curve"></div>
        <div className="content-area">
          <h1 className="header-title">{chartTitle}</h1>
          <div className="gantt-table">
            <div className="gantt-header">
              <div className="task-column-header">GÖREVLER</div>
              <div className="timeline-headers">
                {weekHeaders.map((week, idx) => (
                  <div key={idx} className="week-header" style={{ width: `${100 / weekHeaders.length}%` }}>{week}</div>
                ))}
              </div>
            </div>

            <div className="gantt-body">
              {tasksData.map((task, index) => {
                const totalUnits = weekHeaders.length || 1;
                const activeParts = task.activeParts || [];

                // Group contiguous 0.5 segments
                const segments = [];
                if (activeParts.length > 0) {
                  let start = activeParts[0];
                  let current = activeParts[0];
                  for (let i = 1; i < activeParts.length; i++) {
                    if (activeParts[i] === current + 0.5) {
                      current = activeParts[i];
                    } else {
                      segments.push({ start, end: current });
                      start = activeParts[i];
                      current = activeParts[i];
                    }
                  }
                  segments.push({ start, end: current });
                }

                return (
                  <div className="gantt-row" key={task.id} style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="task-name">{task.name}</div>
                    <div className="timeline-track">
                      <div className="grid-overlay">
                        {weekHeaders.map((_, idx) => (
                          <div key={idx} className="grid-line" style={{ left: `${(idx / weekHeaders.length) * 100}%` }} />
                        ))}
                        <div className="grid-line" style={{ left: '100%' }} />
                      </div>

                      {segments.map((seg, sIdx) => {
                        const left = (seg.start / totalUnits) * 100;
                        const width = ((seg.end - seg.start + 0.5) / totalUnits) * 100;

                        return (
                          <div
                            key={sIdx}
                            className="gantt-bar"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              background: `linear-gradient(90deg, 
                                hsl(145, 70%, ${65 - (index * 4)}%), 
                                hsl(155, 80%, ${50 - (index * 4)}%)
                              )`,
                              boxShadow: `0 4px 12px hsla(145, 70%, 20%, 0.15)`,
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
