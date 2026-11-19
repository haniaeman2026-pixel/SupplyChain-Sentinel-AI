
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell,
  Boxes, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  Clock3, Command, FileText, Gauge, LayoutDashboard, Menu, Network,
  PackageSearch, Plus, RefreshCw, Search, Settings, Shield, ShieldCheck,
  Truck, Users, Workflow, X, XCircle, Zap
} from "lucide-react";
import { api } from "./services/api";

const agents = [
  { name: "Demand & Risk Analyst", short: "Risk Analyst", department: "Risk Intelligence", icon: AlertTriangle, color: "violet", task: "Demand pressure and crisis severity" },
  { name: "Supplier Intelligence Agent", short: "Supplier Intel", department: "Procurement", icon: PackageSearch, color: "blue", task: "Supplier reliability and sourcing" },
  { name: "Inventory Planning Agent", short: "Inventory Planner", department: "Inventory", icon: Boxes, color: "cyan", task: "Stock coverage and replenishment" },
  { name: "Logistics Optimization Agent", short: "Logistics Optimizer", department: "Logistics", icon: Truck, color: "pink", task: "Shipment delays and route options" },
  { name: "Recovery Strategy Coordinator", short: "Recovery Coordinator", department: "Recovery", icon: ShieldCheck, color: "green", task: "Prioritized recovery recommendations" }
];

const initialForm = {
  crisis_type: "Supplier Disruption",
  description: "",
  affected_product: "",
  affected_region: "",
  urgency: "High"
};

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Crisis Analysis", icon: Workflow },
  { label: "Agent Network", icon: Network },
  { label: "Reports & Review", icon: FileText }
];

function cx(...values) {
  return values.filter(Boolean).join(" ");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function statusClass(value = "") {
  const text = value.toLowerCase();
  if (text.includes("approved") || text.includes("complete")) return "success";
  if (text.includes("reject") || text.includes("critical")) return "danger";
  if (text.includes("change") || text.includes("pending")) return "warning";
  return "neutral";
}

function StatCard({ label, value, note, icon: Icon, tone = "violet", trend }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-copy">
        <span className="stat-label">{label}</span>
        <strong>{value ?? "—"}</strong>
        <span className="stat-note">{note}</span>
      </div>
      {trend && <span className="stat-trend"><ArrowUpRight size={13} /> {trend}</span>}
    </article>
  );
}

