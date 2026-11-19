import * as THREE from "three";

/** Tiny seeded RNG so textures are identical on every load. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const shade = (hex: string, k: number) => {
  const [r, g, b] = hexToRgb(hex);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
};

function make(size: number, seed: number, draw: (g: CanvasRenderingContext2D, r: () => number, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  draw(g, rng(seed), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function speckle(g: CanvasRenderingContext2D, r: () => number, s: number, amount: number, density = 1) {
  const n = Math.floor(s * s * 0.06 * density);
  for (let i = 0; i < n; i++) {
    const v = r() > 0.5 ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${r() * amount})`;
    g.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2);
  }
}

export const plaster = (base: string, seed = 1) =>
  make(512, seed, (g, r, s) => {
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "90,80,60"},${r() * 0.04})`;
      g.beginPath(); g.arc(r() * s, r() * s, 20 + r() * 80, 0, 7); g.fill();
    }
    speckle(g, r, s, 0.12);
  });

export const woodPlanks = (base: string, seed = 2, planks = 6) =>
  make(1024, seed, (g, r, s) => {
    const h = s / planks;
    for (let p = 0; p < planks; p++) {
      const k = 0.82 + r() * 0.3;
      g.fillStyle = shade(base, k); g.fillRect(0, p * h, s, h);
      // staggered board joints
      const joint = r() * s;
      for (let i = 0; i < 70; i++) {
        const y = p * h + r() * h;
        g.strokeStyle = `rgba(${r() > 0.5 ? "60,35,15" : "255,240,220"},${0.05 + r() * 0.1})`;
        g.lineWidth = 0.6 + r() * 1.4;
        g.beginPath();
        g.moveTo(0, y);
        g.bezierCurveTo(s * 0.3, y + (r() - 0.5) * 6, s * 0.7, y + (r() - 0.5) * 6, s, y + (r() - 0.5) * 4);
        g.stroke();
      }
      g.fillStyle = "rgba(30,15,5,0.55)"; g.fillRect(0, p * h, s, 2);
      g.fillRect(joint, p * h, 2, h);
    }
  });

export const woodSlats = (base: string, seed = 3, slats = 10) =>
  make(512, seed, (g, r, s) => {
    const w = s / slats;
    for (let i = 0; i < slats; i++) {
      g.fillStyle = shade(base, 0.8 + r() * 0.35); g.fillRect(i * w, 0, w, s);
      for (let j = 0; j < 40; j++) {
        g.strokeStyle = `rgba(${r() > 0.5 ? "50,28,10" : "255,230,200"},${0.05 + r() * 0.1})`;
        g.lineWidth = 0.7;
        const x = i * w + r() * w;
        g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 5, s); g.stroke();
      }
      g.fillStyle = "rgba(20,10,0,0.6)"; g.fillRect(i * w, 0, 2.5, s);
    }
  });

export const tiles = (base: string, n = 4, seed = 4, grout = "#c9c4ba") =>
  make(512, seed, (g, r, s) => {
    const t = s / n;
    g.fillStyle = grout; g.fillRect(0, 0, s, s);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        g.fillStyle = shade(base, 0.96 + r() * 0.08);
        g.fillRect(x * t + 2, y * t + 2, t - 4, t - 4);
      }
    speckle(g, r, s, 0.05);
  });

export const marble = (base: string, seed = 5) =>
  make(1024, seed, (g, r, s) => {
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 14; i++) {
      g.strokeStyle = `rgba(${90 + r() * 40},${90 + r() * 40},${100 + r() * 40},${0.08 + r() * 0.18})`;
      g.lineWidth = 0.6 + r() * 2.2;
      g.beginPath();
      let x = r() * s, y = r() * s;
      g.moveTo(x, y);
      for (let k = 0; k < 14; k++) { x += (r() - 0.3) * 120; y += (r() - 0.3) * 120; g.lineTo(x, y); }
      g.stroke();
    }
    // 2x2 large-format slabs
    g.strokeStyle = "rgba(60,55,45,0.28)"; g.lineWidth = 2;
    g.strokeRect(0, 0, s, s); g.beginPath(); g.moveTo(s / 2, 0); g.lineTo(s / 2, s); g.moveTo(0, s / 2); g.lineTo(s, s / 2); g.stroke();
  });

export const stoneBlocks = (base: string, seed = 6) =>
  make(1024, seed, (g, r, s) => {
    g.fillStyle = shade(base, 0.6); g.fillRect(0, 0, s, s);
    const rows = 8, h = s / rows;
    for (let row = 0; row < rows; row++) {
      let x = -r() * 100;
      while (x < s) {
        const w = 120 + r() * 160;
        g.fillStyle = shade(base, 0.82 + r() * 0.3);
        g.fillRect(x + 3, row * h + 3, w - 6, h - 6);
        for (let i = 0; i < 40; i++) {
          g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${r() * 0.07})`;
          g.fillRect(x + r() * w, row * h + r() * h, 2 + r() * 8, 1 + r() * 4);
        }
        x += w;
      }
    }
  });

export const bricks = (base: string, seed = 7) =>
  make(512, seed, (g, r, s) => {
    g.fillStyle = "#c9bfae"; g.fillRect(0, 0, s, s);
    const rows = 14, h = s / rows, w = s / 6;
    for (let row = 0; row < rows; row++) {
      const off = row % 2 ? w / 2 : 0;
      for (let i = -1; i < 7; i++) {
        g.fillStyle = shade(base, 0.78 + r() * 0.4);
        g.fillRect(i * w + off + 2, row * h + 2, w - 4, h - 4);
      }
    }
    speckle(g, r, s, 0.1);
  });

export const roofTiles = (base: string, seed = 8) =>
  make(512, seed, (g, r, s) => {
    g.fillStyle = shade(base, 0.55); g.fillRect(0, 0, s, s);
    const rows = 8, h = s / rows, cols = 8, w = s / cols;
    for (let row = 0; row < rows; row++) {
      for (let c = 0; c < cols; c++) {
        const x = c * w + (row % 2 ? w / 2 : 0);
        const grd = g.createLinearGradient(x, 0, x + w, 0);
        const k = 0.85 + r() * 0.3;
        grd.addColorStop(0, shade(base, k * 0.7)); grd.addColorStop(0.5, shade(base, k * 1.1)); grd.addColorStop(1, shade(base, k * 0.7));
        g.fillStyle = grd;
        g.fillRect(x, row * h, w - 1, h + 3);
        g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x, row * h + h - 2, w, 3);
      }
    }
    speckle(g, r, s, 0.12);
  });

export const grass = (seed = 9) =>
  make(512, seed, (g, r, s) => {
    g.fillStyle = "#58733a"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 5000; i++) {
      const k = 0.7 + r() * 0.6;
      g.fillStyle = `rgba(${Math.round(70 * k)},${Math.round(110 * k)},${Math.round(45 * k)},${0.3 + r() * 0.5})`;
      g.fillRect(r() * s, r() * s, 1.5, 2 + r() * 5);
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? "30,60,20" : "120,150,70"},0.1)`;
      g.beginPath(); g.arc(r() * s, r() * s, 30 + r() * 70, 0, 7); g.fill();
    }
  });

export const paving = (base = "#cfc8ba", seed = 10) =>
  make(512, seed, (g, r, s) => {
    g.fillStyle = "#9d968a"; g.fillRect(0, 0, s, s);
    const n = 3, t = s / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = shade(base, 0.94 + r() * 0.1);
      g.fillRect(x * t + 2, y * t + 2, t - 4, t - 4);
    }
    speckle(g, r, s, 0.1);
  });

export const concrete = (base = "#bdb9b0", seed = 11) =>
  make(512, seed, (g, r, s) => {
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    speckle(g, r, s, 0.18, 1.5);
  });
