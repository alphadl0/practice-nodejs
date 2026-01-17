const db = require('../db/mysql_connect');

const controller = {
    
    // --- GET METHODS ---
    getAllEvents: async (req, res) => {
        try {
            const [events] = await db.query('SELECT * FROM events');
            res.status(200).json({
                status: "success",
                data: events
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getUserTickets: async (req, res) => {
        const { userId } = req.params;
        try {
            const [userTickets] = await db.query('SELECT * FROM tickets WHERE userId = ?', [userId]);
            res.status(200).json({
                status: "success",
                count: userTickets.length,
                data: userTickets
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // --- POST METHODS (Create) ---
    createEvent: async (req, res) => {
        const { name, date, capacity, price, location, description } = req.body;
        try {
            const [result] = await db.query(
                'INSERT INTO events (name, date, capacity, price, location, description, sold) VALUES (?, ?, ?, ?, ?, ?, 0)',
                [name, date, capacity, price, location, description]
            );
            const newEvent = { id: result.insertId, ...req.body, sold: 0 };
            res.status(201).json({ message: "Etkinlik oluşturuldu", data: newEvent });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // SENARYO 1: STOK KONTROLÜ (Satın Alma)
    buyTicket: async (req, res) => {
        const { eventId, userId } = req.body;
        
        try {
            const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
            const event = events[0];

            if (!event) return res.status(404).json({ error: "Etkinlik bulunamadı" });

            if (event.sold >= event.capacity) {
                return res.status(400).json({ 
                    error: "Kapasite dolu! Bilet satışı yapılamaz.",
                    type: "BUSINESS_RULE_ERROR"
                });
            }

            const [ticketResult] = await db.query(
                'INSERT INTO tickets (eventId, userId, purchaseDate) VALUES (?, ?, NOW())',
                [eventId, userId]
            );

            await db.query('UPDATE events SET sold = sold + 1 WHERE id = ?', [eventId]);

            const newTicket = { 
                id: ticketResult.insertId, 
                eventId: parseInt(eventId), 
                userId, 
                purchaseDate: new Date() 
            };

            res.status(201).json({ message: "Bilet başarıyla alındı", ticket: newTicket });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // SENARYO 2: TARİH KONTROLÜ (İptal)
    cancelTicket: async (req, res) => {
        const ticketId = req.params.id;
        
        try {
            const [tickets] = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
            const ticket = tickets[0];
            
            if (!ticket) return res.status(404).json({ error: "Bilet bulunamadı" });

            const [events] = await db.query('SELECT * FROM events WHERE id = ?', [ticket.eventId]);
            const event = events[0];
            
            if (!event) return res.status(404).json({ error: "Etkinlik bulunamadı" });

            const eventDate = new Date(event.date);
            const now = new Date();
            const hoursLeft = (eventDate - now) / (1000 * 60 * 60);

            if (hoursLeft < 6) {
                return res.status(400).json({ 
                    error: "Etkinliğe 6 saatten az kaldığı için iptal edilemez.",
                    type: "BUSINESS_RULE_ERROR"
                });
            }

            await db.query('DELETE FROM tickets WHERE id = ?', [ticketId]);
            await db.query('UPDATE events SET sold = sold - 1 WHERE id = ?', [ticket.eventId]);

            res.status(200).json({ message: "Bilet iptal edildi." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = controller;