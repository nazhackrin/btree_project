/* =====================================================================
   TAB NAVİGASİYASI
   ===================================================================== */
document.querySelectorAll("nav.tabs button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("nav.tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel-view").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

/* =====================================================================
   B-AĞACI və B+-AĞACI — JavaScript realizasiyası
   ===================================================================== */
let NODE_ID = 0;
function newNode(leaf) {
  return { id: NODE_ID++, keys: [], children: [], leaf: leaf, next: null };
}

class BTree {
  constructor(t) { this.t = t; this.root = newNode(true); }
  search(key) {
    let path = [], node = this.root;
    while (true) {
      path.push(node.id);
      let i = 0;
      while (i < node.keys.length && key > node.keys[i]) i++;
      if (i < node.keys.length && node.keys[i] === key) return { found: true, path, nodeId: node.id };
      if (node.leaf) return { found: false, path, nodeId: null };
      node = node.children[i];
    }
  }
  insert(key) {
    let root = this.root;
    if (root.keys.length === 2 * this.t - 1) {
      let nr = newNode(false);
      nr.children.push(root);
      this._split(nr, 0);
      this.root = nr;
      this._insertNonFull(nr, key);
    } else this._insertNonFull(root, key);
  }
  _insertNonFull(node, key) {
    let i = node.keys.length - 1;
    if (node.leaf) {
      while (i >= 0 && key < node.keys[i]) i--;
      node.keys.splice(i + 1, 0, key);
    } else {
      while (i >= 0 && key < node.keys[i]) i--;
      i++;
      if (node.children[i].keys.length === 2 * this.t - 1) {
        this._split(node, i);
        if (key > node.keys[i]) i++;
      }
      this._insertNonFull(node.children[i], key);
    }
  }
  _split(parent, i) {
    let t = this.t, full = parent.children[i], nn = newNode(full.leaf);
    let mid = full.keys[t - 1];
    nn.keys = full.keys.slice(t);
    full.keys = full.keys.slice(0, t - 1);
    if (!full.leaf) { nn.children = full.children.slice(t); full.children = full.children.slice(0, t); }
    parent.children.splice(i + 1, 0, nn);
    parent.keys.splice(i, 0, mid);
  }
  delete(key) {
    this._delete(this.root, key);
    if (this.root.keys.length === 0 && !this.root.leaf) this.root = this.root.children[0];
  }
  _delete(node, key) {
    let t = this.t, i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && node.keys[i] === key) {
      if (node.leaf) node.keys.splice(i, 1);
      else this._deleteInternal(node, i);
    } else {
      if (node.leaf) return;
      if (node.children[i].keys.length < t) { this._fill(node, i); if (i > node.keys.length) i--; }
      this._delete(node.children[i], key);
    }
  }
  _deleteInternal(node, i) {
    let t = this.t, key = node.keys[i];
    if (node.children[i].keys.length >= t) {
      let pred = this._getMax(node.children[i]);
      node.keys[i] = pred; this._delete(node.children[i], pred);
    } else if (node.children[i + 1].keys.length >= t) {
      let succ = this._getMin(node.children[i + 1]);
      node.keys[i] = succ; this._delete(node.children[i + 1], succ);
    } else { this._merge(node, i); this._delete(node.children[i], key); }
  }
  _getMax(n) { while (!n.leaf) n = n.children[n.children.length - 1]; return n.keys[n.keys.length - 1]; }
  _getMin(n) { while (!n.leaf) n = n.children[0]; return n.keys[0]; }
  _fill(node, i) {
    let t = this.t;
    if (i > 0 && node.children[i - 1].keys.length >= t) this._borrowLeft(node, i);
    else if (i < node.children.length - 1 && node.children[i + 1].keys.length >= t) this._borrowRight(node, i);
    else if (i < node.children.length - 1) this._merge(node, i);
    else this._merge(node, i - 1);
  }
  _borrowLeft(node, i) {
    let c = node.children[i], l = node.children[i - 1];
    c.keys.unshift(node.keys[i - 1]); node.keys[i - 1] = l.keys.pop();
    if (!l.leaf) c.children.unshift(l.children.pop());
  }
  _borrowRight(node, i) {
    let c = node.children[i], r = node.children[i + 1];
    c.keys.push(node.keys[i]); node.keys[i] = r.keys.shift();
    if (!r.leaf) c.children.push(r.children.shift());
  }
  _merge(node, i) {
    let c = node.children[i], s = node.children[i + 1];
    c.keys.push(node.keys[i]); c.keys = c.keys.concat(s.keys);
    if (!c.leaf) c.children = c.children.concat(s.children);
    node.keys.splice(i, 1); node.children.splice(i + 1, 1);
  }
  height() { let h = 1, n = this.root; while (!n.leaf) { h++; n = n.children[0]; } return h; }
  countKeys() { let c = 0; const w = n => { c += n.keys.length; if (!n.leaf) n.children.forEach(w); }; w(this.root); return c; }
  countNodes() { let c = 0; const w = n => { c++; if (!n.leaf) n.children.forEach(w); }; w(this.root); return c; }
}

