const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    thresholdAlertCount: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Inventory', inventorySchema);
