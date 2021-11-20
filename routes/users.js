const {userValidation} = require("../validation/users");
const {User} = require("../database/users");
const router = require('express').Router();

router.post('/', async(req, res)=>{
    const {error} = userValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.getUser({email: req.body.email});
    if(user) return res.status(400).send("Email already in use");

    await User.signup(req.body);

    res.send("User saved.");
});

module.exports = router;