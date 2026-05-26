
// ── fullscreen icon swap ──
document.addEventListener('fullscreenchange',()=>{
  const inFS=!!document.fullscreenElement;
  document.getElementById('icon-fs-enter').style.display=inFS?'none':'';
  document.getElementById('icon-fs-exit').style.display=inFS?'':'none';
});

// ── ctrl-bar auto-hide ──
(function(){
  const bar=document.querySelector('.ctrl-bar');
  let t;
  function show(){bar.classList.remove('hidden');clearTimeout(t);t=setTimeout(()=>bar.classList.add('hidden'),5000);}
  document.addEventListener('mousemove',show);
  document.addEventListener('keydown',show);
  document.addEventListener('touchstart',show,{passive:true});
  bar.addEventListener('mouseenter',()=>{clearTimeout(t);bar.classList.remove('hidden');});
  bar.addEventListener('mouseleave',show);
  show();
})();

// ── lightbox ──
const lightbox=document.getElementById('lightbox');
const lightboxImg=document.getElementById('lightbox-img');
document.addEventListener('click',e=>{
  const img=e.target.closest('.slide img');
  if(!img||img.closest('.lightbox'))return;
  lightboxImg.src=img.src;lightbox.classList.add('active');e.stopPropagation();
});
lightbox.addEventListener('click',e=>{if(e.target!==lightboxImg)lightbox.classList.remove('active');});

// ── slide engine ──
let mode='slide',current=0;
const slides=document.querySelectorAll('.slide');
const counter=document.getElementById('counter');
slides.forEach(s=>s.setAttribute('data-orig-style',s.getAttribute('style')||''));

function resetAnims(s){
  s.querySelectorAll('.animate-line').forEach(el=>{el.style.animation='none';el.offsetHeight;el.style.animation='';});
}

function triggerActiveChart(){
  if(!window.Chart || !Chart.instances)return;
  const active=slides[current];
  if(!active)return;
  const canvases=[...active.querySelectorAll('canvas')];
  Object.values(Chart.instances).forEach(chart=>{
    if(canvases.includes(chart.canvas)){
      try{chart.reset(); chart.update();}catch(e){}
    }
  });
}
function enhanceTables(){
  document.querySelectorAll('.benefit-table,.comp-table,.cancer-cost-table,.nhi-table').forEach(table=>{
    if(table.parentElement && table.parentElement.classList.contains('table-scroll'))return;
    const wrap=document.createElement('div');
    wrap.className='table-scroll';
    table.parentNode.insertBefore(wrap,table);
    wrap.appendChild(table);
  });
}
enhanceTables();
function render(){
  if(mode==='slide'){
    slides.forEach((s,i)=>{
      s.style.position='absolute';s.style.inset='0';
      s.style.display=i===current?'flex':'none';
      if(i===current)resetAnims(s);
    });
  }else{
    slides.forEach(s=>{s.style.position='relative';s.style.display='flex';});
  }
  counter.textContent=(current+1)+' / '+slides.length;
  requestAnimationFrame(triggerActiveChart);
}
function next(){if(current<slides.length-1){current++;render();}}
function prev(){if(current>0){current--;render();}}
function toggleMode(){
  mode=mode==='slide'?'scroll':'slide';
  document.body.classList.toggle('scroll-mode');
  document.documentElement.classList.toggle('scroll-mode');
  render();
}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();next();}
  if(e.key==='ArrowLeft'){e.preventDefault();prev();}
  if(e.key==='f'||e.key==='F'){document.documentElement.requestFullscreen?.();}
  if(e.key==='g'||e.key==='G'){toggleGrid();}
  if(e.key==='Escape'){
    if(document.body.classList.contains('grid-mode'))toggleGrid();
    else if(lightbox.classList.contains('active'))lightbox.classList.remove('active');
    else if(document.fullscreenElement)document.exitFullscreen();
  }
});
window.addEventListener('beforeprint',()=>slides.forEach(s=>{s.style.position='';s.style.inset='';s.style.display=''}));
window.addEventListener('afterprint',()=>render());

