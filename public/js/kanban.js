// Kanban Board JavaScript
let draggedElement = null;
let columns = [];
let tickets = [];

// Initialize the board
async function initBoard() {
    await loadColumns();
    await loadTickets();
    renderBoard();
    initDragAndDrop();
    initBubbles();
    initGradientAnimation();
}

// Load columns from API
async function loadColumns() {
    try {
        const response = await fetch('/api/kanban/columns');
        columns = await response.json();
    } catch (error) {
        console.error('Error loading columns:', error);
    }
}

// Load tickets from API
async function loadTickets() {
    try {
        const response = await fetch('/api/kanban/tickets');
        tickets = await response.json();
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// Render the board
function renderBoard() {
    const board = document.getElementById('kanbanBoard');
    board.innerHTML = '';
    
    columns.forEach(column => {
        const columnEl = createColumnElement(column);
        board.appendChild(columnEl);
    });
}

// Create column element
function createColumnElement(column) {
    const columnEl = document.createElement('div');
    columnEl.className = 'kanban-column';
    columnEl.dataset.columnId = column.id;
    
    const columnTickets = tickets.filter(t => t.column_id === column.id);
    
    columnEl.innerHTML = `
        <div class="kanban-column-header">
            <h3 class="kanban-column-title">${column.name}</h3>
            <span class="kanban-column-count">${columnTickets.length}</span>
        </div>
        <div class="kanban-column-body" ondrop="handleDrop(event)" ondragover="handleDragOver(event)">
            ${columnTickets.map(ticket => createTicketElement(ticket)).join('')}
        </div>
    `;
    
    return columnEl;
}

// Create ticket element
function createTicketElement(ticket) {
    return `
        <div class="kanban-ticket" draggable="true" data-ticket-id="${ticket.id}" 
             ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)">
            <h4 class="kanban-ticket-title">${ticket.title}</h4>
            <p class="kanban-ticket-description">${ticket.description || ''}</p>
            <div class="kanban-ticket-footer">
                <span class="kanban-ticket-priority priority-${ticket.priority}">${ticket.priority}</span>
                <div class="kanban-ticket-actions">
                    <button class="kanban-ticket-action" onclick="editTicket(${ticket.id})">✏️</button>
                    <button class="kanban-ticket-action" onclick="deleteTicket(${ticket.id})">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

// Drag and Drop handlers
function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const columnBody = e.currentTarget;
    columnBody.classList.add('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    const columnBody = e.currentTarget;
    columnBody.classList.remove('drag-over');
    
    const columnId = columnBody.parentElement.dataset.columnId;
    const ticketId = draggedElement.dataset.ticketId;
    
    // Update ticket column
    try {
        await fetch(`/api/kanban/tickets/${ticketId}/move`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ column_id: parseInt(columnId) })
        });
        
        // Refresh the board
        await loadTickets();
        renderBoard();
    } catch (error) {
        console.error('Error moving ticket:', error);
    }
}

// Open ticket form
function openTicketForm() {
    document.getElementById('ticketFormModal').classList.add('show');
}

// Close ticket form
function closeTicketForm() {
    document.getElementById('ticketFormModal').classList.remove('show');
    document.getElementById('ticketForm').reset();
}

// Submit ticket form
document.getElementById('ticketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const ticketData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        column_id: columns[0].id // Add to first column by default
    };
    
    try {
        await fetch('/api/kanban/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });
        
        closeTicketForm();
        await loadTickets();
        renderBoard();
    } catch (error) {
        console.error('Error creating ticket:', error);
    }
});

// Delete ticket
async function deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
        await fetch(`/api/kanban/tickets/${ticketId}`, {
            method: 'DELETE'
        });
        
        await loadTickets();
        renderBoard();
    } catch (error) {
        console.error('Error deleting ticket:', error);
    }
}

// Edit ticket
async function editTicket(ticketId) {
    // TODO: Implement edit functionality
    console.log('Edit ticket:', ticketId);
}

// Add new column
async function addColumn() {
    const name = prompt('Enter column name:');
    if (!name) return;
    
    try {
        await fetch('/api/kanban/columns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        
        await loadColumns();
        renderBoard();
    } catch (error) {
        console.error('Error adding column:', error);
    }
}

// Initialize bubbles
function initBubbles() {
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const size = Math.random() * 100 + 50;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * window.innerWidth + 'px';
        bubble.style.animationDuration = (Math.random() * 20 + 10) + 's';
        bubble.style.animationDelay = Math.random() * 5 + 's';
        
        document.getElementById('bubbleContainer').appendChild(bubble);
        
        setTimeout(() => {
            bubble.remove();
        }, 30000);
    }
    
    setInterval(createBubble, 2000);
    
    for (let i = 0; i < 5; i++) {
        setTimeout(createBubble, i * 500);
    }
}

// Initialize gradient animation
function initGradientAnimation() {
    const gradients = [
        'linear-gradient(45deg, #00d4ff, #ff00ff)',
        'linear-gradient(45deg, #ff00ff, #00ff88)',
        'linear-gradient(45deg, #00ff88, #00d4ff)'
    ];
    
    let currentGradient = 0;
    
    function changeGradient() {
        currentGradient = (currentGradient + 1) % gradients.length;
        document.documentElement.style.setProperty('--gradient-1', gradients[currentGradient]);
        document.documentElement.style.setProperty('--gradient-2', gradients[(currentGradient + 1) % gradients.length]);
        document.documentElement.style.setProperty('--gradient-3', gradients[(currentGradient + 2) % gradients.length]);
    }
    
    setInterval(changeGradient, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initBoard);
