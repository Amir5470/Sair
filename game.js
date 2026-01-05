// game.js
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 1400;
canvas.height = 800;

const ui = {
  scoreEl: document.getElementById('score'),
  coinsEl: document.getElementById('coins'),
  msg: document.getElementById('message'),
  trickState: document.getElementById('trickState'),
  fuelEl: document.getElementById('fuel'),
  shopModal: document.getElementById('shopModal'),
  startBtn: document.getElementById('startBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  shopBtn: document.getElementById('shopBtn'),
  closeShop: document.getElementById('closeShop')
};

// images
const bg = new Image(); bg.src = 'images/backskate.png';
const imgNorm = new Image(); imgNorm.src = 'images/norm.png';
const imgJump = new Image(); imgJump.src = 'images/jump.png';
const imgCrouch = new Image(); imgCrouch.src = 'images/crouch.png';
const rooftop = new Image(); rooftop.src = 'images/rooftop.png';

let rooftopLoaded = false;
rooftop.onload = () => rooftopLoaded = true;

// game state
let player = { x: canvas.width/2-40, y:360, w:80, h:100, vy:0, onGround:false, state:'norm' };
const gravity = 1, baseSpeed = 10, jumpPower = -18;
let keys = {}, scrollX = 0, score = 0, coins = 0;
let paused = false, started = true;
let obstacles=[], pits=[], lowBlocks=[];
let trickActive = false, trickType = null, trickTimer = 0;
let jetpack = { owned:false, fuel:0, active:false };
let shop = JSON.parse(localStorage.getItem('shop_v1')||'{}');
shop.kickflip = shop.kickflip||false;
shop.jetpack = shop.jetpack||false;
shop.double = shop.double||false;

ui.coinsEl.textContent = coins;
ui.scoreEl.textContent = score;
ui.fuelEl.textContent = Math.floor(jetpack.fuel);

// inputs
document.addEventListener('keydown', e=>{ keys[e.key]=true; if(e.key==='p') togglePause(); });
document.addEventListener('keyup', e=>{ keys[e.key]=false; });

// shop buttons
ui.startBtn.onclick = ()=>{ started=true; paused=false; ui.msg.textContent=''; };
ui.pauseBtn.onclick = ()=>togglePause();
ui.shopBtn.onclick = ()=>ui.shopModal.style.display='block';
ui.closeShop.onclick = ()=>ui.shopModal.style.display='none';

document.querySelectorAll('.buy').forEach(btn=>{
  btn.onclick = ()=>{
    const id = btn.dataset.id, cost=parseInt(btn.dataset.cost,10);
    if(coins<cost){ flash('not enough coins'); return; }
    if(shop[id]){ flash('already bought'); return; }
    coins-=cost; shop[id]=true;
    localStorage.setItem('shop_v1', JSON.stringify(shop));
    flash('bought '+id);
    ui.coinsEl.textContent=coins;
    if(id==='jetpack'){ jetpack.owned=true; jetpack.fuel=200; ui.fuelEl.textContent=jetpack.fuel; }
    if(id==='kickflip'){ trickType='kickflip'; }
  };
});

function flash(txt, ms=1400){ ui.msg.textContent=txt; setTimeout(()=>{ if(ui.msg.textContent===txt) ui.msg.textContent=''; }, ms); }

// helpers
function groundY(){ return 500; }
function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){ return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by; }

// spawn obstacles/pits/lowblocks
function spawnSegment(){
  const type=Math.random(), baseX=scrollX+canvas.width+150+Math.random()*400;
  if(type<0.55){
    const w=60+Math.random()*60;
    obstacles.push({x:baseX, y:groundY()-30, w, h:30});
  }else if(type<0.8){
    const pw=Math.min(120+Math.random()*120, Math.abs(jumpPower)*9);
    pits.push({x:baseX,w:pw});
  }else{
    let px=baseX;
    if(pits.some(p=>Math.abs(p.x-px)<260)) px+=260;
    lowBlocks.push({x:px,y:groundY()-160,w:120+Math.random()*80,h:40});
  }
}

// reset game
function resetGame(){
  keys={};
  player={ x: canvas.width/2-40, y:360, w:80, h:100, vy:0, onGround:true, state:'norm' };
  scrollX=0; score=0; coins=0; obstacles=[]; pits=[]; lowBlocks=[];
  jetpack.fuel = shop.jetpack?200:0;
  paused=false; started=true;
  ui.scoreEl.textContent=0; ui.coinsEl.textContent=0; ui.fuelEl.textContent=Math.floor(jetpack.fuel);
  trickActive=false; trickTimer=0; ui.trickState.textContent='none';
}

// pause toggle
function togglePause(){ paused=!paused; ui.pauseBtn.textContent=paused?'Resume':'Pause'; if(!paused) requestAnimationFrame(update); }

