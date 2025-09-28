// Main JavaScript for OptimizeDS Learning Platform

// Global variables
let animationId = null;
let gradientDescentPoints = [];
let currentIteration = 0;

// DOM Elements
const elements = {
    navLinks: document.querySelectorAll('.nav-link'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    gradientCanvas: document.getElementById('gradientCanvas'),
    derivativeCanvas: document.getElementById('derivativeCanvas'),
    convexityCanvas: document.getElementById('convexityCanvas'),
    regressionCanvas: document.getElementById('regressionCanvas'),
    networkCanvas: document.getElementById('networkCanvas'),
    portfolioCanvas: document.getElementById('portfolioCanvas')
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTabs();
    initializeCanvases();
    initializeInteractiveElements();
    initializeQuiz();
    
    // Start hero animation
    if (elements.gradientCanvas) {
        drawGradientDescentDemo();
    }
});

// Navigation functionality
function initializeNavigation() {
    // Smooth scrolling for navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active navigation
                elements.navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
        });
    }
}

// Tab system functionality
function initializeTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const tabContainer = this.closest('.content-tabs, .application-tabs');
            
            // Remove active class from all tabs and buttons
            tabContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            tabContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = tabContainer.querySelector(`#${tabId}`);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Trigger canvas redraw if needed
                setTimeout(() => {
                    if (tabId === 'derivatives') drawDerivativeDemo();
                    if (tabId === 'convexity') drawConvexityDemo();
                }, 100);
            }
        });
    });
}

// Canvas initialization
function initializeCanvases() {
    // Initialize all canvas demonstrations
    if (elements.derivativeCanvas) drawDerivativeDemo();
    if (elements.convexityCanvas) drawConvexityDemo();
    if (elements.regressionCanvas) drawRegressionDemo();
    if (elements.networkCanvas) drawNetworkDiagram();
    if (elements.portfolioCanvas) drawPortfolioDemo();
}

// Interactive elements
function initializeInteractiveElements() {
    // Derivative slider
    const xSlider = document.getElementById('xSlider');
    const xValue = document.getElementById('xValue');
    const derivativeValue = document.getElementById('derivativeValue');
    
    if (xSlider) {
        xSlider.addEventListener('input', function() {
            const x = parseFloat(this.value);
            xValue.textContent = `x = ${x}`;
            const derivative = 2 * x + 2;
            derivativeValue.textContent = `f'(x) = ${derivative.toFixed(2)}`;
            drawDerivativeDemo(x);
        });
    }
    
    // Regression sliders
    const weightSlider = document.getElementById('weightSlider');
    const biasSlider = document.getElementById('biasSlider');
    const weightValue = document.getElementById('weightValue');
    const biasValue = document.getElementById('biasValue');
    const lossValue = document.getElementById('lossValue');
    
    if (weightSlider && biasSlider) {
        function updateRegression() {
            const w = parseFloat(weightSlider.value);
            const b = parseFloat(biasSlider.value);
            weightValue.textContent = w.toFixed(1);
            biasValue.textContent = b.toFixed(1);
            
            const loss = calculateRegressionLoss(w, b);
            lossValue.textContent = loss.toFixed(2);
            drawRegressionDemo(w, b);
        }
        
        weightSlider.addEventListener('input', updateRegression);
        biasSlider.addEventListener('input', updateRegression);
        
        // Auto-optimize button
        const optimizeBtn = document.getElementById('optimizeRegression');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', function() {
                optimizeRegression();
            });
        }
    }
    
    // Animation controls
    const startBtn = document.getElementById('startAnimation');
    const resetBtn = document.getElementById('resetAnimation');
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            startGradientDescentAnimation();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetGradientDescentAnimation();
        });
    }
}

