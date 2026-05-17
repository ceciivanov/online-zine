let carousels = { work: 0, film: 0 };

function carouselNav(section, direction) {
  // Hide swipe hint on first interaction
  const hint = document.getElementById(`${section}-hint`);
  if (hint && !hint.classList.contains('hidden')) {
    hint.classList.add('hidden');
    localStorage.setItem(`${section}-hint-seen`, 'true');
  }
  
  const container = document.querySelector(`#${section} .carousel-container`);
  const slides = container.querySelectorAll('.carousel-slide');
  const total = slides.length;
  const oldIndex = carousels[section];
  
  carousels[section] += direction;
  if (carousels[section] < 0) carousels[section] = 0;
  if (carousels[section] >= total) carousels[section] = total - 1;
  
  const newIndex = carousels[section];
  
  // Only animate if we actually changed slides
  if (oldIndex !== newIndex) {
    const oldSlide = slides[oldIndex];
    const newSlide = slides[newIndex];
    
    // Add transitioning class for animations
    oldSlide.classList.add('transitioning');
    newSlide.classList.add('transitioning');
    
    // Remove old slide with directional animation
    oldSlide.classList.remove('active');
    if (direction > 0) {
      oldSlide.classList.add('slide-out-left');
    } else {
      oldSlide.classList.add('slide-out-right');
    }
    
    // Prepare new slide from opposite direction
    if (direction > 0) {
      newSlide.classList.add('slide-in-right');
    } else {
      newSlide.classList.add('slide-in-left');
    }
    
    // Trigger reflow then activate new slide
    void newSlide.offsetHeight;
    
    setTimeout(() => {
      newSlide.classList.remove('slide-in-left', 'slide-in-right');
      newSlide.classList.add('active');
      
      // Clean up old slide classes
      setTimeout(() => {
        oldSlide.classList.remove('slide-out-left', 'slide-out-right');
      }, 400);
    }, 10);
  }
  
  updateArrowStates(section, total);
}

function updateArrowStates(section, total) {
  const prevArrow = document.getElementById(`${section}-prev`);
  const nextArrow = document.getElementById(`${section}-next`);
  
  prevArrow.classList.toggle('disabled', carousels[section] === 0);
  nextArrow.classList.toggle('disabled', carousels[section] === total - 1);
}

