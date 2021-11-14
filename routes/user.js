const router = require('express').Router();

router.get('/', (req, res) => {
    res.send('USER...');
});

module.exports = router;