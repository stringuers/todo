// Circular Progress Component
class CircularProgress {
    constructor(element) {
        this.element = element;
        this.percentage = parseInt(element.getAttribute('data-percentage')) || 0;
        this.color = element.getAttribute('data-color') || '#ff6767';
        this.size = 100;
        this.radius = this.size / 2 - 10;
        this.circumference = this.radius * 2 * Math.PI;
        
        this.render();
        this.animate();
    }

    render() {
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.size);
        svg.setAttribute('height', this.size);
        svg.setAttribute('viewBox', `0 0 ${this.size} ${this.size}`);
        
        // Background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', this.size / 2);
        bgCircle.setAttribute('cy', this.size / 2);
        bgCircle.setAttribute('r', this.radius);
        bgCircle.setAttribute('fill', 'transparent');
        bgCircle.setAttribute('stroke', '#e6e6e6');
        bgCircle.setAttribute('stroke-width', '8');
        
        // Progress circle
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', this.size / 2);
        progressCircle.setAttribute('cy', this.size / 2);
        progressCircle.setAttribute('r', this.radius);
        progressCircle.setAttribute('fill', 'transparent');
        progressCircle.setAttribute('stroke', this.color);
        progressCircle.setAttribute('stroke-width', '8');
        progressCircle.setAttribute('stroke-linecap', 'round');
        progressCircle.setAttribute('stroke-dasharray', this.circumference);
        progressCircle.setAttribute('stroke-dashoffset', this.circumference);
        progressCircle.style.transform = 'rotate(-90deg)';
        progressCircle.style.transformOrigin = '50% 50%';
        progressCircle.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
        
        // Append circles to SVG
        svg.appendChild(bgCircle);
        svg.appendChild(progressCircle);
        
        // Create text element
        const textElement = document.createElement('div');
        textElement.className = 'circular-progress-text';
        textElement.textContent = '0%';
        
        // Clear and append new elements
        this.element.innerHTML = '';
        this.element.appendChild(svg);
        this.element.appendChild(textElement);
        
        // Store references
        this.progressCircle = progressCircle;
        this.textElement = textElement;
    }

    animate() {
        setTimeout(() => {
            const offset = this.circumference - (this.percentage / 100) * this.circumference;
            this.progressCircle.setAttribute('stroke-dashoffset', offset);
            this.textElement.textContent = `${this.percentage}%`;
        }, 100);
    }
}

// Initialize all circular progress elements
document.addEventListener('DOMContentLoaded', () => {
    const progressElements = document.querySelectorAll('.circular-progress');
    progressElements.forEach(element => {
        new CircularProgress(element);
    });
});