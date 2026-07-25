import "./styles.css";
import "katex/dist/katex.min.css";
import { createIcons, ArrowUpRight, BookOpen, Check, ChevronDown, Clipboard, Code2, Database, Download, ExternalLink, FileText, FlaskConical, Github, Menu, Search, X } from "lucide";
import { marked } from "marked";

const BASE = import.meta.env.BASE_URL;
const ARTIFACT = "https://kilthub.cmu.edu/articles/software/Artifact_for_LLM-Powered_Automatic_Theorem_Proving_and_Synthesis_for_Hybrid_Systems_and_Games/32248389";
const PAPER = "https://arxiv.org/abs/2603.00737";
const data = await fetch(`${BASE}data/content.json`).then((r) => r.json());

const icons = { ArrowUpRight, BookOpen, Check, ChevronDown, Clipboard, Code2, Database, Download, ExternalLink, FileText, FlaskConical, Github, Menu, Search, X };
let state = { page: location.hash.slice(1) || "overview", prompt: "AnalyzeGameLoop", promptFilter: "primary", promptSearch: "", result: "verification" };

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
        ${navLink("prompts", "Prompts")}
        ${navLink("cases", "Case studies")}
        ${navLink("results", "Results")}
        ${navLink("artifact", "Artifact")}
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
          <a class="button primary" href="#prompts">${icon("Code2")} Browse prompts</a>
          <a class="button" href="${ARTIFACT}" target="_blank">${icon("Download")} Get the artifact</a>
        </div>
      </div>
      <div class="outcome-strip" aria-label="Key outcomes">
        <div><strong>5 / 5</strong><span>verification cases solved</span></div>
        <div><strong>4 / 5</strong><span>control envelopes synthesized</span></div>
        <div><strong>0 / 5</strong><span>solved by prior automation alone</span></div>
      </div>
    </section>
    <section class="section intro-band">
      <div class="section-heading"><p class="eyebrow">How it works</p><h2>LLM proposals. Symbolic guarantees.</h2><p>The language model guides proof search and synthesis, while KeYmaera X and Z3 remain the trusted validators.</p></div>
      <div class="pipeline-pair">
        <figure><img src="${BASE}assets/atp-diagram.png" alt="Automated theorem proving pipeline diagram" /><figcaption><strong>Verification</strong><span>Analyze the game, propose a tactic, check it, and use prover feedback to revise.</span></figcaption></figure>
        <figure><img src="${BASE}assets/synthesis-pipeline.png" alt="Control-envelope synthesis pipeline diagram" /><figcaption><strong>Synthesis</strong><span>Compute subvalues backward, prove difficult obligations interactively, and backtrack when needed.</span></figcaption></figure>
      </div>
    </section>
    <section class="section quick-links">
      <a href="#prompts"><span>${icon("Code2", 23)}</span><strong>Prompt library</strong><p>Every distinct production query and shared guide, rendered and searchable.</p></a>
      <a href="#cases"><span>${icon("FlaskConical", 23)}</span><strong>Five case studies</strong><p>Models, objectives, challenges, guidelines, and outcomes.</p></a>
      <a href="#results"><span>${icon("Database", 23)}</span><strong>Experiment data</strong><p>Verification, synthesis, ablation, cost, and token results.</p></a>
      <a href="#artifact"><span>${icon("FileText", 23)}</span><strong>Artifact guide</strong><p>Replay cached runs or optionally perform live evaluations.</p></a>
    </section>
    <section class="citation-band">
      <div><p class="eyebrow">Software artifact</p><h2>Archived for reproducibility</h2><p>${data.generatedFrom}. GPL 2.0+.</p></div>
      <a class="button dark" href="${ARTIFACT}" target="_blank">Open DOI record ${icon("ExternalLink")}</a>
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
    <section class="page-head"><p class="eyebrow">Published prompt templates</p><h1>Prompt library</h1><p>Distinct query roles are shown once. Shared references are separated from query templates, while ablation and legacy variants remain available for completeness.</p></section>
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
          <details><summary>Inspect dGL model ${icon("ChevronDown",16)}</summary><div class="code-tabs"><h3>Game</h3><pre><code>${escape(c.program)}</code></pre><h3>Postcondition</h3><pre><code>${escape(c.postcondition)}</code></pre>${c.guideline?`<h3>Synthesis guideline</h3><pre><code>${escape(c.guideline)}</code></pre>`:""}</div></details>
        </div>
      </article>`).join("")}</section>`);
}

