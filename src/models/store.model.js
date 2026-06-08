import { Schema, model } from 'mongoose';
import validator from 'validator';

const storeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    numOfEmployees: {
      type: String,
      enum: ['1-10', '10-30', '30-50', '50+'],
      required: [true, 'Please select number of employees'],
    },
    telephone: {
      type: String,
      validate: [validator.isMobilePhone],
    },
    logo: {
      type: String,
      default: 'default.png',
    },
    address: {
      line_1: {
        type: String,
        required: [true, 'Please provide address line'],
      },
      line_2: String,
      city: {
        type: String,
        required: [true, 'Please tell us the city'],
      },
      region: {
        type: String,
        required: [true, 'Provide the state/province/region'],
      },
      zipcode: {
        type: String,
        required: [true, 'Provide zipcode'],
      },
    },
    location: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    fee: Number,
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Store must belong to an owner'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

// Number of employees and fee
const numEmployeesFees = [
  { employee: '1-10', amount: 5000 },
  { employee: '10-30', amount: 100000 },
  { employee: '30-50', amount: 200000 },
  { employee: '50+', amount: 500000 },
];

// Virtual populate
storeSchema.virtual('products', {
  ref: 'Product',
  foreignField: 'store',
  localField: '_id',
});

/**
 * @breif Populate store with user when find
 */
storeSchema.pre(/^find/, function (next) {
  // Populate with user
  this.populate({
    path: 'user',
    select: 'username email _id id',
  });
  next();
});

/**
 * @breif Set fee base on employee range
 */
storeSchema.pre('save', async function (next) {
  this.fee = numEmployeesFees.find(
    (item) => item.employee === this.numOfEmployees
  );
  next();
});

const Store = model('Store', storeSchema);

export default Store;
