# Cleopatra Paper Supplement

Readable prompts, case studies, results, selected traces, and reproduction
instructions for *LLM-Powered Automatic Theorem Proving and Synthesis for
Hybrid Systems and Games*.

## Development

The generated content under `public/data/` is derived from the published
artifact. Set `CLEOPATRA_ARTIFACT` when rebuilding it from another location.

```bash
npm install
CLEOPATRA_ARTIFACT=/path/to/cleopatra npm run content
npm run dev
```

The generated data and verbatim templates are committed so GitHub Pages builds
do not depend on access to the large artifact archive.

## Sources

- [Software artifact](https://doi.org/10.1184/R1/32248389.v1)
- [Paper preprint](https://arxiv.org/abs/2603.00737)

The artifact and copied prompt templates are distributed under GPL 2.0+.
