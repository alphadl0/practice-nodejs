const controller = require('../controller/controller');

module.exports = (router) => {
    router.get('/events', controller.getAllEvents);
    router.post('/events', controller.createEvent);
    router.post('/tickets', controller.buyTicket);
    router.delete('/tickets/:id', controller.cancelTicket);
    router.get('/users/:userId/tickets', controller.getUserTickets);
};