function toggleGrid(){
  const isGrid=document.body.classList.toggle('grid-mode');
  document.documentElement.classList.toggle('grid-mode');
  if(isGrid){
    requestAnimationFrame(()=>{
      const natW=window.innerWidth,natH=window.innerHeight;
      const thumbW=(slides[0]?.getBoundingClientRect().width)||360;
      const zoom=thumbW/natW;
      slides.forEach((s,i)=>{
        const orig=s.getAttribute('data-orig-style')||'';
        s.style.cssText=orig+`;width:${natW}px;height:${natH}px;zoom:${zoom};--grid-zoom:${zoom}`;
        s.setAttribute('data-slide-num',i+1);
        s.classList.toggle('grid-current',i===current);
        s._gc=()=>{current=i;toggleGrid();render();};
        s.addEventListener('click',s._gc);
      });
      requestAnimationFrame(()=>{
        const cur=document.querySelector('.slide.grid-current');
        if(cur)cur.scrollIntoView({block:'center',behavior:'instant'});
      });
    });
  }else{
    slides.forEach(s=>{
      s.style.cssText=s.getAttribute('data-orig-style')||'';
      if(s._gc){s.removeEventListener('click',s._gc);delete s._gc;}
      s.classList.remove('grid-current');
    });
    render();
  }
}
if(window.innerWidth<=768){
  mode='scroll';
  document.body.classList.add('scroll-mode');
  document.documentElement.classList.add('scroll-mode');
}
let tx=0,ty=0;
document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
document.addEventListener('touchend',e=>{
  if(mode!=='slide')return;
  const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx))return;
  if(dx<0)next();else prev();
});
render();

// ── Chart.js charts ──
const nhiFontSize=window.innerWidth>1200?13:10;
Chart.defaults.font.family="'Noto Sans TC',sans-serif";

// Slide 02: NHI重大傷病表格版，無圖表初始化

// Slide 03: 台灣人口
const popColors=['#5b9bd5','#5b9bd5','#5b9bd5','#5b9bd5','#30DAA2','#5b9bd5','#E03E57','#E03E57','#E03E57','#E03E57'];
new Chart(document.getElementById('chart-pop'),{
  type:'bar',
  data:{
    labels:['2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'],
    datasets:[{
      label:'台灣人口數（萬人）',
      data:[2352,2357,2358,2360,2356,2338,2319,2317,2312,2305],
      backgroundColor:popColors,borderRadius:4,
    }]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.parsed.y.toLocaleString()+' 萬人'}}},
    scales:{
      y:{beginAtZero:false,min:2295,max:2370,ticks:{callback:v=>v+'萬',font:{size:nhiFontSize}},grid:{color:'rgba(0,0,0,0.05)'}},
      x:{ticks:{font:{size:nhiFontSize}}}
    },
    animation:{duration:900,easing:'easeOutQuart'}
  },
  plugins:[{
    afterDatasetsDraw(chart){
      const ctx=chart.ctx;
      chart.data.datasets.forEach((ds,di)=>{
        chart.getDatasetMeta(di).data.forEach((bar,i)=>{
          ctx.save();ctx.fillStyle='#444';ctx.font=`bold ${nhiFontSize}px 'Noto Sans TC'`;
          ctx.textAlign='center';
          ctx.fillText(ds.data[i].toLocaleString(),bar.x,bar.y-5);
          ctx.restore();
        });
      });
    }
  }]
});

// Slide 04: 男女人口
new Chart(document.getElementById('chart-gender'),{
  type:'bar',
  data:{
    labels:['2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'],
    datasets:[
      {label:'男性人口數',data:[1174,1177,1178,1180,1178,1170,1160,1158,1155,1150],backgroundColor:'rgba(91,155,213,0.85)',borderRadius:3},
      {label:'女性人口數',data:[1178,1180,1180,1180,1178,1168,1159,1159,1157,1155],backgroundColor:'rgba(244,164,96,0.85)',borderRadius:3}
    ]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    plugins:{
      legend:{position:'top',labels:{font:{size:nhiFontSize},padding:12}},
      tooltip:{callbacks:{label:ctx=>ctx.dataset.label+': '+ctx.parsed.y.toLocaleString()+' 萬人'}}
    },
    scales:{
      y:{beginAtZero:false,min:1140,max:1195,ticks:{callback:v=>v+'萬',font:{size:nhiFontSize}},grid:{color:'rgba(0,0,0,0.05)'}},
      x:{ticks:{font:{size:nhiFontSize}}}
    },
    animation:{duration:900,easing:'easeOutQuart'}
  },
  plugins:[{
    afterDatasetsDraw(chart){
      const ctx=chart.ctx;
      const fs=Math.max(10,nhiFontSize-1);
      chart.data.datasets.forEach((ds,di)=>{
        chart.getDatasetMeta(di).data.forEach((bar,i)=>{
          ctx.save();
          ctx.fillStyle=di===0?'#1a5276':'#7d4000';
          ctx.font=`bold ${fs}px 'Noto Sans TC'`;
          ctx.textAlign='center';
          ctx.fillText(ds.data[i].toLocaleString(),bar.x,bar.y-(di===0?10:22));
          ctx.restore();
        });
      });
    }
  }]
});

