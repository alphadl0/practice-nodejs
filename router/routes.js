const router = require('express').Router();
const {getAllEvents,createEvent,buyTicket,cancelTicket,getUserTickets} = require('../controller/controller');

router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.post('/tickets', buyTicket);
router.delete('/tickets/:id', cancelTicket);
router.get('/users/:userId/tickets', getUserTickets);

module.exports = router;