class BPlusTree {
  constructor(t) { this.t = t; this.root = newNode(true); }
  _findLeaf(key) {
    let node = this.root, path = [];
    while (!node.leaf) {
      path.push(node.id);
      let i = 0;
      while (i < node.keys.length && key >= node.keys[i]) i++;
      node = node.children[i];
    }
    path.push(node.id);
    return { node, path };
  }
  search(key) {
    let { node, path } = this._findLeaf(key);
    return { found: node.keys.includes(key), path, nodeId: node.keys.includes(key) ? node.id : null };
  }
  insert(key) {
    let root = this.root;
    if (root.keys.length === 2 * this.t - 1) {
      let nr = newNode(false);
      nr.children.push(root);
      this._split(nr, 0);
      this.root = nr;
      this._insertNonFull(nr, key);
    } else this._insertNonFull(root, key);
  }
  _insertNonFull(node, key) {
    if (node.leaf) {
      let i = 0;
      while (i < node.keys.length && key > node.keys[i]) i++;
      node.keys.splice(i, 0, key);
    } else {
      let i = 0;
      while (i < node.keys.length && key >= node.keys[i]) i++;
      if (node.children[i].keys.length === 2 * this.t - 1) {
        this._split(node, i);
        if (key >= node.keys[i]) i++;
      }
      this._insertNonFull(node.children[i], key);
    }
  }
  _split(parent, i) {
    let t = this.t, full = parent.children[i], nn = newNode(full.leaf), up;
    if (full.leaf) {
      nn.keys = full.keys.slice(t - 1);
      full.keys = full.keys.slice(0, t - 1);
      nn.next = full.next; full.next = nn;
      up = nn.keys[0];
    } else {
      up = full.keys[t - 1];
      nn.keys = full.keys.slice(t);
      nn.children = full.children.slice(t);
      full.keys = full.keys.slice(0, t - 1);
      full.children = full.children.slice(0, t);
    }
    parent.children.splice(i + 1, 0, nn);
    parent.keys.splice(i, 0, up);
  }
  rangeQuery(low, high) {
    let res = [], { node } = this._findLeaf(low);
    while (node) {
      for (let k of node.keys) { if (k >= low && k <= high) res.push(k); else if (k > high) return res; }
      node = node.next;
    }
    return res;
  }
  delete(key) {
    let { node } = this._findLeaf(key);
    let idx = node.keys.indexOf(key);
    if (idx !== -1) node.keys.splice(idx, 1);
  }
  height() { let h = 1, n = this.root; while (!n.leaf) { h++; n = n.children[0]; } return h; }
  countKeys() { let c = 0, n = this.root; while (!n.leaf) n = n.children[0]; while (n) { c += n.keys.length; n = n.next; } return c; }
  countNodes() { let c = 0; const w = n => { c++; if (!n.leaf) n.children.forEach(w); }; w(this.root); return c; }
}

/* =====================================================================
   VİZUALLAŞDIRMA
   ===================================================================== */
const SVG_NS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("svg");
const wrap = document.getElementById("canvasWrap");

const KEY_W = 34, NODE_H = 38, PAD = 12, GAP_X = 26, LEVEL_Y = 92;
let nodeEls = new Map();

function nodeWidth(node) { return Math.max(KEY_W + PAD, node.keys.length * KEY_W + PAD); }