function show(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  const navLinks = document.querySelector('.nav-links');
  id === 'home' ? navLinks.classList.add('hidden') : navLinks.classList.remove('hidden');
  window.scrollTo(0, 0);
  
  // Update URL hash
  window.location.hash = id === 'home' ? '' : id;
  
  // Restore carousel position if returning to work/film
  if (id === 'work' || id === 'film') {
    const container = document.querySelector(`#${id} .carousel-container`);
    const slides = container.querySelectorAll('.carousel-slide');
    const currentIndex = carousels[id];
    
    // Clean up all transition classes first
    slides.forEach((slide) => {
      slide.classList.remove('active', 'slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
    });
    
    // Then activate the correct slide
    slides[currentIndex].classList.add('active');
    updateArrowStates(id, slides.length);
  }
  
  // Force animation retrigger for all pages
  if (id === 'thoughts' || id === 'about') {
    const wrap = document.querySelector(`#${id} .thoughts-wrap, #${id} .about-wrap`);
    if (wrap) {
      wrap.style.animation = 'none';
      void wrap.offsetHeight;
      wrap.style.animation = '';
    }
  } else if (id === 'work' || id === 'film') {
    const wrap = document.querySelector(`#${id} .carousel-wrap`);
    if (wrap) {
      wrap.style.animation = 'none';
      void wrap.offsetHeight;
      wrap.style.animation = '';
    }
  }
}

// Load correct page on initial load/refresh based on URL hash
window.addEventListener('DOMContentLoaded', () => {
  // Clean up all carousel slides on initial load
  document.querySelectorAll('.carousel-slide').forEach(slide => {
    slide.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
  });
  
  // Small delay to ensure CSS is fully loaded (helps with external browser quirks)
  setTimeout(() => {
    const hash = window.location.hash.slice(1);
    const validPages = ['work', 'film', 'thoughts', 'about'];
    if (hash && validPages.includes(hash)) {
      show(hash);
    } else {
      // Initialize arrow states for home page
      updateArrowStates('work', 7);
      updateArrowStates('film', 7);
    }
    
    // Hide swipe hints if already seen
    if (localStorage.getItem('work-hint-seen')) {
      const workHint = document.getElementById('work-hint');
      if (workHint) workHint.classList.add('hidden');
    }
    if (localStorage.getItem('film-hint-seen')) {
      const filmHint = document.getElementById('film-hint');
      if (filmHint) filmHint.classList.add('hidden');
    }
  }, 50);
});

let lbPhotos = [];
let lbIndex = 0;

function openLightbox(src, caption) {
  const activePage = document.querySelector('.page.active').id;
  
  if (activePage === 'thoughts' || activePage === 'about' || activePage === 'home') {
    // Simple single-photo lightbox for non-carousel pages
    lbPhotos = [{ src, caption }];
    lbIndex = 0;
  } else {
    // Full photo list for carousel pages
    buildLbPhotos();
    lbIndex = lbPhotos.findIndex(p => p.src.includes(src.split('/').pop()));
    if (lbIndex === -1) lbIndex = 0;
  }
  
  setLbPhoto(lbPhotos[lbIndex].src, lbPhotos[lbIndex].caption);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  updateLbArrows();
}

function buildLbPhotos() {
  const activePage = document.querySelector('.page.active').id;
  lbPhotos = [];
  if (activePage === 'work' || activePage === 'film') {
    document.querySelectorAll(`#${activePage} .carousel-img`).forEach(img => {
      const parent = img.closest('.carousel-slide');
      const caption = parent.querySelector('.caption-text').textContent;
      lbPhotos.push({ src: img.src, caption });
    });
  }
}

function setLbPhoto(src, caption) {
  const img = document.getElementById('lb-img');
  const captionEl = document.getElementById('lb-caption');
  
  img.src = src;
  
  // Reset caption completely
  captionEl.style.animation = 'none';
  captionEl.style.opacity = '0';
  captionEl.textContent = caption;
  
  // Force reflow
  void captionEl.offsetHeight;
  
  // Re-enable animation
  captionEl.style.animation = '';
  captionEl.style.opacity = '';
}

function lbNav(dir) {
  const next = lbIndex + dir;
  if (next < 0 || next >= lbPhotos.length) return;
  lbIndex = next;
  setLbPhoto(lbPhotos[lbIndex].src, lbPhotos[lbIndex].caption);
  updateLbArrows();
}

function updateLbArrows() {
  document.getElementById('lb-prev').classList.toggle('hidden', lbIndex === 0);
  document.getElementById('lb-next').classList.toggle('hidden', lbIndex === lbPhotos.length - 1);
}

function closeLightbox(e) {
  if (e && e.target === document.getElementById('lb-img')) return;
  
  // Sync carousel to the photo we were viewing in lightbox BEFORE closing
  const activePage = document.querySelector('.page.active').id;
  if (activePage === 'work' || activePage === 'film') {
    carousels[activePage] = lbIndex;
    const container = document.querySelector(`#${activePage} .carousel-container`);
    const slides = container.querySelectorAll('.carousel-slide');
    
    // Clean up all transition classes first
    slides.forEach((slide) => {
      slide.classList.remove('active', 'slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
    });
    
    // Then activate the correct slide
    slides[lbIndex].classList.add('active');
    updateArrowStates(activePage, slides.length);
  }
  
  // Small delay so carousel updates before lightbox fades out
  setTimeout(() => {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }, 10);
}

document.addEventListener('keydown', e => {
  const activePage = document.querySelector('.page.active').id;
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lbNav(1);
    if (e.key === 'ArrowLeft') lbNav(-1);
  } else if (activePage === 'work' || activePage === 'film') {
    if (e.key === 'ArrowRight') carouselNav(activePage, 1);
    if (e.key === 'ArrowLeft') carouselNav(activePage, -1);
  }
});

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  const activePage = document.querySelector('.page.active').id;
  if (activePage === 'work' || activePage === 'film') {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }
}, false);

document.addEventListener('touchmove', e => {
  const activePage = document.querySelector('.page.active').id;
  if (activePage === 'work' || activePage === 'film') {
    // Prevent default scroll when swiping horizontally
    const touchCurrentX = e.changedTouches[0].screenX;
    const touchCurrentY = e.changedTouches[0].screenY;
    const diffX = Math.abs(touchCurrentX - touchStartX);
    const diffY = Math.abs(touchCurrentY - touchStartY);
    
    // If horizontal swipe is more dominant than vertical, prevent scroll
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }
}, { passive: false });

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, false);

function handleSwipe() {
  // Don't handle swipes when lightbox is open
  if (document.getElementById('lightbox').classList.contains('open')) return;
  
  const activePage = document.querySelector('.page.active').id;
  if (activePage !== 'work' && activePage !== 'film') return;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? carouselNav(activePage, 1) : carouselNav(activePage, -1);
  }
}

document.querySelector('.nav-links').classList.add('hidden');