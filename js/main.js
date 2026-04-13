document.addEventListener('DOMContentLoaded', () => {
  // ===== Mobile Menu Toggle =====
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });
  }

  // ===== Dark Mode Toggle =====
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const icon = themeToggle ? themeToggle.querySelector('i') : null;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.setAttribute('data-theme', 'dark');
    if (icon) icon.className = 'fas fa-sun';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (root.getAttribute('data-theme') === 'dark') {
        root.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (icon) icon.className = 'fas fa-moon';
      } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (icon) icon.className = 'fas fa-sun';
      }
    });
  }

  // ===== Header Shadow on Scroll =====
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ===== Scroll Fade-In Observer =====
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ===== Subject Search Engine =====
  const searchInput = document.getElementById('subject-search');
  const searchResults = document.getElementById('search-results');

  if (searchInput && searchResults) {
    const slugify = (text) => text.replace(/\(.*?\)/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const searchableSubjects = [];
    const subjectsData = {
      1: ["Engineering Mathematics-1", "Engineering Physics", "Basic Electrical Engineering", "Engineering Chemistry", "Basic Mechanical Engineering", "Communication Skills"],
      2: ["Engineering Mathematics-2", "Programming for Problem Solving (C Language)", "Basic Electronics Engineering", "Engineering Graphics", "Environmental Studies", "Workshop Practice"],
      3: ["Engineering Mathematics-3", "Data Structures", "Digital Electronics", "Object Oriented Programming (C++)", "Discrete Mathematics", "Data Structures Lab"],
      4: ["Computer Organization and Architecture", "Microprocessor", "Theory of Computation", "Database Management Systems (DBMS)", "Probability and Statistics", "Microprocessor Lab"],
      5: ["Operating System", "Computer Networks", "Software Engineering", "Design and Analysis of Algorithms", "Department Elective-1", "Operating System Lab"],
      6: ["Compiler Design", "Machine Learning", "Web Technology", "Department Elective-2", "Department Elective-3", "Machine Learning Lab"],
      7: ["Artificial Intelligence", "Cloud Computing", "Open Elective-1", "Department Elective-4", "Minor Project", "Seminar"],
      8: ["Major Project", "Industrial Training", "Open Elective-2", "Department Elective-5", "Project Phase-2", "Comprehensive Viva"]
    };

    const aliases = {
      "os": "Operating System", "dbms": "Database Management Systems (DBMS)",
      "cn": "Computer Networks", "ai": "Artificial Intelligence",
      "ml": "Machine Learning", "ds": "Data Structures",
      "daa": "Design and Analysis of Algorithms", "toc": "Theory of Computation",
      "se": "Software Engineering", "cd": "Compiler Design",
      "coa": "Computer Organization and Architecture",
      "oop": "Object Oriented Programming (C++)",
      "dm": "Discrete Mathematics", "pps": "Programming for Problem Solving (C Language)"
    };

    for (const [sem, subs] of Object.entries(subjectsData)) {
      subs.forEach(name => {
        searchableSubjects.push({ name, sem: parseInt(sem), slug: slugify(name) });
      });
    }

    let highlightIdx = -1;

    function renderResults(query) {
      const q = query.toLowerCase().trim();
      if (!q) { searchResults.classList.remove('active'); return; }

      let results = [];
      const aliasMatch = aliases[q];
      if (aliasMatch) {
        results = searchableSubjects.filter(s => s.name === aliasMatch);
      }
      if (results.length === 0) {
        results = searchableSubjects.filter(s => s.name.toLowerCase().includes(q));
      }
      if (results.length === 0) {
        for (const [abbr, fullName] of Object.entries(aliases)) {
          if (abbr.includes(q)) {
            const match = searchableSubjects.find(s => s.name === fullName);
            if (match && !results.find(r => r.name === match.name)) results.push(match);
          }
        }
      }

      highlightIdx = -1;

      if (results.length === 0) {
        searchResults.innerHTML = '<li class="no-result">No subjects found. Try a different keyword.</li>';
        searchResults.classList.add('active');
        return;
      }

      searchResults.innerHTML = results.slice(0, 8).map((s, i) => `
        <li data-href="subject.html?sem=${s.sem}&sub=${encodeURIComponent(s.name)}" data-idx="${i}">
          <div class="result-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="result-text">
            <strong>${s.name}</strong>
            <span>Semester ${s.sem}</span>
          </div>
        </li>
      `).join('');
      searchResults.classList.add('active');

      searchResults.querySelectorAll('li[data-href]').forEach(li => {
        li.addEventListener('click', () => { window.location.href = li.dataset.href; });
      });
    }

    searchInput.addEventListener('input', () => renderResults(searchInput.value));

    searchInput.addEventListener('keydown', (e) => {
      const items = searchResults.querySelectorAll('li[data-href]');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightIdx = Math.min(highlightIdx + 1, items.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightIdx = Math.max(highlightIdx - 1, 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightIdx >= 0 && items[highlightIdx]) {
          window.location.href = items[highlightIdx].dataset.href;
        } else if (items.length > 0) {
          window.location.href = items[0].dataset.href;
        }
        return;
      } else if (e.key === 'Escape') {
        searchResults.classList.remove('active');
        searchInput.blur();
        return;
      }

      items.forEach(i => i.classList.remove('highlighted'));
      if (items[highlightIdx]) {
        items[highlightIdx].classList.add('highlighted');
        items[highlightIdx].scrollIntoView({ block: 'nearest' });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        searchResults.classList.remove('active');
      }
    });
  }

  // ===== URL Routing =====
  const urlParams = new URLSearchParams(window.location.search);
  const semParam = urlParams.get('sem');
  const subjectParam = urlParams.get('sub') || urlParams.get('subject');

  const subjects = {
    1: [
      "Engineering Mathematics-1", "Engineering Physics", "Basic Electrical Engineering",
      "Engineering Chemistry", "Basic Mechanical Engineering", "Communication Skills"
    ],
    2: [
      "Engineering Mathematics-2", "Programming for Problem Solving (C Language)", "Basic Electronics Engineering",
      "Engineering Graphics", "Environmental Studies", "Workshop Practice"
    ],
    3: [
      "Engineering Mathematics-3", "Data Structures", "Digital Electronics",
      "Object Oriented Programming (C++)", "Discrete Mathematics", "Data Structures Lab"
    ],
    4: [
      "Computer Organization and Architecture", "Microprocessor", "Theory of Computation",
      "Database Management Systems (DBMS)", "Probability and Statistics", "Microprocessor Lab"
    ],
    5: [
      "Operating System", "Computer Networks", "Software Engineering",
      "Design and Analysis of Algorithms", "Department Elective-1", "Operating System Lab"
    ],
    6: [
      "Compiler Design", "Machine Learning", "Web Technology",
      "Department Elective-2", "Department Elective-3", "Machine Learning Lab"
    ],
    7: [
      "Artificial Intelligence", "Cloud Computing", "Open Elective-1",
      "Department Elective-4", "Minor Project", "Seminar"
    ],
    8: [
      "Major Project", "Industrial Training", "Open Elective-2",
      "Department Elective-5", "Project Phase-2", "Comprehensive Viva"
    ]
  };

  // ===== Semester Page: Dynamic Subject Grid =====
  if (semParam) {
    const semTitleElements = document.querySelectorAll('.dynamic-sem-title');
    semTitleElements.forEach(el => el.textContent = 'Semester ' + semParam);

    // Update page title for SEO
    if (document.title.includes('Semester Subjects')) {
      document.title = `Semester ${semParam} Subjects - RTU CS/IT Notes`;
    }

    const subjectGrid = document.getElementById('subject-grid');
    if (subjectGrid && subjects[semParam]) {
      subjectGrid.innerHTML = '';
      subjects[semParam].forEach((sub, i) => {
        const a = document.createElement('a');
        a.href = `subject.html?sem=${semParam}&sub=${encodeURIComponent(sub)}`;
        a.className = 'card fade-in';
        a.innerHTML = `
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <h3>${sub}</h3>
          <p>Click for notes</p>
        `;
        // Stagger animation
        a.style.animationDelay = `${i * 0.05}s`;
        subjectGrid.appendChild(a);

        // Trigger fade-in via observer
        if ('IntersectionObserver' in window) {
          const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
              }
            });
          }, { threshold: 0.1 });
          obs.observe(a);
        } else {
          a.classList.add('visible');
        }
      });
    }
  }

  // ===== Subject Page: Dynamic Unit Detection =====
  if (subjectParam) {
    const subTitleElements = document.querySelectorAll('.dynamic-sub-title');
    const decodedSub = decodeURIComponent(subjectParam);
    subTitleElements.forEach(el => el.textContent = decodedSub);

    // Update page title for SEO
    document.title = `${decodedSub} Notes - RTU CS/IT Notes`;

    const unitGrid = document.getElementById('dynamic-unit-grid');
    if (unitGrid) {
      unitGrid.innerHTML = '<p style="text-align: center; color: var(--text-sec); padding: 2rem;">Checking for available notes...</p>';

      const subjectSlug = decodedSub
        .replace(/\(.*?\)/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const units = [1, 2, 3, 4, 5];

      Promise.all(units.map(async (unitNum) => {
        const path = `notes/semester-${semParam}/${subjectSlug}/unit-${unitNum}.pdf`;
        let exists = false;
        try {
          const response = await fetch(path, { method: 'HEAD' });
          if (response.ok) exists = true;
        } catch (e) { /* network error */ }
        return { unitNum, path, exists };
      })).then(results => {
        unitGrid.innerHTML = '';

        results.forEach(({ unitNum, path, exists }) => {
          const card = document.createElement('div');
          card.className = 'unit-card fade-in';

          if (exists) {
            card.innerHTML = `
              <div class="unit-info">
                <div class="unit-number">${unitNum}</div>
                <div>
                  <h4>Unit ${unitNum}</h4>
                  <p>Handwritten notes available</p>
                </div>
              </div>
              <a href="${path}" target="_blank" class="btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </a>
            `;
          } else {
            card.innerHTML = `
              <div class="unit-info">
                <div class="unit-number" style="opacity: 0.5;">${unitNum}</div>
                <div>
                  <h4>Unit ${unitNum}</h4>
                  <p style="color: var(--text-sec);">Notes will be uploaded soon</p>
                </div>
              </div>
              <button class="btn btn-outline" disabled style="opacity: 0.5; cursor: not-allowed;">Coming Soon</button>
            `;
          }
          unitGrid.appendChild(card);

          // Trigger fade-in
          requestAnimationFrame(() => card.classList.add('visible'));
        });

        // Fallback message
        const msg = document.createElement('p');
        msg.style.cssText = 'text-align: center; color: var(--text-sec); margin-top: 0.5rem; font-size: 0.875rem;';
        msg.textContent = 'If notes are not available yet, they will be uploaded soon.';
        unitGrid.appendChild(msg);
      });
    }
  }
});
