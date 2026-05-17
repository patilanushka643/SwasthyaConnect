const path = require('path');
const Inventory = require('../models/Inventory');
const Emergency = require('../models/Emergency');
const MedicalRecord = require('../models/MedicalRecord');

const decrementStock = async (req, res, next) => {
  try {
    const { medicineName, quantity } = req.body;

    if (!medicineName || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'medicineName and positive quantity are required.' });
    }

    const inventory = await Inventory.findOne({ medicineName: medicineName.trim() });

    if (!inventory) {
      return res.status(404).json({ message: 'Medicine not found in inventory.' });
    }

    if (inventory.stockQuantity < quantity) {
      return res.status(409).json({ message: 'Insufficient stock quantity.' });
    }

    inventory.stockQuantity -= quantity;
    await inventory.save();

    return res.status(200).json({
      message: 'Stock updated successfully.',
      item: inventory,
      lowStock: inventory.stockQuantity <= inventory.thresholdAlertCount,
    });
  } catch (error) {
    next(error);
  }
};

const uploadLabFile = async (req, res, next) => {
  try {
    const { recordId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required.' });
    }

    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.path)}`;

    record.fileUrl = fileUrl;
    await record.save();

    return res.status(200).json({
      message: 'Lab file uploaded successfully.',
      record,
    });
  } catch (error) {
    next(error);
  }
};

const upsertEmergency = async (req, res, next) => {
  try {
    const { emergencyId } = req.params;
    const { patientName, triageLevel, assignedBed, status } = req.body;

    if (!patientName || !triageLevel) {
      return res.status(400).json({ message: 'patientName and triageLevel are required.' });
    }

    let emergency;

    if (emergencyId) {
      emergency = await Emergency.findByIdAndUpdate(
        emergencyId,
        {
          $set: {
            patientName,
            triageLevel,
            assignedBed: assignedBed || '',
            status: status || 'Waiting',
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!emergency) {
        return res.status(404).json({ message: 'Emergency case not found.' });
      }
    } else {
      emergency = await Emergency.create({
        patientName,
        triageLevel,
        assignedBed: assignedBed || '',
        status: status || 'Waiting',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:update', emergency);
    }

    return res.status(200).json({
      message: 'Emergency triage updated successfully.',
      emergency,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOverview = async (_req, res, next) => {
  try {
    const lowInventory = await Inventory.find({
      $expr: { $lte: ['$stockQuantity', '$thresholdAlertCount'] },
    }).sort({ stockQuantity: 1 });

    const emergencyStats = await Emergency.aggregate([
      {
        $group: {
          _id: '$triageLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      lowInventory,
      emergencyStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  decrementStock,
  uploadLabFile,
  upsertEmergency,
  getAdminOverview,
};
