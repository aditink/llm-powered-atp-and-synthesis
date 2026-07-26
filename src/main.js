import "./styles.css";
import "katex/dist/katex.min.css";
import { createIcons, ArrowUpRight, BookOpen, Check, ChevronDown, Clipboard, Code2, Database, Download, ExternalLink, FileText, FlaskConical, Github, Menu, Search, X } from "lucide";
import { marked } from "marked";

const BASE = import.meta.env.BASE_URL;
const ARTIFACT = "https://kilthub.cmu.edu/articles/software/Artifact_for_LLM-Powered_Automatic_Theorem_Proving_and_Synthesis_for_Hybrid_Systems_and_Games/32248389";
const PAPER = "https://arxiv.org/abs/2603.00737";
const data = await fetch(`${BASE}data/content.json`).then((r) => r.json());

const icons = { ArrowUpRight, BookOpen, Check, ChevronDown, Clipboard, Code2, Database, Download, ExternalLink, FileText, FlaskConical, Github, Menu, Search, X };
let state = { page: location.hash.slice(1) || "overview", tracePipeline: "verification", traceCase: "lotka", result: "verification", caseTabs: {} };

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
      <a class="brand" href="#overview" aria-label="Paper supplement home">
        <strong>LLM-Powered Automatic Theorem Proving and Synthesis for Hybrid Systems and Games</strong>
      </a>
      <button class="icon-button mobile-menu" aria-label="Open navigation">${icon("Menu", 20)}</button>
      <nav aria-label="Primary">
        ${navLink("overview", "Overview")}
        ${navLink("cases", "Case studies")}
        ${navLink("prompts", "Prompts & traces")}
        ${navLink("results", "Results")}
      </nav>
      <div class="header-links">
        <a href="${PAPER}" target="_blank">Paper ${icon("ArrowUpRight", 14)}</a>
        <a href="${ARTIFACT}" target="_blank">Artifact ${icon("ArrowUpRight", 14)}</a>
      </div>
    </header>
    <main id="main">${content}</main>
    <footer>
      <div><strong>Paper supplement</strong><span>LLM-Powered Automatic Theorem Proving and Synthesis for Hybrid Systems and Games</span></div>
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
  const selectedCase = data.cases.find((item) => item.id === state.traceCase) || data.cases[0];
  const trace = data.exampleTraces.find((item) =>
    item.pipeline === state.tracePipeline && item.benchmark === selectedCase.id);
  const traceBody = trace ? `
    <header>
      <div><span class="tag ${trace.pipeline}">${trace.pipeline}</span><h2>${selectedCase.title}</h2><p>Successful ${trace.model} replay cache · ${trace.interactions.length} recorded prompt/response exchanges</p></div>
      <a class="button" href="${ARTIFACT}" target="_blank">${icon("Database")} Complete cache</a>
    </header>
    <div class="trace-messages">${trace.interactions.map((turn, index) => {
      const isProverExchange = turn.prompt.trimStart().startsWith("fun:");
      const summary = isProverExchange
        ? "KeYmaera X check"
        : turn.prompt.split("\n").find(Boolean)?.slice(0, 90) || "LLM query";
      const requestLabel = isProverExchange ? "Pipeline → KeYmaera X" : "Prompt";
      const requestDetail = isProverExchange ? "Prover request" : "Instantiated user message";
      const responseLabel = isProverExchange ? "KeYmaera X → pipeline" : "LLM response";
      const responseDetail = isProverExchange ? "Formal checker feedback" : trace.model;
      return `
      <details class="trace-turn ${isProverExchange ? "prover-exchange" : "llm-exchange"}" ${index === 0 ? "open" : ""}>
        <summary><span>Exchange ${String(index + 1).padStart(2, "0")}</span><small>${escape(summary)}</small><span class="exchange-kind">${isProverExchange ? "Prover" : "LLM"}</span>${icon("ChevronDown", 16)}</summary>
        <section class="message"><div class="message-label"><span>${requestLabel}</span><small>${requestDetail}</small></div><div class="markdown">${promptMarkdown(turn.prompt)}</div></section>
        <section class="message response"><div class="message-label"><span>${responseLabel}</span><small>${responseDetail}</small></div><div class="markdown">${promptMarkdown(turn.response)}</div></section>
      </details>`;
    }).join("")}</div>` : `
    <div class="trace-empty">
      <span class="tag synthesis">Synthesis</span>
      <h2>${selectedCase.title}</h2>
      <p>No successful synthesis trace is available for Coolant. Both full-pipeline runs failed to verify a synthesized control envelope, as reported in the paper.</p>
      <a class="button" href="#results">${icon("Database")} View synthesis results</a>
    </div>`;
  shell(`
    <section class="page-head"><p class="eyebrow">Published runs</p><h1>Example traces</h1><p>Example traces of verification and synthesis, showing LLM prompts and responses alongside KeYmaera X requests and formal-checker feedback from archived replay caches.</p></section>
    <section class="trace-pipeline-tabs">
      <div class="view-tabs" role="tablist" aria-label="Pipeline">
        ${["verification", "synthesis"].map((pipeline) => `<button role="tab" aria-selected="${state.tracePipeline === pipeline}" class="${state.tracePipeline === pipeline ? "active" : ""}" data-trace-pipeline="${pipeline}">${pipeline[0].toUpperCase() + pipeline.slice(1)}</button>`).join("")}
      </div>
    </section>
    <section class="trace-workspace">
      <aside class="trace-sidebar">
        <p class="result-count">Case studies</p>
        <div class="prompt-list">${data.cases.map((item, index) => `<button class="${selectedCase.id === item.id ? "active" : ""}" data-trace-case="${item.id}"><small>0${index + 1}</small><span>${item.title}</span></button>`).join("")}</div>
      </aside>
      <article class="trace-reader">${traceBody}</article>
    </section>`);
  document.querySelectorAll("[data-trace-pipeline]").forEach((button) => button.onclick = () => {
    state.tracePipeline = button.dataset.tracePipeline;
    prompts();
  });
  document.querySelectorAll("[data-trace-case]").forEach((button) => button.onclick = () => {
    state.traceCase = button.dataset.traceCase;
    prompts();
  });
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
