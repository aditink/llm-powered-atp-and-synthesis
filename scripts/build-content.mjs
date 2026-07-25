import fs from "node:fs";
import path from "node:path";

const artifact = process.env.CLEOPATRA_ARTIFACT || "/tmp/cleopatra-artifact/cleopatra";
const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public", "data");
const rawOut = path.join(root, "public", "prompts");
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(rawOut, { recursive: true });

const primary = new Set([
  "AnalyzeGameLoop", "GetTactic", "SummarizeAndDecide",
  "GetNextActionControl", "PlanControlStrategy",
  "ComputeODEPreconditionControl", "GuessLoopInvControl",
  "GuessAsstPreconditionControl", "PlanInvariantExpansion",
  "AddInvariantConstraints", "ExtractBoundsNeeded",
  "ExtractConstantAssumptions", "ComputeBoundFormula", "ConstructInvariant",
]);
const shared = new Set([
  "Bellerophon", "DGlSyntax", "Instructions", "KyxFormulaSyntax",
  "LabelSyntax", "ReasoningTips", "Counterexamples", "ProcessPlan",
]);

const promptDir = path.join(artifact, "prompts");
const files = fs.readdirSync(promptDir)
  .filter((name) => name.endsWith(".jinja") && !name.includes(" copy"))
  .sort();

const grouped = new Map();
for (const file of files) {
  const match = file.match(/^(.*)\.(system|instance)\.jinja$/);
  const id = match ? match[1] : file.replace(".jinja", "");
  const role = match?.[2] || "shared";
  const content = fs.readFileSync(path.join(promptDir, file), "utf8");
  fs.copyFileSync(path.join(promptDir, file), path.join(rawOut, file));
  if (!grouped.has(id)) grouped.set(id, { id, system: "", instance: "", shared: "" });
  grouped.get(id)[role] = content;
}

const descriptions = {
  AnalyzeGameLoop: "Analyzes Angel and Demon choices and the control modes in a game.",
  GetTactic: "Proposes a Bellerophon tactic, incorporating feedback from earlier proof attempts.",
  SummarizeAndDecide: "Condenses proof progress and decides whether to continue or return to synthesis.",
  GetNextActionControl: "Chooses the next synthesis or proof-repair action, including a backtracking target.",
  PlanControlStrategy: "Plans an Angel control strategy before backward subvalue computation.",
  ComputeODEPreconditionControl: "Proposes a precondition for a differential-equation subgame.",
  GuessLoopInvControl: "Proposes the loop subvalue used as an invariant.",
  GuessAsstPreconditionControl: "Proposes a precondition for a nondeterministic assignment.",
  PlanInvariantExpansion: "Plans how to strengthen or expand a candidate invariant.",
  AddInvariantConstraints: "Turns a control plan into semi-formal invariant constraints.",
  ExtractBoundsNeeded: "Extracts structured bound obligations from invariant constraints.",
  ExtractConstantAssumptions: "Identifies constant assumptions needed by a proposed invariant.",
  ComputeBoundFormula: "Constructs one polynomial bound formula at a time.",
  ConstructInvariant: "Combines the plan, constraints, and bounds into a final invariant.",
  Bellerophon: "The complete KeYmaera X Bellerophon tactic-language guide supplied to the model.",
  DGlSyntax: "Reference for dGL game syntax and Angel/Demon semantics.",
  Instructions: "Shared synthesis instructions.",
  KyxFormulaSyntax: "KeYmaera X formula-syntax reference.",
  LabelSyntax: "Shared labeled-game syntax reference.",
  ReasoningTips: "Shared reasoning advice and common failure modes.",
  Counterexamples: "Guidance for interpreting counterexamples.",
  ProcessPlan: "Shared instructions for processing a synthesis plan.",
};

const prompts = [...grouped.values()].map((p) => ({
  ...p,
  title: p.id.replace(/([a-z])([A-Z])/g, "$1 $2"),
  description: descriptions[p.id] || "Published prompt template included for completeness.",
  category: primary.has(p.id) ? "primary" : shared.has(p.id) ? "shared" : "additional",
  pipeline: ["GetTactic", "SummarizeAndDecide"].includes(p.id) ? "verification"
    : p.id === "AnalyzeGameLoop" ? "both"
    : primary.has(p.id) ? "synthesis" : "reference",
  rawFiles: [
    p.system && `${p.id}.system.jinja`,
    p.instance && `${p.id}.instance.jinja`,
    p.shared && `${p.id}.jinja`,
  ].filter(Boolean),
}));

