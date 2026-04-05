import React, { useState, useEffect } from 'react';
import { Settings, X, Plus, Trash2, Check, X as XIcon } from 'lucide-react';
import './App.css';

const DEFAULT_TASKS = [
  { id: 1, name: "Ön değerlendirme raporu hazırlanması", activeParts: [0, 0.5, 1, 1.5] },
  { id: 2, name: "Ham veri toplama", activeParts: [2, 2.5, 3] },
  { id: 3, name: "Normalizasyon uygulaması", activeParts: [2.5, 3, 3.5, 4] },
];

const DEFAULT_HEADERS = ["Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim"];

const DEFAULT_COMP_COLS = ["Bizim Proje", "Rakip A", "Rakip B"];
const DEFAULT_COMP_ROWS = [
  { id: 1, name: "Gelişmiş Raporlama", checks: { 0: true, 1: false, 2: false } },
  { id: 2, name: "Gerçek Zamanlı Senkronizasyon", checks: { 0: true, 1: true, 2: false } },
  { id: 3, name: "Kullanıcı Dostu Arayüz", checks: { 0: true, 1: true, 2: true } },
];

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
  const [tasksData, setTasksData] = useLocalStorage('gantt_tasks_v4', DEFAULT_TASKS);
  const [weekHeaders, setWeekHeaders] = useLocalStorage('gantt_headers_v4', DEFAULT_HEADERS);
  const [chartTitle, setChartTitle] = useLocalStorage('gantt_title_v4', "EKOFİN YARIŞMA TAKVİMİ");

  const [compCols, setCompCols] = useLocalStorage('comp_cols_v1', DEFAULT_COMP_COLS);
  const [compRows, setCompRows] = useLocalStorage('comp_rows_v1', DEFAULT_COMP_ROWS);
  const [compTitle, setCompTitle] = useLocalStorage('comp_title_v1', "RAKİP ANALİZİ");

  const [activeTab, setActiveTab] = useLocalStorage('active_tab_v1', 'gantt'); 
  const [themeColor, setThemeColor] = useLocalStorage('gantt_theme_color', '#1a3b7c'); 
  const [bgColor, setBgColor] = useLocalStorage('gantt_bg_color', '#f6f8fb'); 

  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditor = () => setIsEditMode(!isEditMode);

  const addTask = () => {
    const newId = tasksData.length > 0 ? Math.max(...tasksData.map(t => t.id)) + 1 : 1;
    setTasksData([...tasksData, { id: newId, name: "Yeni Görev", activeParts: [] }]);
  };
  const removeTask = (id) => setTasksData(tasksData.filter(t => t.id !== id));
  const updateTask = (id, field, value) => setTasksData(tasksData.map(t => t.id === id ? { ...t, [field]: value } : t));
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
  const removeHeader = (index) => setWeekHeaders(weekHeaders.filter((_, i) => i !== index));
  const addHeader = () => setWeekHeaders([...weekHeaders, `Yeni Ay`]);

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

  const addCompRow = () => {
    const newId = compRows.length > 0 ? Math.max(...compRows.map(r => r.id)) + 1 : 1;
    setCompRows([...compRows, { id: newId, name: "Yeni Özellik", checks: {} }]);
  };
  const removeCompRow = (id) => setCompRows(compRows.filter(r => r.id !== id));
  const updateCompRow = (id, value) => setCompRows(compRows.map(r => r.id === id ? { ...r, name: value } : r));
  const moveCompRow = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= compRows.length) return;
    const newRows = [...compRows];
    const temp = newRows[index];
    newRows[index] = newRows[newIndex];
    newRows[newIndex] = temp;
    setCompRows(newRows);
  };
  const addCompCol = () => setCompCols([...compCols, "Yeni Rakip"]);
  const updateCompCol = (index, value) => {
    const newCols = [...compCols];
    newCols[index] = value;
    setCompCols(newCols);
  };
  const removeCompCol = (index) => {
    setCompCols(compCols.filter((_, i) => i !== index));
  };
  const toggleCheck = (rowId, colIdx) => {
    setCompRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const newChecks = { ...(r.checks || {}) };
      newChecks[colIdx] = !newChecks[colIdx];
      return { ...r, checks: newChecks };
    }));
  };

  const resetToDefault = () => {
    if (window.confirm("Sıfırlansın mı?")) {
      if (activeTab === 'gantt') {
        setTasksData(DEFAULT_TASKS);
        setWeekHeaders(DEFAULT_HEADERS);
        setChartTitle("EKOFİN YARIŞMA TAKVİMİ");
      } else {
        setCompCols(DEFAULT_COMP_COLS);
        setCompRows(DEFAULT_COMP_ROWS);
        setCompTitle("RAKİP ANALİZİ");
      }
    }
  };

  return (
    <>
      <style>
        {`
          body, .main-container {
            background-color: ${bgColor} !important;
          }
          .sidebar-curve {
            background-color: ${themeColor} !important;
          }
          .header-title,
          .task-column-header,
          .week-header,
          .task-name,
          .competitor-header,
          .feature-name {
            color: ${themeColor} !important;
          }
        `}
      </style>

      <button className="edit-btn" onClick={toggleEditor} title="Düzenle">
        <Settings size={24} />
      </button>

      <div className={`edit-sidebar ${isEditMode ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Veri Yöneticisi</div>
          <button className="close-btn" onClick={toggleEditor}><X size={24} /></button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '2px solid #eaeaea' }}>
           <button 
             className="action-btn" 
             style={{ background: activeTab === 'gantt' ? themeColor : '#eaeaea', color: activeTab === 'gantt' ? '#fff' : '#555' }}
             onClick={() => setActiveTab('gantt')}
           >
             Yol Haritası
           </button>
           <button 
             className="action-btn" 
             style={{ background: activeTab === 'rakip' ? themeColor : '#eaeaea', color: activeTab === 'rakip' ? '#fff' : '#555' }}
             onClick={() => setActiveTab('rakip')}
           >
             Rakip Analizi
           </button>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Tema & Renkler</div>
          <div className="form-group">
            <label>Ana Tema Rengi (Tablo & Çizgi)</label>
            <input 
               type="color" 
               className="color-picker" 
               value={themeColor} 
               onChange={(e) => setThemeColor(e.target.value)} 
               style={{ padding: 0, height: 40, border: 'none', background: 'none', cursor: 'pointer', width: '100%', marginBottom: 10 }}
            />
          </div>
          <div className="form-group">
            <label>Arka Plan Rengi</label>
            <input 
               type="color" 
               className="color-picker" 
               value={bgColor} 
               onChange={(e) => setBgColor(e.target.value)} 
               style={{ padding: 0, height: 40, border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}
            />
          </div>
        </div>

        {activeTab === 'gantt' && (
          <>
            <div className="sidebar-section">
              <div className="section-title">Genel Ayarlar</div>
              <div className="form-group">
                <label>Ana Başlık</label>
                <input type="text" className="form-input" value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} />
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-title">Aylar (Sütunlar)</div>
              {weekHeaders.map((header, idx) => (
                <div className="form-row" key={idx} style={{ marginBottom: 8 }}>
                  <input type="text" className="form-input" value={header} onChange={(e) => updateHeader(idx, e.target.value)} />
                  <button className="delete-btn" onClick={() => removeHeader(idx)}>X</button>
                </div>
              ))}
              <button className="action-btn outline" onClick={addHeader}>+ Yeni Ay Ekle</button>
            </div>

            <div className="sidebar-section">
              <div className="section-title">Görevler (Satırlar)</div>
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
          </>
        )}

        {activeTab === 'rakip' && (
          <>
            <div className="sidebar-section">
              <div className="section-title">Genel Ayarlar</div>
              <div className="form-group">
                <label>Ana Başlık</label>
                <input type="text" className="form-input" value={compTitle} onChange={(e) => setCompTitle(e.target.value)} />
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-title">Sütunlar (Rakip/Proje)</div>
              {compCols.map((col, idx) => (
                <div className="form-row" key={idx} style={{ marginBottom: 8 }}>
                  <input type="text" className="form-input" value={col} onChange={(e) => updateCompCol(idx, e.target.value)} />
                  <button className="delete-btn" onClick={() => removeCompCol(idx)}>X</button>
                </div>
              ))}
              <button className="action-btn outline" onClick={addCompCol}>+ Yeni Rakip/Sütun Ekle</button>
            </div>

            <div className="sidebar-section">
              <div className="section-title">Özellikler (Satırlar)</div>
              {compRows.map((row, idx) => (
                <div className="card-container" key={row.id}>
                  <div className="card-header">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div className="task-id">{idx + 1}</div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="small-btn" onClick={() => moveCompRow(idx, -1)} disabled={idx === 0}>↑</button>
                        <button className="small-btn" onClick={() => moveCompRow(idx, 1)} disabled={idx === compRows.length - 1}>↓</button>
                      </div>
                    </div>
                    <button className="delete-btn" onClick={() => removeCompRow(row.id)}><Trash2 size={14} /></button>
                  </div>
                  <div className="form-group">
                    <label>Özellik Adı</label>
                    <input type="text" className="form-input" value={row.name} onChange={(e) => updateCompRow(row.id, e.target.value)} />
                  </div>
                  
                  <div className="form-group">
                    <label>Kimlerde Var?</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '5px' }}>
                      {compCols.map((col, cIdx) => (
                        <div key={cIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f5f7f9', borderRadius: '6px' }}>
                           <span style={{ fontSize: '0.9rem', color: '#555' }}>{col}</span>
                           <input 
                             type="checkbox"
                             checked={!!row.checks?.[cIdx]}
                             onChange={() => toggleCheck(row.id, cIdx)}
                             style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                           />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button className="action-btn" onClick={addCompRow}><Plus size={18} style={{ verticalAlign: 'middle', marginRight: 5 }} />Yeni Özellik Ekle</button>
            </div>
          </>
        )}

        <div className="sidebar-section">
          <button className="action-btn outline" onClick={resetToDefault} style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}>Geçerli Sekmeyi Sıfırla</button>
        </div>
      </div>

      <div className={`main-container ${isEditMode ? 'blurred' : ''}`}>
        <div className="sidebar-curve"></div>
        <div className="content-area">
          {activeTab === 'gantt' && (
            <>
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
                                  background: themeColor,
                                  boxShadow: `0 4px 12px rgba(26,59,124, 0.15)`,
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
            </>
          )}

          {activeTab === 'rakip' && (
             <>
             <h1 className="header-title">{compTitle}</h1>
             <div className="gantt-table">
               <div className="gantt-header">
                 <div className="task-column-header competitor-header">ÖZELLİKLER</div>
                 <div className="timeline-headers">
                   {compCols.map((col, idx) => (
                     <div key={idx} className="week-header" style={{ width: `${100 / compCols.length}%` }}>{col}</div>
                   ))}
                 </div>
               </div>

               <div className="gantt-body">
                 {compRows.map((row, index) => {
                   return (
                     <div className="gantt-row" key={row.id} style={{ animationDelay: `${index * 0.05}s` }}>
                       <div className="task-name feature-name">{row.name}</div>
                       <div className="timeline-track" style={{ background: 'transparent' }}>
                         
                         <div style={{ display: 'flex', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                            {compCols.map((_, cIdx) => (
                              <div key={cIdx} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px dashed #e2e8f0' }}>
                                 {row.checks?.[cIdx] ? 
                                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(44, 208, 113, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2cd071' }}>
                                     <Check size={20} strokeWidth={3} />
                                   </div> : 
                                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 77, 79, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d4f' }}>
                                     <XIcon size={20} strokeWidth={3} />
                                   </div>
                                 }
                              </div>
                            ))}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;