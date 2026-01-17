const API_BASE_URL = '/api';
let currentEventForTicket = null;

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'events') {
        loadAllEvents();
    }
}

async function loadAllEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '<div class="loading">Loading events...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            eventsList.innerHTML = '';
            result.data.forEach(event => {
                eventsList.appendChild(createEventCard(event));
            });
        } else {
            eventsList.innerHTML = '<div class="empty-state">No events available. Create one!</div>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showToast('Failed to load events', 'error');
        eventsList.innerHTML = '<div class="empty-state">Error loading events</div>';
    }
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const remainingTickets = event.capacity - event.sold;
    const isAvailable = remainingTickets > 0;

    card.innerHTML = `
        <div class="event-card-header">
            <h3>${escapeHtml(event.name)}</h3>
            <div class="event-date">📅 ${formatDate(event.date)}</div>
            <div class="event-location">📍 ${escapeHtml(event.location || 'TBA')}</div>
        </div>
        <div class="event-card-body">
            <p class="event-description">${escapeHtml(event.description || 'No description provided')}</p>
            <div class="event-stats">
                <div class="stat">
                    <div class="stat-label">Available</div>
                    <div class="stat-value">${remainingTickets}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Capacity</div>
                    <div class="stat-value">${event.capacity}</div>
                </div>
            </div>
            <div class="event-price">💵 $${parseFloat(event.price).toFixed(2)}</div>
        </div>
        <div class="event-card-footer">
            <div class="capacity-status ${isAvailable ? 'available' : 'full'}">
                ${isAvailable ? `✓ ${remainingTickets} tickets available` : '✗ Sold Out'}
            </div>
            <button class="btn btn-primary btn-full" ${!isAvailable ? 'disabled' : ''} onclick="openBuyTicketModal(${event.id}, '${escapeHtml(event.name)}', ${event.price}, ${isAvailable})">
                ${isAvailable ? 'Buy Ticket' : 'Sold Out'}
            </button>
        </div>
    `;

    return card;
}

function openBuyTicketModal(eventId, eventName, price, isAvailable) {
    if (!isAvailable) return;

    currentEventForTicket = { eventId, eventName, price };
    const modal = document.getElementById('buyTicketModal');
    const modalEventInfo = document.getElementById('modalEventInfo');

    modalEventInfo.innerHTML = `
        <p><strong>Event:</strong> ${escapeHtml(eventName)}</p>
        <p><strong>Price:</strong> $${parseFloat(price).toFixed(2)}</p>
    `;

    modal.classList.add('show');
}

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').classList.remove('show');
        document.getElementById('buyUserIdInput').value = '';
        document.getElementById('userIdInput').value = '';
    });
});

window.addEventListener('click', (event) => {
    const buyModal = document.getElementById('buyTicketModal');
    const ticketModal = document.getElementById('ticketDetailsModal');

    if (event.target === buyModal) buyModal.classList.remove('show');
    if (event.target === ticketModal) ticketModal.classList.remove('show');
});

document.getElementById('confirmBuyBtn').addEventListener('click', async () => {
    const userId = document.getElementById('buyUserIdInput').value.trim();

    if (!userId) {
        showToast('Please enter your User ID', 'warning');
        return;
    }

    if (!currentEventForTicket) {
        showToast('Event not selected', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: currentEventForTicket.eventId,
                userId: userId
            })
        });

        const result = await response.json();

        if (response.ok) {
            showToast(`✓ Ticket purchased successfully! Ticket ID: ${result.ticket.id}`, 'success');
            document.getElementById('buyTicketModal').classList.remove('show');
            document.getElementById('buyUserIdInput').value = '';
            loadAllEvents(); // Refresh events list
        } else {
            showToast(result.error || 'Failed to buy ticket', 'error');
        }
    } catch (error) {
        console.error('Error buying ticket:', error);
        showToast('Error purchasing ticket', 'error');
    }
});

