"use strict";
(function(){
  const cfg = window.MONTHSARY;
  const pinBoxes = Array.from(document.querySelectorAll('.pin-box'));
  const pinRow = document.getElementById('pin-row');
  const lockMessage = document.getElementById('lock-message');
  const lockScreen = document.getElementById('lock-screen');
  const lockWelcome = document.getElementById('lock-welcome');
  let unlocking = false;

  function checkCode(){
    if(unlocking) return;
    const entered = pinBoxes.map(function(b){ return b.value; }).join('');
    if(entered === cfg.MONTHSARY_CODE){ unlocking = true; correctCode(); }
    else wrongCode();
  }

  function wrongCode(){
    pinBoxes.forEach(function(b){ b.classList.add('error'); });
    pinRow.classList.add('shake');
    lockMessage.textContent = "Hmm... that's not our special number. Try again, love ❤️";
    lockMessage.classList.add('error-msg');
    setTimeout(function(){
      pinRow.classList.remove('shake');
      pinBoxes.forEach(function(b){ b.value=''; b.classList.remove('error'); });
      pinBoxes[0].focus();
    }, 500);
  }

  function correctCode(){
    pinBoxes.forEach(function(b){ b.classList.add('glow'); });
    lockMessage.classList.remove('error-msg');
    lockMessage.textContent = '';
    lockScreen.classList.add('unlocking');
    monthsaryLaunchConfetti(lockScreen);
    monthsarySpawnHeartBurst(lockScreen);
    monthsaryPlayUnlockSound();
    setTimeout(function(){
      document.querySelector('.lock-card').classList.add('fade-out');
      lockWelcome.classList.add('show');
    }, 500);
    setTimeout(function(){
      sessionStorage.setItem('monthsaryUnlocked', 'yes');
      window.location.href = 'surprise.html';
    }, 2200);
  }

  pinBoxes.forEach(function(box, i){
    box.addEventListener('input', function(){
      box.value = box.value.replace(/[^0-9]/g,'').slice(0,1);
      if(box.value && i < pinBoxes.length - 1) pinBoxes[i+1].focus();
      if(pinBoxes.every(function(b){ return b.value.length === 1; })) checkCode();
    });
    box.addEventListener('keydown', function(e){
      if(e.key === 'Backspace' && !box.value && i > 0) pinBoxes[i-1].focus();
    });
    box.addEventListener('paste', function(e){
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g,'');
      if(!text) return;
      text.split('').slice(0,6).forEach(function(ch, idx){ if(pinBoxes[idx]) pinBoxes[idx].value = ch; });
      const nextEmpty = pinBoxes.findIndex(function(b){ return !b.value; });
      (nextEmpty === -1 ? pinBoxes[pinBoxes.length-1] : pinBoxes[nextEmpty]).focus();
      if(pinBoxes.every(function(b){ return b.value.length === 1; })) checkCode();
    });
  });
})();
