const mongoose = require('mongoose');
const ManagedMess = require('./mess.model');
const Property = require('../property/property.model');
const userService = require('../user/user.service');
const {
  buildMessRooms,
  normalizeRoomsArray,
  calculateSeatMetrics,
  extractRoomCountsFromRooms,
  normalizeUtilityBills,
  formatManagedMess,
} = require('../../utils/messHelper');

class MessService {
  /**
   * Format date string to yyyy-MM-dd key
   */
  toDateKey(dateInput) {
    if (!dateInput) {
      return new Date().toISOString().split('T')[0];
    }
    const raw = String(dateInput).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Sync changes from a ManagedMess back to its linked Property document
   */
  async syncLinkedProperty(mess) {
    const targetPropertyId = mess.propertyId || mess._id;
    if (!targetPropertyId || !mongoose.Types.ObjectId.isValid(targetPropertyId)) {
      return;
    }

    const property = await Property.findById(targetPropertyId);
    if (!property) return;

    property.buildingName = mess.name || property.buildingName;
    property.detailedAddress = mess.address || property.detailedAddress;
    property.area = mess.area || property.area;
    if (mess.defaultSeatRent && Number(mess.defaultSeatRent) >= 100) {
      property.rentPrice = Number(mess.defaultSeatRent);
    }
    property.singleBedRooms = mess.singleBedRooms;
    property.twoBedRooms = mess.twoBedRooms;
    property.threeBedRooms = mess.threeBedRooms;
    property.fourBedRooms = mess.fourBedRooms;
    property.fiveBedRooms = mess.fiveBedRooms;
    property.rooms = mess.rooms;
    property.totalSeats = mess.totalSeats;
    property.vacantSeats = mess.vacantSeats;
    property.isUtilitySeparate = mess.isUtilitySeparate;
    property.utilityBills = mess.utilityBills;
    property.showUtilityAmountToSeekers = mess.showUtilityAmountToSeekers;

    const totalRoomsCount =
      (mess.singleBedRooms || 0) +
      (mess.twoBedRooms || 0) +
      (mess.threeBedRooms || 0) +
      (mess.fourBedRooms || 0) +
      (mess.fiveBedRooms || 0);
    if (totalRoomsCount > 0) {
      property.bedrooms = totalRoomsCount;
    }

    await property.save();
  }

  /**
   * Ensure any Mess Property owned by the user has a corresponding ManagedMess document
   */
  async ensureMessPropertiesSynced(user) {
    const userIdStr = user._id.toString();
    const messProperties = await Property.find({
      owner: user._id,
      isMess: true,
    }).lean();

    for (const prop of messProperties) {
      const exists = await ManagedMess.exists({
        $or: [{ _id: prop._id }, { propertyId: prop._id }],
      });
      if (!exists) {
        const messName =
          prop.buildingName && prop.buildingName.trim().length > 0
            ? prop.buildingName.trim()
            : prop.title;

        const roomCounts = {
          singleBedRooms: Number(prop.singleBedRooms) || 0,
          twoBedRooms: Number(prop.twoBedRooms) || 0,
          threeBedRooms: Number(prop.threeBedRooms) || 0,
          fourBedRooms: Number(prop.fourBedRooms) || 0,
          fiveBedRooms: Number(prop.fiveBedRooms) || 0,
        };

        let rooms = Array.isArray(prop.rooms) && prop.rooms.length > 0 ? prop.rooms : [];
        if (rooms.length === 0) {
          const built = buildMessRooms(roomCounts, []);
          rooms = built.rooms;
        }
        const metrics = calculateSeatMetrics(rooms);

        await ManagedMess.create({
          _id: prop._id,
          propertyId: prop._id,
          name: messName,
          address: prop.detailedAddress,
          area: prop.area,
          managerId: userIdStr,
          managerName: prop.landlordName || user.name || 'মেস ম্যানেজার',
          managerPhone: prop.contactPhone || prop.landlordPhone || user.phoneNumber || '',
          defaultSeatRent: Number(prop.rentPrice) || 3000,
          singleBedRooms: roomCounts.singleBedRooms,
          twoBedRooms: roomCounts.twoBedRooms,
          threeBedRooms: roomCounts.threeBedRooms,
          fourBedRooms: roomCounts.fourBedRooms,
          fiveBedRooms: roomCounts.fiveBedRooms,
          totalSeats: metrics.totalSeats,
          vacantSeats: metrics.vacantSeats,
          rooms,
          isUtilitySeparate: Boolean(prop.isUtilitySeparate),
          utilityBills: Array.isArray(prop.utilityBills) ? prop.utilityBills : [],
          showUtilityAmountToSeekers:
            prop.showUtilityAmountToSeekers !== undefined
              ? Boolean(prop.showUtilityAmountToSeekers)
              : true,
          members: [
            {
              id: userIdStr,
              name: prop.landlordName || user.name || 'মেস ম্যানেজার',
              phone: prop.contactPhone || prop.landlordPhone || user.phoneNumber || '',
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
            managerId: userIdStr,
            managerName: prop.landlordName || user.name || 'মেস ম্যানেজার',
            currentMonth: prop.availableMonth || 'নভেম্বর ২০২৬',
          },
        });
      }
    }
  }

  /**
   * Get all ManagedMess documents where user is Manager, Member, or Seat Occupant
   */
  async getManagedMesses(user) {
    await this.ensureMessPropertiesSynced(user);

    const userIdStr = user._id.toString();
    const userPhone = user.phoneNumber;

    const messes = await ManagedMess.find({
      $or: [
        { managerId: userIdStr },
        { managerPhone: userPhone },
        { 'members.id': userIdStr },
        { 'members.phone': userPhone },
        { 'rooms.seats.occupantPhone': userPhone },
      ],
    }).sort({ createdAt: -1 });

    // Also ensure if a user was assigned a seat via phone number, they exist in `members` with their user._id
    const formattedList = [];
    for (const mess of messes) {
      let modified = false;
      for (const member of mess.members) {
        if (member.phone === userPhone && member.id !== userIdStr) {
          member.id = userIdStr;
          modified = true;
        }
      }
      if (modified) {
        mess.markModified('members');
        await mess.save();
      }
      formattedList.push(formatManagedMess(mess));
    }

    return formattedList;
  }

  /**
   * Get single ManagedMess by ID
   */
  async getMessById(messId) {
    if (!mongoose.Types.ObjectId.isValid(messId)) {
      const error = new Error('অবৈধ মেস আইডি (Invalid Mess ID)');
      error.statusCode = 400;
      throw error;
    }

    const mess = await ManagedMess.findOne({
      $or: [{ _id: messId }, { propertyId: messId }],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    return formatManagedMess(mess);
  }

  /**
   * Create a new ManagedMess (or Bachelor Mess Group)
   */
  async createMess(user, payload) {
    const {
      id,
      propertyId,
      name,
      messName,
      address,
      area,
      defaultSeatRent,
      singleBedRooms,
      twoBedRooms,
      threeBedRooms,
      fourBedRooms,
      fiveBedRooms,
      rooms: rawRooms,
      isUtilitySeparate,
      utilityBills: rawUtilityBills,
      showUtilityAmountToSeekers,
      mealsPerDay,
      currentMonth,
      members: rawMembers,
      sharedBills,
      notices,
    } = payload;

    const resolvedName = String(name || messName || 'ব্যাচেলর মেস').trim();
    const resolvedAddress = String(address || area || 'ঢাকা').trim();
    const resolvedArea = String(area || address || 'Dhaka').trim();
    const userIdStr = user._id.toString();

    let roomCounts = {
      singleBedRooms: Math.max(0, Number(singleBedRooms) || 0),
      twoBedRooms: Math.max(0, Number(twoBedRooms) || 0),
      threeBedRooms: Math.max(0, Number(threeBedRooms) || 0),
      fourBedRooms: Math.max(0, Number(fourBedRooms) || 0),
      fiveBedRooms: Math.max(0, Number(fiveBedRooms) || 0),
    };

    let rooms = [];
    let totalSeats = 0;
    let vacantSeats = 0;

    const hasRoomCountInput =
      roomCounts.singleBedRooms +
        roomCounts.twoBedRooms +
        roomCounts.threeBedRooms +
        roomCounts.fourBedRooms +
        roomCounts.fiveBedRooms >
      0;

    if (hasRoomCountInput) {
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
    }

    const configuredMealsPerDay = Number(mealsPerDay) === 3 ? 3 : 2;
    const defaultSlots = Array(configuredMealsPerDay).fill(true);

    let members = [];
    if (Array.isArray(rawMembers) && rawMembers.length > 0) {
      members = rawMembers.map((m) => ({
        id: String(m.id || m._id || userIdStr),
        name: String(m.name || user.name),
        phone: String(m.phone || m.phoneNumber || user.phoneNumber),
        isAdmin: Boolean(m.isAdmin),
        isManager: Boolean(m.isManager),
        totalMealsConsumed: Number(m.totalMealsConsumed || 0),
        totalMoneyDeposited: Number(m.totalMoneyDeposited || 0),
        todayMealSlots: Array.isArray(m.todayMealSlots)
          ? m.todayMealSlots.map(Boolean)
          : [...defaultSlots],
        customDateSlots: m.customDateSlots || {},
      }));
    }

    // Ensure creator is included in members
    const creatorExists = members.some(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    if (!creatorExists) {
      members.unshift({
        id: userIdStr,
        name: user.name,
        phone: user.phoneNumber,
        isAdmin: true,
        isManager: true,
        totalMealsConsumed: 0,
        totalMoneyDeposited: 0,
        todayMealSlots: [...defaultSlots],
        customDateSlots: {},
      });
    }

    const customId =
      id && mongoose.Types.ObjectId.isValid(id)
        ? new mongoose.Types.ObjectId(id)
        : undefined;

    const messData = {
      ...(customId ? { _id: customId } : {}),
      propertyId:
        propertyId && mongoose.Types.ObjectId.isValid(propertyId)
          ? propertyId
          : customId || null,
      name: resolvedName,
      address: resolvedAddress,
      area: resolvedArea,
      managerId: userIdStr,
      managerName: user.name,
      managerPhone: user.phoneNumber,
      defaultSeatRent:
        defaultSeatRent !== undefined ? Number(defaultSeatRent) : 3000,
      singleBedRooms: roomCounts.singleBedRooms,
      twoBedRooms: roomCounts.twoBedRooms,
      threeBedRooms: roomCounts.threeBedRooms,
      fourBedRooms: roomCounts.fourBedRooms,
      fiveBedRooms: roomCounts.fiveBedRooms,
      totalSeats,
      vacantSeats,
      rooms,
      isUtilitySeparate: Boolean(isUtilitySeparate),
      utilityBills: normalizeUtilityBills(rawUtilityBills),
      showUtilityAmountToSeekers:
        showUtilityAmountToSeekers !== undefined
          ? Boolean(showUtilityAmountToSeekers)
          : true,
      sharedBills: Array.isArray(sharedBills) ? sharedBills : [],
      notices: Array.isArray(notices) ? notices : [],
      members,
      bazarEntries: [],
      mealRequests: [],
      mealConfig: {
        messName: resolvedName,
        mealsPerDay: configuredMealsPerDay,
        managerId: userIdStr,
        managerName: user.name,
        currentMonth: currentMonth || 'নভেম্বর ২০২৬',
      },
    };

    const mess = await ManagedMess.create(messData);
    return formatManagedMess(mess);
  }

  /**
   * Edit / Update ManagedMess by Mess Manager:
   * - Updates name, address, area, defaultSeatRent, room counts, isUtilitySeparate, utilityBills, showUtilityAmountToSeekers
   * - Rebuilds rooms while preserving existing booked seats in rooms of the same type
   * - Syncs with the linked Property document
   */
  async updateMess(messId, user, payload) {
    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    if (payload.name !== undefined) {
      mess.name = String(payload.name).trim();
      if (mess.mealConfig) {
        mess.mealConfig.messName = mess.name;
      }
    }
    if (payload.address !== undefined) {
      mess.address = String(payload.address).trim();
    }
    if (payload.area !== undefined) {
      mess.area = String(payload.area).trim();
    }
    if (payload.defaultSeatRent !== undefined) {
      mess.defaultSeatRent = Number(payload.defaultSeatRent);
    }
    if (payload.isUtilitySeparate !== undefined) {
      mess.isUtilitySeparate = Boolean(payload.isUtilitySeparate);
    }
    if (payload.utilityBills !== undefined) {
      mess.utilityBills = normalizeUtilityBills(payload.utilityBills);
    }
    if (payload.showUtilityAmountToSeekers !== undefined) {
      mess.showUtilityAmountToSeekers = Boolean(payload.showUtilityAmountToSeekers);
    }

    const roomCountFields = [
      'singleBedRooms',
      'twoBedRooms',
      'threeBedRooms',
      'fourBedRooms',
      'fiveBedRooms',
    ];
    const hasRoomCountsInPayload = roomCountFields.some(
      (f) => payload[f] !== undefined
    );

    if (hasRoomCountsInPayload) {
      const currentCounts = extractRoomCountsFromRooms(mess.rooms);
      const targetCounts = {
        singleBedRooms:
          payload.singleBedRooms !== undefined
            ? Number(payload.singleBedRooms)
            : mess.singleBedRooms ?? currentCounts.singleBedRooms,
        twoBedRooms:
          payload.twoBedRooms !== undefined
            ? Number(payload.twoBedRooms)
            : mess.twoBedRooms ?? currentCounts.twoBedRooms,
        threeBedRooms:
          payload.threeBedRooms !== undefined
            ? Number(payload.threeBedRooms)
            : mess.threeBedRooms ?? currentCounts.threeBedRooms,
        fourBedRooms:
          payload.fourBedRooms !== undefined
            ? Number(payload.fourBedRooms)
            : mess.fourBedRooms ?? currentCounts.fourBedRooms,
        fiveBedRooms:
          payload.fiveBedRooms !== undefined
            ? Number(payload.fiveBedRooms)
            : mess.fiveBedRooms ?? currentCounts.fiveBedRooms,
      };

      const built = buildMessRooms(targetCounts, mess.rooms || []);
      mess.rooms = built.rooms;
      mess.totalSeats = built.totalSeats;
      mess.vacantSeats = built.vacantSeats;
      mess.singleBedRooms = built.counts.singleBedRooms;
      mess.twoBedRooms = built.counts.twoBedRooms;
      mess.threeBedRooms = built.counts.threeBedRooms;
      mess.fourBedRooms = built.counts.fourBedRooms;
      mess.fiveBedRooms = built.counts.fiveBedRooms;
      mess.markModified('rooms');
    } else if (Array.isArray(payload.rooms) && payload.rooms.length > 0) {
      // If rooms array is sent directly, preserve booked seats from existing rooms of same type if payload seats are unbooked
      const derivedCounts = extractRoomCountsFromRooms(payload.rooms);
      const payloadHasBookedSeats = payload.rooms.some(
        (r) => Array.isArray(r.seats) && r.seats.some((s) => s.isBooked)
      );
      if (payloadHasBookedSeats) {
        mess.rooms = normalizeRoomsArray(payload.rooms);
      } else {
        const built = buildMessRooms(derivedCounts, mess.rooms || []);
        mess.rooms = built.rooms;
      }
      const metrics = calculateSeatMetrics(mess.rooms);
      mess.totalSeats = metrics.totalSeats;
      mess.vacantSeats = metrics.vacantSeats;
      mess.singleBedRooms = derivedCounts.singleBedRooms;
      mess.twoBedRooms = derivedCounts.twoBedRooms;
      mess.threeBedRooms = derivedCounts.threeBedRooms;
      mess.fourBedRooms = derivedCounts.fourBedRooms;
      mess.fiveBedRooms = derivedCounts.fiveBedRooms;
      mess.markModified('rooms');
    }

    await mess.save();
    await this.syncLinkedProperty(mess);

    return formatManagedMess(mess);
  }

  /**
   * Assign a registered user to a specific seat in a ManagedMess
   * POST /api/messes/:messId/assign-border
   * Body: { roomId, seatId, phone, seatRent, advanceDeposit }
   */
  async assignBorder(messId, payload) {
    const {
      roomId,
      seatId,
      phone,
      phoneNumber,
      seatRent,
      rentAmount,
      advanceDeposit,
      deposit,
    } = payload;

    const targetPhone = phone || phoneNumber;
    if (!targetPhone) {
      const error = new Error('বর্ডারের মোবাইল নম্বর দিন (Phone number is required)');
      error.statusCode = 400;
      throw error;
    }

    // 1. Verify registered user by phone number
    const registeredUser = await userService.findByPhone(targetPhone);

    // 1.1 Check if this user is already active in another mess or bachelor flat
    const existingAffiliation = await userService.getUserActiveAffiliation(
      registeredUser.id,
      registeredUser.phoneNumber,
      messId
    );

    if (existingAffiliation) {
      const error = new Error(existingAffiliation.message);
      error.statusCode = 400;
      error.activeAffiliation = existingAffiliation;
      throw error;
    }

    // 2. Find ManagedMess
    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    // 3. Locate room and seat
    const room = (mess.rooms || []).find((r) => r.id === roomId);
    if (!room) {
      const error = new Error('নির্বাচিত রুমটি পাওয়া যায়নি (Room not found)');
      error.statusCode = 404;
      throw error;
    }

    const seat = (room.seats || []).find((s) => s.id === seatId);
    if (!seat) {
      const error = new Error('নির্বাচিত সিটটি পাওয়া যায়নি (Seat not found)');
      error.statusCode = 404;
      throw error;
    }

    if (seat.isBooked) {
      const error = new Error('এই সিটটি ইতিমধ্যে বুক করা আছে (Seat is already booked)');
      error.statusCode = 400;
      throw error;
    }

    const resolvedSeatRent =
      seatRent !== undefined && seatRent !== null && seatRent !== ''
        ? Number(seatRent)
        : rentAmount !== undefined && rentAmount !== null && rentAmount !== ''
        ? Number(rentAmount)
        : mess.defaultSeatRent;

    const resolvedAdvanceDeposit = Number(advanceDeposit ?? deposit ?? 0) || 0;

    // 4. Mark seat as booked
    seat.isBooked = true;
    seat.occupantName = registeredUser.name;
    seat.occupantPhone = registeredUser.phoneNumber;
    seat.bookedAt = new Date();
    seat.rentAmount = resolvedSeatRent;

    // 5. Add or update border in mess.members
    const mealsPerDay = mess.mealConfig?.mealsPerDay || 2;
    const existingMember = mess.members.find(
      (m) =>
        m.id === registeredUser.id ||
        m.phone === registeredUser.phoneNumber
    );

    if (existingMember) {
      existingMember.id = registeredUser.id;
      existingMember.name = registeredUser.name;
      existingMember.phone = registeredUser.phoneNumber;
      existingMember.totalMoneyDeposited =
        Number(existingMember.totalMoneyDeposited || 0) + resolvedAdvanceDeposit;
    } else {
      mess.members.push({
        id: registeredUser.id,
        name: registeredUser.name,
        phone: registeredUser.phoneNumber,
        isAdmin: false,
        isManager: false,
        totalMealsConsumed: 0,
        totalMoneyDeposited: resolvedAdvanceDeposit,
        todayMealSlots: Array(mealsPerDay).fill(true),
        customDateSlots: {},
      });
    }

    // 6. Update seat metrics & sync with linked Property
    const metrics = calculateSeatMetrics(mess.rooms);
    mess.totalSeats = metrics.totalSeats;
    mess.vacantSeats = metrics.vacantSeats;

    mess.markModified('rooms');
    mess.markModified('members');
    await mess.save();

    await this.syncLinkedProperty(mess);

    return {
      mess: formatManagedMess(mess),
      assignedUser: registeredUser,
    };
  }

  /**
   * Vacate a booked seat in a ManagedMess
   * POST /api/messes/:messId/vacate-seat
   * Body: { roomId, seatId }
   */
  async vacateSeat(messId, payload) {
    const { roomId, seatId } = payload;

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const room = (mess.rooms || []).find((r) => r.id === roomId);
    if (!room) {
      const error = new Error('নির্বাচিত রুমটি পাওয়া যায়নি (Room not found)');
      error.statusCode = 404;
      throw error;
    }

    const seat = (room.seats || []).find((s) => s.id === seatId);
    if (!seat) {
      const error = new Error('নির্বাচিত সিটটি পাওয়া যায়নি (Seat not found)');
      error.statusCode = 404;
      throw error;
    }

    const previousPhone = seat.occupantPhone;

    seat.isBooked = false;
    seat.occupantName = null;
    seat.occupantPhone = null;
    seat.bookedAt = null;
    seat.rentAmount = null;

    // Check if the previous occupant still has any other seat booked in this mess
    if (previousPhone) {
      const stillHasSeat = (mess.rooms || []).some((r) =>
        (r.seats || []).some((s) => s.isBooked && s.occupantPhone === previousPhone)
      );
      if (!stillHasSeat) {
        mess.members = (mess.members || []).filter(
          (m) => m.phone !== previousPhone || m.isManager || m.isAdmin
        );
      }
    }

    const metrics = calculateSeatMetrics(mess.rooms);
    mess.totalSeats = metrics.totalSeats;
    mess.vacantSeats = metrics.vacantSeats;

    mess.markModified('rooms');
    mess.markModified('members');
    await mess.save();

    await this.syncLinkedProperty(mess);

    return formatManagedMess(mess);
  }

  /**
   * Add a Shared Monthly Utility Bill
   * POST /api/messes/:messId/shared-bills
   */
  async addSharedBill(messId, payload) {
    const { title, category, amount, month, note } = payload;

    if (!title || String(title).trim().length === 0) {
      const error = new Error('বিলের নাম আবশ্যক (Bill title is required)');
      error.statusCode = 400;
      throw error;
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) < 0) {
      const error = new Error('বিলের সঠিক পরিমাণ দিন (Valid amount is required)');
      error.statusCode = 400;
      throw error;
    }

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const allowedCategories = [
      'wifi',
      'gas',
      'water',
      'electricity',
      'maid',
      'waste',
      'other',
    ];
    const resolvedCategory = allowedCategories.includes(category) ? category : 'other';

    const newBill = {
      id: `bill_${Date.now()}_${Math.round(Math.random() * 1000)}`,
      title: String(title).trim(),
      category: resolvedCategory,
      amount: Number(amount),
      month: month || mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬',
      dateAdded: new Date(),
      note: note ? String(note).trim() : '',
    };

    mess.sharedBills.push(newBill);
    mess.markModified('sharedBills');
    await mess.save();

    return {
      mess: formatManagedMess(mess),
      bill: newBill,
    };
  }

  /**
   * Delete a Shared Monthly Utility Bill
   * DELETE /api/messes/:messId/shared-bills/:billId
   */
  async deleteSharedBill(messId, billId) {
    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    mess.sharedBills = (mess.sharedBills || []).filter((b) => b.id !== billId);
    mess.markModified('sharedBills');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Post a Manager Notice
   * POST /api/messes/:messId/notices
   */
  async addNotice(messId, user, payload) {
    const { title, message, isUrgent, postedBy } = payload;

    if (!title || !message) {
      const error = new Error('নোটিশের শিরোনাম ও বিস্তারিত বার্তা আবশ্যক');
      error.statusCode = 400;
      throw error;
    }

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const newNotice = {
      id: `notice_${Date.now()}_${Math.round(Math.random() * 1000)}`,
      title: String(title).trim(),
      message: String(message).trim(),
      postedBy: postedBy || user.name || mess.managerName || 'মেস ম্যানেজার',
      postedAt: new Date(),
      isUrgent: Boolean(isUrgent),
    };

    mess.notices.unshift(newNotice);
    mess.markModified('notices');
    await mess.save();

    return {
      mess: formatManagedMess(mess),
      notice: newNotice,
    };
  }

  /**
   * Delete a Mess Notice
   * DELETE /api/messes/:messId/notices/:noticeId
   */
  async deleteNotice(messId, user, noticeId) {
    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const userIdStr = (user._id || user.id).toString();
    const isManager = mess.managerId === userIdStr || mess.managerPhone === user.phoneNumber;
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const isAdmin = memberObj && (memberObj.isAdmin || memberObj.isManager);

    // Find the notice
    const noticeIndex = (mess.notices || []).findIndex(
      (n) => (n.id && n.id === noticeId) || (n._id && n._id.toString() === noticeId)
    );

    if (noticeIndex === -1) {
      const error = new Error('নোটিশটি পাওয়া যায়নি (Notice not found)');
      error.statusCode = 404;
      throw error;
    }

    const targetNotice = mess.notices[noticeIndex];
    const isPoster =
      targetNotice.postedBy === user.name ||
      (memberObj && targetNotice.postedBy === memberObj.name);

    if (!isManager && !isAdmin && !isPoster) {
      const error = new Error('আপনার এই নোটিশটি মুছে ফেলার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    mess.notices.splice(noticeIndex, 1);
    mess.markModified('notices');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Update Meals Per Day (2 or 3)
   * PATCH /api/messes/:messId/meals-per-day
   */
  async updateMealsPerDay(messId, payload) {
    const mealsPerDay = Number(payload.mealsPerDay) === 3 ? 3 : 2;

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    if (!mess.mealConfig) {
      mess.mealConfig = {
        messName: mess.name,
        mealsPerDay,
        managerId: mess.managerId,
        managerName: mess.managerName,
        currentMonth: 'নভেম্বর ২০২৬',
      };
    } else {
      mess.mealConfig.mealsPerDay = mealsPerDay;
    }

    // Adjust todayMealSlots and customDateSlots length for each member
    for (const member of mess.members) {
      const currentSlots = Array.isArray(member.todayMealSlots)
        ? [...member.todayMealSlots]
        : [true, true];
      while (currentSlots.length < mealsPerDay) {
        currentSlots.push(true);
      }
      member.todayMealSlots = currentSlots.slice(0, mealsPerDay);

      if (member.customDateSlots && typeof member.customDateSlots === 'object') {
        const updatedCustom = {};
        const entries =
          member.customDateSlots instanceof Map
            ? Array.from(member.customDateSlots.entries())
            : Object.entries(member.customDateSlots);
        for (const [dateKey, slots] of entries) {
          if (Array.isArray(slots)) {
            const copy = [...slots];
            while (copy.length < mealsPerDay) copy.push(true);
            updatedCustom[dateKey] = copy.slice(0, mealsPerDay);
          }
        }
        member.customDateSlots = updatedCustom;
      }
    }

    mess.markModified('mealConfig');
    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Toggle a member's meal slot for today or a specific date
   * PATCH /api/messes/:messId/members/:memberId/toggle-slot
   * Body: { slotIndex, date }
   */
  async toggleMemberSlot(messId, memberId, payload) {
    const slotIndex = Number(payload.slotIndex);
    const { date } = payload;

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const member = (mess.members || []).find(
      (m) => m.id === memberId || m.phone === memberId
    );
    if (!member) {
      const error = new Error('সদস্য পাওয়া যায়নি (Member not found)');
      error.statusCode = 404;
      throw error;
    }

    const mealsPerDay = mess.mealConfig?.mealsPerDay || 2;
    if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= mealsPerDay) {
      const error = new Error('অবৈধ মিল স্লট ইনডেক্স (Invalid slotIndex)');
      error.statusCode = 400;
      throw error;
    }

    const todayKey = this.toDateKey();
    const targetDateKey = date ? this.toDateKey(date) : todayKey;

    // Ensure customDateSlots is a plain object
    let customSlotsMap = {};
    if (member.customDateSlots instanceof Map) {
      customSlotsMap = Object.fromEntries(member.customDateSlots);
    } else if (member.customDateSlots && typeof member.customDateSlots === 'object') {
      customSlotsMap = { ...member.customDateSlots };
    }

    let currentTodaySlots = Array.isArray(member.todayMealSlots)
      ? [...member.todayMealSlots]
      : Array(mealsPerDay).fill(true);
    while (currentTodaySlots.length < mealsPerDay) {
      currentTodaySlots.push(true);
    }

    let dateSlots = Array.isArray(customSlotsMap[targetDateKey])
      ? [...customSlotsMap[targetDateKey]]
      : [...currentTodaySlots];
    while (dateSlots.length < mealsPerDay) {
      dateSlots.push(true);
    }

    const previousState = Boolean(dateSlots[slotIndex]);
    const newState = !previousState;
    dateSlots[slotIndex] = newState;
    customSlotsMap[targetDateKey] = dateSlots;
    member.customDateSlots = customSlotsMap;

    if (!date || targetDateKey === todayKey) {
      currentTodaySlots[slotIndex] = newState;
      member.todayMealSlots = currentTodaySlots;
    }

    // Adjust totalMealsConsumed
    if (newState) {
      member.totalMealsConsumed = Number(member.totalMealsConsumed || 0) + 1;
    } else {
      member.totalMealsConsumed = Math.max(
        0,
        Number(member.totalMealsConsumed || 0) - 1
      );
    }

    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Add Itemized Bazar Entry & Increment Buyer's Deposit
   * POST /api/messes/:messId/bazar
   */
  async addBazarEntry(messId, user, payload) {
    const {
      buyerMemberId,
      buyerMemberName,
      date,
      totalAmount,
      items: rawItems,
      note,
    } = payload;

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const items = Array.isArray(rawItems)
      ? rawItems.map((item) => ({
          name: String(item.name || 'বাজার আইটেম').trim(),
          quantity: String(item.quantity || '').trim(),
          price: Number(item.price || item.amount || 0),
        }))
      : [];

    const computedTotal =
      totalAmount !== undefined && totalAmount !== null && !isNaN(Number(totalAmount))
        ? Number(totalAmount)
        : items.reduce((sum, i) => sum + Number(i.price || 0), 0);

    // Find buyer member to credit totalMoneyDeposited
    const targetBuyerId = buyerMemberId || user._id.toString();
    const buyerMember = (mess.members || []).find(
      (m) =>
        m.id === targetBuyerId ||
        m.phone === targetBuyerId ||
        (buyerMemberName && m.name === buyerMemberName)
    );

    if (buyerMember) {
      buyerMember.totalMoneyDeposited =
        Number(buyerMember.totalMoneyDeposited || 0) + computedTotal;
    }

    const newEntry = {
      id: `bazar_${Date.now()}_${Math.round(Math.random() * 1000)}`,
      buyerMemberId: buyerMember ? buyerMember.id : targetBuyerId,
      buyerMemberName:
        buyerMemberName || (buyerMember ? buyerMember.name : user.name),
      date: date ? new Date(date) : new Date(),
      totalAmount: computedTotal,
      items,
      note: note ? String(note).trim() : '',
    };

    mess.bazarEntries.unshift(newEntry);
    mess.markModified('bazarEntries');
    mess.markModified('members');
    await mess.save();

    return {
      mess: formatManagedMess(mess),
      bazarEntry: newEntry,
    };
  }

  /**
   * Delete a Bazar Entry & Deduct from Buyer's Deposit
   * DELETE /api/messes/:messId/bazar/:bazarId
   */
  async deleteBazarEntry(messId, user, bazarId) {
    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const userIdStr = (user._id || user.id).toString();
    const isManager = mess.managerId === userIdStr || mess.managerPhone === user.phoneNumber;
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const isAdmin = memberObj && (memberObj.isAdmin || memberObj.isManager);

    // Find the target bazar entry by matching id or _id
    const bazarIndex = (mess.bazarEntries || []).findIndex(
      (b) => (b.id && b.id === bazarId) || (b._id && b._id.toString() === bazarId)
    );

    if (bazarIndex === -1) {
      const error = new Error('বাজার এন্ট্রি পাওয়া যায়নি (Bazar entry not found)');
      error.statusCode = 404;
      throw error;
    }

    const targetBazar = mess.bazarEntries[bazarIndex];
    const isBuyer =
      targetBazar.buyerMemberId === userIdStr ||
      (memberObj && targetBazar.buyerMemberId === memberObj.id) ||
      (memberObj && targetBazar.buyerMemberName === memberObj.name) ||
      targetBazar.buyerMemberName === user.name;

    // Check permission: Manager, Admin, or Buyer who recorded it
    if (!isManager && !isAdmin && !isBuyer) {
      const error = new Error('আপনার এই বাজার এন্ট্রি মুছে ফেলার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    // Deduct totalAmount from buyer member's totalMoneyDeposited
    const amountToDeduct = Number(targetBazar.totalAmount || 0);
    const buyerMember = (mess.members || []).find(
      (m) =>
        m.id === targetBazar.buyerMemberId ||
        m.phone === targetBazar.buyerMemberId ||
        m.name === targetBazar.buyerMemberName
    );

    if (buyerMember && amountToDeduct > 0) {
      buyerMember.totalMoneyDeposited = Math.max(
        0,
        Number(buyerMember.totalMoneyDeposited || 0) - amountToDeduct
      );
    }

    // Remove entry
    mess.bazarEntries.splice(bazarIndex, 1);
    mess.markModified('bazarEntries');
    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Add Deposit to a Member
   * POST /api/messes/:messId/members/:memberId/deposit
   */
  async addMemberDeposit(messId, memberId, payload) {
    const amount = Number(payload.amount);
    if (isNaN(amount) || amount <= 0) {
      const error = new Error('জমার পরিমাণ সঠিক হতে হবে (Valid positive amount is required)');
      error.statusCode = 400;
      throw error;
    }

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const member = (mess.members || []).find(
      (m) => m.id === memberId || m.phone === memberId
    );
    if (!member) {
      const error = new Error('সদস্য পাওয়া যায়নি (Member not found)');
      error.statusCode = 404;
      throw error;
    }

    member.totalMoneyDeposited = Number(member.totalMoneyDeposited || 0) + amount;
    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Add a Registered User to Bachelor Mess by Phone Number
   * POST /api/messes/:messId/members
   */
  async addMember(messId, payload) {
    const {
      phone,
      phoneNumber,
      isAdmin,
      initialDeposit,
      totalMoneyDeposited,
      totalMealsConsumed,
    } = payload;

    const targetPhone = phone || phoneNumber;
    if (!targetPhone) {
      const error = new Error('সদস্যের মোবাইল নম্বর আবশ্যক (Phone number is required)');
      error.statusCode = 400;
      throw error;
    }

    // Verify registered user in database
    const registeredUser = await userService.findByPhone(targetPhone);

    // Check if this user is already active in another mess or bachelor flat
    const existingAffiliation = await userService.getUserActiveAffiliation(
      registeredUser.id,
      registeredUser.phoneNumber,
      messId
    );

    if (existingAffiliation) {
      const error = new Error(existingAffiliation.message);
      error.statusCode = 400;
      error.activeAffiliation = existingAffiliation;
      throw error;
    }

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const alreadyMember = (mess.members || []).find(
      (m) =>
        m.id === registeredUser.id ||
        m.phone === registeredUser.phoneNumber
    );

    if (alreadyMember) {
      const error = new Error('এই সদস্য ইতিমধ্যে মেসে যুক্ত আছেন!');
      error.statusCode = 400;
      throw error;
    }

    const mealsPerDay = mess.mealConfig?.mealsPerDay || 2;
    const deposit = Number(initialDeposit ?? totalMoneyDeposited ?? 0) || 0;

    const newMember = {
      id: registeredUser.id,
      name: registeredUser.name,
      phone: registeredUser.phoneNumber,
      isAdmin: Boolean(isAdmin),
      isManager: false,
      totalMealsConsumed: Number(totalMealsConsumed || 0),
      totalMoneyDeposited: deposit,
      todayMealSlots: Array(mealsPerDay).fill(true),
      customDateSlots: {},
    };

    mess.members.push(newMember);
    mess.markModified('members');
    await mess.save();

    return {
      mess: formatManagedMess(mess),
      member: newMember,
    };
  }

  /**
   * Leave / Reset Mess & Mode for Current User
   * Disassociates the user from their current mess or family expenses, restoring them to initial "General Mode"
   * without destroying or affecting the historical financial data of the mess or other members!
   *
   * POST /api/messes/leave
   * Body: { messId?: string, clearFamilyExpenses?: boolean }
   */
  async leaveMessOrResetMode(user, payload = {}) {
    const userIdStr = (user._id || user.id).toString();
    const userPhone = user.phoneNumber;
    const targetMessId = payload.messId;
    const clearFamilyExpenses = Boolean(payload.clearFamilyExpenses);

    const queryFilter = {
      $or: [
        { managerId: userIdStr },
        { managerPhone: userPhone },
        { 'members.id': userIdStr },
        { 'members.phone': userPhone },
        { 'rooms.seats.occupantPhone': userPhone },
      ],
    };

    if (targetMessId && mongoose.Types.ObjectId.isValid(targetMessId)) {
      queryFilter._id = targetMessId;
    }

    const messes = await ManagedMess.find(queryFilter);

    for (const mess of messes) {
      let isModified = false;

      // 1. Vacate any seat occupied by this user
      if (Array.isArray(mess.rooms)) {
        for (const room of mess.rooms) {
          for (const seat of room.seats || []) {
            if (seat.isBooked && seat.occupantPhone === userPhone) {
              seat.isBooked = false;
              seat.occupantName = null;
              seat.occupantPhone = null;
              seat.bookedAt = null;
              seat.rentAmount = null;
              isModified = true;
            }
          }
        }
      }

      // 2. If user is manager of this mess
      const isManager =
        mess.managerId === userIdStr || mess.managerPhone === userPhone;

      if (isManager) {
        // Look for another admin or member to hand over manager duties
        const nextCandidate = (mess.members || []).find(
          (m) => m.id !== userIdStr && m.phone !== userPhone
        );

        if (nextCandidate) {
          mess.managerId = nextCandidate.id;
          mess.managerName = nextCandidate.name;
          mess.managerPhone = nextCandidate.phone;
          nextCandidate.isManager = true;
          if (mess.mealConfig) {
            mess.mealConfig.managerId = nextCandidate.id;
            mess.mealConfig.managerName = nextCandidate.name;
          }
          isModified = true;
        } else {
          // No other members left in this mess, unassign active manager to release user
          mess.managerId = '';
          mess.managerPhone = '';
          if (mess.mealConfig) {
            mess.mealConfig.managerId = '';
            mess.mealConfig.managerName = '';
          }
          isModified = true;
        }
      }

      // 3. Remove user from members list so they no longer see this mess in their portal
      const previousMemberCount = mess.members.length;
      mess.members = (mess.members || []).filter(
        (m) => m.id !== userIdStr && m.phone !== userPhone
      );
      if (mess.members.length !== previousMemberCount) {
        isModified = true;
      }

      // 4. Update seat counts and save
      if (isModified) {
        const metrics = calculateSeatMetrics(mess.rooms);
        mess.totalSeats = metrics.totalSeats;
        mess.vacantSeats = metrics.vacantSeats;

        mess.markModified('rooms');
        mess.markModified('members');
        await mess.save();
        await this.syncLinkedProperty(mess);
      }
    }

    // 5. If user specifically requested to clear family mode expenses too
    if (clearFamilyExpenses) {
      const FamilyExpense = require('../family-expense/familyExpense.model');
      await FamilyExpense.deleteMany({ userId: user._id });
    }

    // Return the user's fresh profile with General Mode status
    const authService = require('../auth/auth.service');
    const updatedUser = await authService.getProfile(user._id);

    return {
      message: 'আপনি সফলভাবে বর্তমান মেস/বাসা ছেড়েছেন এবং আপনার অ্যাকাউন্ট সাধারণ মোডে (General Mode) ফিরে এসেছে।',
      user: updatedUser,
      activeAffiliation: null,
      mode: 'general',
    };
  }

  /**
   * Remove a member from Bachelor Mess
   * DELETE /api/messes/:messId/members/:memberId
   */
  async removeMember(messId, memberId) {
    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    mess.members = (mess.members || []).filter(
      (m) => m.id !== memberId && m.phone !== memberId
    );
    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Set Mess Manager role
   * PATCH /api/messes/:messId/manager
   */
  async setMessManager(messId, payload) {
    const targetMemberId = payload.managerId || payload.memberId || payload.id;

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const targetMember = (mess.members || []).find(
      (m) => m.id === targetMemberId || m.phone === targetMemberId
    );
    if (!targetMember) {
      const error = new Error('নির্বাচিত সদস্যকে পাওয়া যায়নি (Member not found)');
      error.statusCode = 404;
      throw error;
    }

    for (const member of mess.members) {
      member.isManager = member.id === targetMember.id;
    }

    mess.managerId = targetMember.id;
    mess.managerName = targetMember.name;
    mess.managerPhone = targetMember.phone;

    if (mess.mealConfig) {
      mess.mealConfig.managerId = targetMember.id;
      mess.mealConfig.managerName = targetMember.name;
    }

    mess.markModified('members');
    mess.markModified('mealConfig');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Create Meal Cancellation / Correction Request
   * POST /api/messes/:messId/meal-requests
   */
  async createMealRequest(messId, user, payload) {
    const { memberId, memberName, date, slotIndex, slotName, note } = payload;

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const resolvedMemberId = memberId || user._id.toString();
    const memberObj = (mess.members || []).find(
      (m) => m.id === resolvedMemberId || m.phone === user.phoneNumber
    );

    const sIdx = Number(slotIndex) || 0;
    const defaultSlotNames = ['সকাল (Breakfast)', 'দুপুর (Lunch)', 'রাত (Dinner)'];
    const resolvedSlotName =
      slotName ||
      (mess.mealConfig?.mealsPerDay === 3
        ? defaultSlotNames[sIdx] || 'দুপুর (Lunch)'
        : sIdx === 0
        ? 'দুপুর (Lunch)'
        : 'রাত (Dinner)');

    const newRequest = {
      id: `mreq_${Date.now()}_${Math.round(Math.random() * 1000)}`,
      memberId: memberObj ? memberObj.id : resolvedMemberId,
      memberName: memberName || (memberObj ? memberObj.name : user.name),
      date: date ? new Date(date) : new Date(),
      slotIndex: sIdx,
      slotName: resolvedSlotName,
      status: 'pending',
      note: note ? String(note).trim() : '',
      createdAt: new Date(),
    };

    mess.mealRequests.unshift(newRequest);
    mess.markModified('mealRequests');
    await mess.save();

    return {
      mess: formatManagedMess(mess),
      mealRequest: newRequest,
    };
  }

  /**
   * Approve or Reject a Meal Request
   * PATCH /api/messes/:messId/meal-requests/:requestId/resolve
   */
  async resolveMealRequest(messId, requestId, payload) {
    const { status, approved, action } = payload;

    let isApproved = false;
    if (status === 'approved' || approved === true || action === 'approve') {
      isApproved = true;
    }

    const mess = await ManagedMess.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(messId)
          ? [{ _id: messId }, { propertyId: messId }]
          : []),
      ],
    });

    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const reqItem = (mess.mealRequests || []).find((r) => r.id === requestId);
    if (!reqItem) {
      const error = new Error('মিল রিকোয়েস্টটি পাওয়া যায়নি (Meal request not found)');
      error.statusCode = 404;
      throw error;
    }

    const wasAlreadyApproved = reqItem.status === 'approved';
    reqItem.status = isApproved ? 'approved' : 'rejected';

    // If newly approved, cancel/toggle off that slot and decrement member's totalMealsConsumed
    if (isApproved && !wasAlreadyApproved) {
      const member = (mess.members || []).find(
        (m) => m.id === reqItem.memberId || m.name === reqItem.memberName
      );
      if (member) {
        const mealsPerDay = mess.mealConfig?.mealsPerDay || 2;
        const dateKey = this.toDateKey(reqItem.date);
        let customSlotsMap = {};
        if (member.customDateSlots instanceof Map) {
          customSlotsMap = Object.fromEntries(member.customDateSlots);
        } else if (
          member.customDateSlots &&
          typeof member.customDateSlots === 'object'
        ) {
          customSlotsMap = { ...member.customDateSlots };
        }

        const baseSlots = Array.isArray(customSlotsMap[dateKey])
          ? [...customSlotsMap[dateKey]]
          : Array.isArray(member.todayMealSlots)
          ? [...member.todayMealSlots]
          : Array(mealsPerDay).fill(true);

        if (reqItem.slotIndex >= 0 && reqItem.slotIndex < baseSlots.length) {
          baseSlots[reqItem.slotIndex] = false;
        }
        customSlotsMap[dateKey] = baseSlots;
        member.customDateSlots = customSlotsMap;

        member.totalMealsConsumed = Math.max(
          0,
          Number(member.totalMealsConsumed || 0) - 1
        );
      }
    }

    mess.markModified('mealRequests');
    mess.markModified('members');
    await mess.save();

    return {
      mess: formatManagedMess(mess),
      mealRequest: reqItem,
    };
  }
}

module.exports = new MessService();

