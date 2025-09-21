const accessTikon = 'fc4fd88fc9eaf8fcd1887b9be59ddf49'; // Replace with your Vimeo Access Token
const userId = 'user247310431'; // Replace with your Vimeo User ID
const gallery = document.getElementById('video-gallery');

async function loadVimeoVideos() {
  try {
    const response = await fetch(`https://api.vimeo.com/users/${userId}/videos`, {
      headers: {
        'Authorization': `Bearer ${accessTikon}`
      }
    });

    const data = await response.json();

    data.data.forEach(video => {
      const videoId = video.uri.split('/').pop();
      const thumbnailUrl = video.pictures.sizes[3].link; // Medium thumbnail

      const thumb = document.createElement('div');
      thumb.classList.add('video-thumb');
      thumb.innerHTML = `<img src="${thumbnailUrl}" alt="${video.name}">`;

      thumb.addEventListener('click', () => {
        openFullscreenVimeo(videoId);
      });

      gallery.appendChild(thumb);
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
}

// Function to open fullscreen Vimeo embed
function openFullscreenVimeo(videoId) {
  const iframe = document.createElement('iframe');
  iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  iframe.allow = "autoplay; fullscreen";
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "0";
  iframe.style.zIndex = "10000";

  document.body.appendChild(iframe);

  if (iframe.requestFullscreen) {
    iframe.requestFullscreen();
  } else if (iframe.webkitRequestFullscreen) {
    iframe.webkitRequestFullscreen();
  } else if (iframe.msRequestFullscreen) {
    iframe.msRequestFullscreen();
  }

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      iframe.remove();
    }
  });
}

loadVimeoVideos();