const caseSpecs = [
  {
    id: "lotka", title: "Lotka–Volterra", domain: "Ecosystem control",
    summary: "Maintain predator and prey populations above safety thresholds under nonlinear population dynamics and adversarial control choices.",
    challenge: "Nonlinear dynamics, symbolic parameters, adversarial choices, and an unbounded time horizon.",
    verification: "Verified", synthesis: "Synthesized",
    source: "Adapted from an ARCH-COMP nonlinear-dynamics benchmark with discrete control and adversarial game play added.",
  },
  {
    id: "train", title: "Train", domain: "Rail safety",
    summary: "Keep a train within its movement authority under Davis resistance and time-dependent air-brake modes.",
    challenge: "Nested loops, multiple braking modes, nonlinear resistance, and timing constraints.",
    verification: "Verified", synthesis: "Synthesized",
    source: "Inspired by prior train air-brake verification, extended with rolling resistance and adversarial dynamics.",
  },
  {
    id: "reaction", title: "Chemical Reaction", domain: "Reactor safety",
    summary: "Maintain a safe chemical-reaction state when the controller is not directly accessible and its actions must be treated adversarially.",
    challenge: "Nonlinear reaction dynamics and universal reasoning over controller actions.",
    verification: "Verified", synthesis: "Synthesized",
    source: "Based on a reactor setup from the hybrid-systems literature with an adversarial controller model.",
  },
  {
    id: "coolant", title: "Coolant", domain: "Thermal control",
    summary: "Absorb enough generated heat before either a timer requirement or coolant discharge capacity is exceeded.",
    challenge: "A subtle outer loop invariant whose weakness is discovered only after expensive inner differential proofs.",
    verification: "Verified", synthesis: "Not synthesized",
    source: "A deliberately difficult control-envelope problem; its manual proof required several attempts over three days.",
  },
  {
    id: "vanderpol", title: "Van der Pol", domain: "Oscillator safety",
    summary: "Reason symbolically about a nonlinear oscillator over an unbounded time horizon with adversarial game structure.",
    challenge: "Nonlinear oscillatory dynamics and unbounded-time reasoning.",
    verification: "Verified", synthesis: "Synthesized",
    source: "Adapted from an ARCH-COMP benchmark with adversarial dynamics and a proof-relevant loop structure added.",
  },
];

const cases = caseSpecs.map((item) => {
  const programFile = path.join(artifact, "benchmarks", "programs", `${item.id}.prog`);
  const postFile = path.join(artifact, "benchmarks", "postconditions", `${item.id}.post`);
  const guideFile = path.join(artifact, "benchmarks", "guidelines", `${item.id}.guideline`);
  return {
    ...item,
    program: fs.existsSync(programFile) ? fs.readFileSync(programFile, "utf8").trim() : "",
    postcondition: fs.existsSync(postFile) ? fs.readFileSync(postFile, "utf8").trim() : "",
    guideline: fs.existsSync(guideFile) ? fs.readFileSync(guideFile, "utf8").trim() : "",
  };
});

function csv(file) {
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

const resultRoot = path.join(artifact, "experiments", "test-output");
const resultSets = fs.readdirSync(resultRoot)
  .filter((name) => fs.existsSync(path.join(resultRoot, name, "results_summary.csv")))
  .map((name) => ({ id: name, rows: csv(path.join(resultRoot, name, "results_summary.csv")) }));

const traces = [
  {
    title: "Coolant verification",
    type: "Verification",
    outcome: "Proof found",
    model: "GPT-5.5, high reasoning",
    metrics: "6 requests · 55,207 output tokens · $1.76",
    steps: [
      "Analyze the hybrid game and identify the controller branches.",
      "Propose the full precondition as the main loop invariant.",
      "Discharge the easy f = 0 branch with differential cuts.",
      "Use KeYmaera X feedback to repair branch structure and strengthen differential arguments.",
      "Close the remaining f = F branch and replay the complete checked tactic.",
    ],
    excerpt: "unfold;\\nloop(\\\"discharged<=maxDischarge & (absorbed>=minAbsorbed | ...)\\\", 1); <(\\n  QE(\\\"Z3\\\"),\\n  QE(\\\"Z3\\\"),\\n  unfold; <(\\n    dC(\\\"absorbed>=minAbsorbed\\\", 1); <( ... )\\n  )\\n)",
  },
  {
    title: "Lotka–Volterra synthesis",
    type: "Synthesis",
    outcome: "Control envelope synthesized",
    model: "GPT-5",
    metrics: "Full pipeline · formally checked subvalue map",
    steps: [
      "Analyze Angel and Demon choices in the game loop.",
      "Work backward from the population-safety postcondition.",
      "Propose loop and ODE subvalues for the nonlinear dynamics.",
      "Invoke interactive proving where automatic subvalue checks fail.",
      "Backtrack to repair candidates, then return the verified control envelope.",
    ],
    excerpt: "The trace alternates backward subvalue computation with proof checks. Each proposed invariant or differential precondition is accepted only after KeYmaera X or Z3 validates its proof obligation.",
  },
];

fs.writeFileSync(path.join(out, "content.json"), JSON.stringify({
  prompts, cases, resultSets, traces,
  generatedFrom: "Artifact version 1, DOI 10.1184/R1/32248389.v1",
}, null, 2));