// main loop
let spawnTimer=0, lastTime=performance.now();
function update(t){
  const dt=(t-lastTime)/16.66; lastTime=t;
  if(paused || !started){ requestAnimationFrame(update); return; }

  // movement
  if(keys['ArrowLeft']) scrollX-=baseSpeed;
  if(keys['ArrowRight']) scrollX+=baseSpeed;
  player.x=canvas.width/2-player.w/2;

  if((keys[' ']||keys['ArrowUp']) && player.onGround){ player.vy=jumpPower; player.onGround=false; }

  if(shop.jetpack && keys['j'] && jetpack.fuel>0){ player.vy-=0.8; jetpack.fuel=Math.max(0,jetpack.fuel-1); ui.fuelEl.textContent=Math.floor(jetpack.fuel); jetpack.active=true; } else jetpack.active=false;

  // tricks
  if(!player.onGround && keys['k'] && !trickActive){ trickActive=true; trickTimer=0; ui.trickState.textContent=(trickType==='kickflip'?'kickflip':'flip'); }

  // physics
  player.vy+=gravity; player.y+=player.vy;

  // ground
  if(player.y+player.h>=groundY()){ 
    const landed=!player.onGround; 
    player.y=groundY()-player.h; player.vy=0; player.onGround=true;
    if(landed && trickActive){ const ts=250*(shop.double?2:1); score+=ts; coins+=Math.floor(ts/50); flash('Trick landed +'+ts); ui.coinsEl.textContent=coins; ui.scoreEl.textContent=score; trickActive=false; ui.trickState.textContent='none'; }
  }

  // obstacles
  obstacles.forEach(o=>{
    const sx=o.x-scrollX;
    if(rectsOverlap(player.x,player.y,player.w,player.h,sx,o.y,o.w,o.h)){
      const fromTop=player.y+player.h<=o.y+10 && player.vy>=0;
      if(fromTop){ player.y=o.y-player.h; player.vy=0; player.onGround=true; score+=10; coins+=1; }
      else{ const hitSide=(player.x+player.w-sx<10)||(sx+o.w-player.x<10); if(hitSide) gameOver(); }
    }
  });

  // lowBlocks
  lowBlocks.forEach(b=>{
    const sx=b.x-scrollX;
    if(rectsOverlap(player.x,player.y,player.w,player.h,sx,b.y,b.w,b.h)){
      if(!keys['ArrowDown']&&!keys['s']) gameOver(); else {score+=5;}
    }
  });

  // pits
  pits.forEach(p=>{
    const playerLeft=scrollX+player.x, playerRight=playerLeft+player.w;
    if(player.onGround && playerRight>p.x && playerLeft<p.x+p.w) gameOver();
  });

  // spawn
  spawnTimer+=Math.random()*0.8;
  if(spawnTimer>1.6){ spawnSegment(); spawnTimer=0; }

  // clean up
  obstacles=obstacles.filter(o=>o.x+o.w>scrollX-200);
  pits=pits.filter(p=>p.x+p.w>scrollX-200);
  lowBlocks=lowBlocks.filter(b=>b.x+b.w>scrollX-200);

  // score
  if(keys['ArrowRight']) score+=1; else if(keys['ArrowLeft']) score+=0.2;
  ui.scoreEl.textContent=Math.floor(score);

  if(trickActive){ trickTimer+=1*dt; if(trickTimer>60){ trickActive=false; ui.trickState.textContent='none'; } }

  draw();
  requestAnimationFrame(update);
}

// draw
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const bgX=-scrollX*0.5%canvas.width;
  ctx.drawImage(bg,bgX,0,canvas.width,canvas.height);
  ctx.drawImage(bg,bgX+canvas.width,0,canvas.width,canvas.height);

  // ground
  ctx.fillStyle='#444'; ctx.fillRect(0,groundY(),canvas.width,canvas.height-groundY());

  // pits
  pits.forEach(p=>{ const sx=p.x-scrollX; ctx.fillStyle='#7a0000'; ctx.fillRect(sx,groundY(),p.w,canvas.height-groundY()); });

  // obstacles / rooftops
  obstacles.forEach(o=>{
    const sx=o.x-scrollX;
    if(rooftopLoaded){ ctx.drawImage(rooftop,sx,o.y-o.h,o.w,o.h); } 
    else{ ctx.fillStyle='#888'; ctx.fillRect(sx,o.y,o.w,o.h); }
  });

  // lowBlocks
  lowBlocks.forEach(b=>{
    const sx=b.x-scrollX;
    if(rooftopLoaded){ ctx.drawImage(rooftop,sx,b.y,b.w,b.h); } 
    else{ ctx.fillStyle='#0ff'; ctx.fillRect(sx,b.y,b.w,b.h); }
  });

  // player
  let img=imgNorm;
  if(!player.onGround) img=imgJump;
  if(keys['ArrowDown']) img=imgCrouch;
  ctx.save();
  if(keys['ArrowLeft']&&!keys['ArrowRight']){ ctx.scale(-1,1); ctx.drawImage(img,-player.x-player.w,player.y,player.w,player.h); } 
  else ctx.drawImage(img,player.x,player.y,player.w,player.h);
  ctx.restore();

  // HUD
  ctx.fillStyle='#0ff'; ctx.font='14px monospace';
  ctx.fillText('SPACE/UP: jump • K: trick • J: jetpack • P: pause',20,30);
  ctx.fillText('Score: '+Math.floor(score)+' • Coins: '+coins+' • Trick: '+(trickActive?trickType:'none'),20,50);
  if(jetpack.owned) ctx.fillText('Fuel: '+Math.floor(jetpack.fuel),20,70);
}

// game over
function gameOver(){
  paused=true;
  flash('YOU WIPED OUT • score:'+Math.floor(score));
  coins+=Math.floor(score/200); ui.coinsEl.textContent=coins;
  setTimeout(()=>{ if(confirm('retry?')) resetGame(); },300);
}

// start loop
requestAnimationFrame(update);
