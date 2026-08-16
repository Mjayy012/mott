"use strict";
(function(){
  const cfg = window.MONTHSARY;
  const bgAudio = document.getElementById('bg-audio');
  const musicControl = document.getElementById('music-control');
  const musicToggle = document.getElementById('music-toggle');
  const muteToggle = document.getElementById('mute-toggle');
  const volumeSlider = document.getElementById('volume-slider');
  const musicEnabled = !!(cfg && cfg.BACKGROUND_MUSIC && bgAudio);
  let musicResumeQueued = false;

  if(musicEnabled){
    bgAudio.src = cfg.BACKGROUND_MUSIC;
    bgAudio.preload = 'auto';
    bgAudio.volume = 0.5;
  } else if(musicControl){
    musicControl.style.display = 'none';
  }

  function setMusicPlayingState(isPlaying){
    if(!musicControl || !musicToggle) return;
    musicControl.classList.toggle('playing', isPlaying);
    musicToggle.textContent = isPlaying ? '♪' : '❚❚';
  }

  function playMusicSafely(){
    if(!musicEnabled) return Promise.resolve(false);
    bgAudio.muted = false;
    if(muteToggle) muteToggle.textContent = '🔊';
    const p = bgAudio.play();
    if(p && p.then){
      return p.then(function(){ setMusicPlayingState(true); return true; }).catch(function(){
        setMusicPlayingState(false);
        queueMusicResume();
        return false;
      });
    }
    setMusicPlayingState(true);
    return Promise.resolve(true);
  }

  function queueMusicResume(){
    if(musicResumeQueued || !musicEnabled) return;
    musicResumeQueued = true;
    const resume = function(){
      musicResumeQueued = false;
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('touchstart', resume);
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
      playMusicSafely();
    };
    document.addEventListener('pointerdown', resume, { once:true });
    document.addEventListener('touchstart', resume, { once:true });
    document.addEventListener('click', resume, { once:true });
    document.addEventListener('keydown', resume, { once:true });
  }

  function attemptAutoplayMusic(){
    if(!musicEnabled) return;
    playMusicSafely();
    bgAudio.addEventListener('canplay', function(){
      if(bgAudio.paused) playMusicSafely();
    }, { once:true });
  }

  function pauseMusic(){
    if(!musicEnabled) return;
    bgAudio.pause();
    setMusicPlayingState(false);
  }

  function fadeMusic(targetVol, duration){
    if(!musicEnabled) return;
    const startVol = bgAudio.volume;
    const startTime = performance.now();
    function step(now){
      const t = Math.min(1, (now - startTime) / duration);
      bgAudio.volume = startVol + (targetVol - startVol) * t;
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if(musicToggle){
    musicToggle.addEventListener('click', function(){
      if(!musicEnabled) return;
      if(bgAudio.paused) playMusicSafely();
      else pauseMusic();
      if(musicControl) musicControl.classList.toggle('tucked');
    });
  }
  if(muteToggle){
    muteToggle.addEventListener('click', function(e){
      e.stopPropagation();
      bgAudio.muted = !bgAudio.muted;
      muteToggle.textContent = bgAudio.muted ? '🔇' : '🔊';
    });
  }
  if(volumeSlider){
    volumeSlider.addEventListener('input', function(e){
      e.stopPropagation();
      bgAudio.volume = parseFloat(volumeSlider.value);
      if(bgAudio.volume === 0){ bgAudio.muted = true; if(muteToggle) muteToggle.textContent = '🔇'; }
      else { bgAudio.muted = false; if(muteToggle) muteToggle.textContent = '🔊'; }
    });
    volumeSlider.addEventListener('click', function(e){ e.stopPropagation(); });
  }

  window.MonthsaryMusic = {
    enabled: function(){ return musicEnabled; },
    audio: bgAudio,
    control: musicControl,
    volumeSlider: volumeSlider,
    play: playMusicSafely,
    attempt: attemptAutoplayMusic,
    pause: pauseMusic,
    fade: fadeMusic,
    setState: setMusicPlayingState
  };
})();
