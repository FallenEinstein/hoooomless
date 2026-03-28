"use client";
import { useState, useRef, useEffect } from "react";

function DashboardContent({ time }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("SUMMARY");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAnswer, setSearchAnswer] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [vibeWords, setVibeWords] = useState([]);

  useEffect(() => {
    if (step < 3) {
      const words = "DECONSTRUCTION ANALYSIS ONTOLOGY METHODOLOGY HYPOTHESIS DATA SYSTEM CORE SYNTHESIS ".split(" ");
      const initial = Array.from({ length: 40 }, () => ({
        word: words[Math.floor(Math.random() * words.length)],
        opacity: 0,
        x: Math.random() * 100,
        y: Math.random() * 100,
        id: Math.random()
      }));
      setVibeWords(initial);

      const interval = setInterval(() => {
        setVibeWords(prev => prev.map(w => ({
          ...w,
          opacity: Math.random() > 0.8 ? 0.04 : 0, 
          word: Math.random() > 0.95 ? words[Math.floor(Math.random() * words.length)] : w.word
        })));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setVibeWords([]);
    }
  }, [step]);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStep(2);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/translate", { method: "POST", body: formData });
      if (!res.ok) throw new Error("분석 실패");
      const data = await res.json();
      setAnalysis(data);
      setStep(3);
    } catch (err) { alert(err.message); setStep(1); }
  };

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    setSearchAnswer("");
    try {
      const formData = new FormData();
      formData.append("query", searchQuery);
      formData.append("fileId", analysis?.fileId);
      const res = await fetch("/api/translate", { method: "POST", body: formData });
      const data = await res.json();
      setSearchAnswer(data.answer);
    } catch (err) { console.error(err); }
    setIsSearching(false);
  };

  return (
    <div className={`swiss-canvas-v35 fade-in ${step === 3 ? 'analysis-mode' : ''}`}>
      <div className="apple-bg-layer">
        {step < 3 && vibeWords.map(w => (
          <span key={w.id} className="apple-w" style={{ left: `${w.x}%`, top: `${w.y}%`, opacity: w.opacity }}>
            {w.word}
          </span>
        ))}
      </div>
      <div className="subtle-tracer" />
      
      <div className="apple-viewport">
        <header className="apple-header">
          <div className="ah-meta">
            <span className="ah-left">SYSTEM_ENGINE_v.35.0 // DONGHYUNMIN_EXCLUSIVE</span>
            <span className="ah-right">{time}</span>
          </div>
          <div className="ah-main">
            <h1 className="ah-title">DECONSTRUCTION</h1>
            <div className="ah-sub">
              <span className="ah-tag">Mapping Academic Ontology // 4K Optimized</span>
              <div className="ah-dot" />
            </div>
          </div>
        </header>

        <section className="apple-content">
          {step === 1 && (
            <div className="apple-home">
              <div 
                className={`apple-search-bar ${dragActive ? 'on' : ''} ${file ? 'ready' : ''}`}
                onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
              >
                <div className="asb-inner">
                  <div className="asb-symbol">/</div>
                  <div className="asb-input">
                    {file ? (
                      <span className="asb-file">{file.name}</span>
                    ) : (
                      <span className="asb-placeholder">Initialize scholarly analysis by selecting a PDF file...</span>
                    )}
                  </div>
                  {file && (
                    <div className="asb-actions">
                      <button className="asb-btn-p" onClick={(e) => {e.stopPropagation(); handleAnalyze();}}>Analyze</button>
                      <button className="asb-btn-s" onClick={(e) => {e.stopPropagation(); setFile(null);}}>X</button>
                    </div>
                  )}
                  <input ref={inputRef} type="file" hidden accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
                </div>
              </div>
              <p className="apple-hint">Scholarly research deconstruction engine. Designed for the sophisticated analyst.</p>
            </div>
          )}

          {step === 2 && (
            <div className="apple-processing">
              <div className="ap-ticker">
                {"DECONSTRUCTING".split("").map((c, i) => <span key={i} className="apc">{c}</span>)}
              </div>
              <p className="ap-sub">Mapping every experimental step and quantitative variable...</p>
            </div>
          )}

          {step === 3 && analysis && (
            <div className="apple-dashboard fade-up">
              <div className="apple-search-nexus">
                <div className="asn-label">Q&A_SEMANTIC_SEARCH [ KOREAN // PRECISION_MODE ]</div>
                <div className="asn-bar">
                  <span className="asn-icon">?</span>
                  <input 
                    type="text" 
                    placeholder="Ask about experimental details, data, or conclusions..." 
                    className="asn-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyUp={handleSearch}
                  />
                </div>
                {searchAnswer && (
                  <div className="asn-ans fade-in">
                    <div className="ans-tag">Inference Result //</div>
                    <p>{searchAnswer}</p>
                  </div>
                )}
              </div>

              <nav className="apple-tabs">
                <span className={`at-item ${activeTab === 'SUMMARY' ? 'on' : ''}`} onClick={() => setActiveTab('SUMMARY')}>Summary</span>
                <span className={`at-item ${activeTab === 'DECOMP' ? 'on' : ''}`} onClick={() => setActiveTab('DECOMP')}>Analysis</span>
                <span className={`at-item ${activeTab === 'VISUALS' ? 'on' : ''}`} onClick={() => setActiveTab('VISUALS')}>Visuals</span>
                <span className="at-reset" onClick={() => {setStep(1); setFile(null);}}>REBOOT SYSTEM</span>
              </nav>

              <div className="apple-pane">
                {activeTab === 'SUMMARY' && (
                  <div className="ag-summary">
                    <div className="ac-card"><div className="ac-head">Problem Context</div><p>{analysis.summary?.problem}</p></div>
                    <div className="ac-card"><div className="ac-head">Research Goal</div><p>{analysis.summary?.purpose}</p></div>
                    <div className="ac-card"><div className="ac-head">Method Arch</div><p>{analysis.summary?.methodology}</p></div>
                    <div className="ac-card"><div className="ac-head">Final Synthesis</div><p>{analysis.summary?.conclusion}</p></div>
                  </div>
                )}
                {activeTab === 'DECOMP' && (
                  <div className="ag-decomp">
                    <div className="ap-framework">
                      <div className="ac-head">Methodology Architecture Pipeline</div>
                      <div className="af-flow">
                        {analysis.diagram?.map((d, i) => (
                          <div key={i} className="af-step">
                            <div className="af-num">{String(i+1).padStart(2, '0')}</div>
                            <div className="af-core">
                              <strong className="af-title">{d.step}</strong>
                              <p className="af-desc">{d.desc}</p>
                            </div>
                            {i < analysis.diagram.length - 1 && <div className="af-line" />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="ad-stack">
                      <div className="ad-card"><div className="ac-head">Hypotheses Deconstruction</div><p>{analysis.decomposition?.hypothesis_rq}</p></div>
                      <div className="ad-card"><div className="ac-head">Experimental Method Detail</div><p>{analysis.decomposition?.methodology_detail}</p></div>
                      <div className="ad-card"><div className="ac-head">Quantitative Results Analysis</div><p>{analysis.decomposition?.analysis_result}</p></div>
                      <div className="ad-card"><div className="ac-head">Academic Significance</div><p>{analysis.decomposition?.significance_limitations}</p></div>
                    </div>
                  </div>
                )}
                {activeTab === 'VISUALS' && (
                  <div className="ag-visuals">
                    <div className="ac-head">03 // Extracted Visual Resources</div>
                    <div className="av-list">
                      {analysis.visuals?.map((v, i) => (
                        <div key={i} className="av-card">
                          <div className="av-meta">{v.type} {v.id}</div>
                          <div className="av-body">
                            <h3 className="av-title">{v.title}</h3>
                            <p className="av-context">{v.context}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="apple-footer">
          <div className="af-row">
            <span>Research Deconstruction v.35.0 // Advanced Analytic Mode</span>
            <span>Design for DonghyunMin</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(timer);
    };
  }, []);

  return (
    <main className="viewport">
      {mounted ? <DashboardContent time={time} /> : null}
    </main>
  );
}
