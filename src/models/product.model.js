import { Schema, model } from 'mongoose';
import AppError from '../utilities/appError.js';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name!'],
      trim: true,
      maxlength: [
        40,
        'A product name must have less or equal than 40 characters',
      ],
      minlength: [
        5,
        'A product name must have more or equal than 10 characters',
      ],
    },
    brand: String,
    measurement: {
      unit: String,
      value: Number,
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price!'],
    },
    currency: {
      type: String,
      enum: ['UGX', 'USD', 'EURO'],
      default: 'UGX',
    },
    priceDiscount: Number,
    percentageDiscount: {
      type: Number,
      set: function (value) {
        return Math.round(value);
      },
    },
    imageCover: {
      type: String,
      required: [true, 'A product must have a cover photo'],
    },
    images: [String],
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'A product must belong to a category'],
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'A product must belong to a store'],
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

/**
 * @brief This middleware runs for update, to check for
 * priceDiscount less than price
 */
productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const price = update.price;
  const priceDiscount = update.priceDiscount;

  if (priceDiscount && price && priceDiscount >= price) {
    return next(
      new AppError('Discount price must be less than regular price', 400)
    );
  }

  if (priceDiscount) {
    update.$set = update.$set || {};
    update.$set.percentageDiscount =
      100 - (update.priceDiscount * 100) / update.price;
  }

  next();
});

/**
 * @brief This middleware runs for save and create, to check for
 * priceDiscount less than price
 */
productSchema.pre('save', function (next) {
  if (this.priceDiscount && this.priceDiscount >= this.price) {
    return next(
      new AppError('Discount price must be less than regular price', 400)
    );
  }

  if (this.priceDiscount) {
    this.percentageDiscount =
      Math.round(((this.price - this.priceDiscount) / this.price) * 10000) /
      100;
  } else {
    this.percentageDiscount = 0;
  }

  next();
});

/**
 * @breif Populate middleware in find operation for
 * store and category
 */
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'store',
    select: 'name _id',
  }).populate({
    path: 'category',
    select: 'name _id',
  });

  next();
});

const Product = model('Product', productSchema);

export default Product;
