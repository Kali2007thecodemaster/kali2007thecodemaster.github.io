// === SMOOTH SCROLL (LENIS) SETUP ===
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

function handleNavClick(e, targetId) {
    e.preventDefault();
    lenis.scrollTo(targetId);
}

// === THEME TOGGLE ENGINE ===
window.toggleTheme = function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    // Update the DOM and save preference to browser storage
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

// Initialize the correct theme when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});

// === TYPEWRITER EFFECT ===
const text = "Machine Learning\nEnthusiast.";
const typeElement = document.getElementById('typewriter');
let i = 0;

function typeWriter() {
    if (i < text.length) {
        const char = text.charAt(i);
        typeElement.innerHTML += (char === "\n") ? "<br>" : char;
        i++;
        setTimeout(typeWriter, 100);
    } else {
        typeElement.classList.remove('typewriter');
    }
}

// === SCROLL REVEAL (STAGGERED UPDATE) ===
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// === NAVBAR SHADOW ===
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// === HACKER TEXT SCRAMBLE EFFECT ===
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Note: Removed the theme-toggle button from this selector so the SVG icons don't get scrambled!
document.querySelectorAll(".brand-name, .nav-link.accent").forEach(element => {
    element.onmouseover = event => {
        let iterations = 0;
        const interval = setInterval(() => {
            event.target.innerText = event.target.innerText.split("")
                .map((letter, index) => {
                    if(index < iterations) {
                        return event.target.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");
            
            if(iterations >= event.target.dataset.value.length) { 
                clearInterval(interval);
            }
            
            iterations += 1 / 3;
        }, 30);
    }
});

// === INIT ===
window.addEventListener('load', () => {
    setTimeout(typeWriter, 500);
    initCanvas(); 
});

// === MATHEMATICAL VISUALIZATION (Neural Sphere) ===
function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    
    const particleCount = 60;
    const connectionDistance = 120;
    const rotationSpeed = 0.002;
    const sphereRadius = 180;

    function resize() {
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Point3D {
        constructor() {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            this.x = sphereRadius * Math.sin(phi) * Math.cos(theta);
            this.y = sphereRadius * Math.sin(phi) * Math.sin(theta);
            this.z = sphereRadius * Math.cos(phi);
        }

        rotate(angleX, angleY) {
            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);
            const x1 = this.x * cosY - this.z * sinY;
            const z1 = this.z * cosY + this.x * sinY;
            const cosX = Math.cos(angleX);
            const sinX = Math.sin(angleX);
            const y2 = this.y * cosX - z1 * sinX;
            const z2 = z1 * cosX + this.y * sinX;
            this.x = x1; this.y = y2; this.z = z2;
        }

        project() {
            const scale = 300 / (300 + this.z);
            return {
                x: width/2 + this.x * scale,
                y: height/2 + this.y * scale,
                scale: scale,
                opacity: (this.z + sphereRadius) / (2 * sphereRadius)
            };
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Point3D());

    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left - width/2) * 0.0001;
        mouseY = (e.clientY - rect.top - height/2) * 0.0001;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        const projectedPoints = particles.map(p => {
            p.rotate(rotationSpeed + mouseY, rotationSpeed + mouseX);
            return p.project();
        });
        ctx.strokeStyle = '#ff611a';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < projectedPoints.length; i++) {
            for (let j = i + 1; j < projectedPoints.length; j++) {
                const p1 = projectedPoints[i];
                const p2 = projectedPoints[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < connectionDistance) {
                    const alpha = (1 - dist/connectionDistance) * 0.15 * ((p1.opacity + p2.opacity)/2);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 97, 26, ${alpha})`; 
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        
        // Dynamically adjust node color based on active theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const nodeColor = isDark ? '240, 240, 240' : '26, 26, 26';

        projectedPoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5 * p.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${nodeColor}, ${p.opacity * 0.8})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}
