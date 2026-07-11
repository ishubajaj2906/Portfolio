document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // MOBILE NAVIGATION
    // ==========================================================================
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('open');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('open');
            });
        });
    }

    // ==========================================================================
    // INTERSECTION OBSERVER FOR SECTION ANIMATIONS
    // ==========================================================================
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-link');
    
    // Tracks if specific sections have already run their custom animations
    const animationTracker = {
        skills: false,
        contact: false,
        achievements: false
    };

    const sectionObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                entry.target.classList.add('active');

                // Update navigation active states
                updateActiveNavLink(sectionId);

                // Run section-specific custom animations
                if (sectionId === 'skills' && !animationTracker.skills) {
                    animateSkillsSection(entry.target);
                    animationTracker.skills = true;
                }
                if (sectionId === 'contact' && !animationTracker.contact) {
                    animateContactFormLines(entry.target);
                    animationTracker.contact = true;
                }
                if (sectionId === 'achievements' && !animationTracker.achievements) {
                    animateStatsCounters(entry.target);
                    animationTracker.achievements = true;
                }
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Helper to update active nav links
    function updateActiveNavLink(activeSectionId) {
        navItems.forEach(item => {
            const href = item.getAttribute('href').substring(1);
            if (href === activeSectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Trigger landing animations immediately on load since it is visible first
    const landingSection = document.getElementById('landing');
    if (landingSection) {
        setTimeout(() => {
            landingSection.classList.add('active');
        }, 100);
    }

    // ==========================================================================
    // SKILLS SECTION ANIMATION (COUNT-UP & PROGRESS BARS)
    // ==========================================================================
    function animateSkillsSection(skillsSection) {
        const progressBars = skillsSection.querySelectorAll('.bar-fill');
        const percentages = skillsSection.querySelectorAll('.percentage');

        percentages.forEach((perc, index) => {
            const targetVal = parseInt(perc.getAttribute('data-value'), 10);
            const bar = progressBars[index];

            // Trigger progress bar filling
            if (bar) {
                bar.style.width = targetVal + '%';
            }

            // Animate percentage count-up
            let currentVal = 0;
            const duration = 1200; // 1.2 seconds total animation time
            const increment = targetVal / (duration / 16); // ~60fps frame time

            function updateCounter() {
                currentVal += increment;
                if (currentVal >= targetVal) {
                    perc.textContent = targetVal + '%';
                } else {
                    perc.textContent = Math.floor(currentVal) + '%';
                    requestAnimationFrame(updateCounter);
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    // ==========================================================================
    // ACHIEVEMENTS SECTION STATS COUNTER ANIMATION
    // ==========================================================================
    function animateStatsCounters(achievementsSection) {
        const statCards = achievementsSection.querySelectorAll('.stat-card');

        statCards.forEach((card, index) => {
            const valEl = card.querySelector('.stat-value');
            const originalText = valEl.textContent.trim();
            
            // Extract numbers and suffixes (e.g. "1+" -> target: 1, suffix: "+")
            const hasPlus = originalText.includes('+');
            const targetNum = parseInt(originalText.replace('+', ''), 10);
            
            if (isNaN(targetNum)) return;

            let currentNum = 0;
            const duration = 1500; // 1.5 seconds count duration
            const increment = targetNum / (duration / 16);

            // Add delay cascade for each card
            setTimeout(() => {
                function updateStat() {
                    currentNum += increment;
                    if (currentNum >= targetNum) {
                        valEl.textContent = targetNum + (hasPlus ? '+' : '');
                    } else {
                        valEl.textContent = Math.floor(currentNum) + (hasPlus ? '+' : '');
                        requestAnimationFrame(updateStat);
                    }
                }
                requestAnimationFrame(updateStat);
            }, index * 150); // Stagger stat counting
        });
    }

    // ==========================================================================
    // CONTACT FORM SEQUENTIAL UNDERLINE ANIMATION
    // ==========================================================================
    function animateContactFormLines(contactSection) {
        const formGroups = contactSection.querySelectorAll('.form-group');
        const submitBtn = contactSection.querySelector('.btn-submit');

        if (!formGroups.length) return;

        formGroups.forEach((group, index) => {
            // Draw underlines sequentially
            setTimeout(() => {
                group.classList.add('draw-line');

                // If it is the last field, trigger the send button pulse
                if (index === formGroups.length - 1 && submitBtn) {
                    setTimeout(() => {
                        submitBtn.classList.remove('animate-pulse'); // Remove continuous pulse
                        submitBtn.classList.add('animate-pulse-once'); // Trigger single pop
                    }, 600);
                }
            }, index * 250 + 300); // 300ms delay, then 250ms spacing
        });
    }

    // ==========================================================================
    // SMOOTH SCROLL FOR BUTTONS AND WORK NAV LINKS
    // ==========================================================================
    const allLinks = document.querySelectorAll('a[href^="#"]');
    
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                const headerOffset = 80; // height of our fixed navbar
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================================================
    // CONTACT FORM INTERACTIVE FOCUS AND VALIDATION
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                e.preventDefault();
                alert('Please fill out all the fields before sending!');
            }
            // Form uses native action="mailto:..." with enctype="text/plain" 
            // to send values directly via mail client as requested.
        });
    }
});