function aggregate(rows) {
  const by = new Map();
  for (const row of rows) {
    const key = row.bench_name;
    if (!by.has(key)) by.set(key, { name:key, runs:0, successes:0, price:0, requests:0, output:0 });
    const x=by.get(key); x.runs++; x.successes += row.success === "True" ? 1 : 0; x.price += Number(row.price||0); x.requests += Number(row.num_requests||0); x.output += Number(row.output_tokens||0);
  }
  return [...by.values()];
}
function results() {
  const verification = data.resultSets.filter((x)=>x.id.startsWith("table1_")).flatMap((x)=>x.rows.map((r)=>({...r,set:x.id.replace("table1_","")})));
  const synthesis = data.resultSets.filter((x)=>x.id.startsWith("table3_")).flatMap((x)=>x.rows.map((r)=>({...r,set:x.id.replace("table3_","")})));
  const rows = state.result === "verification" ? verification : synthesis;
  const summary = aggregate(rows);
  shell(`
    <section class="page-head"><p class="eyebrow">Cached experiment results</p><h1>Results</h1><p>All values below are generated from the CSV files in artifact version 1. Cost is the recorded API price for the corresponding run.</p></section>
    <section class="section result-section">
      <div class="view-tabs"><button class="${state.result==="verification"?"active":""}" data-result="verification">Verification</button><button class="${state.result==="synthesis"?"active":""}" data-result="synthesis">Synthesis & ablation</button></div>
      <div class="summary-grid">${summary.map((x)=>`<div><span>${x.name}</span><strong>${x.successes}/${x.runs}</strong><small>successful runs · ${x.requests.toLocaleString()} requests</small></div>`).join("")}</div>
      <div class="table-wrap"><table><thead><tr><th>Benchmark</th><th>Configuration</th><th>Model</th><th>Reasoning</th><th>Success</th><th>Requests</th><th>Output tokens</th><th>Cost</th></tr></thead><tbody>
        ${rows.map((r)=>`<tr><td><strong>${r.bench_name}</strong></td><td>${r.set.replaceAll("_"," ")}</td><td>${r.model_name}</td><td>${r.reasoning_effort||"default"}</td><td><span class="table-status ${r.success==="True"?"yes":"no"}">${r.success==="True"?"Solved":"Not solved"}</span></td><td>${Number(r.num_requests||0).toLocaleString()}</td><td>${Number(r.output_tokens||0).toLocaleString()}</td><td>$${Number(r.price||0).toFixed(2)}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="table-note"><strong>Interpretation.</strong> A case study is solved when at least one run produces a formally checked proof or subvalue map. The synthesis ablation removes LLM-assisted interactive proving and unrestricted backtracking; it does not isolate every individual design choice.</p>
    </section>
    <section class="section traces"><div class="section-heading"><p class="eyebrow">Selected successful runs</p><h2>What an interaction looks like</h2><p>These compact narratives expose the useful structure without reproducing thousands of cache entries. Complete caches remain in the artifact.</p></div>
      ${data.traces.map((t)=>`<article><div class="trace-head"><div><span class="tag">${t.type}</span><h3>${t.title}</h3><p>${t.model} · ${t.metrics}</p></div><span class="trace-outcome">${icon("Check",14)} ${t.outcome}</span></div><ol>${t.steps.map((s)=>`<li>${s}</li>`).join("")}</ol><details><summary>View checked excerpt ${icon("ChevronDown",16)}</summary><pre><code>${escape(t.excerpt)}</code></pre></details></article>`).join("")}
    </section>`);
  document.querySelectorAll("[data-result]").forEach((b)=>b.onclick=()=>{state.result=b.dataset.result;results();});
}

function artifact() {
  shell(`
    <section class="page-head"><p class="eyebrow">Artifact evaluation</p><h1>Artifact</h1><p>Replay the recorded successful paths without API access, or optionally run the pipelines live with an OpenAI API key.</p></section>
    <section class="section reproduce-grid">
      <aside><nav><a href="#setup">01 Setup</a><a href="#replay">02 Replay</a><a href="#live">03 Live runs</a><a href="#citation">04 Cite</a></nav><a class="button primary" href="${ARTIFACT}" target="_blank">${icon("Download")} Download artifact</a></aside>
      <div class="prose">
        <section id="setup"><p class="step">01</p><h2>Set up the Docker environment</h2><p>Download artifact version 1 and unzip both archives at the repository root. The 1.4 GB <code>cleopatra.zip</code> contains the tool, cached experiments, and Docker instructions; <code>delphyne.zip</code> contains the local orchestration library.</p><pre><code>unzip cleopatra.zip
unzip delphyne.zip
cd cleopatra
# Continue with README.docker.md</code></pre></section>
        <section id="replay"><p class="step">02</p><h2>Replay paper experiments</h2><p>Replay mode uses cached model responses and reruns the deterministic parts of the pipelines. Verification caches live under <code>table1_*</code>; synthesis caches live under <code>table3_*</code>.</p><pre><code>python experiments/table1_gpt55_reasoning.py replay &lt;config_id&gt;
python experiments/scripts/replay_success_path.py \
  experiments/test-output/table3_full_pipeline/configs/&lt;config_id&gt;</code></pre><p>Consult <code>README.docker.md</code> in the artifact for image setup, exact commands, and platform notes.</p></section>
        <section id="live"><p class="step">03</p><h2>Optional live runs</h2><p>Live evaluation requires an OpenAI API key, incurs API charges, and may not reproduce cached language-model output exactly. The artifact provides dedicated <code>run_live_*.py</code> entrypoints and writes outputs under <code>experiments/test-output/live/</code>.</p><div class="notice"><strong>Use replay for artifact evaluation.</strong><span>Live runs are useful for extension studies, not required to check the reported cached outcomes.</span></div></section>
        <section id="citation"><p class="step">04</p><h2>Citation</h2><p>The publisher link will become canonical when available. Until then, use the preprint and archived software DOI.</p><pre><code>@software{cleopatra_artifact_2026,
  author = {Kabra, Aditi and Laurent, Jonathan and
            Martins, Ruben and Mitsch, Stefan and Platzer, Andre},
  title = {Artifact for LLM-Powered Automatic Theorem Proving
           and Synthesis for Hybrid Systems and Games},
  year = {2026},
  publisher = {Carnegie Mellon University},
  doi = {10.1184/R1/32248389.v1}
}</code></pre></section>
      </div>
    </section>`);
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
  if (state.page === "reproduce") {
    location.replace("#artifact");
    return;
  }
  ({ overview, prompts, cases, results, artifact }[state.page] || overview)();
  scrollTo({ top: 0, behavior: "instant" });
}
addEventListener("hashchange", render);
render();