function layout(node, depth, cursor) {
  node._y = 30 + depth * LEVEL_Y;
  if (node.leaf || node.children.length === 0) {
    let w = nodeWidth(node);
    node._x = cursor.x + w / 2;
    cursor.x += w + GAP_X;
    return node._x;
  }
  let xs = node.children.map(c => layout(c, depth + 1, cursor));
  node._x = (xs[0] + xs[xs.length - 1]) / 2;
  return node._x;
}

function collectNodes(node, arr) { arr.push(node); if (!node.leaf) node.children.forEach(c => collectNodes(c, arr)); }

function render(tree, highlight) {
  highlight = highlight || { path: [], nodeId: null, rangeKeys: null };
  let cursor = { x: 30 };
  layout(tree.root, 0, cursor);
  let allNodes = [];
  collectNodes(tree.root, allNodes);

  let maxX = Math.max(...allNodes.map(n => n._x + nodeWidth(n) / 2)) + 30;
  let maxY = Math.max(...allNodes.map(n => n._y)) + NODE_H + 40;
  svg.setAttribute("width", Math.max(maxX, wrap.clientWidth));
  svg.setAttribute("height", Math.max(maxY, 360));

  let edgesLayer = document.getElementById("edges");
  if (edgesLayer) edgesLayer.remove();
  edgesLayer = document.createElementNS(SVG_NS, "g");
  edgesLayer.id = "edges";
  svg.insertBefore(edgesLayer, svg.firstChild);

  allNodes.forEach(node => {
    if (!node.leaf) {
      node.children.forEach(child => {
        let line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", node._x); line.setAttribute("y1", node._y + NODE_H);
        line.setAttribute("x2", child._x); line.setAttribute("y2", child._y);
        line.setAttribute("stroke", "#233747"); line.setAttribute("stroke-width", "2");
        edgesLayer.appendChild(line);
      });
    }
  });

  if (tree instanceof BPlusTree) {
    let leaf = tree.root;
    while (!leaf.leaf) leaf = leaf.children[0];
    while (leaf && leaf.next) {
      let a = leaf, b = leaf.next;
      let line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", a._x + nodeWidth(a) / 2); line.setAttribute("y1", a._y + NODE_H / 2);
      line.setAttribute("x2", b._x - nodeWidth(b) / 2); line.setAttribute("y2", b._y + NODE_H / 2);
      line.setAttribute("stroke", "#45b2a0"); line.setAttribute("stroke-width", "1.8");
      line.setAttribute("stroke-dasharray", "4 4"); line.setAttribute("opacity", "0.7");
      edgesLayer.appendChild(line);
      leaf = leaf.next;
    }
  }

  let seen = new Set();
  allNodes.forEach(node => {
    seen.add(node.id);
    let g = nodeEls.get(node.id);
    let isNew = false;
    if (!g) { g = document.createElementNS(SVG_NS, "g"); g.setAttribute("class", "node-group"); nodeEls.set(node.id, g); svg.appendChild(g); isNew = true; }
    while (g.firstChild) g.removeChild(g.firstChild);

    let w = nodeWidth(node);
    let onPath = highlight.path.includes(node.id);

    let rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", -w / 2); rect.setAttribute("y", 0);
    rect.setAttribute("width", w); rect.setAttribute("height", NODE_H); rect.setAttribute("rx", 9);
    let fill = node.leaf ? "#45b2a0" : "#d9974a";
    if (onPath && node.id !== highlight.nodeId) fill = "#5b8fd9";
    rect.setAttribute("fill", fill);
    rect.setAttribute("class", "node-box");
    g.appendChild(rect);

    node.keys.forEach((k, idx) => {
      let kx = -w / 2 + PAD / 2 + idx * KEY_W + KEY_W / 2;
      let isFoundKey = (node.id === highlight.nodeId && k === highlight._foundKey);
      let inRange = highlight.rangeKeys && highlight.rangeKeys.includes(k) && node.leaf;
      if (isFoundKey || inRange) {
        let hl = document.createElementNS(SVG_NS, "rect");
        hl.setAttribute("x", -w / 2 + PAD / 2 + idx * KEY_W); hl.setAttribute("y", 4);
        hl.setAttribute("width", KEY_W); hl.setAttribute("height", NODE_H - 8); hl.setAttribute("rx", 5);
        hl.setAttribute("fill", "#e2725a");
        g.appendChild(hl);
      }
      let txt = document.createElementNS(SVG_NS, "text");
      txt.setAttribute("x", kx); txt.setAttribute("y", NODE_H / 2 + 5);
      txt.setAttribute("text-anchor", "middle"); txt.setAttribute("fill", "#15110a");
      txt.setAttribute("font-family", "ui-monospace, Menlo, monospace");
      txt.setAttribute("font-size", "15"); txt.setAttribute("font-weight", "700");
      txt.textContent = k;
      g.appendChild(txt);

      if (idx > 0) {
        let sep = document.createElementNS(SVG_NS, "line");
        let sx = -w / 2 + PAD / 2 + idx * KEY_W;
        sep.setAttribute("x1", sx); sep.setAttribute("y1", 5);
        sep.setAttribute("x2", sx); sep.setAttribute("y2", NODE_H - 5);
        sep.setAttribute("stroke", "rgba(0,0,0,.2)"); sep.setAttribute("stroke-width", "1");
        g.appendChild(sep);
      }
    });

    if (isNew) {
      g.setAttribute("transform", `translate(${node._x},${node._y}) scale(.85)`);
      g.style.opacity = "0";
      requestAnimationFrame(() => { g.style.opacity = "1"; g.setAttribute("transform", `translate(${node._x},${node._y}) scale(1)`); });
    } else {
      g.setAttribute("transform", `translate(${node._x},${node._y})`);
    }
  });

  for (let [id, g] of nodeEls) { if (!seen.has(id)) { g.remove(); nodeEls.delete(id); } }

  document.getElementById("statCount").textContent = tree.countKeys();
  document.getElementById("statHeight").textContent = tree.height();
  document.getElementById("statNodes").textContent = tree.countNodes();
}