function PanelHeading({ title, subtitle, action }) {
  return (
    <div className="panel-heading">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function WorkflowMap({ loading }) {
  const steps = [
    ["Intake", "Crisis details", "violet"],
    ["Risk", "Demand analysis", "blue"],
    ["Supplier", "Sourcing options", "cyan"],
    ["Inventory", "Stock planning", "blue"],
    ["Logistics", "Route assessment", "pink"],
    ["Recovery", "Action plan", "green"]
  ];

  return (
    <section className="panel workflow-panel">
      <PanelHeading
        title="Agent orchestration map"
        subtitle="Supply chain crisis intelligence pipeline"
        action={<span className={cx("live-indicator", loading && "working")}><i />{loading ? "Analysis running" : "Pipeline ready"}</span>}
      />
      <div className="workflow-scroll">
        <div className={cx("workflow-track", loading && "is-running")}>
          <div className="workflow-connectors">
            {steps.slice(0, -1).map((step, i) => (
              <div className="connector" key={step[0]}>
                <span className="connector-line" />
                <span className="connector-pulse" style={{ animationDelay: `${i * .42}s` }} />
              </div>
            ))}
          </div>
          <div className="workflow-nodes">
            {steps.map(([name, detail, tone], index) => {
              const Icon = [Zap, AlertTriangle, PackageSearch, Boxes, Truck, ShieldCheck][index];
              return (
                <div className="workflow-node-wrap" key={name}>
                  <div className={cx("workflow-node", tone, loading && index === 0 && "node-active")}>
                    <Icon size={19} />
                    <span className="node-core" />
                  </div>
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="workflow-legend">
        <span><i className="legend-dot violet" /> Risk intelligence</span>
        <span><i className="legend-dot blue" /> Procurement & inventory</span>
        <span><i className="legend-dot cyan" /> Logistics & recovery</span>
      </div>
      <div className="workflow-footnote">
        <Activity size={14} />
        <span>Five CrewAI agents · Sequential task orchestration · Human approval required</span>
      </div>
    </section>
  );
}

function AgentHealth({ onViewAll }) {
  return (
    <section className="panel agent-health">
      <PanelHeading
        title="Agent health"
        subtitle="Configured intelligence units"
        action={<button className="text-action" onClick={onViewAll}>View all <ChevronRight size={14} /></button>}
      />
      <div className="health-list">
        {agents.slice(0, 4).map((agent) => {
          const Icon = agent.icon;
          return (
            <div className="health-row" key={agent.name}>
              <div className={`mini-agent-icon ${agent.color}`}><Icon size={16} /></div>
              <div className="health-agent-copy">
                <strong>{agent.short}</strong>
                <small>{agent.department}</small>
              </div>
              <span className="health-status"><i /> Ready</span>
              <div className="health-spark" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SystemAlerts({ reports, onOpenReports }) {
  const pending = reports.filter(r => (r.status || "").toLowerCase().includes("pending"));
  const critical = reports.filter(r => r.urgency === "Critical");
  const items = [
    ...critical.slice(0, 1).map(r => ({
      icon: AlertTriangle, tone: "amber", title: "Critical supply chain event",
      detail: `${r.crisis_type || "Crisis"} · ${r.affected_region || "Region not specified"}`
    })),
    ...pending.slice(0, 1).map(r => ({
      icon: Clock3, tone: "blue", title: "Human review pending",
      detail: `Report ${r.report_id} is awaiting a decision`
    }))
  ];

  if (!items.length) {
    items.push({
      icon: ShieldCheck, tone: "green", title: "No urgent alerts",
      detail: "New analysis and review alerts will appear here"
    });
  }

  return (
    <section className="panel alerts-panel">
      <PanelHeading
        title="System alerts"
        subtitle="Items requiring attention"
        action={<button className="text-action" onClick={onOpenReports}>View all <ChevronRight size={14} /></button>}
      />
      <div className="alert-list">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div className="alert-row" key={`${item.title}-${index}`}>
              <div className={`alert-icon ${item.tone}`}><Icon size={17} /></div>
              <div className="alert-copy"><strong>{item.title}</strong><small>{item.detail}</small></div>
              <span className="alert-arrow"><ChevronRight size={15} /></span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentReports({ reports, onSelect, onViewAll }) {
  return (
    <section className="panel recent-panel">
      <PanelHeading
        title="Recent investigations"
        subtitle="Latest supply chain intelligence reports"
        action={<button className="text-action" onClick={onViewAll}>All reports <ChevronRight size={14} /></button>}
      />
      {reports.length === 0 ? (
        <div className="empty-state compact">
          <FileText size={23} />
          <strong>No investigations yet</strong>
          <span>Run a crisis analysis to generate your first report.</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Report</th><th>Crisis type</th><th>Urgency</th><th>Status</th><th>Created</th><th /></tr></thead>
            <tbody>
              {reports.slice(0, 5).map(report => (
                <tr key={report.report_id}>
                  <td><strong className="report-code">#{report.report_id}</strong></td>
                  <td>{report.crisis_type}</td>
                  <td><span className={cx("pill", statusClass(report.urgency))}>{report.urgency || "Normal"}</span></td>
                  <td><span className={cx("pill", statusClass(report.status))}>{report.status || "Generated"}</span></td>
                  <td className="muted-cell">{formatDate(report.created_at)}</td>
                  <td><button className="icon-button" aria-label="Open report" onClick={() => onSelect(report)}><ChevronRight size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ReportView({ report, onBack, onReview, reviewing }) {
  const [decision, setDecision] = useState("Approved");
  const [comments, setComments] = useState("");

  if (!report) return null;
  const analysis = typeof report.analysis === "string"
    ? report.analysis
    : JSON.stringify(report.analysis, null, 2);
  const isPending = (report.status || "").toLowerCase().includes("pending");

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div><button className="back-link" onClick={onBack}>← Back to reports</button><h1>Investigation report</h1><p>Executive intelligence and human review record</p></div>
        <span className={cx("pill", statusClass(report.status))}>{report.status}</span>
      </div>
      <section className="panel report-summary">
        <div className="report-summary-top"><div><span className="eyebrow">REPORT IDENTIFIER</span><h2>#{report.report_id}</h2></div><span className={cx("pill", statusClass(report.urgency))}>{report.urgency} urgency</span></div>
        <div className="report-meta-grid">
          <div><small>Crisis type</small><strong>{report.crisis_type}</strong></div>
          <div><small>Affected product</small><strong>{report.affected_product || "Not specified"}</strong></div>
          <div><small>Affected region</small><strong>{report.affected_region || "Not specified"}</strong></div>
          <div><small>Created</small><strong>{formatDate(report.created_at)}</strong></div>
        </div>
        <div className="report-description"><small>CRISIS DESCRIPTION</small><p>{report.description}</p></div>
      </section>
      <section className="panel">
        <PanelHeading title="AI investigation findings" subtitle="Consolidated CrewAI analysis" />
        <pre className="analysis-output">{analysis || "No analysis content was returned."}</pre>
      </section>
      <section className="panel human-review-panel">
        <PanelHeading title="Human review" subtitle="Final operational decisions remain with an authorized reviewer" />
        {isPending ? (
          <div className="review-form">
            <label>Review decision<select value={decision} onChange={e => setDecision(e.target.value)}><option>Approved</option><option>Rejected</option><option>Needs Changes</option></select></label>
            <label>Reviewer comments<textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Add decision notes or required changes..." rows={3} /></label>
            <button className="primary-button" disabled={reviewing} onClick={() => onReview(report.report_id, decision, comments)}>{reviewing ? <RefreshCw className="spin" size={16} /> : <Check size={16} />} Submit review</button>
          </div>
        ) : <div className="review-complete"><CheckCircle2 size={19} /><span>This report has been reviewed. Current status: <strong>{report.status}</strong></span></div>}
      </section>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [health, setHealth] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [healthData, dashboardData, reportData] = await Promise.all([
        api.health(), api.dashboard(), api.reports()
      ]);
      setHealth(healthData);
      setDashboard(dashboardData);
      setReports(reportData.reports || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the API.");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const navigate = (page) => {
    setActivePage(page);
    setMobileMenu(false);
    setError("");
    setSuccess("");
    if (page !== "Reports & Review") setSelectedReport(null);
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await api.analyze(form);
      setSelectedReport(result);
      setSuccess("Investigation completed and report saved.");
      setActivePage("Investigation Report");
      setForm(initialForm);
      await loadData();
    } catch (err) {
      setError(err.message || "Analysis could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId, decision, comments) => {
    setReviewing(true);
    setError("");
    setSuccess("");
    try {
      await api.review({
        report_id: reportId,
        decision,
        reviewer: "Workspace Admin",
        comments
      });
      const updated = await api.reports();
      setReports(updated.reports || []);
      const refreshed = (updated.reports || []).find(r => r.report_id === reportId);
      if (refreshed) setSelectedReport(refreshed);
      await loadData();
      setSuccess("Human review decision saved.");
    } catch (err) {
      setError(err.message || "Review could not be saved.");
    } finally {
      setReviewing(false);
    }
  };

  const openReport = (report) => {
    setSelectedReport(report);
    setActivePage("Investigation Report");
    setError("");
  };

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter(r =>
      [r.report_id, r.crisis_type, r.affected_product, r.affected_region, r.status]
        .some(value => String(value || "").toLowerCase().includes(term))
    );
  }, [reports, search]);

  const pendingCount = reports.filter(r => (r.status || "").toLowerCase().includes("pending")).length;
  const criticalCount = reports.filter(r => r.urgency === "Critical").length;

  const renderOverview = () => (
    <div className="page-stack">
      <div className="page-title-row">
        <div><span className="eyebrow">OPERATIONS INTELLIGENCE</span><h1>Supply Chain Command Center</h1><p>Monitor disruptions, agent operations and recovery decisions in one place.</p></div>
        <button className="primary-button" onClick={() => navigate("Crisis Analysis")}><Plus size={16} /> New investigation</button>
      </div>
      <div className="stats-grid">
        <StatCard label="Total investigations" value={dashboard?.total_reports ?? reports.length} note="Reports generated" icon={FileText} tone="violet" />
        <StatCard label="Critical incidents" value={dashboard?.critical_reports ?? criticalCount} note="High-priority events" icon={AlertTriangle} tone="pink" />
        <StatCard label="Pending approvals" value={dashboard?.pending_reviews ?? pendingCount} note="Require human review" icon={Clock3} tone="blue" />
        <StatCard label="Active AI agents" value="05" note="Configured in CrewAI" icon={Users} tone="cyan" />
      </div>
      <WorkflowMap loading={loading} />
      <div className="two-column-grid">
        <AgentHealth onViewAll={() => navigate("Agent Network")} />
        <SystemAlerts reports={reports} onOpenReports={() => navigate("Reports & Review")} />
      </div>
      <RecentReports reports={reports} onSelect={openReport} onViewAll={() => navigate("Reports & Review")} />
    </div>
  );

  const renderCrisisForm = () => (
    <div className="page-stack">
      <div className="page-title-row"><div><span className="eyebrow">NEW WORKFLOW</span><h1>Crisis analysis</h1><p>Submit a supply chain disruption for multi-agent investigation.</p></div><span className="secure-label"><ShieldCheck size={14} /> Human review enabled</span></div>
      <div className="analysis-layout">
        <form className="panel crisis-form" onSubmit={handleAnalyze}>
          <PanelHeading title="Crisis intake" subtitle="Provide the operational context for the agent team" />
          <label>Crisis category<select value={form.crisis_type} onChange={e => setForm({ ...form, crisis_type: e.target.value })}><option>Supplier Disruption</option><option>Inventory Shortage</option><option>Shipment Delay</option><option>Route Disruption</option><option>Demand Surge</option><option>Other</option></select></label>
          <label>Incident description<textarea required minLength={5} maxLength={2000} rows={5} placeholder="Describe what happened, the operational impact and any known constraints..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <div className="form-two-col">
            <label>Affected product<input value={form.affected_product} onChange={e => setForm({ ...form, affected_product: e.target.value })} placeholder="e.g. Medical Gloves" /></label>
            <label>Affected region<input value={form.affected_region} onChange={e => setForm({ ...form, affected_region: e.target.value })} placeholder="e.g. Karachi" /></label>
          </div>
          <label>Incident urgency<select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
          {error && <div className="inline-message error"><AlertTriangle size={15} />{error}</div>}
          <button className="primary-button submit-analysis" disabled={loading}>{loading ? <><RefreshCw className="spin" size={16} /> Running CrewAI investigation...</> : <><Zap size={16} /> Run AI investigation <ArrowUpRight size={16} /></>}</button>
          <p className="form-footnote"><Shield size={13} /> Analysis uses configured CSV datasets. Recommendations require human validation.</p>
        </form>
        <div className="analysis-side">
          <WorkflowMap loading={loading} />
          <section className="panel execution-info"><h3>Execution protocol</h3><div className="protocol-row"><span>01</span><div><strong>Risk assessment</strong><small>Identify operational exposure</small></div></div><div className="protocol-row"><span>02</span><div><strong>Cross-functional analysis</strong><small>Supplier, inventory and logistics</small></div></div><div className="protocol-row"><span>03</span><div><strong>Recovery coordination</strong><small>Prioritized executive action plan</small></div></div><div className="protocol-row"><span>04</span><div><strong>Human decision</strong><small>Review and approve recommendations</small></div></div></section>
        </div>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="page-stack">
      <div className="page-title-row"><div><span className="eyebrow">MULTI-AGENT SYSTEM</span><h1>Agent network</h1><p>Five specialized CrewAI agents working across the supply chain.</p></div><span className="live-indicator"><i /> Configured</span></div>
      <div className="agent-network-grid">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          return <article className="panel agent-card" key={agent.name}>
            <div className="agent-card-top"><div className={`agent-large-icon ${agent.color}`}><Icon size={22} /></div><span className="health-status"><i /> Ready</span></div>
            <span className="agent-index">AGENT 0{index + 1}</span><h3>{agent.name}</h3><span className="agent-department">{agent.department}</span><p>{agent.task}</p>
            <div className="agent-card-footer"><span><Activity size={13} /> CrewAI</span><span>Sequential process</span></div>
          </article>;
        })}
      </div>
      <WorkflowMap loading={loading} />
    </div>
  );

  const renderReports = () => (
    <div className="page-stack">
      <div className="page-title-row"><div><span className="eyebrow">AUDIT & GOVERNANCE</span><h1>Reports & review</h1><p>Review investigation history and record operational decisions.</p></div><button className="secondary-button" onClick={loadData}><RefreshCw size={15} /> Refresh</button></div>
      <div className="stats-grid compact-stats">
        <StatCard label="All reports" value={reports.length} note="Saved investigations" icon={FileText} />
        <StatCard label="Awaiting review" value={pendingCount} note="Decision required" icon={Clock3} tone="blue" />
        <StatCard label="Critical events" value={criticalCount} note="Critical urgency" icon={AlertTriangle} tone="pink" />
      </div>
      <section className="panel reports-panel">
        <PanelHeading title="Investigation register" subtitle="Select a report to inspect findings and review status" />
        <div className="table-toolbar"><div className="search-field"><Search size={15} /><input placeholder="Search reports, products, regions..." value={search} onChange={e => setSearch(e.target.value)} /></div><span>{filteredReports.length} records</span></div>
        {filteredReports.length === 0 ? <div className="empty-state"><FileText size={26} /><strong>No matching reports</strong><span>Try a different search or run a new investigation.</span></div> :
          <div className="table-wrap"><table className="data-table"><thead><tr><th>Report ID</th><th>Incident</th><th>Product / Region</th><th>Urgency</th><th>Review status</th><th>Created</th><th /></tr></thead><tbody>
            {filteredReports.map(report => <tr key={report.report_id}><td><strong className="report-code">#{report.report_id}</strong></td><td>{report.crisis_type}</td><td><span>{report.affected_product || "—"}</span><small className="table-sub">{report.affected_region || "Region not specified"}</small></td><td><span className={cx("pill", statusClass(report.urgency))}>{report.urgency}</span></td><td><span className={cx("pill", statusClass(report.status))}>{report.status}</span></td><td className="muted-cell">{formatDate(report.created_at)}</td><td><button className="icon-button" onClick={() => openReport(report)} aria-label="Open report"><ChevronRight size={16} /></button></td></tr>)}
          </tbody></table></div>}
      </section>
    </div>
  );

  const renderContent = () => {
    if (activePage === "Overview") return renderOverview();
    if (activePage === "Crisis Analysis") return renderCrisisForm();
    if (activePage === "Agent Network") return renderAgents();
    if (activePage === "Reports & Review") return renderReports();
    if (activePage === "Investigation Report") return <ReportView report={selectedReport} onBack={() => navigate("Reports & Review")} onReview={handleReview} reviewing={reviewing} />;
    return renderOverview();
  };

  return (
    <div className="app-shell">
      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}
      <aside className={cx("sidebar", mobileMenu && "sidebar-open")}>
        <div className="brand">
          <div className="brand-mark"><Network size={21} /></div>
          <div><strong>SupplyChain<span>Sentinel</span></strong><small>AI INTELLIGENCE PLATFORM</small></div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}><X size={18} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.label} className={cx("nav-item", activePage === item.label && "active")} onClick={() => navigate(item.label)}><Icon size={17} /><span>{item.label}</span>{item.label === "Reports & Review" && pendingCount > 0 && <b className="nav-count">{pendingCount}</b>}</button>;
          })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="platform-card">
          <div className="platform-card-heading"><span className="platform-dot" /> Platform status</div>
          <strong>{health?.status === "healthy" ? "All systems operational" : "API connection unavailable"}</strong>
          <small>{health?.framework || "FastAPI connection"}</small>
          <button onClick={loadData}>Check connection <ArrowUpRight size={13} /></button>
        </div>
        <div className="sidebar-bottom"><div className="user-avatar">SA</div><div><strong>Workspace Admin</strong><small>Operations control</small></div><Settings size={16} /></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileMenu(true)}><Menu size={20} /></button><div className="breadcrumb">Workspace <ChevronRight size={13} /> <strong>{activePage}</strong></div></div>
          <div className="topbar-right">
            <div className="global-search"><Search size={15} /><input placeholder="Search reports and incidents..." value={search} onChange={e => setSearch(e.target.value)} /><kbd><Command size={10} /> K</kbd></div>
            <button className="top-icon" title="Refresh data" onClick={loadData}><RefreshCw size={17} /></button>
            <button className="top-icon notification-button" title="Pending reviews" onClick={() => navigate("Reports & Review")}><Bell size={17} />{pendingCount > 0 && <i />}</button>
            <div className="top-user"><div className="user-avatar">SA</div><div><strong>Workspace Admin</strong><small>Platform operator</small></div><ChevronDown size={14} /></div>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="global-message error"><AlertTriangle size={15} />{error}<button onClick={() => setError("")}><X size={14} /></button></div>}
          {success && <div className="global-message success"><CheckCircle2 size={15} />{success}<button onClick={() => setSuccess("")}><X size={14} /></button></div>}
          {pageLoading ? <div className="loading-screen"><RefreshCw className="spin" size={24} /><span>Connecting to intelligence platform...</span></div> : renderContent()}
        </div>
        <footer className="app-footer"><span>SUPPLYCHAIN SENTINEL AI <i /> ENTERPRISE INTELLIGENCE</span><span>Powered by FastAPI · CrewAI · Groq</span></footer>
      </main>
    </div>
  );
}
