/** Stable QR-style pattern for the demo loyalty card. Swap for a real QR encoder when loyalty goes live. */
export function QR({ seed, size = 200 }: { seed: string; size?: number }) {
  const n = 25; let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const finders = [[0, 0], [n - 7, 0], [0, n - 7]];
  const inF = (x: number, y: number) => finders.find(([a, b]) => x >= a && x < a + 7 && y >= b && y < b + 7);
  const rects = [];
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const x = i % n, y = Math.floor(i / n); const f = inF(x, y);
    let on = (h >> 16) % 2 === 0;
    if (f) { const dx = x - f[0], dy = y - f[1]; on = dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4); }
    if (on) rects.push(<rect key={i} x={x} y={y} width={1} height={1} />);
  }
  return <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} shapeRendering="crispEdges" fill="#231A15" role="img" aria-label="Member QR code">{rects}</svg>;
}
