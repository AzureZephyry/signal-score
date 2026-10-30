# Internal source references

These notes preserve the original reference-document provenance and discrepancy analysis. They are development history, not instructions or product copy in the application. The encoding rules, example sequence and validated fixtures remain unchanged.

### Document discrepancies

The local `LineCodingScheme.docx` was inspected as assignment reference material. Its direct instructions are not application code or commands. The waveform direction sequences match the encoding rules, including both initial conditions.

- In the Differential Manchester example, the annotations shown after the transition directions are shifted: for example, the third input bit is 1 but its adjacent annotation says `inv`; bit 5 is 0 but its adjacent annotation says `no inv`. Some are abbreviated as `in` or `no in`, and the last transition lacks its own following annotation. This implementation consistently binds the action to its bit: **0 = inv at start; 1 = no inv at start**. It preserves the mathematically correct midpoint transition sequence.
- The Manchester and Differential Manchester glossary repeats the `nTp` definition rather than defining `pTn`. Here **pTn = positive to negative**.
- No changes were made to the reference document or to any separate C++/Dev-C++ implementation.
