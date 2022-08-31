const HttpError = require('../models/http-error');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const msgs = require('../email/email.msgs');
const sendEmail = require('../email/email.send');
const templates = require('../email/email.templates');

const signup = async (req, res, next) => {
    const { name, email, password } = req.body;

    // User.findOne({ email })
    //     .then(user => {

    //         // We have a new user! Send them a confirmation email.
    //         if (!user) {
    //             User.create({ email })
    //                 .then(newUser => sendEmail(newUser.email, templates.confirm(newUser._id)))
    //                 .then(() => {
    //                     res.json({ msg: msgs.confirm })
    //                     console.log(msgs.confirm)
    //                 })
    //                 .catch(err => console.log(err))
    //         }

    //         // We have already seen this email address. But the user has not
    //         // clicked on the confirmation link. Send another confirmation email.
    //         else if (user && !user.confirmed) {
    //             console.log('in2')
    //             sendEmail(user.email, templates.confirm(user._id))
    //                 .then(() => res.json({ msg: msgs.resend })).catch((err) => {
    //                     console.log(err)
    //                 })
    //         }


    //         // The user has already confirmed this email address
    //         else {
    //             console.log('in3')
    //             res.json({ msg: msgs.alreadyConfirmed })
    //         }
    //     })
    //     .catch(err => console.log(err))


    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Αποτυχία δημιουργίας λογαριασμού,παρακαλώ προσπαθήστε ξανά.', 500));
    }

    if (existingUser) {
        return next(new HttpError('Αυτό το Email ανήκει ήδη σε χρήστη', 422));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError('Αποτυχία δημιουργίας λογαριασμού,παρακαλώ προσπαθήστε ξανά.', 500));
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        confirmed: false,
        patients: [],
        visits: [],
        appointments: []
    });

    try {
        await createdUser.save();
        await sendEmail(email, templates.confirm(createdUser.id))
    } catch (err) {
        console.log(err)
        const error = new HttpError('Αποτυχία δημιουργίας λογαριασμού,παρακαλώ προσπαθήστε ξανά.', 500);
        return next(error);
    };

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(new HttpError('Αποτυχία δημιουργίας λογαριασμού,παρακαλώ προσπαθήστε ξανά.', 500));
    }
    console.log(createdUser.id)

    res.status(201).json({ msg: msgs.confirm, userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    
   

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Αποτυχία σύνδεσης,παρακαλώ προσπαθήστε ξανά.', 500));
    }
    if (!existingUser) {
        return next(new HttpError('Δεν υπάρχει εγγεγραμμένος χρήστης με αυτή την διεύθυνση Email.', 401));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError('Αποτυχία σύνδεσης,παρακαλώ προσπαθήστε ξανά.', 500))
    }
    if (!isValidPassword) {
        return next(new HttpError('Ο κωδικός είναι εσφαλμένος.', 401));
    }
    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        )
    } catch (err) {
        return next(new HttpError('Αποτυχία σύνδεσης,παρακαλώ προσπαθήστε ξανά.', 500));
    }

    res.json({ userId: existingUser.id, email: existingUser.email, token: token });
};
const confirmUser = async (req, res, next) => {
    const userId = req.params.userId;
    let token;
    console.log('in1', userId)
    try {
        token = jwt.sign(
            { userId: userId, email: 'test@gmail.com' },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        )
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία σύνδεσης,παρακαλώ προσπαθήστε ξανά.', 500));
    }
    User.findById(userId)
        .then(user => {
            // A user with that id does not exist in the DB. Perhaps some tricky 
            // user tried to go to a different url than the one provided in the 
            // confirmation email.
            if (!user) {
                console.log('in3')
                res.json({ msg: msgs.couldNotFind })
            }
            else if (user && !user.confirmed) {
                console.log('in4')
                User.findByIdAndUpdate(userId, { confirmed: true })
                    .then(() => res.json({ msg: msgs.confirmed, userId: userId, email: User.email, token: token }))
                    .catch(err => console.log(err))
            }
            else {
                res.json({ msg: msgs.alreadyConfirmed })
            }
        })
}

exports.signup = signup;
exports.login = login;
exports.confirmUser = confirmUser;