const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let scoreEl = document.getElementById('score');
let livesEl = document.getElementById('lives');

// パドル
const paddle = { w: 100, h: 12, x: (WIDTH-100)/2, y: HEIGHT-40, speed: 14 };

// ボール
let ball = { x: WIDTH/2, y: HEIGHT/2, r: 8, vx: 3, vy: -3 };

// ブロック
const cols = 8; const rows = 5; const brickW = 90; const brickH = 20; const padding = 10; const offsetTop = 60; const offsetLeft = 35;
let bricks = [];

let score = 0; let lives = 3; let running = false;
let keys = { left: false, right: false };

function initBricks(){
  bricks = [];
  for(let r=0;r<rows;r++){
    bricks[r]=[];
    for(let c=0;c<cols;c++){
      bricks[r][c] = { x: offsetLeft + c*(brickW+padding), y: offsetTop + r*(brickH+padding), w: brickW, h: brickH, alive: true };
    }
  }
}

function resetBall(){ ball.x = WIDTH/2; ball.y = HEIGHT/2; ball.vx = 3 * (Math.random() > 0.5 ? 1 : -1); ball.vy = -3; }

function draw(){
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  // ブロック
  bricks.forEach(row=>row.forEach(b=>{ if(b.alive){ ctx.fillStyle='#f39c12'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.strokeStyle='#c76c0b'; ctx.strokeRect(b.x,b.y,b.w,b.h); }}));
  // パドル
  ctx.fillStyle = '#38bdf8'; ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);
  // ボール
  ctx.beginPath(); ctx.fillStyle='#fff'; ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
}

function update(){
  // パドルは常時移動可能（ポーズ中でも位置を調整できる）
  if(keys.left) paddle.x = Math.max(0, paddle.x - paddle.speed);
  if(keys.right) paddle.x = Math.min(WIDTH - paddle.w, paddle.x + paddle.speed);

  if(!running) return;

  ball.x += ball.vx; ball.y += ball.vy;
  // 壁反射
  if(ball.x - ball.r < 0 || ball.x + ball.r > WIDTH) ball.vx *= -1;
  if(ball.y - ball.r < 0) ball.vy *= -1;
  // 底面
  if(ball.y + ball.r > HEIGHT){ lives--; livesEl.textContent = `Lives: ${lives}`; if(lives<=0){ alert('ゲームオーバー\nスコア: '+score); running=false; init(); } else { resetBall(); running=false; } }

  // パドル衝突
  if(ball.y + ball.r >= paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w){
    ball.vy *= -1;
    // 反射角調整
    let hitPos = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
    ball.vx = 4 * hitPos;
  }

  // ブロック衝突
  bricks.forEach(row=>row.forEach(b=>{
    if(b.alive){
      if(ball.x > b.x && ball.x < b.x + b.w && ball.y - ball.r < b.y + b.h && ball.y + ball.r > b.y){
        ball.vy *= -1; b.alive=false; score+=10; scoreEl.textContent = `Score: ${score}`;
      }
    }
  }));

}

function loop(){ update(); draw(); requestAnimationFrame(loop); }

function init(){ initBricks(); resetBall(); score=0; lives=3; scoreEl.textContent = `Score: ${score}`; livesEl.textContent = `Lives: ${lives}`; paddle.x = (WIDTH-paddle.w)/2; }

// 入力
document.addEventListener('keydown', e => {
  if(e.code === 'ArrowLeft') keys.left = true;
  if(e.code === 'ArrowRight') keys.right = true;
  if(e.code === 'Space') running = !running;
});
document.addEventListener('keyup', e => {
  if(e.code === 'ArrowLeft') keys.left = false;
  if(e.code === 'ArrowRight') keys.right = false;
});
canvas.addEventListener('mousemove', e=>{
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left; paddle.x = Math.min(WIDTH - paddle.w, Math.max(0, x - paddle.w/2));
});

// タッチで開始/ポインタ
canvas.addEventListener('click', ()=>{ running = true; });

init(); loop();