document.getElementById('loadTicketsBtn').addEventListener('click', async () => {
    const userId = document.getElementById('userIdInput').value.trim();

    if (!userId) {
        showToast('Please enter your User ID', 'warning');
        return;
    }

    const ticketsList = document.getElementById('ticketsList');
    ticketsList.innerHTML = '<div class="loading">Loading your tickets...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/tickets`);
        const result = await response.json();

        if (result.status === 'success') {
            if (result.data.length > 0) {
                ticketsList.innerHTML = '';
                result.data.forEach(ticket => {
                    ticketsList.appendChild(createTicketCard(ticket));
                });
            } else {
                ticketsList.innerHTML = '<div class="empty-state">You have no tickets yet</div>';
            }
        } else {
            ticketsList.innerHTML = '<div class="empty-state">No tickets found</div>';
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        showToast('Failed to load tickets', 'error');
        ticketsList.innerHTML = '<div class="empty-state">Error loading tickets</div>';
    }
});

function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';

    card.innerHTML = `
        <div class="ticket-id">Ticket ID: ${ticket.id}</div>
        <div class="ticket-event-name">Event #${ticket.eventId}</div>
        <div class="ticket-info">
            <div class="ticket-info-item">
                <div class="ticket-info-label">Purchase Date</div>
                <div class="ticket-info-value">${formatDate(ticket.purchaseDate)}</div>
            </div>
            <div class="ticket-info-item">
                <div class="ticket-info-label">User ID</div>
                <div class="ticket-info-value">${escapeHtml(ticket.userId)}</div>
            </div>
        </div>
    `;

    card.addEventListener('click', () => openTicketDetailsModal(ticket));
    return card;
}

function openTicketDetailsModal(ticket) {
    const modal = document.getElementById('ticketDetailsModal');
    const ticketDetails = document.getElementById('ticketDetails');

    ticketDetails.innerHTML = `
        <p><strong>Ticket ID:</strong> ${ticket.id}</p>
        <p><strong>Event ID:</strong> ${ticket.eventId}</p>
        <p><strong>User ID:</strong> ${escapeHtml(ticket.userId)}</p>
        <p><strong>Purchase Date:</strong> ${formatDate(ticket.purchaseDate)}</p>
    `;

    document.getElementById('cancelTicketBtn').onclick = () => cancelTicket(ticket.id);
    modal.classList.add('show');
}

async function cancelTicket(ticketId) {
    if (!confirm('Are you sure you want to cancel this ticket? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showToast('✓ Ticket cancelled successfully', 'success');
            document.getElementById('ticketDetailsModal').classList.remove('show');
            const userId = document.getElementById('userIdInput').value.trim();
            if (userId) {
                document.getElementById('loadTicketsBtn').click();
            }
        } else {
            showToast(result.error || 'Failed to cancel ticket', 'error');
        }
    } catch (error) {
        console.error('Error cancelling ticket:', error);
        showToast('Error cancelling ticket', 'error');
    }
}

document.getElementById('createEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventName = document.getElementById('eventName').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const eventCapacity = parseInt(document.getElementById('eventCapacity').value);
    const eventPrice = parseFloat(document.getElementById('eventPrice').value);
    const eventLocation = document.getElementById('eventLocation').value.trim();
    const eventDescription = document.getElementById('eventDescription').value.trim();

    if (!eventName || !eventDate || !eventCapacity || eventPrice < 0) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: eventName,
                date: eventDate,
                capacity: eventCapacity,
                price: eventPrice,
                location: eventLocation,
                description: eventDescription
            })
        });

        const result = await response.json();

        if (response.ok) {
            showToast('✓ Event created successfully!', 'success');
            document.getElementById('createEventForm').reset();
            switchTab('events');
        } else {
            showToast(result.message || 'Failed to create event', 'error');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showToast('Error creating event', 'error');
    }
});

document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const eventCards = document.querySelectorAll('.event-card');

    eventCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
});

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

loadAllEvents();