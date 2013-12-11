var W = window.innerWidth;
var H = window.innerHeight;

if (W/H < 3) { H = ~~(W / 3); }

var canvasEl = document.createElement('canvas');
canvasEl.setAttribute('width',  W);
canvasEl.setAttribute('height', H);
document.body.appendChild(canvasEl);

var ctx = canvasEl.getContext('2d');

ctx.lineWidth = 1;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

var I, cells = [];

var prepare = function() {
  var X, Y = 4;

  var layout = [
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.25],
    [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.9],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.5, 1.5, 7, 1.5, 1.5]
  ];

  var labels = [
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'bksp'],
    ['a/1', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ret'],
    ['sh', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'sh'],
    ['ctr', 'alt', 'spc', 'alt', 'ctr']
  ];

  var codes = [
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'bksp'],
    ['a/1', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ret'],
    ['sh', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'sh'],
    ['ctr', 'alt', 'spc', 'alt', 'ctr']
  ];

  var sum = function(prev, v) { return prev + v; };
  var r = function(v) { return Math.round(v); };

  var x, y, w, h, rowLayout, rowLabels, rowCodes;
  var x0 = 0, y0 = 0;
  var p = 2, P = p*2;
  h = H / Y;

  for (y = 0; y < Y; ++y) {
    rowLayout = layout[y];
    rowLabels = labels[y];
    rowCodes  = codes[y];
    X = rowLayout.reduce(sum, 0);
    for (x = 0; x < rowLayout.length; ++x) {
      w = W * (rowLayout[x] / X);
      cells.push({
        x0:r(x0+p), x1:r(x0+w-P),
        y0:r(y0+p), y1:r(y0+h-P),
        w:r(w-P), h:r(h-P),
        l:rowLabels[x],
        c:rowCodes[x]
      });
      x0 += w;
    }
    x0 = 0;
    y0 += h;
  }

  ctx.font = r(h/3) + 'px sans-serif';

  I = cells.length;

  for (var i = 0; i < I; ++i) {
    draw(cells[i]);
  }
};

var draw = function(c, isDown) {
  ctx.fillStyle = isDown ? '#777' : '#FFF';
  ctx.fillRect(c.x0, c.y0, c.w, c.h);
  if (!isDown) {
      ctx.strokeRect(c.x0, c.y0, c.w, c.h);
  }
  ctx.fillStyle = isDown ? '#FFF' : '#000';
  ctx.fillText(c.l, c.w/2+c.x0, c.h/2+c.y0);
};

var findCell = function(x, y) {
  var c;
  for (var i = 0; i < I; ++i) {
    c = cells[i];
    if (c.x0 < x && c.x1 > x && c.y0 < y && c.y1 > y) {
      return c;
    }
  }
};

//var downCell;

var pointerDown = {}; // pointerId -> Boolean
var cellsDown = {}; // pointerId -> cell

var eqObj = function(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
};

var onKeyDown = function(c) {
  console.log('DOWN ' + c.l);
};

var onKeyUp = function(c) {
  console.log('UP   ' + c.l);
};

var onDown = function(ev) {
  var id = ev.pointerId;
  ev.preventDefault();
  pointerDown[id] = true;
  var c = findCell(ev.x, ev.y);
  if (!c) { return; }
  draw(c, true);
  cellsDown[id] = c;
  onKeyDown(c);
};

var onMove = function(ev) {
//  console.log('move', ev.pointerId, ev.x, ev.y);
  var id = ev.pointerId;
  ev.preventDefault();
  if (!pointerDown[id]) { return; }
  var c0 = cellsDown[id];
  var c = findCell(ev.x, ev.y);
  if (eqObj(c0, c)) { return; }
  if (c0) {
    draw(c0);
    onKeyUp(c0);
  }
  if (c) {
    draw(c, true);
    onKeyDown(c);
  }
  cellsDown[id] = c;
};

var onUp = function(ev) {
  var id = ev.pointerId;
  ev.preventDefault();
  if (!pointerDown[id]) { return; }
  delete pointerDown[id];

  var c = cellsDown[id];
  if (!c) { return; }
  draw(c);
  onKeyUp(c);
};

canvasEl.addEventListener('pointerdown', onDown, false);
canvasEl.addEventListener('pointermove', onMove, false);
canvasEl.addEventListener('pointerup',   onUp,   false);
canvasEl.addEventListener('pointerout',  onUp,   false);

window.addEventListener('load', function() {
  setTimeout(function(){
    window.scrollTo(0, 1);
  }, 0);
});

prepare();
