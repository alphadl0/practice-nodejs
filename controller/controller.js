const db = require('../db/mysql_connect');

// Initialize in-memory storage (temporary until database is connected)
let events = [];
let tickets = [];

const controller = {
    
    // --- GET METHODS ---
    getAllEvents: (req, res) => {
        res.status(200).json({
            status: "success",
            data: events
        });
    },

    getUserTickets: (req, res) => {
        const { userId } = req.params;
        const userTickets = tickets.filter(t => t.userId == userId);
        res.status(200).json({
            status: "success",
            count: userTickets.length,
            data: userTickets
        });
    },

    // --- POST METHODS (Create) ---
    createEvent: (req, res) => {
        const newEvent = req.body;
        newEvent.id = events.length + 1; 
        newEvent.sold = 0; 
        
        events.push(newEvent);
        res.status(201).json({ message: "Etkinlik oluşturuldu", data: newEvent });
    },

    // SENARYO 1: STOK KONTROLÜ (Satın Alma)
    buyTicket: (req, res) => {
        const { eventId, userId } = req.body;
        
        const event = events.find(e => e.id == eventId);
        if (!event) return res.status(404).json({ error: "Etkinlik bulunamadı" });

        if (event.sold >= event.capacity) {
            return res.status(400).json({ 
                error: "Kapasite dolu! Bilet satışı yapılamaz.",
                type: "BUSINESS_RULE_ERROR"
            });
        }

        event.sold++;
        const newTicket = { 
            id: Date.now(), 
            eventId: parseInt(eventId), 
            userId, 
            purchaseDate: new Date() 
        };
        tickets.push(newTicket);

        res.status(201).json({ message: "Bilet başarıyla alındı", ticket: newTicket });
    },

    // SENARYO 2: TARİH KONTROLÜ (İptal)
    cancelTicket: (req, res) => {
        const ticketId = req.params.id;
        const ticket = tickets.find(t => t.id == ticketId);
        
        if (!ticket) return res.status(404).json({ error: "Bilet bulunamadı" });

        const event = events.find(e => e.id == ticket.eventId);
        if (!event) return res.status(404).json({ error: "Etkinlik bulunamadı" });

        const eventDate = new Date(event.date);
        const now = new Date();
        const hoursLeft = (eventDate - now) / (1000 * 60 * 60);

        if (hoursLeft < 24) {
            return res.status(400).json({ 
                error: "Etkinliğe 24 saatten az kaldığı için iptal edilemez.",
                type: "BUSINESS_RULE_ERROR"
            });
        }

        tickets = tickets.filter(t => t.id != ticketId);
        event.sold--;

        res.status(200).json({ message: "Bilet iptal edildi." });
    }
};

module.exports = controller;