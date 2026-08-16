"use strict";
(function(){
  if(!monthsaryRequireUnlocked()) return;
  const cfg = window.MONTHSARY;
  const music = window.MonthsaryMusic;
  document.getElementById('hero-months').textContent = cfg.MONTHSARY_NUMBER + ' Months of Us';
  document.getElementById('hero-names').textContent = cfg.YOUR_NAME + ' ❤️ ' + cfg.PARTNER_NAME;
  document.getElementById('experience').classList.add('revealed');
  if(music && music.enabled()) music.pause();

  function openStoryPage(){
    document.body.classList.add('story-opening');
    sessionStorage.setItem('monthsaryUnlocked', 'yes');
    sessionStorage.setItem('monthsaryAutoplayMusic', 'yes');
    const goToStory = function(){ window.location.href = 'story.html'; };
    if(music) music.play().finally(function(){ setTimeout(goToStory, 180); });
    else setTimeout(goToStory, 180);
  }

  document.getElementById('open-story-btn').addEventListener('click', openStoryPage);
  document.getElementById('open-story-arrow').addEventListener('click', openStoryPage);
})();