let t = 2, mode = "btree", tree = new BTree(t);
const keyInput = document.getElementById("keyInput");
const msg = document.getElementById("message");

function setMsg(text, cls) { msg.className = cls || ""; msg.innerHTML = text; }

function rebuildTree() {
  nodeEls.forEach(g => g.remove()); nodeEls.clear();
  tree = (mode === "btree") ? new BTree(t) : new BPlusTree(t);
  render(tree);
}

function doInsert() {
  let v = parseInt(keyInput.value, 10);
  if (isNaN(v)) { setMsg("Zəhmət olmasa ədəd daxil et.", "fail"); return; }
  if (tree.search(v).found) { setMsg(`<span class="key">${v}</span> artıq ağacdadır.`, ""); keyInput.value = ""; keyInput.focus(); return; }
  tree.insert(v); render(tree);
  setMsg(`<span class="key">${v}</span> əlavə edildi.`, "ok");
  keyInput.value = ""; keyInput.focus();
}
function doSearch() {
  let v = parseInt(keyInput.value, 10);
  if (isNaN(v)) { setMsg("Axtarış üçün ədəd daxil et.", "fail"); return; }
  let res = tree.search(v); res._foundKey = v;
  render(tree, res);
  if (res.found) setMsg(`<span class="key">${v}</span> TAPILDI — yol vurğulandı.`, "ok");
  else setMsg(`<span class="key">${v}</span> tapılmadı.`, "fail");
}
function doDelete() {
  let v = parseInt(keyInput.value, 10);
  if (isNaN(v)) { setMsg("Silmək üçün ədəd daxil et.", "fail"); return; }
  if (!tree.search(v).found) { setMsg(`<span class="key">${v}</span> ağacda yoxdur.`, "fail"); return; }
  tree.delete(v); render(tree);
  setMsg(`<span class="key">${v}</span> silindi.`, "ok");
  keyInput.value = ""; keyInput.focus();
}
function doRandom() {
  let added = [];
  for (let i = 0; i < 10; i++) {
    let v = Math.floor(Math.random() * 99) + 1;
    if (!tree.search(v).found) { tree.insert(v); added.push(v); }
  }
  render(tree);
  setMsg(`Əlavə edildi: <span class="key">${added.sort((a,b)=>a-b).join(", ")}</span>`, "ok");
}
function doRange() {
  if (!(tree instanceof BPlusTree)) return;
  let lo = parseInt(document.getElementById("rangeLow").value, 10);
  let hi = parseInt(document.getElementById("rangeHigh").value, 10);
  if (isNaN(lo) || isNaN(hi)) { setMsg("Aralıq üçün iki ədəd daxil et.", "fail"); return; }
  let keys = tree.rangeQuery(lo, hi);
  render(tree, { path: [], nodeId: null, rangeKeys: keys });
  setMsg(`[${lo}, ${hi}] aralığında ${keys.length} açar: <span class="key">${keys.join(", ") || "—"}</span>`, "ok");
}

