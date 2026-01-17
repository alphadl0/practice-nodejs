const controller = require('../controller/controller');

module.exports = (router) => {
    // Etkinlik işlemleri
    router.get('/events', controller.getAllEvents);
    router.post('/events', controller.createEvent);

    // Bilet işlemleri (İş kuralları burada tetiklenir)
    router.post('/tickets', controller.buyTicket);
    router.delete('/tickets/:id', controller.cancelTicket);
    router.get('/users/:userId/tickets', controller.getUserTickets);
};