// Slide 05: 男性罹癌
const cancerColors=['#5b9bd5','#5b9bd5','#5b9bd5','#5b9bd5','#5b9bd5','#5b9bd5','#5b9bd5','#5b9bd5','#FF8933','#E03E57'];
new Chart(document.getElementById('chart-cancer'),{
  type:'bar',
  data:{
    labels:['2014','2015','2016','2017','2018','2019','2020','2021','2022','2023'],
    datasets:[{
      label:'男性罹癌人數',
      data:[58515,59878,59433,61117,62279,63285,63893,63723,67299,71244],
      backgroundColor:cancerColors,borderRadius:4,
    }]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.parsed.y.toLocaleString()+' 人'}}},
    scales:{
      y:{beginAtZero:false,min:55000,ticks:{callback:v=>v.toLocaleString(),font:{size:nhiFontSize}},grid:{color:'rgba(0,0,0,0.05)'}},
      x:{ticks:{font:{size:nhiFontSize}}}
    },
    animation:{duration:900,easing:'easeOutQuart'}
  },
  plugins:[{
    afterDatasetsDraw(chart){
      const ctx=chart.ctx;
      chart.data.datasets.forEach((ds,di)=>{
        chart.getDatasetMeta(di).data.forEach((bar,i)=>{
          ctx.save();ctx.fillStyle='#333';ctx.font=`bold ${nhiFontSize}px 'Noto Sans TC'`;
          ctx.textAlign='center';
          ctx.fillText(ds.data[i].toLocaleString(),bar.x,bar.y-5);
          ctx.restore();
        });
      });
    }
  }]
});

// Slide 07: 年齡罹癌圓餅 (donut)
new Chart(document.getElementById('chart-pie'),{
  type:'doughnut',
  data:{
    labels:['65歲以上（47%）','50–64歲（39%）','40–49歲（11%）','0–39歲（3%）'],
    datasets:[{
      data:[47,39,11,3],
      backgroundColor:['#014865','#1a5c8a','#2980b9','#5dade2'],
      borderWidth:2,borderColor:'#F0F6F9',
    }]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    cutout:'55%',
    plugins:{
      legend:{display:false},
      tooltip:{callbacks:{label:ctx=>ctx.label+': '+ctx.parsed+'%'}}
    },
    animation:{duration:900,easing:'easeOutQuart'}
  }
});

// ══ CLZ Calculator – official rate table ══
const CLZ_RATES = {
  10:{18:420,19:430,20:439,21:450,22:461,23:472,24:483,25:494,26:504,27:515,
      28:526,29:537,30:548,31:562,32:576,33:590,34:604,35:618,36:632,37:646,
      38:660,39:674,40:688,41:705,42:721,43:738,44:755,45:772,46:788,47:805,
      48:822,49:838,50:855,51:888,52:922,53:955,54:988,55:1022,56:1055,
      57:1088,58:1121,59:1155,60:1188},
  20:{18:222,19:228,20:233,21:239,22:246,23:252,24:258,25:265,26:271,27:277,
      28:283,29:290,30:296,31:306,32:315,33:325,34:334,35:344,36:354,37:363,
      38:373,39:382,40:392,41:412,42:433,43:453,44:473,45:494,46:514,47:534,
      48:554,49:575,50:595}
};
const FREQ_FACTOR = {annual:1,semi:0.52,quarter:0.262,month:0.088};
const FREQ_LABEL  = {annual:'年繳',semi:'半年繳',quarter:'季繳',month:'月繳'};
const FREQ_TIMES  = {annual:1,semi:2,quarter:4,month:12};
const _cc = {per:10,freq:'annual'};

