/*
  ACOUSTICFUSER V2.0 - CORE INTERACTIVE ENGINE
  Features: Fluid Soundwaves, Smooth Cursor, Bento Reveal, Magnetic Interaction
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Device Detection
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
        document.body.classList.add('is-touch');
        const cursor = document.getElementById('cursor');
        const cursorBlur = document.getElementById('cursor-blur');
        if (cursor) cursor.style.display = 'none';
        if (cursorBlur) cursorBlur.style.display = 'none';
    }

    // 1. Smooth Custom Cursor (Desktop Only)
    const cursor = document.getElementById('cursor');
    const cursorBlur = document.getElementById('cursor-blur');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let blurX = 0, blurY = 0;

    if (!isTouch && cursor && cursorBlur) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateCursor() {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;

            blurX += (mouseX - blurX) * 0.05;
            blurY += (mouseY - blurY) * 0.05;
            cursorBlur.style.left = `${blurX}px`;
            cursorBlur.style.top = `${blurY}px`;

            requestAnimationFrame(updateCursor);
        }
        updateCursor();
    }

    // 2. Navigation Scroll Logic
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Fluid Soundwave Visualizer (Canvas)
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Adjust wave parameters for mobile
            if (width < 768) {
                waves.forEach(w => w.amplitude *= 0.6);
            }
        }

        const waves = [];
        const waveCount = isTouch ? 3 : 4; // Fewer waves on mobile for performance
        for(let i = 0; i < waveCount; i++) {
            waves.push({
                amplitude: 40 + (i * 20),
                frequency: width < 768 ? 0.015 : 0.01 - (i * 0.001),
                phase: i * Math.PI / 2,
                speed: 0.01 + (i * 0.005),
                color: i === 0 ? 'rgba(0, 242, 255, 0.3)' : `rgba(255, 255, 255, ${0.05 + (i * 0.02)})`
            });
        }

        function drawWave(wave) {
            wave.phase += wave.speed;
            ctx.beginPath();
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 1;

            const xStep = width < 768 ? 10 : 5; // Less precision on mobile for performance
            for (let x = 0; x < width; x += xStep) {
                let y = height / 2 + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
                
                // Interaction (Magnetic Repulsion)
                const dx = x - (isTouch ? width/2 : mouseX); // On mobile, react to center
                const dy = (height / 2) - (isTouch ? height/2 : mouseY);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < (width < 768 ? 200 : 400)) {
                    const power = (1 - dist / (width < 768 ? 200 : 400)) * 1.5;
                    y += ( (isTouch ? height/2 : mouseY) - height / 2) * power;
                    y += Math.sin(dist * 0.02 - wave.phase * 2) * (10 * power);
                }
                
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        function animateWaves() {
            ctx.clearRect(0, 0, width, height);
            waves.forEach(drawWave);
            requestAnimationFrame(animateWaves);
        }

        window.addEventListener('resize', resize);
        resize();
        animateWaves();
    }

    // 4. Reveal Animation Observer
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.classList.contains('stats-card')) {
                    const targetNum = entry.target.querySelector('h2');
                    if (targetNum && !targetNum.classList.contains('counted')) {
                        animateNumber(targetNum);
                    }
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 5. Stats Number Animation
    function animateNumber(element) {
        element.classList.add('counted');
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(easeProgress * target);
            element.innerText = current + (target === 99 ? '%' : '+');
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // 6. Contact Form Interaction
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const btnTxt = btn.querySelector('.btn-txt');
            btnTxt.innerText = 'TRANSMITTING...';
            btn.classList.add('loading');

            setTimeout(() => {
                btnTxt.innerText = 'REQUEST SENT';
                btn.style.background = 'var(--accent-mint)';
                btn.style.color = '#000';
                alert('We have received your acoustic data. Our engineers will reach out shortly.');
                contactForm.reset();
            }, 2000);
        });
    }

    // 7. Parallax for Desktop
    if (!isTouch) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            document.querySelectorAll('.parallax-img').forEach(img => {
                img.style.transform = `translateY(${scrolled * 0.1}px)`;
            });
        });
    }

    // 8. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
    }

});
