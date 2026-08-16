"use strict";
(function(){
  window.monthsaryEscapeHtml = function(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  };

  window.monthsaryRequireUnlocked = function(){
    if(sessionStorage.getItem('monthsaryUnlocked') !== 'yes'){
      window.location.replace('index.html');
      return false;
    }
    return true;
  };

  window.monthsaryPlayUnlockSound = function(){
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.18);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.55);
    }catch(e){}
  };

  window.monthsaryLaunchConfetti = function(container){
    if(!container) return;
    const colors = ['#e3a9b4','#c9a66b','#d9cfe8','#fffdfb'];
    for(let i=0; i<28; i++){
      const bit = document.createElement('div');
      bit.className = 'confetti-bit';
      bit.style.left = (Math.random()*100) + '%';
      bit.style.background = colors[Math.floor(Math.random()*colors.length)];
      bit.style.transform = 'rotate(' + (Math.random()*360) + 'deg)';
      bit.style.transition = 'transform ' + (1.6+Math.random()*1.2) + 's ease-in, top ' + (1.6+Math.random()*1.2) + 's ease-in, opacity .4s ease ' + (1.4+Math.random()) + 's';
      container.appendChild(bit);
      requestAnimationFrame(function(){
        bit.style.top = (70 + Math.random()*30) + '%';
        bit.style.transform = 'rotate(' + (Math.random()*720-360) + 'deg) translateX(' + (Math.random()*80-40) + 'px)';
        bit.style.opacity = '0';
      });
      setTimeout(function(){ bit.remove(); }, 3200);
    }
  };

  window.monthsarySpawnHeartBurst = function(container){
    if(!container) return;
    for(let i=0; i<14; i++){
      const h = document.createElement('div');
      h.textContent = '❤';
      h.style.position = 'absolute';
      h.style.left = (30 + Math.random()*40) + '%';
      h.style.bottom = '30%';
      h.style.fontSize = (0.8 + Math.random()*1.1) + 'rem';
      h.style.color = Math.random() > .5 ? '#e3a9b4' : '#c9a66b';
      h.style.opacity = '0.9';
      h.style.transition = 'transform 1.8s ease-out, opacity 1.8s ease-out';
      h.style.zIndex = '4';
      container.appendChild(h);
      requestAnimationFrame(function(){
        h.style.transform = 'translateY(-' + (120+Math.random()*140) + 'px) translateX(' + (Math.random()*60-30) + 'px)';
        h.style.opacity = '0';
      });
      setTimeout(function(){ h.remove(); }, 2000);
    }
  };

  function spawnParticles(){
    const particleField = document.getElementById('particle-field');
    if(!particleField) return;
    for(let i=0; i<16; i++){
      const p = document.createElement('div');
      const isHeart = i % 4 === 0;
      p.className = isHeart ? 'heart-float' : 'particle';
      if(isHeart) p.textContent = '❤';
      const size = isHeart ? (10 + Math.random()*8) : (3 + Math.random()*6);
      if(!isHeart){ p.style.width = size + 'px'; p.style.height = size + 'px'; }
      else { p.style.fontSize = size + 'px'; }
      p.style.left = (Math.random()*100) + '%';
      p.style.setProperty('--dx', (Math.random()*60-30) + 'px');
      p.style.animationDuration = (14 + Math.random()*14) + 's';
      p.style.animationDelay = (Math.random()*16) + 's';
      particleField.appendChild(p);
    }
  }

  spawnParticles();
})();
