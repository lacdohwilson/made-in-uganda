import { Schema, model } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subcription must belong to a user!'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide subcription amount!'],
    },
    datePaid: {
      type: Date,
      default: Date.now(),
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
 * @breif Middleware to populate subcription with store (user)
 */
subscriptionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'username email',
  });
  next();
});

const Subscription = model('Subcription', subscriptionSchema);

export default Subscription;
