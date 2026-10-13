document.addEventListener('DOMContentLoaded', () => {
  
  /* === PRESENTATION STATE === */
  let currentSlide = 1;
  const totalSlides = 17;
  
  const slideTitles = [
    "Title Slide",
    "Project Overview",
    "Dataset: Tatoeba Corpus",
    "Preprocessing Pipeline",
    "Tokenization Strategy",
    "Architecture Comparison Roadmap",
    "LSTM Seq2Seq (No Attention)",
    "Training: Teacher Forcing",
    "LSTM + Bahdanau Attention",
    "Decoder-Only Transformer",
    "Encoder-Decoder Transformer",
    "Comparative Analysis",
    "Training & Structural Insights",
    "Technical Implementation",
    "Research Conclusion",
    "Future Work & Extensions",
    "Questions & Discussion"
  ];

  /* === DOM ELEMENTS === */
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentSlideNumSpan = document.getElementById('current-slide-num');
  const totalSlidesNumSpan = document.getElementById('total-slides-num');
  const progressBar = document.getElementById('progress-bar');
  const dotsContainer = document.getElementById('dots-container');
  const restartBtn = document.getElementById('restart-presentation-btn');
  
  // Drawer / Menu elements
  const menuBtn = document.getElementById('menu-btn');
  const menuCloseBtn = document.getElementById('menu-close-btn');
  const menuOverlay = document.getElementById('menu-overlay');
  const slideMenu = document.getElementById('slide-menu');
  const menuListItems = document.getElementById('menu-list-items');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  /* === NAVIGATION FUNCTIONS === */
  function updatePresentation() {
    // Bounds check
    if (currentSlide < 1) currentSlide = 1;
    if (currentSlide > totalSlides) currentSlide = totalSlides;

    // Update slides visibility and transition states
    slides.forEach((slide) => {
      const index = parseInt(slide.dataset.slideIndex);
      slide.classList.remove('active-slide', 'prev-slide');
      
      if (index === currentSlide) {
        slide.classList.add('active-slide');
      } else if (index < currentSlide) {
        slide.classList.add('prev-slide');
      }
    });

    // Update Header counters
    currentSlideNumSpan.textContent = currentSlide;
    
    // Update progress bar
    const progressPercent = ((currentSlide - 1) / (totalSlides - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update dots navigation
    const dots = dotsContainer.querySelectorAll('.nav-dot');
    dots.forEach((dot, idx) => {
      if (idx + 1 === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Disable buttons on boundary
    prevBtn.disabled = (currentSlide === 1);
    nextBtn.disabled = (currentSlide === totalSlides);

    // Sync menu items
    const menuItems = menuListItems.querySelectorAll('.menu-item');
    menuItems.forEach((item, idx) => {
      if (idx + 1 === currentSlide) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updatePresentation();
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      currentSlide++;
      updatePresentation();
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      currentSlide--;
      updatePresentation();
    }
  }

  /* === BUILD UI CONTROLS === */
  // Build Navigation Dots
  dotsContainer.innerHTML = '';
  for (let i = 1; i <= totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'nav-dot';
    if (i === 1) dot.className += ' active';
    dot.title = `Go to slide ${i}: ${slideTitles[i-1]}`;
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  // Build Drawer Menu Items
  menuListItems.innerHTML = '';
  slideTitles.forEach((title, index) => {
    const slideNum = index + 1;
    const li = document.createElement('li');
    li.className = 'menu-item';
    if (slideNum === 1) li.className += ' active';
    
    li.innerHTML = `
      <span class="menu-index">${slideNum}</span>
      <span class="menu-title">${title}</span>
    `;
    
    li.addEventListener('click', () => {
      goToSlide(slideNum);
      closeMenu();
    });
    menuListItems.appendChild(li);
  });

  // Toggle Drawer Menu
  function openMenu() {
    slideMenu.classList.add('active');
    menuOverlay.classList.add('active');
  }

  function closeMenu() {
    slideMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
  }

  menuBtn.addEventListener('click', openMenu);
  menuCloseBtn.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', closeMenu);

  // Fullscreen mode toggle
  fullscreenBtn.addEventListener('click', () => {
    const container = document.getElementById('presentation');
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  // Keyboard navigation listeners
  document.addEventListener('keydown', (e) => {
    // Ignore keyboard events when typing inside text inputs/textareas
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
      e.preventDefault();
      prevSlide();
    }
  });

  // Navigation button listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  restartBtn.addEventListener('click', () => goToSlide(1));


  /* === SLIDE 4: INTERACTIVE PREPROCESSING PIPELINE === */
  let currentPrepStep = 1;
  const prepStepsText = {
    1: {
      input: '"Hello, <b>World</b>!"',
      output: '"Hello, World!"',
      desc: 'Step 1 (HTML Stripping): Standard regex filters strip code segments or markup, leaving clean prose.'
    },
    2: {
      input: '"Hello, World!"',
      output: '"hello, world!"',
      desc: 'Step 2 (Lowercasing): Folds characters to lower case. This ensures tokens like "Hello" and "hello" map together.'
    },
    3: {
      input: '"hello, world!"',
      output: '"hello , world !"',
      desc: 'Step 3 (Punctuation Splitting): Isolates punctuations with spaces, ensuring they compile as individual syntax weights.'
    },
    4: {
      input: '"hello , world !"',
      output: '"hello COMMA world EXCL"',
      desc: 'Step 4 (Special Token Mapping): Converts distinct punctuations to dedicated semantic tokens (COMMA, EXCL).'
    }
  };

  const prepItems = document.querySelectorAll('.pipeline-step-item');
  const prepOutput = document.getElementById('pipeline-state-output');
  const prevPrepBtn = document.getElementById('prev-prep-step');
  const nextPrepBtn = document.getElementById('next-prep-step');

  function updatePrepPipeline() {
    prepItems.forEach((item) => {
      const step = parseInt(item.dataset.step);
      if (step === currentPrepStep) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const stepData = prepStepsText[currentPrepStep];
    const rawValEl = document.querySelector('.raw-value');
    rawValEl.textContent = stepData.input;
    prepOutput.textContent = stepData.output;

    // Controls states
    prevPrepBtn.disabled = (currentPrepStep === 1);
    nextPrepBtn.disabled = (currentPrepStep === 4);
  }

  nextPrepBtn.addEventListener('click', () => {
    if (currentPrepStep < 4) {
      currentPrepStep++;
      updatePrepPipeline();
    }
  });

  prevPrepBtn.addEventListener('click', () => {
    if (currentPrepStep > 1) {
      currentPrepStep--;
      updatePrepPipeline();
    }
  });


  /* === SLIDE 9: INTERACTIVE ATTENTION HEATMAP === */
  const enTokens = ["The", "black", "cat", "sat", "on", "the", "mat", "."];
  const frTokens = ["Le", "chat", "noir", "s'est", "assis", "sur", "le", "tapis", "."];
  
  // Weight matrix highlighting alignment swap (black cat -> chat noir)
  // X: English (columns), Y: French (rows)
  const attentionWeights = [
    // The, black, cat, sat, on, the, mat, .
    [0.85, 0.05, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01], // Le
    [0.02, 0.10, 0.82, 0.02, 0.01, 0.01, 0.01, 0.01], // chat (cat -> chat is high)
    [0.02, 0.80, 0.10, 0.02, 0.01, 0.01, 0.01, 0.01], // noir (black -> noir is high)
    [0.01, 0.02, 0.03, 0.88, 0.02, 0.01, 0.01, 0.01], // s'est
    [0.01, 0.01, 0.02, 0.12, 0.81, 0.01, 0.01, 0.01], // assis
    [0.01, 0.01, 0.01, 0.01, 0.03, 0.15, 0.78, 0.01], // sur
    [0.02, 0.01, 0.01, 0.01, 0.01, 0.89, 0.03, 0.01], // le
    [0.01, 0.01, 0.01, 0.02, 0.01, 0.02, 0.90, 0.01], // tapis
    [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.94]  // .
  ];

  const heatmapGrid = document.getElementById('heatmap-grid');
  const heatmapTooltip = document.getElementById('heatmap-tooltip');

  function renderHeatmap() {
    // Grid size: 10 rows (1 label row + 9 data rows), 9 columns (1 label col + 8 data cols)
    heatmapGrid.style.gridTemplateColumns = `44px repeat(${enTokens.length}, 24px)`;
    heatmapGrid.style.gridTemplateRows = `20px repeat(${frTokens.length}, 24px)`;
    heatmapGrid.innerHTML = '';

    // Corner cell
    const corner = document.createElement('div');
    corner.className = 'heatmap-corner';
    heatmapGrid.appendChild(corner);

    // English Column headers
    for (let c = 0; c < enTokens.length; c++) {
      const colHeader = document.createElement('div');
      colHeader.className = 'heatmap-col-label';
      colHeader.textContent = enTokens[c];
      heatmapGrid.appendChild(colHeader);
    }

    // Grid data
    for (let r = 0; r < frTokens.length; r++) {
      // French Row header
      const rowHeader = document.createElement('div');
      rowHeader.className = 'heatmap-row-label';
      rowHeader.textContent = frTokens[r];
      heatmapGrid.appendChild(rowHeader);

      // Data cells
      for (let c = 0; c < enTokens.length; c++) {
        const weight = attentionWeights[r][c];
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.style.background = `rgba(123, 97, 255, ${weight})`;
        cell.style.borderColor = `rgba(255, 255, 255, ${weight * 0.3 + 0.02})`;
        
        // Tooltip and highlight details
        cell.addEventListener('mouseover', () => {
          heatmapTooltip.innerHTML = `
            <strong>Alignment Score</strong>: 
            <span class="text-blue">${enTokens[c]}</span> ↔ 
            <span class="text-purple">${frTokens[r]}</span> 
            <strong>(Weight: ${weight.toFixed(2)})</strong>
          `;
          cell.style.boxShadow = `0 0 10px rgba(123, 97, 255, 0.6)`;
          highlightHeaders(r, c, true);
        });

        cell.addEventListener('mouseleave', () => {
          heatmapTooltip.textContent = 'Hover over cells to see alignment scores';
          cell.style.boxShadow = 'none';
          highlightHeaders(r, c, false);
        });

        heatmapGrid.appendChild(cell);
      }
    }
  }

  function highlightHeaders(r, c, active) {
    const rowLabels = heatmapGrid.querySelectorAll('.heatmap-row-label');
    const colLabels = heatmapGrid.querySelectorAll('.heatmap-col-label');
    if (active) {
      rowLabels[r].classList.add('active-label');
      colLabels[c].classList.add('active-label');
    } else {
      rowLabels[r].classList.remove('active-label');
      colLabels[c].classList.remove('active-label');
    }
  }

  renderHeatmap();


  /* === SLIDE 14: CODE TAB SWITCHER === */
  const codeTabs = document.querySelectorAll('.code-tab');
  const codeSnippets = document.querySelectorAll('.code-content');

  codeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      codeTabs.forEach(t => t.classList.remove('active'));
      // Add active to current
      tab.classList.add('active');

      // Hide all code snippets
      codeSnippets.forEach(snip => snip.classList.remove('active'));
      
      // Show active snippet
      const targetSnippetId = `code-${tab.dataset.code}`;
      const targetSnippet = document.getElementById(targetSnippetId);
      if (targetSnippet) {
        targetSnippet.classList.add('active');
      }
    });
  });

  // Initial presentation state boot
  updatePresentation();
});