// Gradient Descent Demo
function drawGradientDescentDemo() {
    const canvas = elements.gradientCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw function curve (parabola)
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let x = -200; x <= 200; x++) {
        const realX = x / 40; // Scale
        const realY = realX * realX + 0.5; // f(x) = x^2 + 0.5
        const canvasX = x + width/2;
        const canvasY = height - (realY * 30 + 50); // Scale and flip Y
        
        if (x === -200) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }
    ctx.stroke();
    
    // Draw gradient descent points if animation is running
    if (gradientDescentPoints.length > 0) {
        ctx.fillStyle = '#ffd700';
        gradientDescentPoints.forEach((point, index) => {
            const canvasX = point.x * 40 + width/2;
            const canvasY = height - (point.y * 30 + 50);
            
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw gradient arrow
            if (index === gradientDescentPoints.length - 1) {
                const gradient = 2 * point.x; // f'(x) = 2x
                const arrowLength = Math.min(50, Math.abs(gradient * 20));
                const arrowDirection = gradient > 0 ? -1 : 1;
                
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(canvasX, canvasY);
                ctx.lineTo(canvasX + arrowDirection * arrowLength, canvasY);
                ctx.stroke();
                
                // Arrow head
                ctx.beginPath();
                ctx.moveTo(canvasX + arrowDirection * arrowLength, canvasY);
                ctx.lineTo(canvasX + arrowDirection * arrowLength - arrowDirection * 10, canvasY - 5);
                ctx.lineTo(canvasX + arrowDirection * arrowLength - arrowDirection * 10, canvasY + 5);
                ctx.closePath();
                ctx.fillStyle = '#ff6b6b';
                ctx.fill();
            }
        });
    }
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('f(x) = x² + 0.5', width/2, 20);
}

function startGradientDescentAnimation() {
    // Reset
    gradientDescentPoints = [];
    currentIteration = 0;
    
    // Starting point
    let x = 3; // Start far from minimum
    const learningRate = 0.1;
    const maxIterations = 50;
    
    function step() {
        if (currentIteration < maxIterations) {
            const y = x * x + 0.5; // Function value
            gradientDescentPoints.push({ x: x, y: y });
            
            // Gradient descent update
            const gradient = 2 * x; // f'(x) = 2x
            x = x - learningRate * gradient;
            
            currentIteration++;
            
            // Redraw
            drawGradientDescentDemo();
            
            // Continue animation
            animationId = setTimeout(step, 200);
        }
    }
    
    step();
}

function resetGradientDescentAnimation() {
    if (animationId) {
        clearTimeout(animationId);
        animationId = null;
    }
    gradientDescentPoints = [];
    currentIteration = 0;
    drawGradientDescentDemo();
}

// Derivative Demo
function drawDerivativeDemo(currentX = 0) {
    const canvas = elements.derivativeCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Function: f(x) = x^2 + 2x + 1
    function f(x) {
        return x * x + 2 * x + 1;
    }
    
    function fPrime(x) {
        return 2 * x + 2;
    }
    
    // Draw function
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = -3; x <= 3; x += 0.1) {
        const y = f(x);
        const canvasX = (x + 3) * width / 6;
        const canvasY = height - ((y + 1) * height / 10);
        
        if (x === -3) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }
    ctx.stroke();
    
    // Draw tangent line at current point
    const currentY = f(currentX);
    const slope = fPrime(currentX);
    
    const currentCanvasX = (currentX + 3) * width / 6;
    const currentCanvasY = height - ((currentY + 1) * height / 10);
    
    // Point
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(currentCanvasX, currentCanvasY, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Tangent line
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const tangentLength = 2;
    const x1 = currentX - tangentLength;
    const y1 = currentY + slope * (-tangentLength);
    const x2 = currentX + tangentLength;
    const y2 = currentY + slope * tangentLength;
    
    const canvas1X = (x1 + 3) * width / 6;
    const canvas1Y = height - ((y1 + 1) * height / 10);
    const canvas2X = (x2 + 3) * width / 6;
    const canvas2Y = height - ((y2 + 1) * height / 10);
    
    ctx.moveTo(canvas1X, canvas1Y);
    ctx.lineTo(canvas2X, canvas2Y);
    ctx.stroke();
    
    // Axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    const axisY = height - ((0 + 1) * height / 10);
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(width, axisY);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('f(x) = x² + 2x + 1', width/2, 20);
    ctx.fillText(`Slope at x=${currentX}: ${slope.toFixed(2)}`, width/2, height - 10);
}

