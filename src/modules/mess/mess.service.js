const mongoose = require('mongoose');
const ManagedMess = require('./mess.model');
const PaymentRecord = require('./paymentRecord.model');
const MonthlySheet = require('./monthlySheet.model');
const Property = require('../property/property.model');
const User = require('../auth/user.model');
const userService = require('../user/user.service');
const notificationService = require('../notification/notification.service');
const { isDhakaArea } = require('../../utils/locationHelper');
const {
  buildMessRooms,
  normalizeRoomsArray,
  calculateSeatMetrics,
  extractRoomCountsFromRooms,
  normalizeUtilityBills,
  initializeMemberMealSlots,
  calculateMemberMonthMeals,
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
        const autoOperatingMode = isDhakaArea(prop.area || prop.detailedAddress)
          ? 'dhaka_centralized'
          : 'student_shared';

        await ManagedMess.create({
          _id: prop._id,
          propertyId: prop._id,
          name: messName,
          address: prop.detailedAddress,
          area: prop.area,
          operatingMode: autoOperatingMode,
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
          bazarRoster: { schedule: [] },
          cleaningRoster: { schedule: [] },
          developmentFund: { monthlyFeePerMember: 0, collections: [], expenses: [] },
          members: [
            {
              id: userIdStr,
              name: prop.landlordName || user.name || 'মেস ম্যানেজার',
              phone: prop.contactPhone || prop.landlordPhone || user.phoneNumber || '',
              isAdmin: true,
              isManager: true,
              role: 'controller',
              totalMealsConsumed: 0,
              totalMoneyDeposited: 0,
              paidRent: 0,
              paidUtility: 0,
              paidDevelopmentFee: 0,
              todayMealSlots: [true, true],
              customDateSlots: {},
            },
          ],
          mealConfig: {
            messName,
            mealsPerDay: 2,
            slotNames: ['দুপুর (Lunch)', 'রাত (Dinner)'],
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
   * Create a Bachelor Flat (Dedicated endpoint)
   * POST /api/messes/bachelor-flat
   */
  async createBachelorFlat(user, payload) {
    const { name, rooms: rawRooms, defaultSeatRent, address, area } = payload;
    const userIdStr = (user._id || user.id).toString();

    if (!name || !String(name).trim()) {
      const error = new Error('বাসার নাম আবশ্যক');
      error.statusCode = 400;
      throw error;
    }

    const defaultRent = Number(defaultSeatRent) || 4000;
    const rooms = normalizeRoomsArray(Array.isArray(rawRooms) ? rawRooms : []).map((room) => ({
      ...room,
      seats: (room.seats || []).map((seat) => ({
        ...seat,
        rentAmount:
          seat.rentAmount !== null && seat.rentAmount !== undefined
            ? Number(seat.rentAmount)
            : defaultRent,
      })),
    }));

    const metrics = calculateSeatMetrics(rooms);
    const roomCounts = extractRoomCountsFromRooms(rooms);

    const slotInit = initializeMemberMealSlots(2, new Date());
    const members = [
      {
        id: userIdStr,
        name: user.name,
        phone: user.phoneNumber || '',
        isAdmin: true,
        isManager: true,
        role: 'controller',
        roles: ['controller'],
        todayMealSlots: slotInit.todayMealSlots,
        customDateSlots: slotInit.customDateSlots,
        totalMealsConsumed: slotInit.totalMealsConsumed,
        totalMoneyDeposited: 0,
        paidRent: 0,
        paidUtility: 0,
        paidDevelopmentFee: 0,
      },
    ];

    const flatData = {
      propertyId: null,
      operatingMode: 'bachelor_flat',
      isPrivateGroup: true,
      name: String(name).trim(),
      address: String(address || '').trim(),
      area: String(area || '').trim(),
      managerId: userIdStr,
      managerName: user.name,
      managerPhone: user.phoneNumber || '',
      defaultSeatRent: defaultRent,
      ...roomCounts,
      totalSeats: metrics.totalSeats,
      vacantSeats: metrics.vacantSeats,
      rooms,
      members,
      sharedBills: [],
      notices: [],
      bazarEntries: [],
      mealConfig: {
        messName: String(name).trim(),
        mealsPerDay: 2,
        slotNames: ['দুপুর (Lunch)', 'রাত (Dinner)'],
        managerId: userIdStr,
        managerName: user.name,
        currentMonth: 'নভেম্বর ২০২৬',
      },
    };

    const flat = await ManagedMess.create(flatData);

    // Update user profile with affiliatedMessId & role
    try {
      await User.findByIdAndUpdate(user._id, {
        affiliatedMessId: flat._id,
        role: 'bachelor_admin',
      });
    } catch (uErr) {
      console.warn('Could not update user role/affiliatedMessId:', uErr.message);
    }

    return formatManagedMess(flat);
  }

  /**
   * Create a new ManagedMess (or Bachelor Mess Group)
   * POST /api/messes
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
    const defaultSlotNames =
      configuredMealsPerDay === 3
        ? ['সকাল (Breakfast)', 'দুপুর (Lunch)', 'রাত (Dinner)']
        : ['দুপুর (Lunch)', 'রাত (Dinner)'];
    const defaultSlots = Array(configuredMealsPerDay).fill(true);

    const autoOperatingMode =
      payload.operatingMode &&
      ['student_shared', 'dhaka_centralized', 'bachelor_flat'].includes(payload.operatingMode)
        ? payload.operatingMode
        : isDhakaArea(resolvedArea || resolvedAddress)
        ? 'dhaka_centralized'
        : 'student_shared';

    let members = [];
    if (Array.isArray(rawMembers) && rawMembers.length > 0) {
      members = rawMembers.map((m) => ({
        id: String(m.id || m._id || userIdStr),
        name: String(m.name || user.name),
        phone: String(m.phone || m.phoneNumber || user.phoneNumber),
        isAdmin: Boolean(m.isAdmin),
        isManager: Boolean(m.isManager),
        role: m.role || (m.isAdmin || m.isManager ? 'manager' : 'border'),
        totalMealsConsumed: Number(m.totalMealsConsumed || 0),
        totalMoneyDeposited: Number(m.totalMoneyDeposited || 0),
        paidRent: Number(m.paidRent || 0),
        paidUtility: Number(m.paidUtility || 0),
        paidDevelopmentFee: Number(m.paidDevelopmentFee || 0),
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
        role: 'controller',
        totalMealsConsumed: 0,
        totalMoneyDeposited: 0,
        paidRent: 0,
        paidUtility: 0,
        paidDevelopmentFee: 0,
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
      operatingMode: autoOperatingMode,
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
      bazarRoster: { schedule: [] },
      cleaningRoster: { schedule: [] },
      developmentFund: { monthlyFeePerMember: 0, collections: [], expenses: [] },
      members,
      bazarEntries: [],
      mealRequests: [],
      mealConfig: {
        messName: resolvedName,
        mealsPerDay: configuredMealsPerDay,
        slotNames: defaultSlotNames,
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
    const slotInit = initializeMemberMealSlots(mealsPerDay, new Date());
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
        role: 'border',
        roles: ['border'],
        totalMealsConsumed: slotInit.totalMealsConsumed,
        totalMoneyDeposited: resolvedAdvanceDeposit,
        paidRent: 0,
        paidUtility: 0,
        paidDevelopmentFee: 0,
        todayMealSlots: slotInit.todayMealSlots,
        customDateSlots: slotInit.customDateSlots,
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

    let dateSlots;
    if (Array.isArray(customSlotsMap[targetDateKey])) {
      dateSlots = [...customSlotsMap[targetDateKey]];
    } else if (targetDateKey === todayKey) {
      dateSlots = [...currentTodaySlots];
    } else if (targetDateKey < todayKey) {
      dateSlots = Array(mealsPerDay).fill(false);
    } else {
      dateSlots = Array(mealsPerDay).fill(true);
    }
    while (dateSlots.length < mealsPerDay) {
      dateSlots.push(targetDateKey < todayKey ? false : true);
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

    // Sync totalMealsConsumed exactly with active slots up to today
    member.totalMealsConsumed = calculateMemberMonthMeals(member, mealsPerDay);

    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Set meal slots for a date range (e.g. next 5 days) or multiple specific dates
   * PATCH /api/messes/:messId/members/:memberId/meal-slots/range
   * Body: { startDate, endDate, status, slots, dates }
   */
  async setMemberDateSlotsRange(messId, memberId, payload) {
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
    const todayKey = this.toDateKey();

    // Determine target dates
    let targetDates = [];
    if (Array.isArray(payload.dates) && payload.dates.length > 0) {
      targetDates = payload.dates.map((d) => this.toDateKey(d));
    } else if (payload.startDate && payload.endDate) {
      const start = new Date(payload.startDate);
      const end = new Date(payload.endDate);
      const cur = new Date(start);
      while (cur <= end) {
        targetDates.push(this.toDateKey(cur));
        cur.setDate(cur.getDate() + 1);
      }
    } else if (payload.date) {
      targetDates.push(this.toDateKey(payload.date));
    } else {
      const error = new Error('সঠিক তারিখ অথবা তারিখের সীমা (startDate ও endDate) প্রদান করুন');
      error.statusCode = 400;
      throw error;
    }

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

    for (const dateKey of targetDates) {
      let dateSlots = Array.isArray(customSlotsMap[dateKey])
        ? [...customSlotsMap[dateKey]]
        : [...currentTodaySlots];
      while (dateSlots.length < mealsPerDay) {
        dateSlots.push(true);
      }

      for (let sIdx = 0; sIdx < mealsPerDay; sIdx++) {
        let newSlotVal;
        if (payload.status !== undefined) {
          newSlotVal = Boolean(payload.status);
        } else if (Array.isArray(payload.slots) && payload.slots[sIdx] !== undefined) {
          newSlotVal = Boolean(payload.slots[sIdx]);
        } else {
          newSlotVal = false; // default off when setting vacation/off range
        }

        const oldSlotVal = Boolean(dateSlots[sIdx]);
        if (newSlotVal !== oldSlotVal) {
          dateSlots[sIdx] = newSlotVal;
          if (newSlotVal) {
            member.totalMealsConsumed = Number(member.totalMealsConsumed || 0) + 1;
          } else {
            member.totalMealsConsumed = Math.max(0, Number(member.totalMealsConsumed || 0) - 1);
          }
        }
      }

      customSlotsMap[dateKey] = dateSlots;
      if (dateKey === todayKey) {
        currentTodaySlots = [...dateSlots];
        member.todayMealSlots = currentTodaySlots;
      }
    }

    member.customDateSlots = customSlotsMap;
    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Get 30-day (or whole month) meal sheet for a member with daily slots
   * GET /api/messes/:messId/members/:memberId/meal-sheet?month=2026-11
   */
  async getMemberMealSheet(messId, memberId, query = {}) {
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
    const slotNames = mess.mealConfig?.slotNames || (mealsPerDay === 3 ? ['সকাল', 'দুপুর', 'রাত'] : ['দুপুর', 'রাত']);
    const todayKey = this.toDateKey();

    // Parse month or default to current month YYYY-MM
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1; // 1-12
    if (query.month && /^\d{4}-\d{2}$/.test(query.month)) {
      const parts = query.month.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    let customSlotsMap = {};
    if (member.customDateSlots instanceof Map) {
      customSlotsMap = Object.fromEntries(member.customDateSlots);
    } else if (member.customDateSlots && typeof member.customDateSlots === 'object') {
      customSlotsMap = { ...member.customDateSlots };
    }

    const defaultSlots = Array(mealsPerDay).fill(true);
    const sheet = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(month).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      let slots;
      if (Array.isArray(customSlotsMap[dateKey])) {
        slots = customSlotsMap[dateKey];
      } else if (dateKey === todayKey && Array.isArray(member.todayMealSlots)) {
        slots = member.todayMealSlots;
      } else if (dateKey < todayKey) {
        // Past days before joining or unrecorded are automatically OFF
        slots = Array(mealsPerDay).fill(false);
      } else {
        // Future days default to ON
        slots = defaultSlots;
      }

      sheet.push({
        dayNumber: day,
        date: dateKey,
        isToday: dateKey === todayKey,
        isPast: dateKey < todayKey,
        isFuture: dateKey > todayKey,
        slots: slots.slice(0, mealsPerDay),
        totalMealsDay: slots.filter(Boolean).length,
      });
    }

    return {
      messId: mess._id.toString(),
      memberId: member.id,
      memberName: member.name,
      month: `${year}-${String(month).padStart(2, '0')}`,
      daysInMonth,
      mealsPerDay,
      slotNames,
      totalMealsConsumed: member.totalMealsConsumed,
      sheet,
    };
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

    // Find buyer member for recording buyer details
    const targetBuyerId = buyerMemberId || user._id.toString();
    const buyerMember = (mess.members || []).find(
      (m) =>
        m.id === targetBuyerId ||
        m.phone === targetBuyerId ||
        (buyerMemberName && m.name === buyerMemberName)
    );

    // Decoupled from personal deposit in standard mess (student_shared / dhaka_centralized).
    // In Bachelor Flat mode:
    // Bazar expense is paid directly from the buyer's personal pocket (no manager advance deposit).
    // Therefore, the amount spent on bazar is credited directly to buyer's meal deposit!
    if (mess.operatingMode === 'bachelor_flat') {
      if (buyerMember) {
        buyerMember.totalMoneyDeposited = Number(buyerMember.totalMoneyDeposited || 0) + computedTotal;
        mess.markModified('members');
      }

      // Record a PaymentRecord for transparency & audit
      try {
        await PaymentRecord.create({
          messId: mess._id.toString(),
          memberId: buyerMember ? buyerMember.id : targetBuyerId,
          memberName: buyerMember ? buyerMember.name : (buyerMemberName || user.name),
          category: 'meal',
          amount: computedTotal,
          paymentMethod: 'bazar_contribution',
          collectorId: (user._id || user.id).toString(),
          collectorName: user.name || 'নিজস্ব বাজার',
          note: `বাজারের খরচ (স্বয়ংক্রিয় মিল জমা) - ${note || (items.length > 0 ? items.map((i) => i.name).join(', ') : 'বাজার সামগ্রী')}`,
          date: date ? new Date(date) : new Date(),
        });
      } catch (err) {
        console.warn('Could not record payment record for bachelor flat bazar:', err.message);
      }
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

    // Remove entry
    mess.bazarEntries.splice(bazarIndex, 1);

    // In Bachelor Flat mode, reverse buyer's deposit credit:
    if (mess.operatingMode === 'bachelor_flat') {
      const buyerMember = (mess.members || []).find(
        (m) =>
          m.id === targetBazar.buyerMemberId ||
          m.phone === targetBazar.buyerMemberId ||
          (targetBazar.buyerMemberName && m.name === targetBazar.buyerMemberName)
      );
      if (buyerMember) {
        buyerMember.totalMoneyDeposited = Math.max(
          0,
          Number(buyerMember.totalMoneyDeposited || 0) - Number(targetBazar.totalAmount || 0)
        );
        mess.markModified('members');
      }
    }

    mess.markModified('bazarEntries');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Get all Bazar Entries with summary, buyer breakdown & transparency list
   * GET /api/messes/:messId/bazar
   */
  async getBazarEntries(messId, user) {
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
    const userPhone = user.phoneNumber;
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === userPhone
    );

    const rawEntries = Array.isArray(mess.bazarEntries) ? mess.bazarEntries : [];
    const entries = [...rawEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalBazarCost = entries.reduce((sum, e) => sum + Number(e.totalAmount || 0), 0);

    const buyerMap = {};
    for (const e of entries) {
      const bId = e.buyerMemberId || 'unknown';
      if (!buyerMap[bId]) {
        buyerMap[bId] = {
          buyerMemberId: bId,
          buyerMemberName: e.buyerMemberName || 'বর্ডার',
          totalAmount: 0,
          entryCount: 0,
        };
      }
      buyerMap[bId].totalAmount += Number(e.totalAmount || 0);
      buyerMap[bId].entryCount += 1;
    }

    const myBuyerInfo = memberObj ? buyerMap[memberObj.id] || buyerMap[userIdStr] || null : null;
    const myTotalBazarCost = myBuyerInfo ? myBuyerInfo.totalAmount : 0;

    return {
      messId: mess._id.toString(),
      messName: mess.name,
      operatingMode: mess.operatingMode,
      totalBazarCost,
      totalEntries: entries.length,
      myTotalBazarCost,
      buyerBreakdown: Object.values(buyerMap),
      entries,
    };
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
    const slotInit = initializeMemberMealSlots(mealsPerDay, new Date());
    const initialMeals =
      totalMealsConsumed !== undefined && totalMealsConsumed !== null && !isNaN(Number(totalMealsConsumed))
        ? Number(totalMealsConsumed)
        : slotInit.totalMealsConsumed;

    const newMember = {
      id: registeredUser.id,
      name: registeredUser.name,
      phone: registeredUser.phoneNumber,
      role: isAdmin ? 'controller' : 'border',
      roles: isAdmin ? ['controller'] : ['border'],
      isAdmin: Boolean(isAdmin),
      isManager: false,
      totalMealsConsumed: initialMeals,
      totalMoneyDeposited: deposit,
      todayMealSlots: slotInit.todayMealSlots,
      customDateSlots: slotInit.customDateSlots,
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

      // Check if user is a controller in this mess
      const userMember = (mess.members || []).find(
        (m) => m.id === userIdStr || m.phone === userPhone
      );
      const userRoles = Array.isArray(userMember?.roles) && userMember.roles.length > 0
        ? userMember.roles
        : (userMember?.role ? [userMember.role] : []);
      const isController =
        mess.managerId === userIdStr ||
        mess.managerPhone === userPhone ||
        Boolean(userMember?.isAdmin) ||
        userRoles.includes('controller') ||
        userMember?.role === 'controller';

      const otherMembers = (mess.members || []).filter(
        (m) => m.id !== userIdStr && m.phone !== userPhone
      );

      // Rule: If leaving user is a controller and other members exist in the mess,
      // there MUST be at least one other controller appointed before this controller can leave!
      if (isController && otherMembers.length > 0) {
        const otherControllers = otherMembers.filter((m) => {
          const mRoles = Array.isArray(m.roles) && m.roles.length > 0 ? m.roles : (m.role ? [m.role] : []);
          return Boolean(m.isAdmin) || mRoles.includes('controller') || m.role === 'controller';
        });

        if (otherControllers.length === 0) {
          const error = new Error(
            'মেসে অন্তত একজন মেস কন্ট্রোলার থাকা আবশ্যক। মেস ছাড়ার পূর্বে অনুগ্রহ করে অন্য একজন সদস্যকে কন্ট্রোলার হিসেবে দায়িত্ব প্রদান করুন।'
          );
          error.statusCode = 400;
          throw error;
        }

        // If other controller exists and this user is primary mess manager, transfer primary manager to the other controller
        if (mess.managerId === userIdStr || mess.managerPhone === userPhone) {
          const newPrimaryController = otherControllers[0];
          mess.managerId = newPrimaryController.id;
          mess.managerName = newPrimaryController.name;
          mess.managerPhone = newPrimaryController.phone;
          newPrimaryController.isAdmin = true;
          newPrimaryController.isManager = true;
          if (!Array.isArray(newPrimaryController.roles)) {
            newPrimaryController.roles = [];
          }
          if (!newPrimaryController.roles.includes('controller')) {
            newPrimaryController.roles.push('controller');
          }
          newPrimaryController.role = 'controller';
          if (mess.mealConfig) {
            mess.mealConfig.managerId = newPrimaryController.id;
            mess.mealConfig.managerName = newPrimaryController.name;
          }
          isModified = true;
        }
      } else if (mess.managerId === userIdStr || mess.managerPhone === userPhone) {
        // If not a controller or sole member in mess, hand over or release manager
        const nextCandidate = otherMembers.find((m) => {
          const mRoles = Array.isArray(m.roles) && m.roles.length > 0 ? m.roles : (m.role ? [m.role] : []);
          return Boolean(m.isAdmin) || mRoles.includes('controller') || m.role === 'controller';
        }) || otherMembers[0];

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
      if (member.id === targetMember.id) {
        member.isManager = true;
      }
    }

    if (payload.roles || payload.role) {
      let rawRoles = [];
      if (Array.isArray(payload.roles)) rawRoles = payload.roles;
      else if (typeof payload.role === 'string') rawRoles = [payload.role];
      else if (typeof payload.roles === 'string') rawRoles = [payload.roles];
      if (rawRoles.length > 0) {
        targetMember.roles = rawRoles;
        targetMember.role = rawRoles[0];
        if (rawRoles.includes('controller')) targetMember.isAdmin = true;
      }
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

  /**
   * Helper: check if user is Controller, Manager or Admin of the mess
   */
  checkMessManagerOrAdmin(mess, user, requiredRole = null) {
    const userIdStr = (user._id || user.id).toString();
    const isOwner =
      mess.managerId === userIdStr || mess.managerPhone === user.phoneNumber;
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const memberRoles = Array.isArray(memberObj?.roles) && memberObj.roles.length > 0
      ? memberObj.roles
      : (memberObj?.role ? [memberObj.role] : []);

    const isController =
      isOwner ||
      Boolean(memberObj?.isAdmin) ||
      memberRoles.includes('controller') ||
      memberObj?.role === 'controller';

    if (isController) {
      return {
        isAuthorized: true,
        isController: true,
        isManager: true,
        member: memberObj,
        isOwner,
        roles: memberRoles,
      };
    }

    if (requiredRole === 'meal_bazar') {
      const authorized =
        memberRoles.includes('meal_bazar_manager') ||
        memberRoles.includes('meal_incharge') ||
        memberRoles.includes('manager') ||
        Boolean(memberObj?.isManager);
      return {
        isAuthorized: authorized,
        isController: false,
        isManager: authorized,
        member: memberObj,
        isOwner,
        roles: memberRoles,
      };
    }

    if (requiredRole === 'cleaning') {
      const authorized =
        memberRoles.includes('cleaning_manager') ||
        memberRoles.includes('cleaning_incharge') ||
        memberRoles.includes('manager') ||
        Boolean(memberObj?.isManager);
      return {
        isAuthorized: authorized,
        isController: false,
        isManager: authorized,
        member: memberObj,
        isOwner,
        roles: memberRoles,
      };
    }

    if (requiredRole === 'utility') {
      const authorized =
        memberRoles.includes('utility_manager') ||
        memberRoles.includes('utility_incharge') ||
        memberRoles.includes('manager') ||
        Boolean(memberObj?.isManager);
      return {
        isAuthorized: authorized,
        isController: false,
        isManager: authorized,
        member: memberObj,
        isOwner,
        roles: memberRoles,
      };
    }

    const hasAnyManagerRole =
      Boolean(memberObj?.isManager) ||
      memberRoles.some((r) =>
        ['manager', 'meal_bazar_manager', 'meal_incharge', 'cleaning_manager', 'cleaning_incharge', 'utility_manager', 'utility_incharge'].includes(r)
      );

    return {
      isAuthorized: Boolean(hasAnyManagerRole),
      isController: false,
      isManager: Boolean(hasAnyManagerRole),
      member: memberObj,
      isOwner,
      roles: memberRoles,
    };
  }

  /**
   * Update Mess Settings (Operating Mode & Meals per day 2 or 3)
   */
  async updateMessSettings(messId, user, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user);
    if (!isAuthorized) {
      const error = new Error('শুধুমাত্র মেস কন্ট্রোলার বা ম্যানেজার সেটিংস পরিবর্তন করতে পারেন');
      error.statusCode = 403;
      throw error;
    }

    const { operatingMode, mealsPerDay, currentMonth } = payload;

    // 1. Operating Mode update
    if (operatingMode) {
      if (!['student_shared', 'dhaka_centralized', 'bachelor_flat'].includes(operatingMode)) {
        const error = new Error('ভুল অপারেটিং মোড সিলেক্ট করা হয়েছে');
        error.statusCode = 400;
        throw error;
      }
      mess.operatingMode = operatingMode;
    }

    // 2. Meals per day setting (2 or 3)
    if (mealsPerDay !== undefined) {
      const parsedMealsPerDay = Number(mealsPerDay);
      if (parsedMealsPerDay !== 2 && parsedMealsPerDay !== 3) {
        const error = new Error('মিলের সংখ্যা শুধুমাত্র ২ বার অথবা ৩ বার হতে পারে');
        error.statusCode = 400;
        throw error;
      }

      mess.mealConfig = mess.mealConfig || {};
      mess.mealConfig.mealsPerDay = parsedMealsPerDay;
      mess.mealConfig.slotNames =
        parsedMealsPerDay === 3
          ? ['সকাল (Breakfast)', 'দুপুর (Lunch)', 'রাত (Dinner)']
          : ['দুপুর (Lunch)', 'রাত (Dinner)'];

      // Adjust each member's todayMealSlots to match the new count
      if (Array.isArray(mess.members)) {
        mess.members.forEach((member) => {
          let currentSlots = Array.isArray(member.todayMealSlots)
            ? member.todayMealSlots
            : [];
          if (parsedMealsPerDay === 3) {
            if (currentSlots.length < 3) {
              member.todayMealSlots = [
                currentSlots[0] !== undefined ? currentSlots[0] : true,
                currentSlots[1] !== undefined ? currentSlots[1] : true,
                true,
              ];
            }
          } else {
            // 2 meals: Lunch & Dinner
            member.todayMealSlots = currentSlots.slice(0, 2);
            if (member.todayMealSlots.length < 2) {
              member.todayMealSlots = [true, true];
            }
          }
        });
      }
    }

    if (currentMonth && typeof currentMonth === 'string') {
      mess.mealConfig = mess.mealConfig || {};
      mess.mealConfig.currentMonth = currentMonth.trim();
    }

    mess.markModified('mealConfig');
    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Get Bazar Roster (Visible to all borders and managers)
   */
  /**
   * Get Bazar Roster (Visible to all borders and managers)
   * GET /api/messes/:messId/bazar-roster
   */
  async getBazarRoster(messId, user, query = {}) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const requestedMonth = query.month ? String(query.month).trim() : null;
    let targetRoster = null;

    if (requestedMonth && Array.isArray(mess.bazarRosters)) {
      targetRoster = mess.bazarRosters.find(
        (r) => r.month && r.month.trim() === requestedMonth
      );
    }

    if (!targetRoster && mess.bazarRoster) {
      if (typeof mess.bazarRoster === 'object' && !Array.isArray(mess.bazarRoster)) {
        if (!requestedMonth || (mess.bazarRoster.month && mess.bazarRoster.month.trim() === requestedMonth)) {
          targetRoster = mess.bazarRoster;
        }
      }
    }

    if (!targetRoster) {
      if (Array.isArray(mess.bazarRosters) && mess.bazarRosters.length > 0) {
        targetRoster = mess.bazarRosters[mess.bazarRosters.length - 1];
      } else if (mess.bazarRoster && !Array.isArray(mess.bazarRoster) && typeof mess.bazarRoster === 'object') {
        targetRoster = mess.bazarRoster;
      } else {
        targetRoster = {
          month: requestedMonth || mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬',
          schedule: Array.isArray(mess.bazarRoster) ? mess.bazarRoster : [],
        };
      }
    }

    const cleanSchedule = (Array.isArray(targetRoster.schedule) ? targetRoster.schedule : []).map((s, idx) => ({
      id: s.id ? String(s.id).trim() : `roster_${s.dayNumber || idx + 1}`,
      dayNumber: Number(s.dayNumber) || idx + 1,
      date: s.date || '',
      memberIds: Array.isArray(s.memberIds) ? s.memberIds.map(String) : [],
      memberNames: Array.isArray(s.memberNames) ? s.memberNames.map(String) : [],
      note: s.note || '',
      isCompleted: Boolean(s.isCompleted),
      notificationSent: Boolean(s.notificationSent),
    }));

    return {
      bazarRoster: {
        month: targetRoster.month || requestedMonth || mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬',
        schedule: cleanSchedule,
      },
      operatingMode: mess.operatingMode || 'student_shared',
    };
  }

  /**
   * Set or Replace Entire Bazar Roster (30 days schedule)
   * POST /api/messes/:messId/bazar-roster
   */
  async setBazarRoster(messId, user, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user, 'meal_bazar');
    if (!isAuthorized) {
      const error = new Error('বাজার রোস্টার তৈরি বা পরিবর্তন করার অনুমতি আপনার নেই');
      error.statusCode = 403;
      throw error;
    }

    const targetMonth = (payload.month || mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬').trim();
    const rawSchedule = Array.isArray(payload.schedule) ? payload.schedule : [];

    const formattedSchedule = rawSchedule.map((s, idx) => {
      const dayNum = parseInt(s.dayNumber, 10);
      const validDayNumber = !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31 ? dayNum : Math.min(31, Math.max(1, idx + 1));

      return {
        id: s.id ? String(s.id).trim() : `roster_${validDayNumber}`,
        dayNumber: validDayNumber,
        date: s.date ? this.toDateKey(s.date) : '',
        memberIds: Array.isArray(s.memberIds) ? s.memberIds.map(String) : [],
        memberNames: Array.isArray(s.memberNames) ? s.memberNames.map(String) : [],
        note: s.note ? String(s.note).trim() : '',
        isCompleted: Boolean(s.isCompleted),
        notificationSent: Boolean(s.notificationSent),
      };
    });

    const newRosterData = {
      month: targetMonth,
      note: payload.note ? String(payload.note).trim() : '',
      schedule: formattedSchedule,
    };

    // Rule 3: If a roster already exists for that month, update/overwrite the month's schedule
    mess.bazarRosters = Array.isArray(mess.bazarRosters) ? mess.bazarRosters : [];
    const existingIndex = mess.bazarRosters.findIndex(
      (r) => r.month && r.month.trim() === targetMonth
    );

    if (existingIndex >= 0) {
      mess.bazarRosters[existingIndex] = newRosterData;
    } else {
      mess.bazarRosters.push(newRosterData);
    }

    mess.bazarRoster = newRosterData;

    mess.markModified('bazarRoster');
    mess.markModified('bazarRosters');
    await mess.save();

    return {
      bazarRoster: newRosterData,
      mess: formatManagedMess(mess),
    };
  }

  /**
   * Add or Update a single day's Bazar Roster Entry
   */
  async updateBazarRosterEntry(messId, user, entryId, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    mess.bazarRoster = (mess.bazarRoster && !Array.isArray(mess.bazarRoster) && typeof mess.bazarRoster === 'object')
      ? mess.bazarRoster
      : { month: mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬', schedule: Array.isArray(mess.bazarRoster) ? mess.bazarRoster : [] };

    const schedule = mess.bazarRoster.schedule || [];
    let entry = schedule.find(
      (s) => s.id === entryId || (s._id && s._id.toString() === entryId)
    );

    const userIdStr = (user._id || user.id).toString();
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const isAssigned =
      entry &&
      Array.isArray(entry.memberIds) &&
      (entry.memberIds.includes(userIdStr) ||
        (memberObj && entry.memberNames?.includes(memberObj.name)));

    const { isAuthorized: canManage } = this.checkMessManagerOrAdmin(mess, user, 'meal_bazar');

    if (!canManage && !isAssigned) {
      const error = new Error('আপনার এই রোস্টার এন্ট্রি আপডেট করার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    if (!entry) {
      const dayNum = parseInt(payload.dayNumber, 10);
      const validDayNumber = !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31 ? dayNum : Math.min(31, Math.max(1, schedule.length + 1));
      entry = {
        id: entryId || `roster_${validDayNumber}`,
        date: payload.date ? this.toDateKey(payload.date) : '',
        dayNumber: validDayNumber,
        memberIds: Array.isArray(payload.memberIds) ? payload.memberIds.map(String) : [],
        memberNames: Array.isArray(payload.memberNames) ? payload.memberNames.map(String) : [],
        note: payload.note ? String(payload.note).trim() : '',
        isCompleted: Boolean(payload.isCompleted),
        notificationSent: false,
      };
      schedule.push(entry);
    } else {
      if (canManage) {
        if (payload.date) entry.date = this.toDateKey(payload.date);
        if (payload.dayNumber !== undefined) {
          const dayNum = parseInt(payload.dayNumber, 10);
          if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) entry.dayNumber = dayNum;
        }
        if (Array.isArray(payload.memberIds)) entry.memberIds = payload.memberIds.map(String);
        if (Array.isArray(payload.memberNames)) entry.memberNames = payload.memberNames.map(String);
      }
      if (payload.note !== undefined) entry.note = String(payload.note).trim();
      if (payload.isCompleted !== undefined) entry.isCompleted = Boolean(payload.isCompleted);
    }

    // Keep active month roster in bazarRosters in sync
    if (Array.isArray(mess.bazarRosters) && mess.bazarRoster.month) {
      const rIdx = mess.bazarRosters.findIndex((r) => r.month === mess.bazarRoster.month);
      if (rIdx >= 0) mess.bazarRosters[rIdx] = mess.bazarRoster;
    }

    mess.markModified('bazarRoster');
    mess.markModified('bazarRosters');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Delete single Bazar Roster Entry
   */
  async deleteBazarRosterEntry(messId, user, entryId) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user, 'meal_bazar');
    if (!isAuthorized) {
      const error = new Error('বাজার রোস্টার এন্ট্রি মুছে ফেলার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    mess.bazarRoster = (mess.bazarRoster && !Array.isArray(mess.bazarRoster) && typeof mess.bazarRoster === 'object')
      ? mess.bazarRoster
      : { month: mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬', schedule: Array.isArray(mess.bazarRoster) ? mess.bazarRoster : [] };

    mess.bazarRoster.schedule = (mess.bazarRoster.schedule || []).filter(
      (s) => s.id !== entryId && (!s._id || s._id.toString() !== entryId)
    );

    if (Array.isArray(mess.bazarRosters) && mess.bazarRoster.month) {
      const rIdx = mess.bazarRosters.findIndex((r) => r.month === mess.bazarRoster.month);
      if (rIdx >= 0) mess.bazarRosters[rIdx] = mess.bazarRoster;
    }

    mess.markModified('bazarRoster');
    mess.markModified('bazarRosters');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Get Cleaning Roster (Transparent to all members)
   * GET /api/messes/:messId/cleaning-roster
   */
  async getCleaningRoster(messId, user, query = {}) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const requestedMonth = query.month ? String(query.month).trim() : null;
    let targetRoster = null;

    if (requestedMonth && Array.isArray(mess.cleaningRosters)) {
      targetRoster = mess.cleaningRosters.find(
        (r) => r.month && r.month.trim() === requestedMonth
      );
    }

    if (!targetRoster && mess.cleaningRoster) {
      if (typeof mess.cleaningRoster === 'object' && !Array.isArray(mess.cleaningRoster)) {
        if (!requestedMonth || (mess.cleaningRoster.month && mess.cleaningRoster.month.trim() === requestedMonth)) {
          targetRoster = mess.cleaningRoster;
        }
      }
    }

    if (!targetRoster) {
      if (Array.isArray(mess.cleaningRosters) && mess.cleaningRosters.length > 0) {
        targetRoster = mess.cleaningRosters[mess.cleaningRosters.length - 1];
      } else if (mess.cleaningRoster && !Array.isArray(mess.cleaningRoster) && typeof mess.cleaningRoster === 'object') {
        targetRoster = mess.cleaningRoster;
      } else {
        targetRoster = {
          month: requestedMonth || mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬',
          schedule: Array.isArray(mess.cleaningRoster) ? mess.cleaningRoster : [],
        };
      }
    }

    const cleanSchedule = (Array.isArray(targetRoster.schedule) ? targetRoster.schedule : []).map((s, idx) => ({
      id: s.id ? String(s.id).trim() : `clean_${s.dayNumber || idx + 1}`,
      dayNumber: Number(s.dayNumber) || idx + 1,
      date: s.date || '',
      memberIds: Array.isArray(s.memberIds) ? s.memberIds.map(String) : [],
      memberNames: Array.isArray(s.memberNames) ? s.memberNames.map(String) : [],
      cleaningArea: s.cleaningArea ? String(s.cleaningArea).trim() : 'টয়লেট ও বেসিন',
      note: s.note || '',
      isCompleted: Boolean(s.isCompleted),
      notificationSent: Boolean(s.notificationSent),
    }));

    return {
      cleaningRoster: {
        month: targetRoster.month || requestedMonth || mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬',
        schedule: cleanSchedule,
      },
      operatingMode: mess.operatingMode || 'student_shared',
    };
  }

  /**
   * Set or Replace Entire Cleaning Roster
   * POST /api/messes/:messId/cleaning-roster
   */
  async setCleaningRoster(messId, user, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user, 'cleaning');
    if (!isAuthorized) {
      const error = new Error('পরিষ্কারের রোস্টার তৈরি বা পরিবর্তন করার অনুমতি আপনার নেই');
      error.statusCode = 403;
      throw error;
    }

    const targetMonth = (payload.month || mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬').trim();
    const rawSchedule = Array.isArray(payload.schedule) ? payload.schedule : [];

    const formattedSchedule = rawSchedule.map((s, idx) => {
      const dayNum = parseInt(s.dayNumber, 10);
      const validDayNumber = !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31 ? dayNum : Math.min(31, Math.max(1, idx + 1));

      return {
        id: s.id ? String(s.id).trim() : `clean_${validDayNumber}`,
        dayNumber: validDayNumber,
        date: s.date ? this.toDateKey(s.date) : '',
        memberIds: Array.isArray(s.memberIds) ? s.memberIds.map(String) : [],
        memberNames: Array.isArray(s.memberNames) ? s.memberNames.map(String) : [],
        cleaningArea: s.cleaningArea ? String(s.cleaningArea).trim() : 'টয়লেট ও বেসিন',
        note: s.note ? String(s.note).trim() : '',
        isCompleted: Boolean(s.isCompleted),
        notificationSent: Boolean(s.notificationSent),
      };
    });

    const newRosterData = {
      month: targetMonth,
      note: payload.note ? String(payload.note).trim() : '',
      schedule: formattedSchedule,
    };

    // Rule 3: If a roster already exists for that month, update/overwrite the month's schedule
    mess.cleaningRosters = Array.isArray(mess.cleaningRosters) ? mess.cleaningRosters : [];
    const existingIndex = mess.cleaningRosters.findIndex(
      (r) => r.month && r.month.trim() === targetMonth
    );

    if (existingIndex >= 0) {
      mess.cleaningRosters[existingIndex] = newRosterData;
    } else {
      mess.cleaningRosters.push(newRosterData);
    }

    mess.cleaningRoster = newRosterData;

    mess.markModified('cleaningRoster');
    mess.markModified('cleaningRosters');
    await mess.save();

    return {
      cleaningRoster: newRosterData,
      mess: formatManagedMess(mess),
    };
  }

  /**
   * Add or Update single Cleaning Roster Entry
   */
  async updateCleaningRosterEntry(messId, user, entryId, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    mess.cleaningRoster = (mess.cleaningRoster && !Array.isArray(mess.cleaningRoster) && typeof mess.cleaningRoster === 'object')
      ? mess.cleaningRoster
      : { month: mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬', schedule: Array.isArray(mess.cleaningRoster) ? mess.cleaningRoster : [] };

    const schedule = mess.cleaningRoster.schedule || [];
    let entry = schedule.find(
      (s) => s.id === entryId || (s._id && s._id.toString() === entryId)
    );

    const userIdStr = (user._id || user.id).toString();
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const isAssigned =
      entry &&
      Array.isArray(entry.memberIds) &&
      (entry.memberIds.includes(userIdStr) ||
        (memberObj && entry.memberNames?.includes(memberObj.name)));

    const { isAuthorized: canManage } = this.checkMessManagerOrAdmin(mess, user, 'cleaning');

    if (!canManage && !isAssigned) {
      const error = new Error('আপনার এই পরিষ্কারের শিডিউল আপডেট করার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    if (!entry) {
      const dayNum = parseInt(payload.dayNumber, 10);
      const validDayNumber = !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31 ? dayNum : Math.min(31, Math.max(1, schedule.length + 1));
      entry = {
        id: entryId || `clean_${validDayNumber}`,
        date: payload.date ? this.toDateKey(payload.date) : '',
        dayNumber: validDayNumber,
        memberIds: Array.isArray(payload.memberIds) ? payload.memberIds.map(String) : [],
        memberNames: Array.isArray(payload.memberNames) ? payload.memberNames.map(String) : [],
        cleaningArea: payload.cleaningArea ? String(payload.cleaningArea).trim() : 'টয়লেট ও বেসিন',
        note: payload.note ? String(payload.note).trim() : '',
        isCompleted: Boolean(payload.isCompleted),
        notificationSent: false,
      };
      schedule.push(entry);
    } else {
      if (canManage) {
        if (payload.date) entry.date = this.toDateKey(payload.date);
        if (payload.dayNumber !== undefined) {
          const dayNum = parseInt(payload.dayNumber, 10);
          if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) entry.dayNumber = dayNum;
        }
        if (Array.isArray(payload.memberIds)) entry.memberIds = payload.memberIds.map(String);
        if (Array.isArray(payload.memberNames)) entry.memberNames = payload.memberNames.map(String);
        if (payload.cleaningArea !== undefined) entry.cleaningArea = String(payload.cleaningArea).trim();
      }
      if (payload.note !== undefined) entry.note = String(payload.note).trim();
      if (payload.isCompleted !== undefined) entry.isCompleted = Boolean(payload.isCompleted);
    }

    if (Array.isArray(mess.cleaningRosters) && mess.cleaningRoster.month) {
      const rIdx = mess.cleaningRosters.findIndex((r) => r.month === mess.cleaningRoster.month);
      if (rIdx >= 0) mess.cleaningRosters[rIdx] = mess.cleaningRoster;
    }

    mess.markModified('cleaningRoster');
    mess.markModified('cleaningRosters');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Delete single Cleaning Roster Entry
   */
  async deleteCleaningRosterEntry(messId, user, entryId) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user, 'cleaning');
    if (!isAuthorized) {
      const error = new Error('পরিষ্কারের রোস্টার এন্ট্রি মুছে ফেলার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    mess.cleaningRoster = (mess.cleaningRoster && !Array.isArray(mess.cleaningRoster) && typeof mess.cleaningRoster === 'object')
      ? mess.cleaningRoster
      : { month: mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬', schedule: Array.isArray(mess.cleaningRoster) ? mess.cleaningRoster : [] };

    mess.cleaningRoster.schedule = (mess.cleaningRoster.schedule || []).filter(
      (s) => s.id !== entryId && (!s._id || s._id.toString() !== entryId)
    );

    if (Array.isArray(mess.cleaningRosters) && mess.cleaningRoster.month) {
      const rIdx = mess.cleaningRosters.findIndex((r) => r.month === mess.cleaningRoster.month);
      if (rIdx >= 0) mess.cleaningRosters[rIdx] = mess.cleaningRoster;
    }

    mess.markModified('cleaningRoster');
    mess.markModified('cleaningRosters');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Get Development Fund (Transparent for all members)
   */
  async getDevelopmentFund(messId, user) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const formatted = formatManagedMess(mess);
    return {
      developmentFund: formatted.developmentFund,
    };
  }

  /**
   * Set Development Fund Configuration (e.g. monthly fee per member)
   */
  async setDevelopmentFundConfig(messId, user, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user);
    if (!isAuthorized) {
      const error = new Error('মেস উন্নয়ন ফি নির্ধারণ করার অনুমতি শুধুমাত্র কন্ট্রোলার বা ম্যানেজারের আছে');
      error.statusCode = 403;
      throw error;
    }

    const { monthlyFeePerMember, note } = payload;
    mess.developmentFund = mess.developmentFund || { collections: [], expenses: [] };
    if (monthlyFeePerMember !== undefined) {
      mess.developmentFund.monthlyFeePerMember = Math.max(0, Number(monthlyFeePerMember) || 0);
    }
    if (note !== undefined) {
      mess.developmentFund.note = String(note).trim();
    }

    mess.markModified('developmentFund');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Record Development Fee Collection / Payment from a border
   */
  async recordDevelopmentFeePayment(messId, user, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user);
    if (!isAuthorized) {
      const error = new Error('উন্নয়ন ফি জমা নেওয়ার অনুমতি আপনার নেই');
      error.statusCode = 403;
      throw error;
    }

    const { memberId, amount, paymentDate, paymentMethod, note } = payload;
    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      const error = new Error('সঠিক জমার পরিমাণ উল্লেখ করুন');
      error.statusCode = 400;
      throw error;
    }

    const targetMember = (mess.members || []).find(
      (m) => m.id === memberId || (m._id && m._id.toString() === memberId)
    );
    if (!targetMember) {
      const error = new Error('মেম্বারকে পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    // Add to member's paidDevelopmentFee
    targetMember.paidDevelopmentFee =
      (Number(targetMember.paidDevelopmentFee) || 0) + paymentAmount;

    // Record in developmentFund collections
    mess.developmentFund = mess.developmentFund || { collections: [], expenses: [] };
    mess.developmentFund.collections.push({
      id: new mongoose.Types.ObjectId().toString(),
      memberId: targetMember.id,
      memberName: targetMember.name,
      amount: paymentAmount,
      date: paymentDate ? this.toDateKey(paymentDate) : this.toDateKey(new Date()),
      paymentMethod: paymentMethod || 'Cash',
      note: note || '',
      recordedBy: user.name || 'কন্ট্রোলার',
    });

    mess.markModified('developmentFund');
    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Record Development Expense (spent from development fund)
   */
  async recordDevelopmentExpense(messId, user, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user);
    if (!isAuthorized) {
      const error = new Error('উন্নয়ন ফান্ড থেকে খরচ যোগ করার অনুমতি আপনার নেই');
      error.statusCode = 403;
      throw error;
    }

    const { title, amount, expenseDate, spentBy, voucherUrl, note } = payload;
    const expenseAmount = Number(amount);
    if (!title || !expenseAmount || expenseAmount <= 0) {
      const error = new Error('খরচের বিবরণ ও সঠিক পরিমাণ দেওয়া আবশ্যক');
      error.statusCode = 400;
      throw error;
    }

    mess.developmentFund = mess.developmentFund || { collections: [], expenses: [] };
    mess.developmentFund.expenses.push({
      id: new mongoose.Types.ObjectId().toString(),
      title: String(title).trim(),
      amount: expenseAmount,
      date: expenseDate ? this.toDateKey(expenseDate) : this.toDateKey(new Date()),
      spentBy: spentBy || user.name || 'কন্ট্রোলার',
      voucherUrl: voucherUrl || '',
      note: note || '',
    });

    mess.markModified('developmentFund');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Delete Development Expense
   */
  async deleteDevelopmentExpense(messId, user, expenseId) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user);
    if (!isAuthorized) {
      const error = new Error('খরচ মুছে ফেলার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    mess.developmentFund = mess.developmentFund || { expenses: [] };
    mess.developmentFund.expenses = (mess.developmentFund.expenses || []).filter(
      (e) => e.id !== expenseId && (!e._id || e._id.toString() !== expenseId)
    );

    mess.markModified('developmentFund');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Assign Role(s) to a Mess Member (Controller assigns roles)
   * Supports assigning multiple responsibilities:
   * - controller (মেস কন্ট্রোলার)
   * - meal_bazar_manager (মিল ও বাজার ম্যানেজার)
   * - cleaning_manager (টয়লেট ও মেস পরিষ্কার ম্যানেজার)
   * - utility_manager (ইউটিলিটি ও বিল ম্যানেজার)
   * - border (সাধারণ বর্ডার)
   */
  async setMemberRole(messId, user, targetMemberId, rolePayload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const userIdStr = (user._id || user.id).toString();
    const isOwner =
      mess.managerId === userIdStr || mess.managerPhone === user.phoneNumber;
    const currentMember = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const currentUserRoles = Array.isArray(currentMember?.roles) && currentMember.roles.length > 0
      ? currentMember.roles
      : (currentMember?.role ? [currentMember.role] : []);
    const isController =
      isOwner ||
      Boolean(currentMember?.isAdmin) ||
      currentUserRoles.includes('controller') ||
      currentMember?.role === 'controller';

    if (!isController) {
      const error = new Error('শুধুমাত্র মেস কন্ট্রোলার মেম্বারদের রোল বরাদ্দ করতে পারেন');
      error.statusCode = 403;
      throw error;
    }

    const target = (mess.members || []).find(
      (m) => m.id === targetMemberId || (m._id && m._id.toString() === targetMemberId)
    );
    if (!target) {
      const error = new Error('মেম্বারকে পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    // Extract roles from rolePayload (array, object, or string)
    let rawRoles = [];
    if (Array.isArray(rolePayload)) {
      rawRoles = rolePayload;
    } else if (typeof rolePayload === 'string') {
      rawRoles = [rolePayload];
    } else if (rolePayload && typeof rolePayload === 'object') {
      if (Array.isArray(rolePayload.roles)) {
        rawRoles = rolePayload.roles;
      } else if (typeof rolePayload.role === 'string') {
        rawRoles = [rolePayload.role];
      }
    }

    // Role mapping and alias resolution
    const roleMapping = {
      controller: 'controller',
      manager: 'manager',
      meal_bazar_manager: 'meal_bazar_manager',
      meal_incharge: 'meal_bazar_manager',
      cleaning_manager: 'cleaning_manager',
      cleaning_incharge: 'cleaning_manager',
      utility_manager: 'utility_manager',
      utility_incharge: 'utility_manager',
      border: 'border',
    };

    const validKeys = Object.keys(roleMapping);
    let normalizedRoles = [
      ...new Set(
        rawRoles
          .map((r) => String(r).trim().toLowerCase())
          .filter((r) => validKeys.includes(r))
          .map((r) => roleMapping[r])
      ),
    ];

    if (normalizedRoles.length === 0) {
      normalizedRoles = ['border'];
    }

    // If manager or controller roles are selected along with 'border', eliminate 'border'
    const finalRoles =
      normalizedRoles.length > 1
        ? normalizedRoles.filter((r) => r !== 'border')
        : normalizedRoles;

    const hasController = finalRoles.includes('controller');
    const hasAnyManager = finalRoles.some((r) =>
      ['controller', 'manager', 'meal_bazar_manager', 'cleaning_manager', 'utility_manager'].includes(r)
    );

    target.roles = finalRoles;
    target.role = finalRoles[0] || 'border';
    target.isAdmin = hasController;
    target.isManager = hasAnyManager;

    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Record Granular Member Payment (Rent, Utility, Meal Deposit, Development Fee)
   */
  async recordMemberPayment(messId, user, targetMemberId, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user);
    if (!isAuthorized) {
      const error = new Error('পেমেন্ট হিসাব যুক্ত করার অনুমতি আপনার নেই');
      error.statusCode = 403;
      throw error;
    }

    const { paymentType, amount, note, date } = payload;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      const error = new Error('সঠিক টাকার পরিমাণ দিন');
      error.statusCode = 400;
      throw error;
    }

    const target = (mess.members || []).find(
      (m) => m.id === targetMemberId || (m._id && m._id.toString() === targetMemberId)
    );
    if (!target) {
      const error = new Error('মেম্বার পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const paymentDateKey = date ? this.toDateKey(date) : this.toDateKey(new Date());

    switch (paymentType) {
      case 'seat_rent':
        target.paidRent = (Number(target.paidRent) || 0) + numAmount;
        break;
      case 'utility':
        target.paidUtility = (Number(target.paidUtility) || 0) + numAmount;
        break;
      case 'meal_deposit':
        target.totalMoneyDeposited = (Number(target.totalMoneyDeposited) || 0) + numAmount;
        break;
      case 'development_fee':
        target.paidDevelopmentFee = (Number(target.paidDevelopmentFee) || 0) + numAmount;
        mess.developmentFund = mess.developmentFund || { collections: [], expenses: [] };
        mess.developmentFund.collections.push({
          id: new mongoose.Types.ObjectId().toString(),
          memberId: target.id,
          memberName: target.name,
          amount: numAmount,
          date: paymentDateKey,
          note: note || 'উন্নয়ন ফি জমা',
          recordedBy: user.name || 'কন্ট্রোলার',
        });
        mess.markModified('developmentFund');
        break;
      default: {
        const error = new Error('সঠিক পেমেন্টের ধরন দিন (seat_rent, utility, meal_deposit, development_fee)');
        error.statusCode = 400;
        throw error;
      }
    }

    let paymentCategory = null;
    if (paymentType === 'meal_deposit' || paymentType === 'meal') paymentCategory = 'meal';
    else if (paymentType === 'seat_rent' || paymentType === 'rent') paymentCategory = 'rent';
    else if (paymentType === 'utility') paymentCategory = 'utility';

    if (paymentCategory) {
      try {
        await PaymentRecord.create({
          id: new mongoose.Types.ObjectId().toString(),
          messId: mess._id.toString(),
          memberId: target.id,
          memberName: target.name,
          amount: numAmount,
          category: paymentCategory,
          paymentMethod: 'cash',
          collectorId: (user._id || user.id).toString(),
          collectorName: user.name || 'ম্যানেজার',
          note: note || '',
          createdAt: date ? new Date(date) : new Date(),
        });
      } catch (err) {
        // Non-blocking fallback
      }
    }

    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Record Deposit with Role-based Category Permissions
   * POST /api/mess/:messId/deposits
   */
  async recordDeposit(messId, user, payload = {}) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি (Mess not found)');
      error.statusCode = 404;
      throw error;
    }

    const userIdStr = (user._id || user.id).toString();
    const isOwner = mess.managerId === userIdStr || mess.managerPhone === user.phoneNumber;
    const currentMember = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );

    const userRoles = Array.isArray(currentMember?.roles) && currentMember.roles.length > 0
      ? currentMember.roles
      : (currentMember?.role ? [currentMember.role] : []);

    const isControllerOrFullManager =
      isOwner ||
      Boolean(currentMember?.isAdmin) ||
      userRoles.includes('controller') ||
      currentMember?.role === 'controller' ||
      userRoles.includes('manager') ||
      currentMember?.role === 'manager';

    const hasMealRole =
      userRoles.includes('meal_bazar_manager') ||
      userRoles.includes('meal_incharge');

    const hasUtilityRole =
      userRoles.includes('utility_manager') ||
      userRoles.includes('utility_incharge');

    // 1. Regular Border Check:
    if (!isControllerOrFullManager && !hasMealRole && !hasUtilityRole) {
      const error = new Error('বর্ডারদের টাকা জমা উত্তোলনের অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    // 2. Normalize and Validate Category:
    const rawCategory = String(payload.category || payload.paymentType || '').trim().toLowerCase();
    let category = '';
    if (rawCategory === 'meal' || rawCategory === 'meal_deposit') category = 'meal';
    else if (rawCategory === 'rent' || rawCategory === 'seat_rent') category = 'rent';
    else if (rawCategory === 'utility' || rawCategory === 'utility_bill') category = 'utility';
    else {
      const error = new Error('সঠিক ক্যাটাগরি দিন (meal, rent, utility)');
      error.statusCode = 400;
      throw error;
    }

    // 3. Role-based Category Enforcement:
    if (!isControllerOrFullManager) {
      if (category === 'meal' && !hasMealRole) {
        const error = new Error('মিলের টাকা জমা নেওয়ার অনুমতি আপনার নেই');
        error.statusCode = 403;
        throw error;
      }
      if (category === 'utility' && !hasUtilityRole) {
        const error = new Error('ইউটিলিটি বিল জমা নেওয়ার অনুমতি আপনার নেই');
        error.statusCode = 403;
        throw error;
      }
      if (category === 'rent') {
        const error = new Error('শুধুমাত্র মেস কন্ট্রোলার বা মেস ম্যানেজার সিট ভাড়ার টাকা জমা নিতে পারেন');
        error.statusCode = 403;
        throw error;
      }
    }

    // 4. Validate Target Member:
    const targetMemberId = payload.memberId || payload.targetMemberId;
    if (!targetMemberId) {
      const error = new Error('মেম্বার আইডি প্রদান করা আবশ্যক');
      error.statusCode = 400;
      throw error;
    }

    const targetMember = (mess.members || []).find(
      (m) =>
        m.id === targetMemberId ||
        (m._id && m._id.toString() === targetMemberId) ||
        m.phone === targetMemberId
    );
    if (!targetMember) {
      const error = new Error('মেম্বারকে পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    // 5. Validate Amount:
    const numAmount = Math.round(Number(payload.amount));
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      const error = new Error('টাকার পরিমাণ অবশ্যই একটি ধনাত্মক পূর্ণসংখ্যা হতে হবে');
      error.statusCode = 400;
      throw error;
    }

    // 6. Defaults for optional fields:
    const paymentMethod = payload.paymentMethod ? String(payload.paymentMethod).trim().toLowerCase() : 'cash';
    const createdAt = payload.createdAt || payload.date ? new Date(payload.createdAt || payload.date) : new Date();

    // 7. Save PaymentRecord:
    const paymentRecord = new PaymentRecord({
      id: new mongoose.Types.ObjectId().toString(),
      messId: mess._id.toString(),
      memberId: targetMember.id,
      memberName: targetMember.name,
      amount: numAmount,
      category,
      paymentMethod,
      collectorId: userIdStr,
      collectorName: user.name || (currentMember ? currentMember.name : 'ম্যানেজার'),
      note: payload.note ? String(payload.note).trim() : '',
      createdAt,
    });
    await paymentRecord.save();

    // 8. Update member balances in mess ledger:
    if (category === 'meal') {
      targetMember.totalMoneyDeposited = Number(targetMember.totalMoneyDeposited || 0) + numAmount;
    } else if (category === 'rent') {
      targetMember.paidRent = Number(targetMember.paidRent || 0) + numAmount;
    } else if (category === 'utility') {
      targetMember.paidUtility = Number(targetMember.paidUtility || 0) + numAmount;
    }

    mess.markModified('members');
    await mess.save();

    return {
      deposit: paymentRecord,
      paymentRecord,
      mess: formatManagedMess(mess),
    };
  }

  /**
   * Get List of Deposits / Payment Records
   * GET /api/mess/:messId/deposits
   */
  async getDeposits(messId, user, query = {}) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const filter = { messId: mess._id.toString() };
    if (query.memberId) filter.memberId = query.memberId;
    if (query.category) filter.category = query.category;

    const deposits = await PaymentRecord.find(filter).sort({ createdAt: -1 });
    return deposits;
  }

  /**
   * Get Deposit Summary (totalMealDeposited, totalBazarCost, cashInHand, memberMealDeposits)
   * GET /api/mess/:messId/deposits/summary
   */
  async getDepositsSummary(messId, user) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const messIdStr = mess._id.toString();
    const mealRecords = await PaymentRecord.find({
      messId: messIdStr,
      category: 'meal',
    });

    const memberMealDeposits = (mess.members || []).map((m) => {
      const mId = m.id || (m._id ? m._id.toString() : '');
      const mRecords = mealRecords.filter(
        (r) => r.memberId === mId || r.memberId === m.phone
      );
      const recordTotal = mRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const totalMealDeposit = recordTotal > 0 ? recordTotal : Number(m.totalMoneyDeposited || 0);

      return {
        memberId: mId,
        memberName: m.name || '',
        totalMealDeposit,
      };
    });

    const totalMealDeposited = memberMealDeposits.reduce(
      (sum, m) => sum + Number(m.totalMealDeposit || 0),
      0
    );

    const totalBazarCost = (mess.bazarEntries || []).reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );

    const cashInHand = totalMealDeposited - totalBazarCost;

    return {
      totalMealDeposited,
      totalBazarCost,
      cashInHand,
      memberMealDeposits,
    };
  }

  /**
   * Get Today's Active Meals per slot and active member lists
   * GET /api/mess/:messId/today-meals
   */
  async getTodayMeals(messId, user) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const todayKey = this.toDateKey(new Date());
    const mealsPerDay = mess.mealConfig?.mealsPerDay || 2;
    const defaultSlotNames =
      mealsPerDay === 3
        ? ['সকাল (Breakfast)', 'দুপুর (Lunch)', 'রাত (Dinner)']
        : ['দুপুর (Lunch)', 'রাত (Dinner)'];

    const slotNames =
      Array.isArray(mess.mealConfig?.slotNames) && mess.mealConfig.slotNames.length === mealsPerDay
        ? mess.mealConfig.slotNames
        : defaultSlotNames;

    const slotKeys =
      mealsPerDay === 3
        ? ['breakfast', 'lunch', 'dinner']
        : ['lunch', 'dinner'];

    const slots = slotNames.map((name, idx) => ({
      slotIndex: idx,
      slotKey: slotKeys[idx] || `slot_${idx}`,
      slotName: name,
      activeCount: 0,
      members: [],
    }));

    const summary = {};
    slotKeys.forEach((key, idx) => {
      summary[key] = {
        slotIndex: idx,
        slotName: slotNames[idx],
        count: 0,
        members: [],
      };
    });

    let totalActiveMealsToday = 0;

    for (const member of mess.members || []) {
      const memberId = member.id || (member._id ? member._id.toString() : '');
      const memberEntry = {
        id: memberId,
        name: member.name || '',
        phone: member.phone || '',
      };

      let memberTodaySlots = [];
      if (member.customDateSlots && member.customDateSlots[todayKey]) {
        memberTodaySlots = Array.isArray(member.customDateSlots[todayKey])
          ? member.customDateSlots[todayKey].map(Boolean)
          : [];
      } else if (member.customDateSlots instanceof Map && member.customDateSlots.has(todayKey)) {
        const val = member.customDateSlots.get(todayKey);
        memberTodaySlots = Array.isArray(val) ? val.map(Boolean) : [];
      } else if (Array.isArray(member.todayMealSlots)) {
        memberTodaySlots = member.todayMealSlots.map(Boolean);
      } else {
        memberTodaySlots = Array(mealsPerDay).fill(true);
      }

      for (let i = 0; i < mealsPerDay; i++) {
        const isActive = memberTodaySlots[i] !== undefined ? Boolean(memberTodaySlots[i]) : true;
        if (isActive) {
          totalActiveMealsToday += 1;
          if (slots[i]) {
            slots[i].activeCount += 1;
            slots[i].members.push(memberEntry);
          }
          const sKey = slotKeys[i];
          if (sKey && summary[sKey]) {
            summary[sKey].count += 1;
            summary[sKey].members.push(memberEntry);
          }
        }
      }
    }

    return {
      date: todayKey,
      mealsPerDay,
      totalActiveMealsToday,
      slots,
      summary,
    };
  }

  /**
   * Send Day-Before Roster Reminder Notifications for Tomorrow (Bazar & Cleaning)
   */
  async sendRosterReminders(messId, user, options = {}) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    // Default target date is tomorrow (local Bangladesh date + 1 day)
    let targetDateKey;
    if (options.targetDate) {
      targetDateKey = this.toDateKey(options.targetDate);
    } else {
      const now = new Date();
      const bdTomorrow = new Date(now.getTime() + (6 + 24) * 60 * 60 * 1000);
      targetDateKey = bdTomorrow.toISOString().slice(0, 10);
    }

    let notificationsSent = 0;

    // 1. Bazar Roster checks
    if (mess.bazarRoster && Array.isArray(mess.bazarRoster.schedule)) {
      for (const entry of mess.bazarRoster.schedule) {
        if (entry.date === targetDateKey && !entry.notificationSent) {
          if (Array.isArray(entry.memberIds) && entry.memberIds.length > 0) {
            for (const memberId of entry.memberIds) {
              try {
                await notificationService.createAndSendNotification({
                  userId: memberId,
                  title: '🛒 কাল আপনার বাজার করার পালা!',
                  body: `"${mess.name}"-এ কাল (${targetDateKey}) আপনার বাজার করার শিডিউল রয়েছে। মেসের বাজার তালিকা ও খরচ প্রস্তুত রাখুন।`,
                  type: 'MESS_REMINDER',
                  data: {
                    messId: mess._id.toString(),
                    type: 'BAZAR_REMINDER',
                    date: targetDateKey,
                  },
                });
                notificationsSent += 1;
              } catch (e) {
                console.error(`[Bazar Reminder Notif Error]: ${e.message}`);
              }
            }
            entry.notificationSent = true;
          }
        }
      }
    }

    // 2. Cleaning Roster checks
    if (mess.cleaningRoster && Array.isArray(mess.cleaningRoster.schedule)) {
      for (const entry of mess.cleaningRoster.schedule) {
        if (entry.date === targetDateKey && !entry.notificationSent) {
          if (Array.isArray(entry.memberIds) && entry.memberIds.length > 0) {
            for (const memberId of entry.memberIds) {
              try {
                await notificationService.createAndSendNotification({
                  userId: memberId,
                  title: '🧹 কাল আপনার পরিষ্কার করার দায়িত্ব!',
                  body: `"${mess.name}"-এ কাল (${targetDateKey}) আপনার ${entry.cleaningArea || 'টয়লেট/মেস'} পরিষ্কারের শিডিউল রয়েছে।`,
                  type: 'MESS_REMINDER',
                  data: {
                    messId: mess._id.toString(),
                    type: 'CLEANING_REMINDER',
                    date: targetDateKey,
                  },
                });
                notificationsSent += 1;
              } catch (e) {
                console.error(`[Cleaning Reminder Notif Error]: ${e.message}`);
              }
            }
            entry.notificationSent = true;
          }
        }
      }
    }

    mess.markModified('bazarRoster');
    mess.markModified('cleaningRoster');
    await mess.save();

    return {
      success: true,
      targetDate: targetDateKey,
      notificationsSent,
      message: `${targetDateKey} তারিখের জন্য ${notificationsSent} টি নোটিফিকেশন পাঠানো হয়েছে।`,
    };
  }

  /**
   * Dispatch reminders for all active messes (can be called periodically by worker)
   */
  async dispatchDailyRosterRemindersForAllMesses() {
    try {
      const now = new Date();
      const bdTomorrow = new Date(now.getTime() + (6 + 24) * 60 * 60 * 1000);
      const targetDateKey = bdTomorrow.toISOString().slice(0, 10);

      const candidateMesses = await ManagedMess.find({
        $or: [
          { 'bazarRoster.schedule.date': targetDateKey, 'bazarRoster.schedule.notificationSent': { $ne: true } },
          { 'cleaningRoster.schedule.date': targetDateKey, 'cleaningRoster.schedule.notificationSent': { $ne: true } },
        ],
      });

      let totalSent = 0;
      for (const mess of candidateMesses) {
        const res = await this.sendRosterReminders(mess._id, null, { targetDate: targetDateKey });
        totalSent += res.notificationsSent || 0;
      }
      return totalSent;
    } catch (err) {
      console.error('[Roster Reminder Worker Error]:', err.message);
      return 0;
    }
  }

  /**
   * Helper: Build month summary sheet object from a formatted ManagedMess document
   */
  buildSheetFromMess(formattedMess, options = {}) {
    const accSum = formattedMess.accountsSummary || {};
    const mealLedger = accSum.mealLedger || {};
    const rentLedger = accSum.rentUtilityLedger || {};

    const membersSummary = (formattedMess.members || []).map((m) => {
      const mealAcc = m.accounts?.meal || {};
      const rentAcc = m.accounts?.seatRent || {};
      const utilAcc = m.accounts?.utility || {};
      const devAcc = m.accounts?.developmentFund || {};
      const totalSum = m.accounts?.totalSummary || {};

      return {
        memberId: (m.id || m._id || '').toString(),
        memberName: m.name || '',
        phone: m.phone || '',
        role: m.role || 'border',
        roles: m.roles || ['border'],
        roleLabel: m.roleLabel || 'বর্ডার',
        assignedRoomName: m.assignedRoomName || null,
        assignedSeatNumber: m.assignedSeatNumber !== undefined ? m.assignedSeatNumber : null,
        mealsConsumed: Number(mealAcc.mealsConsumed || 0),
        mealCost: Number(mealAcc.totalMealCost || 0),
        bazarContributed: Number(m.totalMoneyDeposited || 0),
        totalMoneyDeposited: Number(m.totalMoneyDeposited || 0),
        mealBalance: Number(mealAcc.balance || 0),
        mealStatus: mealAcc.status || (mealAcc.balance >= 0 ? 'receivable' : 'payable'),
        mealDue: Number(mealAcc.due || 0),
        seatRent: Number(rentAcc.seatRent || 0),
        paidRent: Number(rentAcc.paidRent || 0),
        seatRentDue: Number(rentAcc.due || 0),
        utilityShare: Number(utilAcc.utilityShare || 0),
        paidUtility: Number(utilAcc.paidUtility || 0),
        utilityDue: Number(utilAcc.due || 0),
        developmentFee: Number(devAcc.monthlyFee || 0),
        paidDevelopmentFee: Number(devAcc.paidFee || 0),
        devFeeDue: Number(devAcc.due || 0),
        totalPayable: Number(totalSum.totalPayable || 0),
        totalPaid: Number(totalSum.totalPaid || 0),
        totalDue: Number(totalSum.totalDue || 0),
        overallBalance: Number(totalSum.overallBalance || 0),
      };
    });

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthKey = options.monthKey || currentMonthKey;
    const monthLabel = options.monthLabel || formattedMess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬';

    return {
      messId: (formattedMess._id || formattedMess.id).toString(),
      messName: formattedMess.name || '',
      monthKey,
      monthLabel,
      operatingMode: formattedMess.operatingMode || 'bachelor_flat',
      operatingModeLabel: formattedMess.operatingModeLabel || '',
      totalBazarCost: Number(mealLedger.totalBazarCost || formattedMess.totalBazarCost || 0),
      totalMeals: Number(mealLedger.totalMeals || formattedMess.totalMessMeals || 0),
      mealRate: Number(mealLedger.mealRate || formattedMess.mealRate || 0),
      totalExpectedRent: Number(rentLedger.totalExpectedRent || 0),
      totalCollectedRent: Number(rentLedger.totalCollectedRent || 0),
      rentDue: Number(rentLedger.rentDue || 0),
      totalSharedUtilityBills: Number(rentLedger.totalSharedUtilityBills || formattedMess.totalSharedBills || 0),
      perBorderUtilityShare: Number(rentLedger.perBorderUtilityShare || formattedMess.perBorderUtilityShare || 0),
      totalCollectedUtility: Number(rentLedger.totalCollectedUtility || 0),
      utilityDue: Number(rentLedger.utilityDue || 0),
      accountsSummary: accSum,
      membersSummary,
      bazarEntriesSnapshot: Array.isArray(formattedMess.bazarEntries) ? formattedMess.bazarEntries : [],
      closedAt: options.closedAt || new Date(),
      closedBy: options.closedBy || '',
      closedByName: options.closedByName || '',
    };
  }

  /**
   * Preview ongoing current month sheet
   * GET /api/messes/:messId/current-sheet-preview
   */
  async getCurrentSheetPreview(messId, user) {
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

    const formatted = formatManagedMess(mess);
    return this.buildSheetFromMess(formatted, {
      monthLabel: mess.mealConfig?.currentMonth || 'চলতি মাস',
    });
  }

  /**
   * Finalize / Close current month and reset counters for next month
   * POST /api/messes/:messId/close-month
   * Body: { monthKey, monthLabel, nextMonthLabel }
   */
  async closeCurrentMonth(messId, user, payload = {}) {
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
    const isAdmin = memberObj && (memberObj.isAdmin || memberObj.isManager || (memberObj.roles || []).includes('controller'));

    if (!isManager && !isAdmin) {
      const error = new Error('শুধুমাত্র মেস কন্ট্রোলার বা ম্যানেজার মাস ক্লোজ করতে পারেন');
      error.statusCode = 403;
      throw error;
    }

    const now = new Date();
    const defaultMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthKey = payload.monthKey || defaultMonthKey;
    const monthLabel = payload.monthLabel || mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬';

    // 1. Generate snapshot sheet
    const formatted = formatManagedMess(mess);
    const sheetData = this.buildSheetFromMess(formatted, {
      monthKey,
      monthLabel,
      closedBy: userIdStr,
      closedByName: user.name,
      closedAt: new Date(),
    });

    // 2. Save or update the finalized MonthlySheet
    const savedSheet = await MonthlySheet.findOneAndUpdate(
      { messId: mess._id.toString(), monthKey },
      sheetData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 3. Reset ongoing month counters for fresh next month start
    const nextMonth = payload.nextMonthLabel
      ? String(payload.nextMonthLabel).trim()
      : 'পরবর্তী মাস';

    const defaultSlots = Array(mess.mealConfig?.mealsPerDay || 2).fill(true);
    for (const m of mess.members) {
      m.totalMealsConsumed = 0;
      m.totalMoneyDeposited = 0;
      m.paidRent = 0;
      m.paidUtility = 0;
      m.paidDevelopmentFee = 0;
      m.todayMealSlots = [...defaultSlots];
      m.customDateSlots = {};
    }

    mess.bazarEntries = [];
    mess.mealConfig.currentMonth = nextMonth;
    mess.markModified('members');
    mess.markModified('bazarEntries');
    mess.markModified('mealConfig');
    await mess.save();

    return {
      closedSheet: savedSheet,
      newMonthMess: formatManagedMess(mess),
    };
  }

  /**
   * Get list of historical closed monthly sheets (previous 5+ months)
   * GET /api/messes/:messId/monthly-sheets
   */
  async getMonthlySheetsHistory(messId, user) {
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

    const sheets = await MonthlySheet.find({
      messId: mess._id.toString(),
    })
      .sort({ monthKey: -1 })
      .limit(12)
      .select('messId messName monthKey monthLabel operatingMode operatingModeLabel totalBazarCost totalMeals mealRate totalExpectedRent totalCollectedRent rentDue totalSharedUtilityBills perBorderUtilityShare closedAt closedByName');

    return {
      messId: mess._id.toString(),
      currentActiveMonth: mess.mealConfig?.currentMonth || 'নভেম্বর ২০২৬',
      totalSheetsFound: sheets.length,
      history: sheets,
    };
  }

  /**
   * Get full details of a specific month's sheet
   * GET /api/messes/:messId/monthly-sheets/:monthKey
   */
  async getMonthlySheetDetails(messId, monthKey, user) {
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

    const sheet = await MonthlySheet.findOne({
      messId: mess._id.toString(),
      monthKey,
    });

    if (sheet) {
      return sheet;
    }

    // If monthKey matches current month or requested preview, return live preview
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (monthKey === currentMonthKey || monthKey === 'current') {
      const formatted = formatManagedMess(mess);
      return this.buildSheetFromMess(formatted, {
        monthKey: currentMonthKey,
        monthLabel: mess.mealConfig?.currentMonth || 'চলতি মাস',
      });
    }

    const error = new Error(`${monthKey} মাসের হিসাব শিট পাওয়া যায়নি`);
    error.statusCode = 404;
    throw error;
  }
}

module.exports = new MessService();

