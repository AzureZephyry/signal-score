export function Legend() {
  return (
    <section className="legend" aria-labelledby="legend-title">
      <div>
        <span className="section-index">03 / DECIPHER</span>
        <h2 id="legend-title">
          A small language
          <br />
          of signals.
        </h2>
        <p>
          Eight ways to carry the same information.
          <br />
          Read the voltage. Follow the transitions.
        </p>
      </div>
      <dl>
        <div>
          <dt>+V / 0V / −V</dt>
          <dd>
            Positive, zero, and negative voltage. Normalized levels; no fixed
            voltage magnitude.
          </dd>
        </div>
        <div>
          <dt>hi / lo</dt>
          <dd>High (+V) and low (0V) in Unipolar NRZ.</dd>
        </div>
        <div>
          <dt>pos / neg / zero</dt>
          <dd>The signal is at positive, negative, or zero voltage.</dd>
        </div>
        <div>
          <dt>nTp / pTn</dt>
          <dd>
            Negative to positive / positive to negative at the middle of a bit.
          </dd>
        </div>
        <div>
          <dt>inv / no inv</dt>
          <dd>Invert / keep the preceding level at the beginning of a bit.</dd>
        </div>
        <div>
          <dt>RZ</dt>
          <dd>
            Return to zero halfway through the bit. Dotted guides mark half-bit
            intervals.
          </dd>
        </div>
      </dl>
    </section>
  );
}