// Convexity Demo
function drawConvexityDemo(showConvex = true) {
    const canvas = elements.convexityCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Function definitions
    function convexFunc(x) {
        return x * x; // Simple parabola
    }
    
    function nonConvexFunc(x) {
        return x * x * x - 3 * x * x + 2; // Cubic with local min/max
    }
    
    const func = showConvex ? convexFunc : nonConvexFunc;
    const color = showConvex ? '#4CAF50' : '#f44336';
    const title = showConvex ? 'Convex Function (f(x) = x²)' : 'Non-Convex Function (f(x) = x³ - 3x² + 2)';
    
    // Draw function
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let x = -2; x <= 4; x += 0.1) {
        const y = func(x);
        const canvasX = (x + 2) * width / 6;
        const canvasY = height - ((y + 5) * height / 10);
        
        if (x === -2) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }
    ctx.stroke();
    
    // Draw convexity illustration (line between two points)
    const x1 = 0, x2 = 3;
    const y1 = func(x1), y2 = func(x2);
    
    const canvas1X = (x1 + 2) * width / 6;
    const canvas1Y = height - ((y1 + 5) * height / 10);
    const canvas2X = (x2 + 2) * width / 6;
    const canvas2Y = height - ((y2 + 5) * height / 10);
    
    // Points
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(canvas1X, canvas1Y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas2X, canvas2Y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Line between points
    ctx.strokeStyle = '#666';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas1X, canvas1Y);
    ctx.lineTo(canvas2X, canvas2Y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Title
    ctx.fillStyle = '#333';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(title, width/2, 20);
    
    const convexText = showConvex ? 
        'Function lies below line (convex)' : 
        'Function crosses line (non-convex)';
    ctx.font = '12px Inter';
    ctx.fillText(convexText, width/2, height - 10);
}

// Regression Demo
let regressionData = [];

function generateRegressionData() {
    regressionData = [];
    for (let i = 0; i < 20; i++) {
        const x = (i - 10) / 5; // Range from -2 to 2
        const y = 1.5 * x + 0.5 + (Math.random() - 0.5) * 0.8; // True line with noise
        regressionData.push({ x, y });
    }
}