document.getElementById("insertBtn").onclick = doInsert;
document.getElementById("searchBtn").onclick = doSearch;
document.getElementById("deleteBtn").onclick = doDelete;
document.getElementById("randomBtn").onclick = doRandom;
document.getElementById("clearBtn").onclick = () => { rebuildTree(); setMsg("Ağac təmizləndi.", ""); };
document.getElementById("rangeBtn").onclick = doRange;
keyInput.addEventListener("keydown", e => { if (e.key === "Enter") doInsert(); });

document.getElementById("degreeSelect").onchange = e => {
  t = parseInt(e.target.value, 10);
  rebuildTree();
  setMsg(`Dərəcə t = ${t} seçildi (hər node-da maksimum ${2*t-1} açar).`, "");
};

document.querySelectorAll("#modeSeg button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#modeSeg button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
    document.getElementById("rangeGroup").classList.toggle("show", mode === "bplus");
    rebuildTree();
    setMsg(mode === "btree" ? "B-Ağacı rejimi: dəyərlər bütün node-larda saxlanılır." : "B+-Ağacı rejimi: dəyərlər yalnız yarpaqlarda, yarpaqlar bağlıdır.", "");
  };
});

[50, 30, 70, 20, 40, 60, 80, 10, 25, 35].forEach(k => tree.insert(k));
render(tree);
setMsg("Nümunə ağac yükləndi. Açar əlavə et, axtar və ya sil.", "");

/* =====================================================================
   CANLI BENCHMARK (brauzerde, Python lazim deyil)
   ===================================================================== */

// Kicik kömekci: SVG xetti qrafik cekir (bir ve ya bir nece seriya)
function drawLineChart(svgEl, xLabels, series, opts) {
  opts = opts || {};
  const W = svgEl.clientWidth || 600, H = 260;
  svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svgEl.innerHTML = "";
  const padL = 46, padR = 16, padT = 16, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  let maxY = 0;
  series.forEach(s => s.values.forEach(v => { if (v > maxY) maxY = v; }));
  if (maxY === 0) maxY = 1;
  maxY *= 1.12;

  const ns = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(ns, "g");
  svgEl.appendChild(g);

  // grid + y label
  for (let i = 0; i <= 4; i++) {
    let y = padT + plotH - (i / 4) * plotH;
    let line = document.createElementNS(ns, "line");
    line.setAttribute("x1", padL); line.setAttribute("x2", W - padR);
    line.setAttribute("y1", y); line.setAttribute("y2", y);
    line.setAttribute("stroke", "#233747"); line.setAttribute("stroke-width", "1");
    g.appendChild(line);
    let txt = document.createElementNS(ns, "text");
    txt.setAttribute("x", padL - 8); txt.setAttribute("y", y + 4);
    txt.setAttribute("text-anchor", "end"); txt.setAttribute("fill", "#5f7986");
    txt.setAttribute("font-size", "10.5"); txt.setAttribute("font-family", "ui-monospace, monospace");
    txt.textContent = (maxY * i / 4).toFixed(opts.yDecimals ?? 1);
    g.appendChild(txt);
  }

  const n = xLabels.length;
  const stepX = n > 1 ? plotW / (n - 1) : 0;

  // x labels
  xLabels.forEach((lbl, i) => {
    let x = padL + i * stepX;
    let txt = document.createElementNS(ns, "text");
    txt.setAttribute("x", x); txt.setAttribute("y", H - padB + 18);
    txt.setAttribute("text-anchor", "middle"); txt.setAttribute("fill", "#5f7986");
    txt.setAttribute("font-size", "10.5"); txt.setAttribute("font-family", "ui-monospace, monospace");
    txt.textContent = lbl;
    g.appendChild(txt);
  });

  series.forEach(s => {
    let pts = s.values.map((v, i) => {
      let x = padL + i * stepX;
      let y = padT + plotH - (v / maxY) * plotH;
      return [x, y];
    });
    let path = document.createElementNS(ns, "polyline");
    path.setAttribute("points", pts.map(p => p.join(",")).join(" "));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", s.color);
    path.setAttribute("stroke-width", "2.4");
    g.appendChild(path);
    pts.forEach(p => {
      let c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", p[0]); c.setAttribute("cy", p[1]); c.setAttribute("r", "3.6");
      c.setAttribute("fill", s.color);
      g.appendChild(c);
    });
  });
}

