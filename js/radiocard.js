/* August — Radio Card (Card 4) interactivity */
document.addEventListener("DOMContentLoaded", () => {
  const radioCard = document.querySelector(".card-stack__card--radio");
  if (!radioCard) return;

  const covers = [...radioCard.querySelectorAll("[data-radio-vol]")];
  const playBtn = radioCard.querySelector("[data-radio-play]");
  const playIcon = playBtn?.querySelector(".radio-hero__play-icon");
  const pauseIcon = playBtn?.querySelector(".radio-hero__pause-icon");
  const titleEl = radioCard.querySelector("[data-radio-title]");
  const subEl = radioCard.querySelector("[data-radio-sub]");
  const radioWrapper = radioCard.querySelector(".radio-card");

  const sitePlayer = document.querySelector("[data-player]");
  const siteAudio = sitePlayer?.querySelector("[data-player-audio]");
  const sitePlayBtn = sitePlayer?.querySelector("[data-player-play]");

  const tracks = [
    { title: "AUGUST RADIO — VOL. 14", sub: "Madison After Hours" },
    { title: "AUGUST RADIO — VOL. 15", sub: "State Street Mix" },
    { title: "AUGUST RADIO — VOL. 16", sub: "Late Light" },
  ];

  let currentVol = 0;

  const setActiveCover = (idx) => {
    covers.forEach((c, i) => c.classList.toggle("is-active", i === idx));
    currentVol = idx;
    if (titleEl) titleEl.textContent = tracks[idx].title;
    if (subEl) subEl.textContent = tracks[idx].sub;
  };

  const syncPlayState = () => {
    if (!siteAudio) return;
    const playing = !siteAudio.paused;
    if (radioWrapper) radioWrapper.classList.toggle("is-playing", playing);
    if (playIcon) playIcon.hidden = playing;
    if (pauseIcon) pauseIcon.hidden = !playing;
  };

  covers.forEach((cover) => {
    cover.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = Number(cover.getAttribute("data-radio-vol"));
      setActiveCover(idx);

      if (sitePlayBtn) {
        const trackBtns = sitePlayer.querySelectorAll("[data-track]");
        const targetBtn = trackBtns[idx];
        if (targetBtn) targetBtn.click();
      }

      setTimeout(syncPlayState, 100);
    });
  });

  if (playBtn) {
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (sitePlayBtn) sitePlayBtn.click();
      setTimeout(syncPlayState, 100);
    });
  }

  if (siteAudio) {
    siteAudio.addEventListener("play", syncPlayState);
    siteAudio.addEventListener("pause", syncPlayState);
    siteAudio.addEventListener("ended", syncPlayState);
  }

  setActiveCover(0);
});