function drawRegressionDemo(w = 1, b = 0) {
    const canvas = elements.regressionCanvas;
    if (!canvas) return;
    
    if (regressionData.length === 0) {
        generateRegressionData();
    }
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.moveTo(50, height - 50);
    ctx.lineTo(50, 20);
    ctx.stroke();
    
    // Scale factors
    const xScale = (width - 70) / 4; // For x range -2 to 2
    const yScale = (height - 70) / 4; // For y range -2 to 2
    const centerX = 50 + (width - 70) / 2;
    const centerY = height - 50 - (height - 70) / 2;
    
    // Draw data points
    ctx.fillStyle = '#667eea';
    regressionData.forEach(point => {
        const canvasX = centerX + point.x * xScale;
        const canvasY = centerY - point.y * yScale;
        
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw regression line
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const x1 = -2, x2 = 2;
    const y1 = w * x1 + b;
    const y2 = w * x2 + b;
    
    const canvas1X = centerX + x1 * xScale;
    const canvas1Y = centerY - y1 * yScale;
    const canvas2X = centerX + x2 * xScale;
    const canvas2Y = centerY - y2 * yScale;
    
    ctx.moveTo(canvas1X, canvas1Y);
    ctx.lineTo(canvas2X, canvas2Y);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Linear Regression Demo', width/2, 15);
    ctx.fillText(`y = ${w.toFixed(1)}x + ${b.toFixed(1)}`, width/2, height - 10);
}

function calculateRegressionLoss(w, b) {
    if (regressionData.length === 0) return 0;
    
    let totalLoss = 0;
    regressionData.forEach(point => {
        const predicted = w * point.x + b;
        const error = point.y - predicted;
        totalLoss += error * error;
    });
    
    return totalLoss / regressionData.length;
}

function optimizeRegression() {
    if (regressionData.length === 0) return;
    
    let w = parseFloat(document.getElementById('weightSlider').value);
    let b = parseFloat(document.getElementById('biasSlider').value);
    
    const learningRate = 0.1;
    const iterations = 100;
    
    function step(iter) {
        if (iter >= iterations) return;
        
        // Calculate gradients
        let gradW = 0, gradB = 0;
        regressionData.forEach(point => {
            const predicted = w * point.x + b;
            const error = predicted - point.y;
            gradW += error * point.x;
            gradB += error;
        });
        
        gradW = gradW * 2 / regressionData.length;
        gradB = gradB * 2 / regressionData.length;
        
        // Update parameters
        w -= learningRate * gradW;
        b -= learningRate * gradB;
        
        // Update UI
        document.getElementById('weightSlider').value = w;
        document.getElementById('biasSlider').value = b;
        document.getElementById('weightValue').textContent = w.toFixed(1);
        document.getElementById('biasValue').textContent = b.toFixed(1);
        document.getElementById('lossValue').textContent = calculateRegressionLoss(w, b).toFixed(2);
        
        drawRegressionDemo(w, b);
        
        // Continue animation
        setTimeout(() => step(iter + 1), 50);
    }
    
    step(0);
}

// Network Diagram
function drawNetworkDiagram() {
    const canvas = elements.networkCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Network structure
    const layers = [3, 4, 2, 1]; // Input, hidden1, hidden2, output
    const layerPositions = [];
    
    // Calculate layer positions
    for (let i = 0; i < layers.length; i++) {
        const x = (i + 1) * width / (layers.length + 1);
        const nodes = [];
        for (let j = 0; j < layers[i]; j++) {
            const y = (j + 1) * height / (layers[i] + 1);
            nodes.push({ x, y });
        }
        layerPositions.push(nodes);
    }
    
    // Draw connections
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i < layerPositions.length - 1; i++) {
        layerPositions[i].forEach(fromNode => {
            layerPositions[i + 1].forEach(toNode => {
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.stroke();
            });
        });
    }
    
    // Draw nodes
    layerPositions.forEach((layer, layerIndex) => {
        layer.forEach(node => {
            ctx.fillStyle = layerIndex === 0 ? '#4CAF50' : 
                           layerIndex === layerPositions.length - 1 ? '#f44336' : '#2196F3';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI);
            ctx.fill();
            
            // Node border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    });
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Input Layer', layerPositions[0][0].x, height - 10);
    ctx.fillText('Hidden Layers', width/2, height - 10);
    ctx.fillText('Output Layer', layerPositions[layerPositions.length-1][0].x, height - 10);
    
    ctx.fillText('Neural Network Architecture', width/2, 15);
}

// Portfolio Demo
function drawPortfolioDemo() {
    const canvas = elements.portfolioCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.moveTo(50, height - 50);
    ctx.lineTo(50, 20);
    ctx.stroke();
    
    // Axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Risk (Standard Deviation)', width/2, height - 10);
    ctx.save();
    ctx.translate(15, height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('Expected Return', 0, 0);
    ctx.restore();
    
    // Draw efficient frontier
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i <= 100; i++) {
        const risk = 0.1 + (i / 100) * 0.3; // Risk from 0.1 to 0.4
        const returnRate = 0.05 + Math.sqrt(risk) * 0.3; // Simplified efficient frontier
        
        const canvasX = 50 + (risk - 0.1) * (width - 70) / 0.3;
        const canvasY = height - 50 - (returnRate - 0.05) * (height - 70) / 0.15;
        
        if (i === 0) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }
    ctx.stroke();
    
    // Sample portfolios
    const portfolios = [
        { risk: 0.15, return: 0.08, name: 'Conservative' },
        { risk: 0.25, return: 0.12, name: 'Moderate' },
        { risk: 0.35, return: 0.15, name: 'Aggressive' }
    ];
    
    portfolios.forEach((portfolio, index) => {
        const canvasX = 50 + (portfolio.risk - 0.1) * (width - 70) / 0.3;
        const canvasY = height - 50 - (portfolio.return - 0.05) * (height - 70) / 0.15;
        
        const colors = ['#4CAF50', '#FF9800', '#f44336'];
        ctx.fillStyle = colors[index];
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(portfolio.name, canvasX + 10, canvasY);
    });
    
    // Title
    ctx.fillStyle = '#333';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Efficient Frontier - Portfolio Optimization', width/2, 15);
}

// Algorithm Visualization Functions
function showGradientDescent() {
    const modal = createVisualizationModal('Gradient Descent Visualization');
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    modal.querySelector('.modal-content').appendChild(canvas);
    
    // Animate gradient descent on the canvas
    animateAlgorithm(canvas, 'gradient-descent');
}

function showNewtonMethod() {
    const modal = createVisualizationModal('Newton\'s Method Visualization');
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    modal.querySelector('.modal-content').appendChild(canvas);
    
    animateAlgorithm(canvas, 'newton-method');
}

function showAdam() {
    const modal = createVisualizationModal('Adam Optimizer Visualization');
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    modal.querySelector('.modal-content').appendChild(canvas);
    
    animateAlgorithm(canvas, 'adam');
}

function showSimulatedAnnealing() {
    const modal = createVisualizationModal('Simulated Annealing Visualization');
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    modal.querySelector('.modal-content').appendChild(canvas);
    
    animateAlgorithm(canvas, 'simulated-annealing');
}

function createVisualizationModal(title) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'visualization-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
        </div>
    `;
    
    // Add styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    
    modal.querySelector('.modal-content').style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 15px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
    `;
    
    modal.querySelector('.modal-header').style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    `;
    
    modal.querySelector('.close-modal').style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    `;
    
    // Close functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    document.body.appendChild(modal);
    return modal;
}

function animateAlgorithm(canvas, algorithm) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // This is a simplified version - you could expand this for each algorithm
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#333';
    ctx.font = '16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${algorithm} animation would go here`, width/2, height/2);
    ctx.fillText('(Simplified for demo purposes)', width/2, height/2 + 30);
}

// Quiz functionality
function initializeQuiz() {
    const quizSubmit = document.querySelector('.quiz-submit');
    if (quizSubmit) {
        quizSubmit.addEventListener('click', function() {
            const selectedOption = document.querySelector('input[name="q1"]:checked');
            const feedback = document.querySelector('.quiz-feedback');
            
            if (!selectedOption) {
                feedback.textContent = 'Please select an answer.';
                feedback.style.background = '#ffeb3b';
                feedback.style.color = '#333';
                return;
            }
            
            if (selectedOption.value === 'newton') {
                feedback.textContent = 'Correct! Newton\'s method typically converges faster due to second-order information.';
                feedback.style.background = '#4CAF50';
                feedback.style.color = 'white';
            } else {
                feedback.textContent = 'Not quite. Newton\'s method uses second-order derivatives for faster convergence.';
                feedback.style.background = '#f44336';
                feedback.style.color = 'white';
            }
        });
    }
}

// Hint functionality
function showHint(problemNumber) {
    const hint = document.getElementById(`hint${problemNumber}`);
    if (hint) {
        hint.classList.toggle('hidden');
    }
}

// Convexity button handlers
document.addEventListener('DOMContentLoaded', function() {
    const showConvexBtn = document.getElementById('showConvex');
    const showNonConvexBtn = document.getElementById('showNonConvex');
    
    if (showConvexBtn) {
        showConvexBtn.addEventListener('click', () => drawConvexityDemo(true));
    }
    
    if (showNonConvexBtn) {
        showNonConvexBtn.addEventListener('click', () => drawConvexityDemo(false));
    }
});

// Scroll animations
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.overview-card, .algorithm-card, .problem-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
            element.classList.add('fade-in');
        }
    });
});