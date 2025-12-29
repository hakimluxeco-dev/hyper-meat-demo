import './style.css'

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavbar();
    initSpecials();
    initContactForm();
    initLightbox();
    initPWA();
    initMobileMenu();
});

function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');

    if (btn && nav) {
        btn.addEventListener('click', () => {
            nav.classList.toggle('active');
            // Toggle icon
            const icon = btn.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = btn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

function initPWA() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker Registered'));
    }

    // Install Prompt Logic
    let deferredPrompt;
    const installBanner = document.getElementById('install-banner');
    const installBtn = document.getElementById('install-btn');
    const closeBtn = document.getElementById('close-install');

    if (!installBanner || !installBtn) return;

    // Helper: Check if we should show the banner
    const shouldShowBanner = () => {
        const dismissedTime = localStorage.getItem('pwaDismissedTime');
        if (!dismissedTime) return true;

        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        return (now - parseInt(dismissedTime)) > oneHour;
    };

    // Helper: Show Banner function
    const showBanner = () => {
        if (shouldShowBanner()) {
            installBanner.style.display = 'flex';

            // Platform detection for text
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.includes('android')) {
                installBtn.innerHTML = '<i class="fab fa-android"></i> Install for Android';
            } else if (userAgent.includes('windows') || userAgent.includes('mac')) {
                installBtn.innerHTML = '<i class="fas fa-desktop"></i> Install App';
            } else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                installBtn.innerHTML = '<i class="fab fa-apple"></i> Install App';
            } else {
                installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
            }
        }
    };

    // 1. Capture the install prompt (Android/Desktop)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Don't show immediately, wait for the timer
    });

    // 2. Trigger Timer (Wait 4s for splash screen)
    setTimeout(() => {
        // Only show if not already in standalone mode
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        if (!isStandalone) {
            showBanner();
        }
    }, 4000);

    // 3. Handle Install Click
    installBtn.addEventListener('click', async () => {
        // If we have the native prompt (Android/Desktop), use it
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                deferredPrompt = null;
            }
            installBanner.style.display = 'none';
        }
        // iOS Manual Instructions
        else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            alert('To install on iPhone:\n1. Tap the "Share" button.\n2. Tap "Add to Home Screen".');
        }
    });

    // 4. Handle Close (Dismiss for 1 Hour)
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            installBanner.style.display = 'none';
            localStorage.setItem('pwaDismissedTime', Date.now().toString());
        });
    }
}

// Lightbox Globals
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

function initLightbox() {
    if (!lightbox) return;

    // Close button
    const closeBtn = document.querySelector('.lightbox-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            lightbox.style.display = 'none';
        }
    }

    // Click outside to close
    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    }
}

function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightbox.style.display = 'block';
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.innerText = alt;
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = 'Sending...';
        btn.disabled = true;

        // Simulate sending
        setTimeout(() => {
            btn.innerText = 'Message Sent!';
            btn.style.background = 'var(--text-main)'; // Success visual
            btn.style.color = 'var(--bg-dark)';

            form.reset();

            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.background = '';
                btn.style.color = '';
            }, 3000);
        }, 1500);
    });
}

async function initSpecials() {
    const grid = document.getElementById('specials-grid');
    if (!grid) return;

    try {
        const response = await fetch('/data/specials.json');
        const specials = await response.json();

        // Clear loading state
        grid.innerHTML = '';

        specials.forEach(special => {
            const card = document.createElement('div');
            card.className = 'card card-sm flyer-card animate__animated'; // Added flyer-card class
            card.style.visibility = 'hidden'; // Hide initially for scroll observer

            // Make image clickable
            card.innerHTML = `
                <div class="flyer-image-container">
                    <img src="${special.image}" alt="${special.title}" style="cursor: pointer;">
                </div>
                <div class="card-content">
                    <span>${special.subtitle}</span>
                    <h3>${special.title}</h3>
                </div>
            `;

            grid.appendChild(card);

            // Add click listener purely via JS to avoid inline handler issues with module scope if needed, 
            // but inline with window global is easier for quick proto.
            // Let's attach it properly though.
            const img = card.querySelector('img');
            img.onclick = () => openLightbox(special.image, special.title);


            // Re-add to the existing observer if possible, or just animate in immediately
            card.style.visibility = 'visible';
            card.classList.add('animate__fadeInUp');
        });

    } catch (error) {
        console.error('Failed to load specials:', error);
        grid.innerHTML = '<div style="grid-column: span 12; text-align: center; color: var(--text-muted);">Check back later for new specials.</div>';
    }
}

function initScrollAnimations() {
    // Select all elements with 'animate__animated' class that are not manually triggered
    // But for this simple implementation, let's just observe specific elements we want to trigger on scroll

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the animation class that actually triggers visibility/motion
                // For Animate.css, we can just ensure they have the class names 
                // but usually we want to add a class like 'visible' or re-add the animation name

                // My strategy: removing 'visibility: hidden' or adding a class that starts it
                // Actually Animate.css runs immediately. We need to hide them first.
                // Let's assume we used a custom class or inline style opacity:0 in HTML for things we want to wait for

                // Better approach for this setup:
                // Using .animate__animated means it runs on load. 
                // Let's find elements that we want to trigger:
                entry.target.style.visibility = 'visible';
                entry.target.classList.add('animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Let's select sections to animate
    document.querySelectorAll('.card, .heritage-content > *, .section-header > *').forEach(el => {
        el.style.visibility = 'hidden';
        el.classList.add('animate__animated'); // base class
        observer.observe(el);
    });

    // Special Observer for Heritage Image (Grayscale -> Color)
    const heritageImg = document.querySelector('.heritage-image img');
    if (heritageImg) {
        // Ensure starting state
        heritageImg.classList.remove('reveal-color');

        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add class to trigger CSS transition
                    entry.target.classList.add('reveal-color');
                    console.log('Heritage image revealed!'); // Debug
                    imgObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 }); // Trigger when 25% visible

        imgObserver.observe(heritageImg);
    }
}

function initNavbar() {
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Down Scoll
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
            header.style.transform = 'translate(-50%, -150%)'; // Hide it
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Up Scroll
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
            header.style.transform = 'translate(-50%, 0)'; // Show it
        }

        lastScroll = currentScroll;
    });
}
