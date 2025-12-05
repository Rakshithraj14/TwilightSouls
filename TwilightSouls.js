/**
 * TwilightSouls - Moon Phase Compatibility
 * Calculate lunar phases and compatibility between two birthdates
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    createStarfield();
});

// Create animated starfield background
function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;
    
    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        const size = Math.random() * 2 + 0.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        star.style.setProperty('--twinkle-duration', (Math.random() * 4 + 2) + 's');
        star.style.setProperty('--twinkle-delay', (Math.random() * 5) + 's');
        star.style.setProperty('--star-opacity', (Math.random() * 0.5 + 0.2));
        
        starfield.appendChild(star);
    }
}

// Render moon SVG based on phase value
function renderMoonSVG(containerId, phaseValue) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const size = 160;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 70;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.filter = 'drop-shadow(0 0 20px rgba(255, 250, 240, 0.5)) drop-shadow(0 0 40px rgba(255, 250, 240, 0.2))';
    
    // Gradient definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    const surfaceGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    surfaceGradient.setAttribute('id', `surface-${containerId}`);
    surfaceGradient.setAttribute('cx', '35%');
    surfaceGradient.setAttribute('cy', '35%');
    surfaceGradient.innerHTML = `
        <stop offset="0%" stop-color="#FFFEF5"/>
        <stop offset="40%" stop-color="#F5F3E8"/>
        <stop offset="80%" stop-color="#E8E4D8"/>
        <stop offset="100%" stop-color="#D8D4C8"/>
    `;
    defs.appendChild(surfaceGradient);
    
    const shadowGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    shadowGradient.setAttribute('id', `shadow-${containerId}`);
    shadowGradient.innerHTML = `
        <stop offset="0%" stop-color="#1a1a22"/>
        <stop offset="100%" stop-color="#0a0a10"/>
    `;
    defs.appendChild(shadowGradient);
    svg.appendChild(defs);
    
    // Dark side of moon
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', cx);
    bgCircle.setAttribute('cy', cy);
    bgCircle.setAttribute('r', radius);
    bgCircle.setAttribute('fill', `url(#shadow-${containerId})`);
    svg.appendChild(bgCircle);
    
    // Illuminated part
    const illuminatedPath = createMoonPath(cx, cy, radius, phaseValue);
    if (illuminatedPath) {
        const illuminated = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        illuminated.setAttribute('d', illuminatedPath);
        illuminated.setAttribute('fill', `url(#surface-${containerId})`);
        svg.appendChild(illuminated);
    }
    
    // Crater details
    addCraters(svg, cx, cy, radius, phaseValue);
    
    // Outer glow ring
    const glowRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glowRing.setAttribute('cx', cx);
    glowRing.setAttribute('cy', cy);
    glowRing.setAttribute('r', radius + 1);
    glowRing.setAttribute('fill', 'none');
    glowRing.setAttribute('stroke', 'rgba(255, 250, 240, 0.15)');
    glowRing.setAttribute('stroke-width', '2');
    svg.appendChild(glowRing);
    
    container.innerHTML = '';
    container.appendChild(svg);
}

// Create SVG path for illuminated moon portion
function createMoonPath(cx, cy, radius, phase) {
    if (phase < 0.03) return null; // New moon
    
    if (phase > 0.47 && phase < 0.53) { // Full moon
        return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} Z`;
    }
    
    const isWaxing = phase <= 0.5;
    const illumination = isWaxing ? phase * 2 : (1 - phase) * 2;
    const terminatorRx = Math.abs(radius * Math.cos(illumination * Math.PI));
    const top = cy - radius;
    const bottom = cy + radius;
    
    let d = `M ${cx} ${top}`;
    
    if (isWaxing) {
        d += ` A ${radius} ${radius} 0 0 1 ${cx} ${bottom}`;
        d += illumination < 0.5 
            ? ` A ${terminatorRx} ${radius} 0 0 1 ${cx} ${top}` 
            : ` A ${terminatorRx} ${radius} 0 0 0 ${cx} ${top}`;
    } else {
        d += illumination < 0.5 
            ? ` A ${terminatorRx} ${radius} 0 0 0 ${cx} ${bottom}` 
            : ` A ${terminatorRx} ${radius} 0 0 1 ${cx} ${bottom}`;
        d += ` A ${radius} ${radius} 0 0 1 ${cx} ${top}`;
    }
    
    return d + ' Z';
}

// Add crater details to moon surface
function addCraters(svg, cx, cy, radius, phase) {
    const craters = [
        { x: 0.2, y: -0.25, r: 0.08, opacity: 0.2 },
        { x: -0.15, y: 0.2, r: 0.1, opacity: 0.15 },
        { x: 0.05, y: 0.35, r: 0.06, opacity: 0.18 },
        { x: -0.25, y: -0.1, r: 0.05, opacity: 0.12 },
        { x: 0.3, y: 0.1, r: 0.07, opacity: 0.15 },
        { x: -0.1, y: -0.35, r: 0.04, opacity: 0.1 }
    ];
    
    craters.forEach(crater => {
        if (isIlluminated(crater.x, phase)) {
            const craterEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            craterEl.setAttribute('cx', cx + crater.x * radius);
            craterEl.setAttribute('cy', cy + crater.y * radius);
            craterEl.setAttribute('r', crater.r * radius);
            craterEl.setAttribute('fill', `rgba(200, 195, 185, ${crater.opacity})`);
            svg.appendChild(craterEl);
        }
    });
}

// Check if a point on the moon is illuminated
function isIlluminated(x, phase) {
    if (phase < 0.03) return false;
    if (phase > 0.47 && phase < 0.53) return true;
    
    if (phase <= 0.5) {
        return x > (1 - phase * 4) * -1;
    }
    return x < ((1 - phase) * 4 - 1);
}

// Calculate lunar age (days into current cycle)
function getLunarAge(date) {
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const synodicMonth = 29.53058867;
    const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    let age = daysSince % synodicMonth;
    return age < 0 ? age + synodicMonth : age;
}

// Get phase value (0-1) from date
function getPhaseValue(date) {
    return getLunarAge(date) / 29.53058867;
}

// Get moon phase name from phase value
function getMoonPhaseName(phaseValue) {
    if (phaseValue < 0.0625 || phaseValue >= 0.9375) return 'New Moon';
    if (phaseValue < 0.1875) return 'Waxing Crescent';
    if (phaseValue < 0.3125) return 'First Quarter';
    if (phaseValue < 0.4375) return 'Waxing Gibbous';
    if (phaseValue < 0.5625) return 'Full Moon';
    if (phaseValue < 0.6875) return 'Waning Gibbous';
    if (phaseValue < 0.8125) return 'Last Quarter';
    return 'Waning Crescent';
}

// Calculate compatibility percentage
function calculateCompatibility(age1, age2) {
    const synodicMonth = 29.53058867;
    let diff = Math.abs(age1 - age2);
    if (diff > synodicMonth / 2) diff = synodicMonth - diff;
    return Math.max(0, Math.min(100, Math.round((1 - diff / (synodicMonth / 2)) * 100)));
}

// Get romantic compatibility message
function getCompatibilityMessage(score, phase1, phase2) {
    if (phase1 === phase2) {
        const msgs = [
            `Two hearts born beneath the same ${phase1}—your souls were written in the stars together.`,
            `The ${phase1} claimed you both, binding your fates with threads of silver light.`,
            `Mirrored souls beneath the ${phase1}—what one feels, the other knows.`
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
    
    if ((phase1 === 'New Moon' && phase2 === 'Full Moon') || (phase1 === 'Full Moon' && phase2 === 'New Moon')) {
        const msgs = [
            'Shadow meets radiance—your souls complete what the other lacks.',
            'Where one holds mystery, the other brings light. Together, you are whole.',
            'The dark and the luminous entwined—a love that defies the ordinary.'
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
    
    if (score >= 80) {
        const msgs = [
            'Your moons whisper the same secrets—a connection rare and undeniable.',
            'The cosmos conspired in your favor; your energies dance in harmony.',
            'Fate has been generous—your hearts beat to the same celestial rhythm.'
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
    
    if (score >= 60) {
        const msgs = [
            'Your moons share a tender affinity, like waves answering each other.',
            'The stars smile upon your bond—drawn by the same gravity.',
            'A gentle lunar kinship flows between you, soft as moonlight.'
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
    
    if (score >= 40) {
        const msgs = [
            'Your moons paint different shades of silver, yet both belong to the same sky.',
            'Different rhythms, shared heavens—your connection holds unexpected depth.',
            'The moon shows you different faces, yet you gaze upon the same light.'
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
    
    if (score >= 20) {
        const msgs = [
            'Your moons speak different dialects—beauty lies in translation.',
            'Contrasting phases create a magnetic pull; what differs also attracts.',
            'The distance between your moons is a bridge waiting to be crossed.'
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
    
    const msgs = [
        'Opposite phases create magnetic tension—a cosmic dance of push and pull.',
        'Your moons stand at far edges, yet the same sky holds you both.',
        'The greatest distances hide the deepest connections waiting to be found.'
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
}

// Main update function - called when dates change
function updateMoons() {
    const day1 = document.getElementById('day1').value;
    const month1 = document.getElementById('month1').value;
    const year1 = document.getElementById('year1').value;
    const day2 = document.getElementById('day2').value;
    const month2 = document.getElementById('month2').value;
    const year2 = document.getElementById('year2').value;
    
    const scoreEl = document.getElementById('scoreNumber');
    const messageEl = document.getElementById('compatibilityMessage');
    const centerGif = document.getElementById('centerGif');
    const moonsSection = document.querySelector('.moons-section');
    const scoreDisplay = document.querySelector('.score-display');
    
    const date1Complete = day1 && month1 !== '' && year1 && year1.length === 4;
    const date2Complete = day2 && month2 !== '' && year2 && year2.length === 4;
    
    // Update first moon
    if (date1Complete) {
        const date1 = new Date(parseInt(year1), parseInt(month1), parseInt(day1));
        const phase1Val = getPhaseValue(date1);
        renderMoonSVG('moonImage1', phase1Val);
        document.getElementById('phase1').textContent = getMoonPhaseName(phase1Val);
    } else {
        const container1 = document.getElementById('moonImage1');
        const svg1 = container1.querySelector('svg');
        if (svg1) svg1.remove();
        document.getElementById('phase1').textContent = 'LOVE';
    }
    
    // Update second moon
    if (date2Complete) {
        const date2 = new Date(parseInt(year2), parseInt(month2), parseInt(day2));
        const phase2Val = getPhaseValue(date2);
        renderMoonSVG('moonImage2', phase2Val);
        document.getElementById('phase2').textContent = getMoonPhaseName(phase2Val);
    } else {
        const container2 = document.getElementById('moonImage2');
        const svg2 = container2.querySelector('svg');
        if (svg2) svg2.remove();
        document.getElementById('phase2').textContent = 'BELOVED';
    }
    
    // Handle both dates complete
    if (date1Complete && date2Complete) {
        const date1 = new Date(parseInt(year1), parseInt(month1), parseInt(day1));
        const date2 = new Date(parseInt(year2), parseInt(month2), parseInt(day2));
        const age1 = getLunarAge(date1);
        const age2 = getLunarAge(date2);
        const phase1Name = getMoonPhaseName(getPhaseValue(date1));
        const phase2Name = getMoonPhaseName(getPhaseValue(date2));
        
        const compatibility = calculateCompatibility(age1, age2);
        
        if (centerGif) centerGif.classList.add('hidden');
        if (moonsSection) moonsSection.classList.add('joined');
        if (scoreDisplay) scoreDisplay.classList.add('visible');
        
        animateScore(compatibility);
        messageEl.textContent = getCompatibilityMessage(compatibility, phase1Name, phase2Name);
    } else {
        if (centerGif) centerGif.classList.remove('hidden');
        if (moonsSection) moonsSection.classList.remove('joined');
        if (scoreDisplay) scoreDisplay.classList.remove('visible');
        
        scoreEl.textContent = '--';
        messageEl.textContent = 'Enter both dates to unveil your celestial bond';
    }
}

// Animate score counter
function animateScore(targetScore) {
    const scoreEl = document.getElementById('scoreNumber');
    const currentScore = scoreEl.textContent === '--' ? 0 : parseInt(scoreEl.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        scoreEl.textContent = Math.round(currentScore + (targetScore - currentScore) * easeOut);
        if (progress < 1) requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}