function clzSet(key,val,btn){
  _cc[key]=val;
  btn.closest('.cc-btn-row').querySelectorAll('.cc-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  clzCalc();
}
function syncCov(v){
  document.getElementById('cc-cov-num').value=v;
  clzCalc();
}
function syncCovNum(v){
  const c=Math.min(300,Math.max(50,Math.round(parseFloat(v)/10)*10))||100;
  document.getElementById('cc-cov-num').value=c;
  document.getElementById('cc-cov-range').value=c;
  clzCalc();
}
function clzROC(){
  const y=parseInt(document.getElementById('cc-roc-y').value);
  const m=parseInt(document.getElementById('cc-roc-m').value);
  const d=parseInt(document.getElementById('cc-roc-d').value);
  const tag=document.getElementById('cc-age-tag');
  if(!y||!m||!d||y<40||y>114||m<1||m>12||d<1||d>31){tag.classList.remove('vis','cc-age-err');return;}
  const dob=new Date(y+1911,m-1,d);
  if(dob.getMonth()!==m-1){tag.classList.remove('vis');return;}
  const now=new Date();
  let ay=now.getFullYear()-dob.getFullYear(),am=now.getMonth()-dob.getMonth();
  if(now.getDate()<dob.getDate())am--;
  if(am<0){ay--;am+=12;}
  const age=ay+(am>6?1:0);
  const btn20=document.getElementById('btn20yr');
  if(age>50){btn20.disabled=true;btn20.classList.remove('on');if(_cc.per===20){_cc.per=10;document.getElementById('btn10yr').classList.add('on');}}
  else{btn20.disabled=false;}
  const valid=age>=18&&age<=(_cc.per===20?50:60);
  tag.classList.add('vis');
  if(!valid){tag.classList.add('cc-age-err');document.getElementById('cc-age-num').textContent=age+' 歲（超出範圍）';return;}
  tag.classList.remove('cc-age-err');
  document.getElementById('cc-age-num').textContent=age;
  clzCalc();
}
function clzCalc(){
  const y=parseInt(document.getElementById('cc-roc-y').value);
  const m=parseInt(document.getElementById('cc-roc-m').value);
  const d=parseInt(document.getElementById('cc-roc-d').value);
  if(!y||!m||!d)return;
  const dob=new Date(y+1911,m-1,d);
  if(dob.getMonth()!==m-1)return;
  const now=new Date();
  let ay=now.getFullYear()-dob.getFullYear(),am=now.getMonth()-dob.getMonth();
  if(now.getDate()<dob.getDate())am--;
  if(am<0){ay--;am+=12;}
  const age=ay+(am>6?1:0);
  const per=_cc.per,freq=_cc.freq;
  const rate=CLZ_RATES[per]&&CLZ_RATES[per][age];
  if(!rate)return;
  const cov=parseInt(document.getElementById('cc-cov-num').value)||100;
  const annual=rate*cov;
  const freqPrem=Math.round(annual*FREQ_FACTOR[freq]);
  const total=annual*per;
  const maturity=Math.round(total*1.06);
  const hasDisc=document.getElementById('cc-discount').checked;
  const discounted=Math.round(annual*0.99);
  const daily=Math.ceil(annual/365);

  // Show hero
  const hero=document.getElementById('cc-prem-hero');
  hero.classList.add('vis');

  // Numbers — no floating point issues
  const f=n=>n.toLocaleString();
  document.getElementById('cc-annual').textContent=f(annual);
  document.getElementById('cc-total').textContent=f(total);
  document.getElementById('cc-maturity').textContent=f(maturity);
  document.getElementById('cc-daily').textContent='約 '+f(daily)+' 元 ／ 天';

  // Freq note
  const fn=document.getElementById('cc-freq-note');
  if(freq!=='annual'){
    fn.style.display='block';
    fn.textContent=FREQ_LABEL[freq]+'每期 '+f(freqPrem)+' 元（年繳×'+FREQ_FACTOR[freq]+'）';
  } else {fn.style.display='none';}

  // Discount note
  const dn=document.getElementById('cc-disc-note');
  if(hasDisc){
    dn.style.display='block';
    dn.textContent='健康管理折扣後年繳 '+f(discounted)+' 元（第2保單年度起）';
  } else {dn.style.display='none';}

  // Benefits — all integers, clean display
  document.getElementById('bene-cov').textContent=cov;
  document.getElementById('b-heavy').textContent=cov;
  document.getElementById('b-specific').textContent=Math.round(cov*0.5);
  document.getElementById('b-light').textContent=Math.round(cov*0.1);
  document.getElementById('b-disease').textContent=Math.round(cov*0.1);
  document.getElementById('b-surgery').textContent=(cov*0.02%1===0)?cov*0.02:(cov*0.02).toFixed(1);
}
function clzSet(k,v,btn){
  _cc[k]=v;
  btn.closest('.cc-btn-row').querySelectorAll('.cc-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  clzCalc();
}

