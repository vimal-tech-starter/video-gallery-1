const accessTikon = 'fc4fd88fc9eaf8fcd1887b9be59ddf49'; // Replace with your Vimeo Access Token
const userId = 'user247310431'; // Replace with your Vimeo User ID
const gallery = document.getElementById('video-gallery');

let activeIframe = null; // track current player

// Smoothly remove a thumbnail (non-blocking)
function removeThumbnail(thumb, delay = 0) {
  setTimeout(() => {
    thumb.classList.add('fade-out');
    thumb.addEventListener('animationend', () => thumb.remove());
  }, delay);
}

// Clear gallery but let old thumbs fade out while new ones fade in
function fadeOutExistingThumbs() {
  const thumbs = document.querySelectorAll('.video-thumb');
  thumbs.forEach((thumb, index) => {
    removeThumbnail(thumb, index * 100);
  });
}

// Open Vimeo video directly in fullscreen
function openFullscreenVimeo(videoId) {
  if (activeIframe) activeIframe.remove(); // safety

  const iframe = document.createElement('iframe');
  iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
  iframe.allow = "autoplay; fullscreen";
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.zIndex = "1000";

  document.body.appendChild(iframe);
  activeIframe = iframe;

  // Add a floating close button ❌
  closeButton = document.createElement("button");
  closeButton.innerHTML = "✖";
  closeButton.style.position = "fixed";
  closeButton.style.top = "15px";
  closeButton.style.right = "20px";
  closeButton.style.zIndex = "1100";
  closeButton.style.fontSize = "28px";
  closeButton.style.background = "rgba(0,0,0,0.6)";
  closeButton.style.color = "#fff";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "50%";
  closeButton.style.width = "45px";
  closeButton.style.height = "45px";
  closeButton.style.cursor = "pointer";
  closeButton.style.display = "flex";
  closeButton.style.alignItems = "center";
  closeButton.style.justifyContent = "center";
  closeButton.style.transition = "background 0.3s";
  closeButton.onmouseover = () => closeButton.style.background = "rgba(255,0,0,0.8)";
  closeButton.onmouseout = () => closeButton.style.background = "rgba(0,0,0,0.6)";
  closeButton.onclick = () => closeVimeoPlayer();

  document.body.appendChild(closeButton);

  // Request fullscreen if supported
  if (iframe.requestFullscreen) iframe.requestFullscreen();

  // Remove iframe if ESC is pressed
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVimeoPlayer();
  });

  // Remove iframe when fullscreen exits
  ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"]
    .forEach(eventType => {
      document.addEventListener(eventType, () => {
        if (!document.fullscreenElement &&
          !document.webkitFullscreenElement &&
          !document.mozFullScreenElement &&
          !document.msFullscreenElement) {
          closeVimeoPlayer();
        }
      });
    });
}

// Close Vimeo player safely
function closeVimeoPlayer() {
  if (activeIframe) {
    activeIframe.remove();
    activeIframe = null;
  }
  if (closeButton) {
    closeButton.remove();
    closeButton = null;
  }
  if (document.exitFullscreen) document.exitFullscreen();
}

// Load Vimeo videos with blended fade-out + fade-in
async function loadVimeoVideos() {
  try {
    fadeOutExistingThumbs();

    const response = await fetch(`https://api.vimeo.com/users/${userId}/videos`, {
      headers: { 'Authorization': `Bearer ${accessTikon}` }
    });

    const data = await response.json();

    data.data.forEach((video, index) => {
      const videoId = video.uri.split('/').pop();
      const thumbnailUrl = video.pictures.sizes[3].link;

      const thumb = document.createElement('div');
      thumb.classList.add('video-thumb');
      thumb.innerHTML = `<img src="${thumbnailUrl}" alt="${video.name}">`;

      // Fade-in stagger
      thumb.style.animation = `fadeInThumb 0.8s forwards`;
      thumb.style.animationDelay = `${index * 0.1}s`;

      thumb.addEventListener('click', () => {
        openFullscreenVimeo(videoId);
      });

      gallery.appendChild(thumb);
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
}

// Run on page load
loadVimeoVideos();