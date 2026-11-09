const mongoose = require('mongoose');
const ManagedMess = require('./mess.model');
const Property = require('../property/property.model');
const userService = require('../user/user.service');
const notificationService = require('../notification/notification.service');
const { isDhakaArea } = require('../../utils/locationHelper');
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
    const defaultSlotNames =
      configuredMealsPerDay === 3
        ? ['সকাল (Breakfast)', 'দুপুর (Lunch)', 'রাত (Dinner)']
        : ['দুপুর (Lunch)', 'রাত (Dinner)'];
    const defaultSlots = Array(configuredMealsPerDay).fill(true);

    const autoOperatingMode =
      payload.operatingMode &&
      ['student_shared', 'dhaka_centralized'].includes(payload.operatingMode)
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

  /**
   * Helper: check if user is Controller, Manager or Admin of the mess
   */
  checkMessManagerOrAdmin(mess, user) {
    const userIdStr = (user._id || user.id).toString();
    const isOwner =
      mess.managerId === userIdStr || mess.managerPhone === user.phoneNumber;
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const hasRole =
      memberObj &&
      (memberObj.isAdmin ||
        memberObj.isManager ||
        memberObj.role === 'controller' ||
        memberObj.role === 'manager');

    return {
      isAuthorized: isOwner || Boolean(hasRole),
      member: memberObj,
      isOwner,
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
      if (!['student_shared', 'dhaka_centralized'].includes(operatingMode)) {
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
  async getBazarRoster(messId, user) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    return {
      operatingMode: mess.operatingMode || 'student_shared',
      bazarRoster: mess.bazarRoster || { month: '', note: '', schedule: [] },
    };
  }

  /**
   * Set or Replace Entire Bazar Roster (30 days schedule)
   */
  async setBazarRoster(messId, user, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const userIdStr = (user._id || user.id).toString();
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const canManage =
      mess.managerId === userIdStr ||
      (memberObj &&
        ['controller', 'manager', 'meal_incharge'].includes(memberObj.role)) ||
      (memberObj && (memberObj.isAdmin || memberObj.isManager));

    if (!canManage) {
      const error = new Error('বাজার রোস্টার তৈরি বা পরিবর্তন করার অনুমতি আপনার নেই');
      error.statusCode = 403;
      throw error;
    }

    const { month, note, schedule } = payload;
    mess.bazarRoster = mess.bazarRoster || {};
    if (month !== undefined) mess.bazarRoster.month = month;
    if (note !== undefined) mess.bazarRoster.note = note;

    if (Array.isArray(schedule)) {
      mess.bazarRoster.schedule = schedule.map((s, idx) => ({
        id: s.id || new mongoose.Types.ObjectId().toString(),
        date: s.date ? this.toDateKey(s.date) : '',
        dayNumber: Number(s.dayNumber) || idx + 1,
        memberIds: Array.isArray(s.memberIds) ? s.memberIds : [],
        memberNames: Array.isArray(s.memberNames) ? s.memberNames : [],
        note: s.note || '',
        isCompleted: Boolean(s.isCompleted),
        notificationSent: Boolean(s.notificationSent),
      }));
    }

    mess.markModified('bazarRoster');
    await mess.save();

    return formatManagedMess(mess);
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

    mess.bazarRoster = mess.bazarRoster || { schedule: [] };
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

    const canManage =
      mess.managerId === userIdStr ||
      (memberObj &&
        ['controller', 'manager', 'meal_incharge'].includes(memberObj.role)) ||
      (memberObj && (memberObj.isAdmin || memberObj.isManager));

    if (!canManage && !isAssigned) {
      const error = new Error('আপনার এই রোস্টার এন্ট্রি আপডেট করার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    if (!entry) {
      entry = {
        id: entryId || new mongoose.Types.ObjectId().toString(),
        date: payload.date ? this.toDateKey(payload.date) : '',
        dayNumber: Number(payload.dayNumber) || schedule.length + 1,
        memberIds: Array.isArray(payload.memberIds) ? payload.memberIds : [],
        memberNames: Array.isArray(payload.memberNames) ? payload.memberNames : [],
        note: payload.note || '',
        isCompleted: Boolean(payload.isCompleted),
        notificationSent: false,
      };
      schedule.push(entry);
    } else {
      if (canManage) {
        if (payload.date) entry.date = this.toDateKey(payload.date);
        if (payload.dayNumber !== undefined) entry.dayNumber = Number(payload.dayNumber);
        if (Array.isArray(payload.memberIds)) entry.memberIds = payload.memberIds;
        if (Array.isArray(payload.memberNames)) entry.memberNames = payload.memberNames;
      }
      if (payload.note !== undefined) entry.note = payload.note;
      if (payload.isCompleted !== undefined) entry.isCompleted = Boolean(payload.isCompleted);
    }

    mess.markModified('bazarRoster');
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

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user);
    if (!isAuthorized) {
      const error = new Error('বাজার রোস্টার এন্ট্রি মুছে ফেলার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    mess.bazarRoster = mess.bazarRoster || { schedule: [] };
    mess.bazarRoster.schedule = (mess.bazarRoster.schedule || []).filter(
      (s) => s.id !== entryId && (!s._id || s._id.toString() !== entryId)
    );

    mess.markModified('bazarRoster');
    await mess.save();

    return formatManagedMess(mess);
  }

  /**
   * Get Cleaning Roster (Transparent to all members)
   */
  async getCleaningRoster(messId, user) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    return {
      operatingMode: mess.operatingMode || 'student_shared',
      cleaningRoster: mess.cleaningRoster || { month: '', note: '', schedule: [] },
    };
  }

  /**
   * Set or Replace Entire Cleaning Roster
   */
  async setCleaningRoster(messId, user, payload) {
    const mess = await ManagedMess.findById(messId);
    if (!mess) {
      const error = new Error('মেসটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const userIdStr = (user._id || user.id).toString();
    const memberObj = (mess.members || []).find(
      (m) => m.id === userIdStr || m.phone === user.phoneNumber
    );
    const canManage =
      mess.managerId === userIdStr ||
      (memberObj &&
        ['controller', 'manager', 'cleaning_incharge'].includes(memberObj.role)) ||
      (memberObj && (memberObj.isAdmin || memberObj.isManager));

    if (!canManage) {
      const error = new Error('পরিষ্কার তালিকা তৈরি বা পরিবর্তন করার অনুমতি আপনার নেই');
      error.statusCode = 403;
      throw error;
    }

    const { month, note, schedule } = payload;
    mess.cleaningRoster = mess.cleaningRoster || {};
    if (month !== undefined) mess.cleaningRoster.month = month;
    if (note !== undefined) mess.cleaningRoster.note = note;

    if (Array.isArray(schedule)) {
      mess.cleaningRoster.schedule = schedule.map((s, idx) => ({
        id: s.id || new mongoose.Types.ObjectId().toString(),
        date: s.date ? this.toDateKey(s.date) : '',
        dayNumber: Number(s.dayNumber) || idx + 1,
        memberIds: Array.isArray(s.memberIds) ? s.memberIds : [],
        memberNames: Array.isArray(s.memberNames) ? s.memberNames : [],
        cleaningArea: s.cleaningArea || 'টয়লেট ও মেস রুম',
        note: s.note || '',
        isCompleted: Boolean(s.isCompleted),
        notificationSent: Boolean(s.notificationSent),
      }));
    }

    mess.markModified('cleaningRoster');
    await mess.save();

    return formatManagedMess(mess);
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

    mess.cleaningRoster = mess.cleaningRoster || { schedule: [] };
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

    const canManage =
      mess.managerId === userIdStr ||
      (memberObj &&
        ['controller', 'manager', 'cleaning_incharge'].includes(memberObj.role)) ||
      (memberObj && (memberObj.isAdmin || memberObj.isManager));

    if (!canManage && !isAssigned) {
      const error = new Error('আপনার এই পরিষ্কারের শিডিউল আপডেট করার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    if (!entry) {
      entry = {
        id: entryId || new mongoose.Types.ObjectId().toString(),
        date: payload.date ? this.toDateKey(payload.date) : '',
        dayNumber: Number(payload.dayNumber) || schedule.length + 1,
        memberIds: Array.isArray(payload.memberIds) ? payload.memberIds : [],
        memberNames: Array.isArray(payload.memberNames) ? payload.memberNames : [],
        cleaningArea: payload.cleaningArea || 'টয়লেট ও মেস রুম',
        note: payload.note || '',
        isCompleted: Boolean(payload.isCompleted),
        notificationSent: false,
      };
      schedule.push(entry);
    } else {
      if (canManage) {
        if (payload.date) entry.date = this.toDateKey(payload.date);
        if (payload.dayNumber !== undefined) entry.dayNumber = Number(payload.dayNumber);
        if (Array.isArray(payload.memberIds)) entry.memberIds = payload.memberIds;
        if (Array.isArray(payload.memberNames)) entry.memberNames = payload.memberNames;
        if (payload.cleaningArea !== undefined) entry.cleaningArea = payload.cleaningArea;
      }
      if (payload.note !== undefined) entry.note = payload.note;
      if (payload.isCompleted !== undefined) entry.isCompleted = Boolean(payload.isCompleted);
    }

    mess.markModified('cleaningRoster');
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

    const { isAuthorized } = this.checkMessManagerOrAdmin(mess, user);
    if (!isAuthorized) {
      const error = new Error('পরিষ্কারের রোস্টার এন্ট্রি মুছে ফেলার অনুমতি নেই');
      error.statusCode = 403;
      throw error;
    }

    mess.cleaningRoster = mess.cleaningRoster || { schedule: [] };
    mess.cleaningRoster.schedule = (mess.cleaningRoster.schedule || []).filter(
      (s) => s.id !== entryId && (!s._id || s._id.toString() !== entryId)
    );

    mess.markModified('cleaningRoster');
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
   * Assign Role to a Mess Member (Controller assigns roles)
   */
  async setMemberRole(messId, user, targetMemberId, role) {
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
    const isController = isOwner || currentMember?.role === 'controller';

    if (!isController) {
      const error = new Error('শুধুমাত্র মেস কন্ট্রোলার মেম্বারদের রোল বরাদ্দ করতে পারেন');
      error.statusCode = 403;
      throw error;
    }

    const validRoles = [
      'controller',
      'manager',
      'meal_incharge',
      'cleaning_incharge',
      'utility_incharge',
      'border',
    ];
    if (!validRoles.includes(role)) {
      const error = new Error('অকার্যকর রোল (Invalid role)');
      error.statusCode = 400;
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

    target.role = role;
    if (role === 'controller') {
      target.isAdmin = true;
      target.isManager = true;
    } else if (role === 'manager') {
      target.isManager = true;
    } else {
      target.isManager = false;
    }

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

    mess.markModified('members');
    await mess.save();

    return formatManagedMess(mess);
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
}

module.exports = new MessService();

