const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    console.log('server check...');
    res.send("I'm up!");
});

module.exports = router;