const express = require('express');
const upload = require('../middleware/upload');
const { protect, restrictTo } = require('../middleware/auth');
const authController = require('../controllers/authController');
const opdController = require('../controllers/opdController');
const clinicalController = require('../controllers/clinicalController');
const logisticsController = require('../controllers/logisticsController');

const router = express.Router();

router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/otp/request', authController.requestOtp);
router.post('/auth/otp/verify', authController.verifyOtp);
router.get('/auth/staff', protect, restrictTo('admin'), authController.getStaff);

router.get('/opd/doctors', protect, opdController.getDoctors);
router.post('/opd/book', protect, restrictTo('patient'), opdController.bookAppointment);
router.get('/opd/my-appointments', protect, restrictTo('patient'), opdController.getPatientAppointments);
router.get('/opd/doctor-queue', protect, restrictTo('doctor', 'admin'), opdController.getDoctorQueue);
router.get('/opd/queue/:appointmentId', protect, opdController.getQueueStatus);

router.get('/clinical/timeline', protect, clinicalController.getTimeline);
router.post('/clinical/record', protect, restrictTo('doctor'), clinicalController.submitMedicalRecord);

router.post('/logistics/pharmacy/decrement', protect, restrictTo('admin', 'doctor'), logisticsController.decrementStock);
router.post(
  '/logistics/records/:recordId/upload',
  protect,
  restrictTo('doctor', 'admin'),
  upload.single('file'),
  logisticsController.uploadLabFile
);
router.put('/logistics/emergency/:emergencyId?', protect, restrictTo('admin', 'doctor'), logisticsController.upsertEmergency);
router.get('/logistics/admin/overview', protect, restrictTo('admin'), logisticsController.getAdminOverview);

module.exports = router;
