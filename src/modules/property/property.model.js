const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    isBooked: { type: Boolean, default: false },
    occupantName: { type: String, default: null },
    occupantPhone: { type: String, default: null },
    bookedAt: { type: Date, default: null },
    rentAmount: { type: Number, default: null },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    roomType: {
      type: String,
      enum: ['single', 'two_bed', 'three_bed', 'four_bed', 'five_bed'],
      default: 'single',
    },
    roomNumber: { type: Number, required: true },
    roomName: { type: String, required: true },
    seats: { type: [seatSchema], default: [] },
  },
  { _id: false }
);

const utilityBillSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'বিজ্ঞাপনের শিরোনাম দিন'],
      trim: true,
      maxlength: [160, 'শিরোনাম ১৬০ অক্ষরের বেশি হতে পারবে না'],
    },
    buildingName: {
      type: String,
      trim: true,
      default: '',
    },
    houseNumber: {
      type: String,
      trim: true,
      default: '',
    },
    floorLevel: {
      type: String,
      trim: true,
      default: '',
    },
    bedrooms: {
      type: Number,
      default: 1,
      min: [0, 'বেডরুম সংখ্যা ০ বা তার বেশি হতে হবে'],
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: [0, 'বাথরুম সংখ্যা ০ বা তার বেশি হতে হবে'],
    },
    balconies: {
      type: Number,
      default: 0,
      min: [0, 'বারান্দার সংখ্যা ০ বা তার বেশি হতে হবে'],
    },
    area: {
      type: String,
      required: [true, 'এলাকা নির্বাচন করুন'],
      trim: true,
      index: true,
    },
    subArea: {
      type: String,
      required: [true, 'সাব-এলাকা দিন'],
      trim: true,
      index: true,
    },
    goliNumber: {
      type: String,
      trim: true,
      default: '',
    },
    detailedAddress: {
      type: String,
      required: [true, 'বিস্তারিত ঠিকানা দিন'],
      trim: true,
    },
    rentPrice: {
      type: Number,
      required: [true, 'ভাড়ার পরিমাণ দিন'],
      min: [100, 'ভাড়া কমপক্ষে ১০০ টাকা হতে হবে'],
      index: true,
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },
    tenantType: {
      type: String,
      default: 'Family',
      index: true,
    },
    tenantTypes: {
      type: [String],
      default: ['Family'],
      index: true,
    },
    rentType: {
      type: String,
      enum: ['entire_house', 'single_room'],
      default: 'entire_house',
      index: true,
    },
    maxOccupants: {
      type: Number,
      default: 1,
    },

    // Mess-specific fields
    isMess: {
      type: Boolean,
      default: false,
      index: true,
    },
    singleBedRooms: {
      type: Number,
      default: 0,
    },
    twoBedRooms: {
      type: Number,
      default: 0,
    },
    threeBedRooms: {
      type: Number,
      default: 0,
    },
    fourBedRooms: {
      type: Number,
      default: 0,
    },
    fiveBedRooms: {
      type: Number,
      default: 0,
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    vacantSeats: {
      type: Number,
      default: 0,
    },
    rooms: {
      type: [roomSchema],
      default: [],
    },
    isUtilitySeparate: {
      type: Boolean,
      default: false,
    },
    utilityBills: {
      type: [utilityBillSchema],
      default: [],
    },
    showUtilityAmountToSeekers: {
      type: Boolean,
      default: true,
    },

    availableMonth: {
      type: String,
      required: [true, 'কোন মাস থেকে ভাড়া হবে তা উল্লেখ করুন'],
      trim: true,
      default: 'চলতি মাস থেকে',
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    landlordName: {
      type: String,
      trim: true,
      default: '',
    },
    landlordPhone: {
      type: String,
      trim: true,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [90.399452, 23.777176],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isCommunityPaused: {
      type: Boolean,
      default: false,
      index: true,
    },
    alreadyRentedReportCount: {
      type: Number,
      default: 0,
    },
    communityPausedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast multi-filter search
propertySchema.index({ area: 1, subArea: 1, rentPrice: 1, tenantType: 1, isMess: 1, isActive: 1 });

// Full text search index
propertySchema.index({ title: 'text', detailedAddress: 'text', buildingName: 'text' });

// Geospatial 2dsphere index for location based queries
propertySchema.index({ location: '2dsphere' });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