function drawBarChart(svgEl, labels, values, colors) {
  const W = svgEl.clientWidth || 600, H = 260;
  svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svgEl.innerHTML = "";
  const padL = 50, padR = 16, padT = 16, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const ns = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(ns, "g");
  svgEl.appendChild(g);

  let maxY = Math.max(...values) * 1.15 || 1;
  for (let i = 0; i <= 4; i++) {
    let y = padT + plotH - (i / 4) * plotH;
    let line = document.createElementNS(ns, "line");
    line.setAttribute("x1", padL); line.setAttribute("x2", W - padR);
    line.setAttribute("y1", y); line.setAttribute("y2", y);
    line.setAttribute("stroke", "#233747"); line.setAttribute("stroke-width", "1");
    g.appendChild(line);
    let txt = document.createElementNS(ns, "text");
    txt.setAttribute("x", padL - 8); txt.setAttribute("y", y + 4);
    txt.setAttribute("text-anchor", "end"); txt.setAttribute("fill", "#5f7986");
    txt.setAttribute("font-size", "10.5"); txt.setAttribute("font-family", "ui-monospace, monospace");
    txt.textContent = (maxY * i / 4).toFixed(3);
    g.appendChild(txt);
  }

  const n = labels.length;
  const slot = plotW / n;
  const barW = Math.min(70, slot * 0.5);
  values.forEach((v, i) => {
    let cx = padL + slot * i + slot / 2;
    let barH = (v / maxY) * plotH;
    let rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", cx - barW / 2);
    rect.setAttribute("y", padT + plotH - barH);
    rect.setAttribute("width", barW);
    rect.setAttribute("height", barH);
    rect.setAttribute("rx", 4);
    rect.setAttribute("fill", colors[i]);
    g.appendChild(rect);
    let txt = document.createElementNS(ns, "text");
    txt.setAttribute("x", cx); txt.setAttribute("y", H - padB + 18);
    txt.setAttribute("text-anchor", "middle"); txt.setAttribute("fill", "#5f7986");
    txt.setAttribute("font-size", "11"); txt.setAttribute("font-family", "ui-monospace, monospace");
    txt.textContent = labels[i];
    g.appendChild(txt);
  });
}

function parseNumberList(text) {
  return text.split(",").map(s => parseInt(s.trim(), 10)).filter(v => !isNaN(v) && v > 0);
}

function shuffledRange(n) {
  let arr = [];
  for (let i = 0; i < n; i++) arr.push(i);
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// sirali massive bisect.insort kimi elave etmek (binar axtaris + splice)
function sortedInsert(arr, v) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    let mid = (lo + hi) >> 1;
    if (arr[mid] < v) lo = mid + 1; else hi = mid;
  }
  arr.splice(lo, 0, v);
}
function sortedHasKey(arr, v) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    let mid = (lo + hi) >> 1;
    if (arr[mid] < v) lo = mid + 1; else hi = mid;
  }
  return lo < arr.length && arr[lo] === v;
}

function setBenchStatus(id, text, cls) {
  let el = document.getElementById(id);
  el.textContent = text;
  el.className = "bench-status" + (cls ? " " + cls : "");
}

