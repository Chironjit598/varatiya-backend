const Property = require('./property.model');
const PropertyReport = require('./propertyReport.model');
const ManagedMess = require('../mess/mess.model');
const alertService = require('../alert/alert.service');
const notificationService = require('../notification/notification.service');
const {
  buildMessRooms,
  normalizeRoomsArray,
  calculateSeatMetrics,
  extractRoomCountsFromRooms,
  normalizeUtilityBills,
} = require('../../utils/messHelper');

class PropertyService {
  formatProperty(doc) {
    if (!doc) return null;
    const obj = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
    obj.id = (obj.id || obj._id || '').toString();
    obj._id = obj._id || obj.id;
    obj.isCommunityPaused = Boolean(obj.isCommunityPaused);
    obj.alreadyRentedReportCount = Number(obj.alreadyRentedReportCount) || 0;
    return obj;
  }

  /**
   * Create a new Property or Mess listing
   */
  async createProperty(userId, userData, payload) {
    const {
      title,
      buildingName,
      houseNumber,
      floorLevel,
      bedrooms,
      bathrooms,
      balconies,
      area,
      subArea,
      goliNumber,
      detailedAddress,
      rentPrice,
      isNegotiable,
      tenantType,
      tenantTypes,
      rentType,
      maxOccupants,
      isMess,
      singleBedRooms,
      twoBedRooms,
      threeBedRooms,
      fourBedRooms,
      fiveBedRooms,
      rooms: rawRooms,
      isUtilitySeparate,
      utilityBills: rawUtilityBills,
      showUtilityAmountToSeekers,
      availableMonth,
      imageUrls,
      amenities,
      latitude,
      longitude,
      contactPhone,
      landlordName,
      landlordPhone,
    } = payload;

    const isMessFlag = Boolean(isMess);
    let rooms = [];
    let totalSeats = 0;
    let vacantSeats = 0;
    let roomCounts = {
      singleBedRooms: Math.max(0, Number(singleBedRooms) || 0),
      twoBedRooms: Math.max(0, Number(twoBedRooms) || 0),
      threeBedRooms: Math.max(0, Number(threeBedRooms) || 0),
      fourBedRooms: Math.max(0, Number(fourBedRooms) || 0),
      fiveBedRooms: Math.max(0, Number(fiveBedRooms) || 0),
    };

    if (isMessFlag) {
      const hasCountInput =
        roomCounts.singleBedRooms +
          roomCounts.twoBedRooms +
          roomCounts.threeBedRooms +
          roomCounts.fourBedRooms +
          roomCounts.fiveBedRooms >
        0;

      if (hasCountInput) {
        const built = buildMessRooms(roomCounts, Array.isArray(rawRooms) ? rawRooms : []);
        rooms = built.rooms;
        totalSeats = built.totalSeats;
        vacantSeats = built.vacantSeats;
      } else if (Array.isArray(rawRooms) && rawRooms.length > 0) {
        rooms = normalizeRoomsArray(rawRooms);
        const metrics = calculateSeatMetrics(rooms);
        totalSeats = metrics.totalSeats;
        vacantSeats = metrics.vacantSeats;
        roomCounts = extractRoomCountsFromRooms(rooms);
      } else {
        // Default 1 two-bed room if no room counts or rooms were specified for a mess
        roomCounts.twoBedRooms = 1;
        const built = buildMessRooms(roomCounts, []);
        rooms = built.rooms;
        totalSeats = built.totalSeats;
        vacantSeats = built.vacantSeats;
      }
    }

    const totalMessRooms =
      roomCounts.singleBedRooms +
      roomCounts.twoBedRooms +
      roomCounts.threeBedRooms +
      roomCounts.fourBedRooms +
      roomCounts.fiveBedRooms;

    const utilityBills = normalizeUtilityBills(rawUtilityBills);
    const resolvedLandlordName = landlordName ? landlordName.trim() : userData.name || '';
    const resolvedLandlordPhone = landlordPhone
      ? landlordPhone.trim()
      : userData.phoneNumber || '';
    const resolvedContactPhone = contactPhone
      ? contactPhone.trim()
      : resolvedLandlordPhone;

    const propertyData = {
      owner: userId,
      title: title.trim(),
      buildingName: buildingName ? buildingName.trim() : '',
      houseNumber: houseNumber ? houseNumber.trim() : '',
      floorLevel: floorLevel ? floorLevel.trim() : '',
      bedrooms: isMessFlag
        ? Number(bedrooms) || Math.max(1, totalMessRooms)
        : Number(bedrooms) || 1,
      bathrooms: isMessFlag
        ? bathrooms !== undefined
          ? Number(bathrooms)
          : 0
        : Number(bathrooms) || 1,
      balconies: balconies !== undefined ? Number(balconies) : 0,
      area: area.trim(),
      subArea: subArea.trim(),
      goliNumber: goliNumber ? goliNumber.trim() : '',
      detailedAddress: detailedAddress.trim(),
      rentPrice: Number(rentPrice),
      isNegotiable: Boolean(isNegotiable),
      tenantType: tenantType || (isMessFlag ? 'Bachelor (Male)' : 'Any'),
      tenantTypes:
        Array.isArray(tenantTypes) && tenantTypes.length > 0
          ? tenantTypes
          : [tenantType || (isMessFlag ? 'Bachelor (Male)' : 'Any')],
      rentType:
        rentType && ['entire_house', 'single_room'].includes(rentType)
          ? rentType
          : 'entire_house',
      maxOccupants: maxOccupants !== undefined ? Number(maxOccupants) : 1,

      isMess: isMessFlag,
      singleBedRooms: roomCounts.singleBedRooms,
      twoBedRooms: roomCounts.twoBedRooms,
      threeBedRooms: roomCounts.threeBedRooms,
      fourBedRooms: roomCounts.fourBedRooms,
      fiveBedRooms: roomCounts.fiveBedRooms,
      totalSeats,
      vacantSeats,
      rooms,
      isUtilitySeparate: Boolean(isUtilitySeparate),
      utilityBills,
      showUtilityAmountToSeekers:
        showUtilityAmountToSeekers !== undefined
          ? Boolean(showUtilityAmountToSeekers)
          : true,

      availableMonth: availableMonth.trim(),
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [imageUrls],
      amenities: Array.isArray(amenities) ? amenities : [],
      contactPhone: resolvedContactPhone,
      landlordName: resolvedLandlordName,
      landlordPhone: resolvedLandlordPhone,
      isActive: true,
    };

    if (latitude !== undefined && longitude !== undefined && latitude !== '' && longitude !== '') {
      propertyData.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    const property = await Property.create(propertyData);

    // Automatically create a linked ManagedMess document with the same _id when isMess == true
    if (isMessFlag) {
      const messName =
        property.buildingName && property.buildingName.trim().length > 0
          ? property.buildingName.trim()
          : property.title;

      await ManagedMess.findOneAndUpdate(
        { _id: property._id },
        {
          $setOnInsert: {
            _id: property._id,
            propertyId: property._id,
            name: messName,
            address: property.detailedAddress,
            area: property.area,
            managerId: userId.toString(),
            managerName: resolvedLandlordName,
            managerPhone: resolvedContactPhone || resolvedLandlordPhone,
            defaultSeatRent: Number(property.rentPrice) || 3000,
            singleBedRooms: roomCounts.singleBedRooms,
            twoBedRooms: roomCounts.twoBedRooms,
            threeBedRooms: roomCounts.threeBedRooms,
            fourBedRooms: roomCounts.fourBedRooms,
            fiveBedRooms: roomCounts.fiveBedRooms,
            totalSeats,
            vacantSeats,
            rooms,
            isUtilitySeparate: property.isUtilitySeparate,
            utilityBills: property.utilityBills,
            showUtilityAmountToSeekers: property.showUtilityAmountToSeekers,
            sharedBills: property.isUtilitySeparate
              ? property.utilityBills.map((ub) => ({
                  id: ub.id,
                  title: ub.name,
                  category: 'other',
                  amount: ub.amount,
                  month: property.availableMonth || 'নভেম্বর ২০২৬',
                  dateAdded: new Date(),
                  note: '',
                }))
              : [],
            notices: [],
            members: [
              {
                id: userId.toString(),
                name: resolvedLandlordName || 'মেস ম্যানেজার',
                phone: resolvedContactPhone || resolvedLandlordPhone,
                isAdmin: true,
                isManager: true,
                totalMealsConsumed: 0,
                totalMoneyDeposited: 0,
                todayMealSlots: [true, true],
                customDateSlots: {},
              },
            ],
            bazarEntries: [],
            mealRequests: [],
            mealConfig: {
              messName,
              mealsPerDay: 2,
              managerId: userId.toString(),
              managerName: resolvedLandlordName || 'মেস ম্যানেজার',
              currentMonth: property.availableMonth || 'নভেম্বর ২০২৬',
            },
          },
        },
        { upsert: true, new: true }
      );
    }

    // Check active AlertSubscription records and increment matchCount
    try {
      await alertService.matchPropertyWithAlerts(property);
    } catch (err) {
      console.error('[Alert Match Warning]:', err.message);
    }

    return this.formatProperty(property);
  }

  /**
   * Get all properties for public feed with filtering, text search, and pagination
   */
  async getAllProperties(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    const andConditions = [];

    // Filter by isMess if passed
    if (queryParams.isMess !== undefined && queryParams.isMess !== '') {
      filter.isMess = queryParams.isMess === 'true' || queryParams.isMess === true;
    }

    // Filter by rentType if passed
    if (queryParams.rentType && queryParams.rentType.trim().length > 0) {
      filter.rentType = queryParams.rentType.trim();
    }

    // Text search or regex match
    if (queryParams.search && queryParams.search.trim().length > 0) {
      const escapedSearch = queryParams.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      andConditions.push({
        $or: [
          { title: searchRegex },
          { buildingName: searchRegex },
          { detailedAddress: searchRegex },
          { area: searchRegex },
          { subArea: searchRegex },
        ],
      });
    }

    // Area filter
    if (queryParams.area && queryParams.area.trim().length > 0 && queryParams.area !== 'All') {
      const escapedArea = queryParams.area.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.area = new RegExp(escapedArea, 'i');
    }

    // Sub-area filter
    if (
      queryParams.subArea &&
      queryParams.subArea.trim().length > 0 &&
      queryParams.subArea !== 'All'
    ) {
      const escapedSubArea = queryParams.subArea
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.subArea = new RegExp(escapedSubArea, 'i');
    }

    // Tenant type filter
    if (
      queryParams.tenantType &&
      queryParams.tenantType.trim().length > 0 &&
      queryParams.tenantType !== 'All' &&
      queryParams.tenantType !== 'Any'
    ) {
      const selectedTenant = queryParams.tenantType.trim();
      const escapedTenant = selectedTenant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      andConditions.push({
        $or: [
          { tenantTypes: { $in: [selectedTenant, 'Any'] } },
          { tenantType: new RegExp(escapedTenant, 'i') },
          { tenantType: 'Any' },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // Price range filters
    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.rentPrice = {};
      if (queryParams.minPrice && !isNaN(Number(queryParams.minPrice))) {
        filter.rentPrice.$gte = Number(queryParams.minPrice);
      }
      if (queryParams.maxPrice && !isNaN(Number(queryParams.maxPrice))) {
        filter.rentPrice.$lte = Number(queryParams.maxPrice);
      }
    }

    // Bedrooms filter
    if (queryParams.minBedrooms && !isNaN(Number(queryParams.minBedrooms))) {
      filter.bedrooms = { $gte: Number(queryParams.minBedrooms) };
    }

    // Geospatial radius filter ($centerSphere)
    if (queryParams.lat && queryParams.lng && queryParams.radiusKm) {
      const lat = Number(queryParams.lat);
      const lng = Number(queryParams.lng);
      const radiusKm = Number(queryParams.radiusKm);

      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm)) {
        const radiusInRadians = radiusKm / 6378.1;
        filter.location = {
          $geoWithin: {
            $centerSphere: [[lng, lat], radiusInRadians],
          },
        };
      }
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (queryParams.sortBy === 'price_asc') {
      sort = { rentPrice: 1, createdAt: -1 };
    } else if (queryParams.sortBy === 'price_desc') {
      sort = { rentPrice: -1, createdAt: -1 };
    }

    const [total, rawProperties] = await Promise.all([
      Property.countDocuments(filter),
      Property.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name phoneNumber avatar isPhoneVerified')
        .lean(),
    ]);

    const properties = rawProperties.map((p) => this.formatProperty(p));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      properties,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get single property details by ID (Public)
   */
  async getPropertyById(id) {
    const property = await Property.findById(id)
      .populate('owner', 'name phoneNumber avatar isPhoneVerified createdAt')
      .lean();

    if (!property) {
      const error = new Error('বিজ্ঞাপনটি পাওয়া যায়নি (Property not found)');
      error.statusCode = 404;
      throw error;
    }

    return this.formatProperty(property);
  }

  /**
   * Get properties posted by current logged in user
   */
  async getMyProperties(userId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const filter = { owner: userId };

    if (queryParams.status === 'active') {
      filter.isActive = true;
    } else if (queryParams.status === 'inactive') {
      filter.isActive = false;
    }

    const [totalPosts, rawProperties] = await Promise.all([
      Property.countDocuments(filter),
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const properties = rawProperties.map((p) => this.formatProperty(p));

    return {
      properties,
      totalPosts,
    };
  }

  /**
   * Toggle Property Active / Rented status
   */
  async togglePropertyStatus(id, userId) {
    const property = await Property.findById(id);

    if (!property) {
      const error = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    if (property.owner.toString() !== userId.toString()) {
      const error = new Error('আপনার এই বিজ্ঞাপনটি পরিবর্তন করার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    property.isActive = !property.isActive;
    await property.save();

    const formatted = this.formatProperty(property);
    formatted.statusText = property.isActive
      ? 'সক্রিয় বিজ্ঞাপন (চালু)'
      : 'ভাড়া হয়ে গেছে (অফ)';

    return formatted;
  }

  /**
   * Update an existing property post & sync linked ManagedMess
   */
  async updateProperty(id, userId, payload) {
    const property = await Property.findById(id);

    if (!property) {
      const error = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    if (property.owner.toString() !== userId.toString()) {
      const error = new Error('আপনার এই বিজ্ঞাপনটি পরিবর্তন করার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    const simpleUpdatableFields = [
      'title',
      'buildingName',
      'houseNumber',
      'floorLevel',
      'bedrooms',
      'bathrooms',
      'balconies',
      'area',
      'subArea',
      'goliNumber',
      'detailedAddress',
      'rentPrice',
      'isNegotiable',
      'tenantType',
      'tenantTypes',
      'rentType',
      'maxOccupants',
      'availableMonth',
      'imageUrls',
      'amenities',
      'contactPhone',
      'landlordName',
      'landlordPhone',
      'isMess',
      'isUtilitySeparate',
      'showUtilityAmountToSeekers',
      'isActive',
    ];

    simpleUpdatableFields.forEach((field) => {
      if (payload[field] !== undefined) {
        property[field] = payload[field];
      }
    });

    if (payload.utilityBills !== undefined) {
      property.utilityBills = normalizeUtilityBills(payload.utilityBills);
    }

    if (
      payload.latitude !== undefined &&
      payload.longitude !== undefined &&
      payload.latitude !== '' &&
      payload.longitude !== ''
    ) {
      property.location = {
        type: 'Point',
        coordinates: [Number(payload.longitude), Number(payload.latitude)],
      };
    }

    // Handle Mess room updates while preserving booked seats
    if (property.isMess) {
      const roomCountFields = [
        'singleBedRooms',
        'twoBedRooms',
        'threeBedRooms',
        'fourBedRooms',
        'fiveBedRooms',
      ];
      const countsUpdated = roomCountFields.some((f) => payload[f] !== undefined);

      if (countsUpdated) {
        const targetCounts = {
          singleBedRooms:
            payload.singleBedRooms !== undefined
              ? Number(payload.singleBedRooms)
              : property.singleBedRooms,
          twoBedRooms:
            payload.twoBedRooms !== undefined
              ? Number(payload.twoBedRooms)
              : property.twoBedRooms,
          threeBedRooms:
            payload.threeBedRooms !== undefined
              ? Number(payload.threeBedRooms)
              : property.threeBedRooms,
          fourBedRooms:
            payload.fourBedRooms !== undefined
              ? Number(payload.fourBedRooms)
              : property.fourBedRooms,
          fiveBedRooms:
            payload.fiveBedRooms !== undefined
              ? Number(payload.fiveBedRooms)
              : property.fiveBedRooms,
        };

        const built = buildMessRooms(targetCounts, property.rooms || []);
        property.rooms = built.rooms;
        property.totalSeats = built.totalSeats;
        property.vacantSeats = built.vacantSeats;
        property.singleBedRooms = built.counts.singleBedRooms;
        property.twoBedRooms = built.counts.twoBedRooms;
        property.threeBedRooms = built.counts.threeBedRooms;
        property.fourBedRooms = built.counts.fourBedRooms;
        property.fiveBedRooms = built.counts.fiveBedRooms;
      } else if (Array.isArray(payload.rooms) && payload.rooms.length > 0) {
        property.rooms = normalizeRoomsArray(payload.rooms);
        const metrics = calculateSeatMetrics(property.rooms);
        property.totalSeats = metrics.totalSeats;
        property.vacantSeats = metrics.vacantSeats;
        const derivedCounts = extractRoomCountsFromRooms(property.rooms);
        property.singleBedRooms = derivedCounts.singleBedRooms;
        property.twoBedRooms = derivedCounts.twoBedRooms;
        property.threeBedRooms = derivedCounts.threeBedRooms;
        property.fourBedRooms = derivedCounts.fourBedRooms;
        property.fiveBedRooms = derivedCounts.fiveBedRooms;
      }
    }

    await property.save();

    // Sync linked ManagedMess document if it exists (or create it if isMess == true)
    if (property.isMess) {
      const linkedMess = await ManagedMess.findOne({
        $or: [{ _id: property._id }, { propertyId: property._id }],
      });

      const messName =
        property.buildingName && property.buildingName.trim().length > 0
          ? property.buildingName.trim()
          : property.title;

      if (linkedMess) {
        linkedMess.name = messName;
        linkedMess.address = property.detailedAddress;
        linkedMess.area = property.area;
        linkedMess.defaultSeatRent = Number(property.rentPrice) || linkedMess.defaultSeatRent;
        linkedMess.singleBedRooms = property.singleBedRooms;
        linkedMess.twoBedRooms = property.twoBedRooms;
        linkedMess.threeBedRooms = property.threeBedRooms;
        linkedMess.fourBedRooms = property.fourBedRooms;
        linkedMess.fiveBedRooms = property.fiveBedRooms;
        linkedMess.rooms = property.rooms;
        linkedMess.totalSeats = property.totalSeats;
        linkedMess.vacantSeats = property.vacantSeats;
        linkedMess.isUtilitySeparate = property.isUtilitySeparate;
        linkedMess.utilityBills = property.utilityBills;
        linkedMess.showUtilityAmountToSeekers = property.showUtilityAmountToSeekers;
        if (linkedMess.mealConfig) {
          linkedMess.mealConfig.messName = messName;
        }
        await linkedMess.save();
      } else {
        await ManagedMess.create({
          _id: property._id,
          propertyId: property._id,
          name: messName,
          address: property.detailedAddress,
          area: property.area,
          managerId: userId.toString(),
          managerName: property.landlordName || 'মেস ম্যানেজার',
          managerPhone: property.contactPhone || property.landlordPhone || '',
          defaultSeatRent: Number(property.rentPrice) || 3000,
          singleBedRooms: property.singleBedRooms,
          twoBedRooms: property.twoBedRooms,
          threeBedRooms: property.threeBedRooms,
          fourBedRooms: property.fourBedRooms,
          fiveBedRooms: property.fiveBedRooms,
          totalSeats: property.totalSeats,
          vacantSeats: property.vacantSeats,
          rooms: property.rooms,
          isUtilitySeparate: property.isUtilitySeparate,
          utilityBills: property.utilityBills,
          showUtilityAmountToSeekers: property.showUtilityAmountToSeekers,
          members: [
            {
              id: userId.toString(),
              name: property.landlordName || 'মেস ম্যানেজার',
              phone: property.contactPhone || property.landlordPhone || '',
              isAdmin: true,
              isManager: true,
              totalMealsConsumed: 0,
              totalMoneyDeposited: 0,
              todayMealSlots: [true, true],
              customDateSlots: {},
            },
          ],
          mealConfig: {
            messName,
            mealsPerDay: 2,
            managerId: userId.toString(),
            managerName: property.landlordName || 'মেস ম্যানেজার',
            currentMonth: property.availableMonth || 'নভেম্বর ২০২৬',
          },
        });
      }
    }

    return this.formatProperty(property);
  }

  /**
   * Delete a property post
   */
  async deleteProperty(id, userId) {
    const property = await Property.findById(id);

    if (!property) {
      const error = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    if (property.owner.toString() !== userId.toString()) {
      const error = new Error('আপনার এই বিজ্ঞাপনটি মুছে ফেলার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    await property.deleteOne();
    await ManagedMess.deleteOne({
      $or: [{ _id: property._id }, { propertyId: property._id }],
    });

    return true;
  }

  /**
   * Report a property (e.g., 'ALREADY_RENTED', 'WRONG_NUMBER', etc.)
   * Triggers automatic pause if 2 unique users report ALREADY_RENTED
   */
  async reportProperty(propertyId, userId, payload = {}) {
    const property = await Property.findById(propertyId);
    if (!property) {
      const error = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    if (property.owner.toString() === userId.toString()) {
      const error = new Error('নিজের বিজ্ঞাপনে রিপোর্ট করা যাবে না');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already submitted an active report for this property
    const existingReport = await PropertyReport.findOne({
      propertyId: property._id,
      userId,
      status: 'ACTIVE',
    });

    if (existingReport) {
      const error = new Error('আপনি ইতোমধ্যে এই বিজ্ঞাপনে রিপোর্ট করেছেন। ধন্যবাদ!');
      error.statusCode = 400;
      throw error;
    }

    const reason = payload.reason || 'ALREADY_RENTED';
    const note = payload.note ? String(payload.note).trim() : '';

    const report = await PropertyReport.create({
      propertyId: property._id,
      userId,
      reason,
      note,
      status: 'ACTIVE',
    });

    let autoPaused = false;

    // Check if reason is ALREADY_RENTED and evaluate auto-pause threshold (>= 2 reports)
    if (reason === 'ALREADY_RENTED') {
      const activeRentedReportsCount = await PropertyReport.countDocuments({
        propertyId: property._id,
        reason: 'ALREADY_RENTED',
        status: 'ACTIVE',
      });

      property.alreadyRentedReportCount = activeRentedReportsCount;

      if (activeRentedReportsCount >= 2 && property.isActive) {
        property.isActive = false;
        property.isCommunityPaused = true;
        property.communityPausedAt = new Date();
        autoPaused = true;

        // Send Notification to Property Landlord
        try {
          await notificationService.createAndSendNotification({
            userId: property.owner,
            title: 'আপনার বাসাটি কি ভাড়া হয়ে গেছে?',
            body: `ব্যবহারকারীরা রিপোর্ট করেছেন যে "${property.title}" বাসাটি ইতোমধ্যে ভাড়া হয়ে গেছে। তাই বিজ্ঞাপনটি সাময়িকভাবে বন্ধ (Pause) রাখা হয়েছে। বাসা এখনও ফাঁকা থাকলে আপনি পুনরায় চালু করতে পারবেন।`,
            type: 'SYSTEM',
            data: {
              propertyId: property._id,
              action: 'COMMUNITY_PAUSED_REACTIVATE',
            },
          });
        } catch (notifErr) {
          console.error('[Community Auto-Pause Notification Error]:', notifErr.message);
        }
      }

      await property.save();
    }

    return {
      success: true,
      report,
      alreadyRentedReportCount: property.alreadyRentedReportCount,
      isCommunityPaused: property.isCommunityPaused,
      autoPaused,
      message: autoPaused
        ? '২টি রিপোর্টের কারণে বিজ্ঞাপনটি সাময়িকভাবে বন্ধ করা হয়েছে এবং মালিককে জানানো হয়েছে।'
        : 'আপনার রিপোর্ট সফলভাবে জমা নেওয়া হয়েছে। ধন্যবাদ!',
    };
  }

  /**
   * Reactivate a property that was community paused
   */
  async reactivateCommunityPausedProperty(propertyId, userId) {
    const property = await Property.findById(propertyId);
    if (!property) {
      const error = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    if (property.owner.toString() !== userId.toString()) {
      const error = new Error('আপনার এই বিজ্ঞাপনটি অ্যাক্টিভ করার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    property.isActive = true;
    property.isCommunityPaused = false;
    property.communityPausedAt = null;
    property.alreadyRentedReportCount = 0;
    await property.save();

    // Mark previous active reports as resolved
    await PropertyReport.updateMany(
      { propertyId: property._id, status: 'ACTIVE' },
      { status: 'RESOLVED', resolvedAt: new Date() }
    );

    // Update associated community pause notifications as resolved & read
    try {
      const Notification = require('../notification/notification.model');
      await Notification.updateMany(
        {
          userId: property.owner,
          'data.propertyId': property._id,
          'data.action': 'COMMUNITY_PAUSED_REACTIVATE',
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
            'data.metadata.isReactivated': true,
            'data.metadata.reactivatedAt': new Date(),
          },
        }
      );
    } catch (notifErr) {
      console.error('[Notification Update Error on Reactivate]:', notifErr.message);
    }

    return this.formatProperty(property);
  }
}

module.exports = new PropertyService();
