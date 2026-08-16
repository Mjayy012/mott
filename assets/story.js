
  (function(){
  "use strict";

  const cfg = window.MONTHSARY;
  const MONTHSARY_CODE = cfg.MONTHSARY_CODE;
  const YOUR_NAME = cfg.YOUR_NAME;
  const PARTNER_NAME = cfg.PARTNER_NAME;
  const MONTHSARY_NUMBER = cfg.MONTHSARY_NUMBER;
  const RELATIONSHIP_START_DATE = cfg.RELATIONSHIP_START_DATE;
  const BACKGROUND_MUSIC = cfg.BACKGROUND_MUSIC;
  const GOOGLE_SCRIPT_URL = cfg.GOOGLE_SCRIPT_URL || '';
  const timelineEntries = cfg.timelineEntries;
  const photos = cfg.photos;
  const videos = cfg.videos;
  const reasons = cfg.reasons;
  const loveLetter = cfg.loveLetter;
  const secretMessage = cfg.secretMessage;

  /* ============================================================ 
    END OF CUSTOMIZATION BLOCK — code below makes it all work
    ============================================================ */

  document.title = "Happy Monthsary, " + PARTNER_NAME.split(" ")[0] + " ❤️";

  /* ---------------- populate text content ---------------- */
      document.getElementById('finale-names').textContent = YOUR_NAME + " ❤️ " + PARTNER_NAME;
  document.getElementById('letter-body').textContent = loveLetter;
  document.getElementById('surprise-message').textContent = secretMessage;

  const letterScene = document.getElementById('letter-scene');
  const letterPaper = document.getElementById('letter-paper');
  function openLetter(){
    if(!letterScene || letterScene.classList.contains('opened')) return;
    letterScene.classList.add('opened');
    document.getElementById('letter-open-btn').setAttribute('aria-expanded', 'true');
    setTimeout(function(){ letterScene.scrollIntoView({ behavior:'smooth', block:'center' }); }, 450);
  }
  document.getElementById('letter-envelope').addEventListener('click', openLetter);
  document.getElementById('letter-envelope').addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      openLetter();
    }
  });
  document.getElementById('letter-open-btn').addEventListener('click', openLetter);

  /* ---------------- timeline ---------------- */
  const timelineEl = document.getElementById('timeline');
  timelineEntries.forEach(function(item){
    const div = document.createElement('div');
    div.className = 'timeline-item reveal';
    div.innerHTML =
      '<span class="timeline-dot">❤</span>' +
      '<div class="timeline-date">' + escapeHtml(item.date) + '</div>' +
      '<div class="timeline-title">' + escapeHtml(item.title) + '</div>' +
      '<p class="timeline-desc">' + escapeHtml(item.desc) + '</p>' +
      (item.photo ? '<div class="timeline-photo"><img src="' + item.photo + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>' : '');
    timelineEl.appendChild(div);
  });

  /* ---------------- reasons ---------------- */
  const reasonsGrid = document.getElementById('reasons-grid');
  reasons.forEach(function(r){
    const card = document.createElement('div');
    card.className = 'reason-card reveal';
    card.innerHTML = '<span class="reason-heart">❤</span>' + escapeHtml(r);
    reasonsGrid.appendChild(card);
  });

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  const experience = document.getElementById('experience');

  /* ============================================================
    AMBIENT PARTICLE FIELD (candlelight motif)
    ============================================================ */
  const particleField = document.getElementById('particle-field');
  function spawnParticles(){
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

  /* ============================================================
    SCROLL REVEAL
    ============================================================ */
  let revealObserver;
  function initRevealObserver(){
    if(revealObserver) return;
    revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function(el){ revealObserver.observe(el); });

    // quiet moment sequential lines
    const quietObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          document.getElementById('quiet-line-1').classList.add('show');
          setTimeout(function(){ document.getElementById('quiet-line-2').classList.add('show'); }, 1400);
          setTimeout(function(){ document.getElementById('heartbeat').classList.add('show'); }, 2200);
          quietObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    quietObserver.observe(document.getElementById('quiet'));
  }


  /* ============================================================
    3. BACKGROUND MUSIC CONTROL
    ============================================================ */
  const bgAudio = document.getElementById('bg-audio');
  const musicControl = document.getElementById('music-control');
  const musicToggle = document.getElementById('music-toggle');
  const muteToggle = document.getElementById('mute-toggle');
  const volumeSlider = document.getElementById('volume-slider');
  let musicEnabled = !!BACKGROUND_MUSIC;
  const MUSIC_TIME_KEY = 'monthsaryMusicTime';
  const MUSIC_SHOULD_PLAY_KEY = 'monthsaryMusicShouldPlay';
  let musicTimeRestored = false;

  if(musicEnabled){
    bgAudio.src = BACKGROUND_MUSIC;
    bgAudio.preload = 'auto';
    bgAudio.volume = 0.5;
  } else {
    musicControl.style.display = 'none';
  }

  let musicResumeQueued = false;
  let queuedMusicResumeHandler = null;
  let videoPlaybackActive = false;

  function setMusicPlayingState(isPlaying){
    musicControl.classList.toggle('playing', isPlaying);
    musicToggle.textContent = isPlaying ? '♪' : '❚❚';
  }

  function getSavedMusicTime(){
    const saved = parseFloat(sessionStorage.getItem(MUSIC_TIME_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  }

  function restoreSavedMusicTime(){
    if(!musicEnabled || musicTimeRestored) return;
    const saved = getSavedMusicTime();
    if(!saved){
      musicTimeRestored = true;
      return;
    }

    const applySavedTime = function(){
      try{
        if(Number.isFinite(bgAudio.duration) && bgAudio.duration > 0){
          bgAudio.currentTime = Math.min(saved, Math.max(0, bgAudio.duration - 0.25));
        } else {
          bgAudio.currentTime = saved;
        }
        musicTimeRestored = true;
      }catch(e){
        bgAudio.addEventListener('loadedmetadata', applySavedTime, { once:true });
      }
    };

    applySavedTime();
  }

  function saveMusicState(shouldPlay){
    if(!musicEnabled) return;
    if(Number.isFinite(bgAudio.currentTime)){
      sessionStorage.setItem(MUSIC_TIME_KEY, String(bgAudio.currentTime));
    }
    sessionStorage.setItem(MUSIC_SHOULD_PLAY_KEY, shouldPlay ? 'yes' : 'no');
  }

  function playMusicSafely(){
    if(!musicEnabled) return Promise.resolve(false);
    if(videoPlaybackActive){
      setMusicPlayingState(false);
      return Promise.resolve(false);
    }
    restoreSavedMusicTime();
    sessionStorage.setItem(MUSIC_SHOULD_PLAY_KEY, 'yes');
    bgAudio.muted = false;
    muteToggle.textContent = '🔊';

    const p = bgAudio.play();
    if(p && p.then){
      return p.then(function(){
        setMusicPlayingState(true);
        saveMusicState(true);
        return true;
      }).catch(function(){
        setMusicPlayingState(false);
        if(!videoPlaybackActive) queueMusicResume();
        return false;
      });
    }

    setMusicPlayingState(true);
    saveMusicState(true);
    return Promise.resolve(true);
  }

  function clearQueuedMusicResume(){
    if(!queuedMusicResumeHandler) return;
    document.removeEventListener('pointerdown', queuedMusicResumeHandler);
    document.removeEventListener('touchstart', queuedMusicResumeHandler);
    document.removeEventListener('click', queuedMusicResumeHandler);
    document.removeEventListener('keydown', queuedMusicResumeHandler);
    queuedMusicResumeHandler = null;
    musicResumeQueued = false;
  }

  function queueMusicResume(){
    if(musicResumeQueued || !musicEnabled) return;
    musicResumeQueued = true;

    const resume = function(){
      clearQueuedMusicResume();
      if(!videoPlaybackActive) playMusicSafely();
    };
    queuedMusicResumeHandler = resume;

    document.addEventListener('pointerdown', resume, { once:true });
    document.addEventListener('touchstart', resume, { once:true });
    document.addEventListener('click', resume, { once:true });
    document.addEventListener('keydown', resume, { once:true });
  }

  function attemptAutoplayMusic(){
    if(!musicEnabled) return;
    restoreSavedMusicTime();
    const shouldPlay = sessionStorage.getItem(MUSIC_SHOULD_PLAY_KEY);
    if(shouldPlay !== 'no'){
      playMusicSafely();
    }
    bgAudio.addEventListener('canplay', function(){
      if(bgAudio.paused && !videoPlaybackActive && sessionStorage.getItem(MUSIC_SHOULD_PLAY_KEY) !== 'no') playMusicSafely();
    }, { once:true });
    return;
    const p = bgAudio.play();
    if(p && p.then){
      p.then(function(){ musicControl.classList.add('playing'); })
      .catch(function(){ /* autoplay blocked — wait for first interaction */
          const resume = function(){
            bgAudio.play().then(function(){ musicControl.classList.add('playing'); }).catch(function(){});
            document.removeEventListener('click', resume);
            document.removeEventListener('touchstart', resume);
          };
          document.addEventListener('click', resume, { once:true });
          document.addEventListener('touchstart', resume, { once:true });
      });
    }
  }

  musicToggle.addEventListener('click', function(){
    if(!musicEnabled) return;
    if(bgAudio.paused){
      playMusicSafely();
    } else {
      saveMusicState(false);
      bgAudio.pause();
      setMusicPlayingState(false);
    }
    musicControl.classList.toggle('tucked');
  });

  bgAudio.addEventListener('timeupdate', function(){
    saveMusicState(!bgAudio.paused || musicPausedByVideo);
  });
  bgAudio.addEventListener('play', function(){
    setMusicPlayingState(true);
  });
  bgAudio.addEventListener('pause', function(){
    setMusicPlayingState(false);
  });
  window.addEventListener('pagehide', function(){
    saveMusicState(!bgAudio.paused || musicPausedByVideo);
  });

  muteToggle.addEventListener('click', function(e){
    e.stopPropagation();
    bgAudio.muted = !bgAudio.muted;
    muteToggle.textContent = bgAudio.muted ? '🔇' : '🔊';
  });

  volumeSlider.addEventListener('input', function(e){
    e.stopPropagation();
    bgAudio.volume = parseFloat(volumeSlider.value);
    if(bgAudio.volume === 0){ bgAudio.muted = true; muteToggle.textContent = '🔇'; }
    else { bgAudio.muted = false; muteToggle.textContent = '🔊'; }
  });
  volumeSlider.addEventListener('click', function(e){ e.stopPropagation(); });

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

  let musicPausedByVideo = false;

  function pauseMusicForVideo(){
    if(!musicEnabled) return;
    videoPlaybackActive = true;
    clearQueuedMusicResume();
    const shouldResumeAfterVideo = !bgAudio.paused || sessionStorage.getItem(MUSIC_SHOULD_PLAY_KEY) === 'yes';
    musicPausedByVideo = shouldResumeAfterVideo;
    if(shouldResumeAfterVideo) saveMusicState(true);
    bgAudio.pause();
    setMusicPlayingState(false);
  }

  function resumeMusicAfterVideo(){
    if(!musicEnabled) return;
    videoPlaybackActive = false;
    if(!musicPausedByVideo) return;
    musicPausedByVideo = false;
    playMusicSafely();
  }

  function pauseCurrentVideoForScroll(){
    const v = currentVideoEl();
    if(!v || v.paused) return;
    v.pause();
    document.getElementById('video-playpause').textContent = '▶';
  }

  /* ============================================================
    5. CINEMATIC PHOTO SLIDESHOW
    ============================================================ */
  let currentSlide = 0;
  let slideTimer = null;
  let slideshowInit = false;

  function initSlideshow(){
    if(slideshowInit) return;
    slideshowInit = true;
    const wrap = document.getElementById('slides-wrap');
    const dotsWrap = document.getElementById('slide-dots');

    photos.forEach(function(photo, i){
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.dataset.index = i;

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption || ('Memory ' + (i+1));
      img.loading = 'lazy';
      img.onerror = function(){
        slide.innerHTML = '<div class="slide-placeholder"><span class="ph-icon">🤍</span><span>Add ' + photo.src + ' to see this memory</span></div>' +
          '<div class="slide-caption">' + escapeHtml(photo.caption || '') + '</div>';
      };
      slide.appendChild(img);

      const cap = document.createElement('div');
      cap.className = 'slide-caption';
      cap.textContent = photo.caption || '';
      slide.appendChild(cap);

      wrap.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'slide-dot';
      dot.setAttribute('aria-label', 'Go to photo ' + (i+1));
      dot.addEventListener('click', function(){ goToSlide(i); });
      dotsWrap.appendChild(dot);
    });

    document.getElementById('slide-prev').addEventListener('click', function(){ goToSlide(currentSlide - 1); });
    document.getElementById('slide-next').addEventListener('click', function(){ goToSlide(currentSlide + 1); });
    document.getElementById('slide-play').addEventListener('click', toggleSlideshowAuto);

    // swipe support
    let touchX = null;
    const stage = document.getElementById('slideshow');
    stage.addEventListener('touchstart', function(e){ touchX = e.touches[0].clientX; }, {passive:true});
    stage.addEventListener('touchend', function(e){
      if(touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if(Math.abs(dx) > 40){ dx < 0 ? goToSlide(currentSlide+1) : goToSlide(currentSlide-1); }
      touchX = null;
    }, {passive:true});

    renderSlide();
  }

  function renderSlide(){
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-dot');
    slides.forEach(function(s, i){
      s.classList.toggle('active', i === currentSlide);
      s.classList.toggle('kenburns', i === currentSlide);
    });
    dots.forEach(function(d, i){ d.classList.toggle('active', i === currentSlide); });
    document.getElementById('slide-progress').textContent = (currentSlide+1) + ' / ' + photos.length;

    if(currentSlide === photos.length - 1){
      // reached the end — cue the cinematic transition (only advances automatically in auto mode)
    }
  }

  function goToSlide(i){
    const prev = currentSlide;
    currentSlide = (i + photos.length) % photos.length;
    renderSlide();
    if(prev === photos.length - 1 && currentSlide === 0 && i === photos.length){
      triggerCineTransition();
    }
  }

  let autoPlaying = false;
  function toggleSlideshowAuto(){
    autoPlaying = !autoPlaying;
    const btn = document.getElementById('slide-play');
    if(autoPlaying){
      btn.textContent = '❚❚ Pause slideshow';
      slideTimer = setInterval(function(){
        if(currentSlide === photos.length - 1){
          clearInterval(slideTimer);
          autoPlaying = false;
          btn.textContent = '▶ Play slideshow';
          triggerCineTransition();
        } else {
          goToSlide(currentSlide + 1);
        }
      }, 3800);
    } else {
      btn.textContent = '▶ Play slideshow';
      clearInterval(slideTimer);
    }
  }

  function triggerCineTransition(){
    const overlay = document.getElementById('cine-transition');
    const l1 = document.getElementById('cine-line-1');
    const l2 = document.getElementById('cine-line-2');
    overlay.classList.add('show');
    fadeMusic(0.15, 800);
    setTimeout(function(){ l1.classList.add('show'); }, 300);
    setTimeout(function(){ l1.classList.remove('show'); }, 2200);
    setTimeout(function(){ l2.classList.add('show'); }, 2700);
    setTimeout(function(){
      overlay.classList.remove('show');
      l2.classList.remove('show');
      fadeMusic(0.5, 1200);
      document.getElementById('videos').scrollIntoView({ behavior:'smooth' });
    }, 4700);
  }

  /* ============================================================
    7. VIDEO MEMORIES
    ============================================================ */
  let currentVideo = 0;
  let videosInit = false;
  let userInteracted = false;

  function initVideos(){
    if(videosInit) return;
    videosInit = true;
    const wrap = document.getElementById('video-frames-wrap');

    videos.forEach(function(v, i){
      const frame = document.createElement('div');
      frame.className = 'video-frame';
      frame.dataset.index = i;

      if(v.type === 'drive'){
        const iframe = document.createElement('iframe');
        iframe.src = v.src;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'eager';
        iframe.title = v.caption || 'Google Drive video memory';
        frame.appendChild(iframe);

        const cap = document.createElement('p');
        cap.className = 'video-caption';
        cap.textContent = v.caption || '';
        frame.appendChild(cap);

        const note = document.createElement('div');
        note.className = 'drive-video-note';
        note.textContent = 'Google Drive video uses its own player controls.';
        frame.appendChild(note);

        wrap.appendChild(frame);
        return;
      }

      const vid = document.createElement('video');
      vid.src = v.src;
      vid.playsInline = true;
      vid.muted = true; // respect autoplay restrictions until user interacts
      vid.controls = false;
      vid.preload = 'auto';
      vid.addEventListener('play', pauseMusicForVideo);
      vid.addEventListener('pause', resumeMusicAfterVideo);
      vid.onerror = function(){
        frame.innerHTML = '<div class="video-placeholder"><span style="font-size:2rem;">🎬</span><span>Add ' + v.src + ' to see this memory</span></div>' +
          '<p class="video-caption">' + escapeHtml(v.caption || '') + '</p>';
      };
      vid.addEventListener('ended', function(){
        resumeMusicAfterVideo();
        document.getElementById('video-playpause').textContent = '▶';
        if(i < videos.length - 1){
          document.getElementById('video-next-cta').classList.add('show');
        }
      });
      frame.appendChild(vid);

      const cap = document.createElement('p');
      cap.className = 'video-caption';
      cap.textContent = v.caption || '';
      frame.appendChild(cap);

      wrap.appendChild(frame);
    });

    document.getElementById('video-playpause').addEventListener('click', function(){
      userInteracted = true;
      const v = currentVideoEl();
      if(!v) return;
      if(v.paused){
        pauseMusicForVideo();
        v.muted = false;
        v.play().catch(function(){
          videoPlaybackActive = false;
          resumeMusicAfterVideo();
        });
        this.textContent = '❚❚';
      } else {
        v.pause();
        this.textContent = '▶';
      }
    });
    document.getElementById('video-mute').addEventListener('click', function(){
      const v = currentVideoEl(); if(!v) return;
      v.muted = !v.muted;
      this.textContent = v.muted ? '🔇' : '🔊';
    });
    document.getElementById('video-fullscreen').addEventListener('click', function(){
      const v = currentVideoEl(); if(!v) return;
      if(v.requestFullscreen) v.requestFullscreen();
      else if(v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
    document.getElementById('video-prev').addEventListener('click', function(){ goToVideo(currentVideo - 1); });
    document.getElementById('video-next').addEventListener('click', function(){ goToVideo(currentVideo + 1); });
    document.getElementById('video-next-cta').addEventListener('click', function(){
      document.getElementById('video-next-cta').classList.remove('show');
      goToVideo(currentVideo + 1);
    });

    const videoSection = document.getElementById('videos');
    if('IntersectionObserver' in window && videoSection){
      const videoScrollObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting || entry.intersectionRatio < 0.25){
            pauseCurrentVideoForScroll();
          }
        });
      }, { threshold:[0, 0.12, 0.25, 0.5] });
      videoScrollObserver.observe(videoSection);
    }

    renderVideo();
  }

  function currentVideoEl(){
    const frame = document.querySelector('.video-frame[data-index="' + currentVideo + '"]');
    return frame ? frame.querySelector('video') : null;
  }

  function renderVideo(){
    document.querySelectorAll('.video-frame').forEach(function(f){
      const idx = parseInt(f.dataset.index, 10);
      f.classList.toggle('active', idx === currentVideo);
      const v = f.querySelector('video');
      if(v && idx !== currentVideo) v.pause();
    });
    const activeConfig = videos[currentVideo] || {};
    document.getElementById('video-stage').classList.toggle('drive-mode', activeConfig.type === 'drive');
    document.getElementById('video-counter').textContent = (currentVideo+1) + ' / ' + videos.length;
    document.getElementById('video-playpause').textContent = '▶';
    document.getElementById('video-next-cta').classList.remove('show');
  }

  function goToVideo(i){
    if(i < 0 || i >= videos.length) return;
    currentVideo = i;
    renderVideo();
  }

  function startExperience(){
    experience.classList.add('revealed');
    document.getElementById('music-control').setAttribute('aria-hidden','false');
    document.getElementById('music-control').style.display = 'flex';
    attemptAutoplayMusic();
    initReplyMailbox();
    initRevealObserver();
    initSlideshow();
    initVideos();
    startCounter();
  }

  /* ============================================================
    9. LIVE RELATIONSHIP COUNTER
    ============================================================ */
  function startCounter(){
    const startDate = new Date(RELATIONSHIP_START_DATE + 'T00:00:00');
    function update(){
      const now = new Date();
      let diffMs = now - startDate;
      if(diffMs < 0) diffMs = 0;

      let months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
      if(now.getDate() < startDate.getDate()) months--;
      if(months < 0) months = 0;

      const anchor = new Date(startDate);
      anchor.setMonth(anchor.getMonth() + months);
      let remainderMs = now - anchor;
      if(remainderMs < 0) remainderMs = 0;

      const days = Math.floor(remainderMs / (1000*60*60*24));
      const hours = Math.floor((remainderMs / (1000*60*60)) % 24);
      const mins = Math.floor((remainderMs / (1000*60)) % 60);
      const secs = Math.floor((remainderMs / 1000) % 60);

      document.getElementById('c-months').textContent = months;
      document.getElementById('c-days').textContent = days;
      document.getElementById('c-hours').textContent = hours;
      document.getElementById('c-mins').textContent = mins;
      document.getElementById('c-secs').textContent = secs;
    }
    update();
    setInterval(update, 1000);
  }

  /* ============================================================
    12. SECRET SURPRISE
    ============================================================ */
  const surpriseBtn = document.getElementById('surprise-btn');
  const surpriseOverlay = document.getElementById('surprise-overlay');
  surpriseBtn.addEventListener('click', function(){
    surpriseOverlay.classList.add('show');
    spawnSurpriseHearts();
  });
  document.getElementById('surprise-close').addEventListener('click', function(){
    surpriseOverlay.classList.remove('show');
  });
  surpriseOverlay.addEventListener('click', function(e){
    if(e.target === surpriseOverlay) surpriseOverlay.classList.remove('show');
  });

  function spawnSurpriseHearts(){
    for(let i=0; i<20; i++){
      const h = document.createElement('div');
      h.textContent = '❤';
      h.style.position = 'fixed';
      h.style.left = (Math.random()*100) + '%';
      h.style.bottom = '-20px';
      h.style.fontSize = (0.9 + Math.random()*1.2) + 'rem';
      h.style.color = Math.random() > .5 ? '#e3a9b4' : '#c9a66b';
      h.style.zIndex = '9996';
      h.style.opacity = '.9';
      h.style.transition = 'transform 2.6s ease-out, opacity 2.6s ease-out';
      document.body.appendChild(h);
      requestAnimationFrame(function(){
        h.style.transform = 'translateY(-' + (60+Math.random()*40) + 'vh) translateX(' + (Math.random()*80-40) + 'px)';
        h.style.opacity = '0';
      });
      setTimeout(function(){ h.remove(); }, 2800);
    }
  }

  /* ============================================================
    13. WRITE ME BACK
    ============================================================ */
  function initReplyMailbox(){
    const form = document.getElementById('reply-form');
    const sentBox = document.getElementById('reply-sent');
    const miniEnvelope = document.getElementById('reply-mini-envelope');
    const editBtn = document.getElementById('reply-edit-btn');
    const overlay = document.getElementById('reply-modal-overlay');
    const modalClose = document.getElementById('reply-modal-close');
    const modalScene = document.getElementById('reply-modal-scene');
    const modalEnvelope = document.getElementById('reply-modal-envelope');
    const modalText = document.getElementById('reply-modal-text');
    const input = document.getElementById('reply-input');
    const status = document.getElementById('reply-status');
    const sentText = sentBox.querySelector('.reply-sent-text');
    let pageReplyMessage = '';

    if(!form || !sentBox || !miniEnvelope || !editBtn || !overlay || !modalClose || !modalScene || !modalEnvelope || !modalText || !input) return;

    try{
      localStorage.removeItem('monthsary_reply_message');
      localStorage.removeItem('monthsary_reply_saved_online');
      localStorage.removeItem('monthsary_reply_id');
      localStorage.removeItem('monthsary_reply_edit_token');
    }catch(e){}

    function setStatus(message, isError){
      if(!status) return;
      status.textContent = message || '';
      status.classList.toggle('error', !!isError);
    }

    function showSentState(message, source){
      form.classList.add('hidden');
      sentBox.classList.remove('hidden');
      modalText.textContent = message;
      if(sentText){
        sentText.textContent = 'Your letter is ready to open.';
      }
    }

    function showFormState(message){
      sentBox.classList.add('hidden');
      form.classList.remove('hidden');
      setStatus('');
      input.value = message || '';
      input.focus();
    }

    function appendQuery(url, params){
      const parts = [];
      Object.keys(params).forEach(function(key){
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      });
      return url + (url.indexOf('?') === -1 ? '?' : '&') + parts.join('&');
    }

    function loadReplyFromSheet(){
      if(!GOOGLE_SCRIPT_URL) return Promise.resolve('');

      return new Promise(function(resolve, reject){
        const callbackName = 'monthsaryReplyCallback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
        const script = document.createElement('script');
        let finished = false;
        const timeout = setTimeout(function(){
          cleanup();
          reject(new Error('Google Sheet reply load timed out.'));
        }, 12000);

        function cleanup(){
          if(finished) return;
          finished = true;
          clearTimeout(timeout);
          delete window[callbackName];
          if(script.parentNode) script.parentNode.removeChild(script);
        }

        window[callbackName] = function(data){
          const reply = data && data.reply ? data.reply : {};
          cleanup();
          resolve(reply.message ? String(reply.message).trim() : '');
        };

        script.onerror = function(){
          cleanup();
          reject(new Error('Could not load the Google Sheet reply.'));
        };
        script.src = appendQuery(GOOGLE_SCRIPT_URL, {
          callback: callbackName,
          v: Date.now()
        });
        document.body.appendChild(script);
      });
    }

    function saveReplyToSheet(message){
      if(!GOOGLE_SCRIPT_URL) return Promise.reject(new Error('Google Script URL is missing.'));

      return new Promise(function(resolve, reject){
        const callbackName = 'monthsaryReplySaveCallback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
        const script = document.createElement('script');
        let finished = false;
        const timeout = setTimeout(function(){
          cleanup();
          reject(new Error('Google Sheet reply save timed out.'));
        }, 12000);

        function cleanup(){
          if(finished) return;
          finished = true;
          clearTimeout(timeout);
          delete window[callbackName];
          if(script.parentNode) script.parentNode.removeChild(script);
        }

        window[callbackName] = function(data){
          cleanup();
          if(!data || !data.ok){
            reject(new Error((data && data.error) || 'Could not save the reply.'));
            return;
          }
          resolve(data.reply || { message: message });
        };

        script.onerror = function(){
          cleanup();
          reject(new Error('Could not reach the Google Sheet saver.'));
        };
        script.src = appendQuery(GOOGLE_SCRIPT_URL, {
          action: 'save',
          message: message,
          page: window.location.pathname.split('/').pop() || 'story.html',
          callback: callbackName,
          v: Date.now()
        });
        document.body.appendChild(script);
      });
    }

    function openModal(){
      modalText.textContent = pageReplyMessage || '';
      modalScene.classList.remove('opened');
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
      modalEnvelope.focus();
    }

    function closeModal(){
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      modalScene.classList.remove('opened');
    }

    function openLetter(){
      modalScene.classList.add('opened');
    }

    loadReplyFromSheet().then(function(message){
      if(!message){
        pageReplyMessage = '';
        modalText.textContent = '';
        return;
      }
      pageReplyMessage = message;
      showSentState(message, 'page');
    }).catch(function(){});

    form.addEventListener('submit', function(e){
      e.preventDefault();
      const message = input.value.trim();
      if(!message) return;
      if(!GOOGLE_SCRIPT_URL){
        setStatus('Add your Google Apps Script URL in assets/config.js first.', true);
        return;
      }

      setStatus('Sending your letter...');
      saveReplyToSheet(message).then(function(reply){
        pageReplyMessage = reply && reply.message ? reply.message : message;
        showSentState(pageReplyMessage, 'page');
        setStatus('');
      }).catch(function(){
        setStatus('Could not save yet. Check the Google Apps Script deployment URL.', true);
      });
    });

    miniEnvelope.addEventListener('click', openModal);
    editBtn.addEventListener('click', function(){
      showFormState(pageReplyMessage);
    });
    modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){
      if(e.target === overlay) closeModal();
    });
    modalEnvelope.addEventListener('click', openLetter);
    modalEnvelope.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        openLetter();
      }
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && overlay.classList.contains('show')) closeModal();
    });
  }

  /* ============================================================
    14. REPLAY
    ============================================================ */
  document.getElementById('replay-btn').addEventListener('click', function(){
    if(musicEnabled){ bgAudio.pause(); }
    sessionStorage.removeItem('monthsaryUnlocked');
    sessionStorage.removeItem(MUSIC_TIME_KEY);
    sessionStorage.removeItem(MUSIC_SHOULD_PLAY_KEY);
    window.location.href = 'index.html';
  });

  if(sessionStorage.getItem('monthsaryUnlocked') !== 'yes'){
    window.location.replace('index.html');
  } else {
    startExperience();
  }

  })();
  
