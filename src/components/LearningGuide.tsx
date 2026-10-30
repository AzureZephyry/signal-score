export function LearningGuide() {
  return (
    <details className="learning-guide">
      <summary>How to use this visualizer</summary>
      <ol>
        <li>Choose the bit-stream length and confirm it.</li>
        <li>Enter exactly that many binary digits: only 0 and 1.</li>
        <li>Generate and compare the eight waveforms.</li>
        <li>
          Select a bit, then choose <strong>Explain encoding</strong> to
          understand its voltage pattern. Use the encoding selector to move
          between schemes.
        </li>
      </ol>
    </details>
  );
}
export function GraphGuide() {
  return (
    <details className="graph-guide">
      <summary>How to read the waveforms and tables</summary>
      <div className="graph-guide-grid">
        <div>
          <h3>Left to right: time</h3>
          <p>
            Each column is one equal bit interval. The binary digit above it is
            the original input bit. Solid steps show the voltage held over time;
            vertical steps show a change in voltage.
          </p>
        </div>
        <div>
          <h3>Up and down: voltage</h3>
          <p>
            <strong>+V</strong> is positive voltage, <strong>0V</strong> is zero
            voltage, and <strong>−V</strong> is negative voltage. These are
            relative levels, not a fixed number of volts. Faint dotted guides
            mark bit boundaries and, where needed, half-bits.
          </p>
        </div>
        <div>
          <h3>Read one column together</h3>
          <p>
            The <strong>in</strong> row repeats the input. The{" "}
            <strong>out</strong> row names its encoded voltage or midpoint
            direction. The <strong>start</strong> row says whether the level
            changes at the beginning; <strong>mid</strong> marks a return to
            zero.
          </p>
        </div>
        <div>
          <h3>Select to connect the pieces</h3>
          <p>
            Click a digit, a waveform interval, or an output cell to highlight
            that same bit in every scheme. Arrow keys move through bits. The
            glossary below explains hi, lo, pos, neg, zero, nTp, pTn, inv and no
            inv.
          </p>
        </div>
      </div>
    </details>
  );
}
