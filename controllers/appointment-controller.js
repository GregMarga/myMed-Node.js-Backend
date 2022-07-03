const HttpError = require('../models/http-error');
const Appointment = require('../models/appointment');
const User = require('../models/user');
const { default: mongoose } = require('mongoose');




const saveAppointments = async (req, res, next) => {
    const userId = req.params.uid;
    const { startDate, endDate, title, notes } = req.body;
    const id = mongoose.Types.ObjectId();

    let doctor;
    try {
        doctor = await User.findById(userId);
    } catch (err) {
        return next(new HttpError('Creating Appointment failed.', 500));
    }
    if (!doctor) {
        return next(new HttpError('Could not find a user for provided id', 404));
    }
    const createdAppointment = new Appointment({
        _id: id,
        startDate,
        endDate,
        title,
        notes,
        doctor: userId,
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdAppointment.save({ session: sess });
        doctor.appointments.push(createdAppointment);
        await doctor.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Signing up failed,please try again.', 500);
        return next(error);
    };




    res.status(201).json({ id: id, startDate: startDate, endDate: endDate, title: title, notes: notes });
};

const getAppointments = async (req, res, next) => {
    const userId = req.params.uid;
    let appointments;
    try {
        appointments = await Appointment.find({ patient: userId });
    } catch (err) {
        return new HttpError('Could not load appointments', 500);
    }
    res.json(appointments);
};

const updateAppointments = async (req, res, next) => {
    const { appId, startDate, endDate, title, notes } = req.body;
    let appointment;
    try {
        appointment = await Appointment.findById(appId);
    } catch (err) {
       
        return next(new HttpError('Something went wrong could not update appointment.', 500));
    }
    appointment.startDate = (!!startDate) ? startDate : appointment.startDate;
    appointment.endDate = (!!endDate) ? endDate : appointment.endDate;
    appointment.title = (!!title) ? title : appointment.title;
    appointment.notes = (!!notes) ? notes : appointment.notes;

    try {
        await appointment.save();
    } catch (err) {
        return next(new HttpError('Could not update appointment,please try again later', 500));
    }
    res.json({ id: appointment._id, startDate: appointment.startDate, title: appointment.title, endDate: appointment.endDate, notes: appointment.notes });
}
const deleteAppointment = async (req, res, next) => {
    const appId = req.params.appId;
    let appointment;
    try {
        appointment = await Appointment.findById(appId).populate('doctor');
    } catch (err) {
        return next(new HttpError(' Could not delete appointment,please try again later.', 500))
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await appointment.remove({ session: sess });
        appointment.doctor.appointments.pull(appointment);
        await appointment.doctor.save({ session: sess });
        await sess.commitTransaction();

    } catch (err) {
        return next(new HttpError('Something went wrong,could not delete appointment.', 500));
    }
    res.json(appointment);
}

exports.saveAppointments = saveAppointments;
exports.getAppointments = getAppointments;
exports.updateAppointments = updateAppointments;
exports.deleteAppointment = deleteAppointment;