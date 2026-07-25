import "./styles.css";
import "katex/dist/katex.min.css";
import { createIcons, ArrowUpRight, BookOpen, Check, ChevronDown, Clipboard, Code2, Database, Download, ExternalLink, FileText, FlaskConical, Github, Menu, Search, X } from "lucide";
import { marked } from "marked";

const BASE = import.meta.env.BASE_URL;
const ARTIFACT = "https://kilthub.cmu.edu/articles/software/Artifact_for_LLM-Powered_Automatic_Theorem_Proving_and_Synthesis_for_Hybrid_Systems_and_Games/32248389";
const PAPER = "https://arxiv.org/abs/2603.00737";
const data = await fetch(`${BASE}data/content.json`).then((r) => r.json());

const icons = { ArrowUpRight, BookOpen, Check, ChevronDown, Clipboard, Code2, Database, Download, ExternalLink, FileText, FlaskConical, Github, Menu, Search, X };
let state = { page: location.hash.slice(1) || "overview", prompt: "AnalyzeGameLoop", promptFilter: "primary", promptSearch: "", result: "verification", caseTabs: {} };

const app = document.querySelector("#app");

function icon(name, size = 17) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px" aria-hidden="true"></i>`;
}
function escape(value = "") {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function navLink(id, label) {
  return `<a href="#${id}" class="${state.page === id ? "active" : ""}" data-nav="${id}">${label}</a>`;
}
function shell(content) {
  app.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#overview" aria-label="Cleopatra home">
        <span class="brand-mark">C</span>
        <span><strong>Cleopatra</strong><small>Paper supplement</small></span>
      </a>
      <button class="icon-button mobile-menu" aria-label="Open navigation">${icon("Menu", 20)}</button>
      <nav aria-label="Primary">
        ${navLink("overview", "Overview")}
        ${navLink("prompts", "Prompts & traces")}
        ${navLink("cases", "Case studies")}
        ${navLink("results", "Results")}
      </nav>
      <div class="header-links">
        <a href="${PAPER}" target="_blank">Paper ${icon("ArrowUpRight", 14)}</a>
        <a href="${ARTIFACT}" target="_blank">Artifact ${icon("ArrowUpRight", 14)}</a>
      </div>
    </header>
    <main id="main">${content}</main>
    <footer>
      <div><strong>Cleopatra</strong><span>ControL EnvelOPe And Theorem Revision Automation</span></div>
      <p>Supplementary material for the paper. No analytics or visitor tracking.</p>
      <div class="footer-links"><a href="${PAPER}">Paper</a><a href="${ARTIFACT}">Artifact</a><a href="https://github.com/aditink/cleopatra-paper">Source</a></div>
    </footer>`;
  createIcons({ icons });
  bindShell();
}

function overview() {
  shell(`
    <section class="hero">
      <div class="hero-inner">
        <p class="eyebrow">Formal methods · Hybrid games · LLM-guided proving</p>
        <h1>LLM-Powered Automatic Theorem Proving and Synthesis for Hybrid Systems and Games</h1>
        <p class="authors">Aditi Kabra · Jonathan Laurent · Ruben Martins · Stefan Mitsch · André Platzer</p>
        <p class="affiliations">Carnegie Mellon University · Karlsruhe Institute of Technology · DePaul University</p>
        <p class="lead">A readable companion to the paper and artifact: inspect the production prompts, explore five challenging case studies, compare experimental results, and replay formally checked runs.</p>
        <div class="hero-actions">
          <a class="button primary" href="#prompts">${icon("Code2")} Browse examples</a>
          <a class="button" href="${ARTIFACT}" target="_blank">${icon("Download")} Get the artifact</a>
        </div>
        <details class="hero-citation">
          <summary>Cite this paper ${icon("ChevronDown", 16)}</summary>
          <pre><code>@INPROCEEDINGS{DBLP:conf/fmcad/KabraLMMP26,
  author        = {Kabra, Aditi and
                   Laurent, Jonathan and
                   Martins, Ruben and
                   Mitsch, Stefan and
                   Platzer, Andr{\\'{e}}},
  title         = {{LLM}-Powered Automatic Theorem Proving and
                   Synthesis for Hybrid Systems and Games},
  booktitle     = {FMCAD},
  longbooktitle = {Proceedings of the 26th Conference on Formal
                   Methods in Computer-Aided Design -- FMCAD 2026},
  year          = {2026},
  editor        = {Dutertre, Bruno and
                   K{\\\"{o}}nighofer, Bettina}
}</code></pre>
        </details>
      </div>
    </section>`);
}

function promptMarkdown(value) {
  marked.setOptions({ gfm: true, breaks: false });
  return marked.parse(value || "_This prompt has no content for this message role._");
}
function prompts() {
  const q = state.promptSearch.toLowerCase();
  const visible = data.prompts.filter((p) =>
    (state.promptFilter === "all" || p.category === state.promptFilter) &&
    (!q || `${p.title} ${p.description} ${p.pipeline}`.toLowerCase().includes(q)));
  const selected = data.prompts.find((p) => p.id === state.prompt) || visible[0] || data.prompts[0];
  shell(`
    <section class="page-head"><p class="eyebrow">Published templates and checked runs</p><h1>Prompts & traces</h1><p>Browse every distinct production query and shared guide, then inspect one representative successful verification trace for each benchmark.</p></section>
    <section class="prompt-workspace">
      <aside class="prompt-sidebar">
        <label class="search">${icon("Search")}<input id="prompt-search" type="search" value="${escape(state.promptSearch)}" placeholder="Search prompts" /></label>
        <div class="segments" role="group" aria-label="Prompt category">
          ${[["primary","Production"],["shared","Guides"],["additional","Additional"],["all","All"]].map(([id,label]) => `<button class="${state.promptFilter===id?"active":""}" data-filter="${id}">${label}</button>`).join("")}
        </div>
        <p class="result-count">${visible.length} templates</p>
        <div class="prompt-list">${visible.map((p) => `<button class="${selected.id===p.id?"active":""}" data-prompt="${p.id}"><span>${p.title}</span><small>${p.pipeline}</small></button>`).join("")}</div>
      </aside>
      <article class="prompt-reader">
        <header><div><span class="tag ${selected.pipeline}">${selected.pipeline}</span><h2>${selected.title}</h2><p>${selected.description}</p></div><div class="reader-actions"><button class="icon-button copy-prompt" title="Copy prompt" aria-label="Copy prompt">${icon("Clipboard")}</button>${selected.rawFiles.map((f) => `<a class="icon-button" title="Download ${f}" aria-label="Download ${f}" href="${BASE}prompts/${f}" download>${icon("Download")}</a>`).join("")}</div></header>
        ${selected.system ? `<section class="message"><div class="message-label"><span>System</span><small>${selected.id}.system.jinja</small></div><div class="markdown">${promptMarkdown(selected.system)}</div></section>` : ""}
        ${selected.instance ? `<section class="message"><div class="message-label"><span>User template</span><small>${selected.id}.instance.jinja</small></div><div class="markdown">${promptMarkdown(selected.instance)}</div></section>` : ""}
        ${selected.shared ? `<section class="message"><div class="message-label"><span>Shared guide</span><small>${selected.id}.jinja</small></div><div class="markdown">${promptMarkdown(selected.shared)}</div></section>` : ""}
      </article>
    </section>
    <section class="section benchmark-traces">
      <div class="section-heading"><p class="eyebrow">Successful examples</p><h2>One checked trace per problem</h2><p>Each example is taken from a successful GPT-5.5 high-reasoning run. The displayed tactic is the final script accepted by KeYmaera X; complete interaction caches are available in the artifact.</p></div>
      <div class="trace-grid">${data.cases.map((c) => {
        const trace = data.verificationTraces.find((item) => item.benchmark === c.id);
        if (!trace) return "";
        return `<article class="trace-card"><header><div><span class="tag verification">Verification</span><h3>${c.title}</h3></div><span class="trace-outcome">${icon("Check",14)} Proof checked</span></header><p>${trace.requests} requests · ${Number(trace.outputTokens).toLocaleString()} output tokens · $${Number(trace.cost).toFixed(2)}</p><details><summary>View theorem and final tactic ${icon("ChevronDown",16)}</summary><h4>Theorem</h4><pre><code>${escape(trace.formula)}</code></pre><h4>Accepted tactic</h4><pre><code>${escape(trace.tactic)}</code></pre></details></article>`;
      }).join("")}</div>
      <a class="button" href="${ARTIFACT}" target="_blank">${icon("Database")} Open complete caches</a>
    </section>`);
  bindPrompt(selected);
}

function cases() {
  shell(`
    <section class="page-head"><p class="eyebrow">Starting benchmarks</p><h1>Five challenging case studies</h1><p>These examples span nonlinear dynamics, nested control modes, adversarial choices, and unbounded-time reasoning. They are starting points for a broader hybrid-systems benchmark suite.</p></section>
    <section class="case-list section">${data.cases.map((c, i) => `
      <article class="case-row">
        <div class="case-index">0${i+1}</div>
        <div class="case-summary"><p class="eyebrow">${c.domain}</p><h2>${c.title}</h2><p>${c.summary}</p><div class="status-line"><span class="success">${icon("Check",14)} ${c.verification}</span><span class="${c.synthesis.includes("Not")?"neutral":"success"}">${c.synthesis.includes("Not")?"×":icon("Check",14)} ${c.synthesis}</span></div></div>
        <div class="case-detail"><dl><dt>Primary challenge</dt><dd>${c.challenge}</dd><dt>Provenance</dt><dd>${c.source}</dd></dl>
          <details><summary>Inspect benchmark input ${icon("ChevronDown",16)}</summary><div class="code-tabs">
            <div class="view-tabs case-tabs"><button class="${(state.caseTabs[c.id]||"verification")==="verification"?"active":""}" data-case="${c.id}" data-case-tab="verification">Verification</button><button class="${state.caseTabs[c.id]==="synthesis"?"active":""}" data-case="${c.id}" data-case-tab="synthesis">Synthesis</button></div>
            ${(state.caseTabs[c.id]||"verification")==="verification"
              ? `<h3>Verification theorem</h3><pre><code>${escape(c.verificationFormula)}</code></pre>`
              : `<h3>Hybrid game</h3><pre><code>${escape(c.program)}</code></pre><h3>Target postcondition</h3><pre><code>${escape(c.postcondition)}</code></pre>${c.guideline?`<h3>Informal synthesis guideline</h3><pre><code>${escape(c.guideline)}</code></pre>`:""}`}
          </div></details>
        </div>
      </article>`).join("")}</section>`);
  document.querySelectorAll("[data-case-tab]").forEach((button) => button.onclick = () => {
    state.caseTabs[button.dataset.case] = button.dataset.caseTab;
    cases();
    document.querySelector(`[data-case="${button.dataset.case}"]`)?.closest("details")?.setAttribute("open", "");
  });
}

function results() {
  const verificationSummary = [
    ["Qwen3.5","✓","1/5","0.13 ± 0.13","—","88.0 ± 18.0","254 ± 17"],
    ["GPT-5.4-mini","","1/5","0.13 ± 0.13","1.07 ± 1.05","138.5 ± 130.5","41 ± 39"],
    ["GPT-5.4-mini","✓","2/5","0.33 ± 0.21","0.70 ± 0.17","11.0 ± 2.7","148 ± 36"],
    ["GPT-5.4","✓","5/5","0.93 ± 0.07","2.21 ± 0.44","9.4 ± 1.4","92 ± 18"],
    ["GPT-5.5","","3/5","0.60 ± 0.24","5.95 ± 5.25","47.3 ± 33.7","35 ± 30"],
    ["GPT-5.5","✓","5/5","1.00 ± 0.00","2.05 ± 0.56","6.1 ± 1.3","63 ± 17","best"],
  ];
  const verificationDetail = [
    ["Qwen3.5, reas.","2/3","—","0/3","—","0/3","—","0/3","—","0/3","—"],
    ["GPT-5.4-mini, no reas.","2/3","1.07","0/3","—","0/3","—","0/3","—","0/3","—"],
    ["GPT-5.4-mini, reas.","2/3","0.33","0/3","—","0/3","—","0/3","—","3/3","0.95"],
    ["GPT-5.4, reas.","3/3","0.81","3/3","2.09","3/3","1.22","3/3","4.38","2/3","2.74"],
    ["GPT-5.5, no reas.","1/1","0.17","0/1","—","1/1","16.44","0/1","—","1/1","1.24"],
    ["GPT-5.5, reas.","3/3","0.88","3/3","1.80","3/3","1.89","3/3","4.68","3/3","1.01"],
  ];
  const synthesisSummary = [
    ["Baseline","0/5","—","—","—","—"],
    ["Ablation","2/5","0.40 ± 0.24","0.80 ± 0.06","19.5 ± 2.5","76 ± 7"],
    ["Full Pipeline","4/5","0.80 ± 0.20","2.19 ± 0.73","41.0 ± 10.0","203 ± 67","best"],
  ];
  const synthesisDetail = [
    ["Ablation","1/1","0.86","0/1","—","0/1","—","0/1","—","1/1","0.74"],
    ["Full Pipeline","2/2","0.75","0/2","—","2/2","5.35","2/2","1.90","2/2","0.75","best"],
  ];
  const cells = (row) => row.slice(0, row.at(-1) === "best" ? -1 : row.length);
  const simpleTable = (headers, rows) => `<div class="table-wrap paper-table"><table><thead><tr>${headers.map((h)=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r)=>`<tr class="${r.at(-1)==="best"?"best-row":""}">${cells(r).map((v,i)=>`<td>${i===0?`<strong>${v}</strong>`:v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const benchmarkTable = (rows) => `<div class="table-wrap paper-table benchmark-table"><table><thead><tr><th rowspan="2">Configuration</th>${["Chem. Reaction","Coolant","Train","Lotka–Volterra","Van der Pol"].map((h)=>`<th colspan="2">${h}</th>`).join("")}</tr><tr>${Array(5).fill("<th>Succ.</th><th>Cost</th>").join("")}</tr></thead><tbody>${rows.map((r)=>`<tr class="${r.at(-1)==="best"?"best-row":""}">${cells(r).map((v,i)=>`<td>${i===0?`<strong>${v}</strong>`:v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  shell(`
    <section class="page-head"><p class="eyebrow">Paper evaluation</p><h1>Results</h1><p>These tables reproduce the compact evaluation tables from the paper. Cost, calls, and output tokens are averaged only over successful runs.</p></section>
    <section class="section result-section">
      <div class="view-tabs"><button class="${state.result==="verification"?"active":""}" data-result="verification">Verification</button><button class="${state.result==="synthesis"?"active":""}" data-result="synthesis">Synthesis</button></div>
      ${state.result==="verification"
        ? `<div class="paper-result"><h2>Verification across models</h2>${simpleTable(["Model","Reasoning","Solved","Pass@1","Avg Cost ($)","Avg Calls","Avg Output (k tokens)"],verificationSummary)}<p class="table-note">Reasoning is high for OpenAI models and enabled for Qwen. Pass@1 is the mean empirical single-run success rate across case studies ± standard error.</p><h2>Verification by benchmark</h2>${benchmarkTable(verificationDetail)}<p class="table-note">Succ. is successful runs out of total runs. Cost is the average dollar cost of successful runs.</p></div>`
        : `<div class="paper-result"><h2>Synthesis across configurations</h2>${simpleTable(["Configuration","Solved","Pass@1","Avg Cost ($)","Avg Calls","Avg Output (k tokens)"],synthesisSummary)}<p class="table-note">Each synthesis attempt runs four parallel pipeline threads. The ablation disables LLM-assisted proving and custom backtracking.</p><h2>Synthesis by benchmark</h2>${benchmarkTable(synthesisDetail)}<p class="table-note">Succ. is successful runs out of total runs. Cost is the average dollar cost of successful runs.</p></div>`}
    </section>`);
  document.querySelectorAll("[data-result]").forEach((b)=>b.onclick=()=>{state.result=b.dataset.result;results();});
}

function bindShell() {
  document.querySelector(".mobile-menu")?.addEventListener("click", () => document.querySelector(".site-header nav").classList.toggle("open"));
}
function bindPrompt(selected) {
  document.querySelectorAll("[data-filter]").forEach((b)=>b.onclick=()=>{state.promptFilter=b.dataset.filter;prompts();});
  document.querySelectorAll("[data-prompt]").forEach((b)=>b.onclick=()=>{state.prompt=b.dataset.prompt;prompts();});
  document.querySelector("#prompt-search")?.addEventListener("input",(e)=>{state.promptSearch=e.target.value;prompts();document.querySelector("#prompt-search")?.focus();});
  document.querySelector(".copy-prompt")?.addEventListener("click", async (e)=>{
    await navigator.clipboard.writeText([selected.system,selected.instance,selected.shared].filter(Boolean).join("\n\n"));
    e.currentTarget.innerHTML=icon("Check"); createIcons({icons});
  });
}
function render() {
  state.page = location.hash.slice(1) || "overview";
  ({ overview, prompts, cases, results }[state.page] || overview)();
  scrollTo({ top: 0, behavior: "instant" });
}
addEventListener("hashchange", render);
render();