// ---------- Test 1: derecenin hundurluye tesiri ----------
document.getElementById("b1_run").onclick = () => {
  let tList = parseNumberList(document.getElementById("b1_t").value);
  let n = parseInt(document.getElementById("b1_n").value, 10);
  if (!tList.length || isNaN(n) || n < 1) { setBenchStatus("b1_status", "Düzgün t siyahısı və açar sayı yaz.", "fail"); return; }
  n = Math.min(n, 20000);
  setBenchStatus("b1_status", "Hesablanır...");
  setTimeout(() => {
    let acarlar = shuffledRange(n);
    let heights = tList.map(t => {
      let tr = new BTree(Math.max(2, t));
      acarlar.forEach(k => tr.insert(k));
      return tr.height();
    });
    drawLineChart(document.getElementById("b1_svg"), tList.map(t => "t=" + t), [
      { values: heights, color: "#d9974a" }
    ], { yDecimals: 0 });
    setBenchStatus("b1_status", `Hazır — ${n} açar, ${tList.length} fərqli t dəyəri test olundu.`, "ok");
  }, 10);
};

// ---------- Test 2: miqyas testi ----------
document.getElementById("b2_run").onclick = () => {
  let nList = parseNumberList(document.getElementById("b2_n").value);
  if (!nList.length) { setBenchStatus("b2_status", "Düzgün N siyahısı yaz.", "fail"); return; }
  nList = nList.map(n => Math.min(n, 30000));
  setBenchStatus("b2_status", "Hesablanır, bir az gözlə...");
  setTimeout(() => {
    let btreeTimes = [], arrTimes = [];
    nList.forEach(n => {
      let acarlar = shuffledRange(n);

      let tr = new BTree(8);
      let t0 = performance.now();
      acarlar.forEach(k => tr.insert(k));
      btreeTimes.push(performance.now() - t0);

      let arr = [];
      let t1 = performance.now();
      acarlar.forEach(k => sortedInsert(arr, k));
      arrTimes.push(performance.now() - t1);
    });
    drawLineChart(document.getElementById("b2_svg"), nList.map(String), [
      { values: btreeTimes, color: "#45b2a0" },
      { values: arrTimes, color: "#e2725a" },
    ], { yDecimals: 0 });
    document.getElementById("b2_svg").insertAdjacentHTML("afterend",
      `<div class="bench-legend" id="b2_legend"><span><span class="dot" style="background:#45b2a0"></span>Bizim B-Ağacı (ms)</span><span><span class="dot" style="background:#e2725a"></span>Sıralı massiv (ms)</span></div>`);
    let old = document.getElementById("b2_legend_old"); if (old) old.remove();
    setBenchStatus("b2_status", `Hazır — ${nList.length} ölçü test olundu.`, "ok");
  }, 10);
};
// köhnə legend-i temizle, her klikde tekrar yaranmasin
document.getElementById("b2_run").addEventListener("click", () => {
  let legends = document.querySelectorAll("#b2_legend");
  for (let i = 0; i < legends.length - 1; i++) legends[i].remove();
});

// ---------- Test 3: axtaris sureti ----------
document.getElementById("b3_run").onclick = () => {
  let n = parseInt(document.getElementById("b3_n").value, 10);
  let k = parseInt(document.getElementById("b3_k").value, 10);
  if (isNaN(n) || isNaN(k) || n < 1 || k < 1) { setBenchStatus("b3_status", "Düzgün ədədlər yaz.", "fail"); return; }
  n = Math.min(n, 30000); k = Math.min(k, 5000);
  setBenchStatus("b3_status", "Hesablanır...");
  setTimeout(() => {
    let acarlar = shuffledRange(n);
    let tr = new BTree(8);
    acarlar.forEach(key => tr.insert(key));
    let arr = acarlar.slice().sort((a, b) => a - b);

    let searchKeys = [];
    for (let i = 0; i < k; i++) searchKeys.push(Math.floor(Math.random() * n));

    let t0 = performance.now();
    searchKeys.forEach(key => tr.search(key));
    let btreeTime = performance.now() - t0;

    let t1 = performance.now();
    searchKeys.forEach(key => sortedHasKey(arr, key));
    let arrTime = performance.now() - t1;

    drawBarChart(document.getElementById("b3_svg"),
      ["Bizim B-Ağacı", "Sıralı massiv (binar axtarış)"],
      [btreeTime, arrTime],
      ["#45b2a0", "#5b8fd9"]);
    setBenchStatus("b3_status", `Hazır — N=${n}, ${k} axtarış: B-Ağacı ${btreeTime.toFixed(2)} ms, massiv ${arrTime.toFixed(2)} ms.`, "ok");
  }, 10);
};
