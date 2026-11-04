/**
 * Helper utilities for Mess Room Generation, Seat Preservation, and Financial Calculations
 */

const ROOM_TYPE_CONFIGS = [
  {
    countField: 'singleBedRooms',
    roomType: 'single',
    idPrefix: 'single',
    seatsPerRoom: 1,
    namePrefix: 'সিঙ্গেল রুম',
  },
  {
    countField: 'twoBedRooms',
    roomType: 'two_bed',
    idPrefix: 'two',
    seatsPerRoom: 2,
    namePrefix: '২ সিটের রুম',
  },
  {
    countField: 'threeBedRooms',
    roomType: 'three_bed',
    idPrefix: 'three',
    seatsPerRoom: 3,
    namePrefix: '৩ সিটের রুম',
  },
  {
    countField: 'fourBedRooms',
    roomType: 'four_bed',
    idPrefix: 'four',
    seatsPerRoom: 4,
    namePrefix: '৪ সিটের রুম',
  },
  {
    countField: 'fiveBedRooms',
    roomType: 'five_bed',
    idPrefix: 'five',
    seatsPerRoom: 5,
    namePrefix: '৫ সিটের রুম',
  },
];

/**
 * Convert English digits to Bengali digits (e.g. 1 -> '১')
 */
const toBengaliDigits = (num) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[Number(d)]);
};

/**
 * Extract room type counts from an existing rooms array
 */
const extractRoomCountsFromRooms = (rooms = []) => {
  const counts = {
    singleBedRooms: 0,
    twoBedRooms: 0,
    threeBedRooms: 0,
    fourBedRooms: 0,
    fiveBedRooms: 0,
  };

  if (!Array.isArray(rooms)) return counts;

  for (const room of rooms) {
    const rt = room.roomType;
    const seatLen = Array.isArray(room.seats) ? room.seats.length : 0;
    if (rt === 'single' || (!rt && seatLen === 1)) counts.singleBedRooms += 1;
    else if (rt === 'two_bed' || (!rt && seatLen === 2)) counts.twoBedRooms += 1;
    else if (rt === 'three_bed' || (!rt && seatLen === 3)) counts.threeBedRooms += 1;
    else if (rt === 'four_bed' || (!rt && seatLen === 4)) counts.fourBedRooms += 1;
    else if (rt === 'five_bed' || (!rt && seatLen === 5)) counts.fiveBedRooms += 1;
  }

  return counts;
};

/**
 * Build or rebuild rooms based on room counts while preserving existing booked seats
 * in rooms of the same type.
 *
 * @param {Object} counts - { singleBedRooms, twoBedRooms, threeBedRooms, fourBedRooms, fiveBedRooms }
 * @param {Array} [existingRooms=[]] - Existing rooms array to preserve booked seats from
 * @returns {{ rooms: Array, totalSeats: number, vacantSeats: number, bookedSeats: number, counts: Object }}
 */
const buildMessRooms = (counts = {}, existingRooms = []) => {
  const normalizedCounts = {
    singleBedRooms: Math.max(0, Number(counts.singleBedRooms) || 0),
    twoBedRooms: Math.max(0, Number(counts.twoBedRooms) || 0),
    threeBedRooms: Math.max(0, Number(counts.threeBedRooms) || 0),
    fourBedRooms: Math.max(0, Number(counts.fourBedRooms) || 0),
    fiveBedRooms: Math.max(0, Number(counts.fiveBedRooms) || 0),
  };

  const rooms = [];
  const safeExistingRooms = Array.isArray(existingRooms) ? existingRooms : [];

  for (const cfg of ROOM_TYPE_CONFIGS) {
    const count = normalizedCounts[cfg.countField];
    const existingOfSameType = safeExistingRooms.filter((r) => r.roomType === cfg.roomType);

    // Collect all booked seats from rooms beyond `count` so no booked border is lost on room reduction
    const overflowBookedSeats = [];
    for (let rIdx = count; rIdx < existingOfSameType.length; rIdx++) {
      const oldRoom = existingOfSameType[rIdx];
      for (const s of oldRoom.seats || []) {
        if (s && s.isBooked) {
          overflowBookedSeats.push(s);
        }
      }
    }

    for (let i = 1; i <= count; i++) {
      const existingRoom = existingOfSameType[i - 1];
      const roomId = (existingRoom && existingRoom.id) || `room_${cfg.idPrefix}_${i}`;
      const roomName =
        (existingRoom && existingRoom.roomName) ||
        `${cfg.namePrefix} ${toBengaliDigits(i)} নং`;

      const seats = [];
      for (let sIdx = 1; sIdx <= cfg.seatsPerRoom; sIdx++) {
        const existingSeat =
          existingRoom && Array.isArray(existingRoom.seats)
            ? existingRoom.seats[sIdx - 1]
            : null;
        const seatId =
          (existingSeat && existingSeat.id) || `seat_${cfg.idPrefix}_${i}_${sIdx}`;

        if (existingSeat && existingSeat.isBooked) {
          seats.push({
            id: seatId,
            seatNumber: sIdx,
            isBooked: true,
            occupantName: existingSeat.occupantName || null,
            occupantPhone: existingSeat.occupantPhone || null,
            bookedAt: existingSeat.bookedAt || new Date(),
            rentAmount:
              existingSeat.rentAmount !== undefined && existingSeat.rentAmount !== null
                ? Number(existingSeat.rentAmount)
                : null,
          });
        } else if (overflowBookedSeats.length > 0) {
          const migrated = overflowBookedSeats.shift();
          seats.push({
            id: seatId,
            seatNumber: sIdx,
            isBooked: true,
            occupantName: migrated.occupantName || null,
            occupantPhone: migrated.occupantPhone || null,
            bookedAt: migrated.bookedAt || new Date(),
            rentAmount:
              migrated.rentAmount !== undefined && migrated.rentAmount !== null
                ? Number(migrated.rentAmount)
                : null,
          });
        } else {
          seats.push({
            id: seatId,
            seatNumber: sIdx,
            isBooked: false,
            occupantName: null,
            occupantPhone: null,
            bookedAt: null,
            rentAmount:
              existingSeat &&
              existingSeat.rentAmount !== undefined &&
              existingSeat.rentAmount !== null
                ? Number(existingSeat.rentAmount)
                : null,
          });
        }
      }

      rooms.push({
        id: roomId,
        roomType: cfg.roomType,
        roomNumber: i,
        roomName,
        seats,
      });
    }
  }

  const { totalSeats, vacantSeats, bookedSeats } = calculateSeatMetrics(rooms);

  return {
    rooms,
    totalSeats,
    vacantSeats,
    bookedSeats,
    counts: normalizedCounts,
  };
};

/**
 * Normalize an explicit rooms array and compute seat metrics
 */
const normalizeRoomsArray = (rawRooms = []) => {
  if (!Array.isArray(rawRooms)) return [];

  return rawRooms.map((room, idx) => {
    const roomNumber = Number(room.roomNumber) || idx + 1;
    const roomType = room.roomType || 'single';
    const roomId = room.id || `room_${roomType}_${roomNumber}`;
    const roomName = room.roomName || `রুম ${toBengaliDigits(roomNumber)} নং`;

    const seats = Array.isArray(room.seats)
      ? room.seats.map((seat, sIdx) => {
          const seatNumber = Number(seat.seatNumber) || sIdx + 1;
          const isBooked = Boolean(seat.isBooked);
          return {
            id: seat.id || `seat_${roomType}_${roomNumber}_${seatNumber}`,
            seatNumber,
            isBooked,
            occupantName: isBooked ? seat.occupantName || null : null,
            occupantPhone: isBooked ? seat.occupantPhone || null : null,
            bookedAt: isBooked ? seat.bookedAt || new Date() : null,
            rentAmount:
              seat.rentAmount !== undefined && seat.rentAmount !== null
                ? Number(seat.rentAmount)
                : null,
          };
        })
      : [];

    return {
      id: roomId,
      roomType,
      roomNumber,
      roomName,
      seats,
    };
  });
};

/**
 * Calculate totalSeats, vacantSeats, and bookedSeats from rooms array
 */
const calculateSeatMetrics = (rooms = []) => {
  if (!Array.isArray(rooms)) {
    return { totalSeats: 0, vacantSeats: 0, bookedSeats: 0 };
  }

  let totalSeats = 0;
  let vacantSeats = 0;

  for (const room of rooms) {
    const seats = Array.isArray(room.seats) ? room.seats : [];
    totalSeats += seats.length;
    vacantSeats += seats.filter((s) => !s.isBooked).length;
  }

  const bookedSeats = totalSeats - vacantSeats;
  return { totalSeats, vacantSeats, bookedSeats };
};

/**
 * Normalize utility bills array
 */
const normalizeUtilityBills = (rawBills) => {
  if (!rawBills) return [];
  let list = rawBills;
  if (typeof rawBills === 'string') {
    try {
      list = JSON.parse(rawBills);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];

  return list
    .filter((b) => b && (b.name || b.title))
    .map((b, i) => ({
      id: b.id || `util_${Date.now()}_${i}`,
      name: String(b.name || b.title).trim(),
      amount: Number(b.amount) || 0,
    }));
};

/**
 * Format and enrich a ManagedMess document with exact financial & utility calculations:
 * - totalSeats = sum(room.seats.length)
 * - vacantSeats = sum(room.seats.filter(s => !s.isBooked).length)
 * - bookedSeats = totalSeats - vacantSeats
 * - totalBazarCost = sum(entry.totalAmount for entry in bazarEntries)
 * - totalMessMeals = sum(member.totalMealsConsumed for member in members)
 * - mealRate = totalMessMeals > 0 ? (totalBazarCost / totalMessMeals) : 0.0
 * - totalSharedBills = sum(bill.amount for bill in sharedBills)
 * - perBorderUtilityShare = Math.round(totalSharedBills / Math.max(bookedSeats, 1))
 * - memberSeatRent = assignedSeat?.rentAmount ?? mess.defaultSeatRent
 * - memberMealCost = Math.round(member.totalMealsConsumed * mealRate)
 * - memberTotalPayable = memberSeatRent + memberMealCost + perBorderUtilityShare
 * - memberDue = memberTotalPayable - member.totalMoneyDeposited
 */
const formatManagedMess = (messDoc) => {
  if (!messDoc) return null;
  const mess = typeof messDoc.toJSON === 'function' ? messDoc.toJSON() : { ...messDoc };

  const idStr = (mess.id || mess._id || '').toString();
  mess.id = idStr;
  mess._id = mess._id || idStr;
  if (mess.propertyId) {
    mess.propertyId = mess.propertyId.toString();
  }

  const rooms = Array.isArray(mess.rooms) ? mess.rooms : [];
  const { totalSeats, vacantSeats, bookedSeats } = calculateSeatMetrics(rooms);
  const roomCounts = extractRoomCountsFromRooms(rooms);

  mess.singleBedRooms =
    mess.singleBedRooms !== undefined ? Number(mess.singleBedRooms) : roomCounts.singleBedRooms;
  mess.twoBedRooms =
    mess.twoBedRooms !== undefined ? Number(mess.twoBedRooms) : roomCounts.twoBedRooms;
  mess.threeBedRooms =
    mess.threeBedRooms !== undefined ? Number(mess.threeBedRooms) : roomCounts.threeBedRooms;
  mess.fourBedRooms =
    mess.fourBedRooms !== undefined ? Number(mess.fourBedRooms) : roomCounts.fourBedRooms;
  mess.fiveBedRooms =
    mess.fiveBedRooms !== undefined ? Number(mess.fiveBedRooms) : roomCounts.fiveBedRooms;

  const bazarEntries = Array.isArray(mess.bazarEntries) ? mess.bazarEntries : [];
  const totalBazarCost = bazarEntries.reduce(
    (sum, entry) => sum + Number(entry.totalAmount || 0),
    0
  );

  const members = Array.isArray(mess.members) ? mess.members : [];
  const totalMessMeals = members.reduce(
    (sum, member) => sum + Number(member.totalMealsConsumed || 0),
    0
  );
  const mealRate = totalMessMeals > 0 ? totalBazarCost / totalMessMeals : 0.0;

  const sharedBills = Array.isArray(mess.sharedBills) ? mess.sharedBills : [];
  const totalSharedBills = sharedBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const perBorderUtilityShare = Math.round(totalSharedBills / Math.max(bookedSeats, 1));

  // Build lookup of booked seats by occupantPhone
  const seatByPhone = {};
  for (const room of rooms) {
    for (const seat of room.seats || []) {
      if (seat.isBooked && seat.occupantPhone) {
        seatByPhone[seat.occupantPhone] = { room, seat };
      }
    }
  }

  const mealsPerDay = mess.mealConfig?.mealsPerDay || 2;

  mess.members = members.map((m) => {
    const memberObj = typeof m.toJSON === 'function' ? m.toJSON() : { ...m };

    // Ensure customDateSlots is a plain JS object
    let customDateSlots = {};
    if (memberObj.customDateSlots instanceof Map) {
      for (const [k, v] of memberObj.customDateSlots.entries()) {
        customDateSlots[k] = Array.isArray(v) ? v.map(Boolean) : [];
      }
    } else if (memberObj.customDateSlots && typeof memberObj.customDateSlots === 'object') {
      for (const [k, v] of Object.entries(memberObj.customDateSlots)) {
        if (!k.startsWith('$') && !k.startsWith('_')) {
          customDateSlots[k] = Array.isArray(v) ? v.map(Boolean) : [];
        }
      }
    }

    const todayMealSlots = Array.isArray(memberObj.todayMealSlots)
      ? memberObj.todayMealSlots.map(Boolean)
      : Array(mealsPerDay).fill(true);

    const assigned = seatByPhone[memberObj.phone];
    const memberSeatRent =
      assigned && assigned.seat.rentAmount !== null && assigned.seat.rentAmount !== undefined
        ? Number(assigned.seat.rentAmount)
        : Number(mess.defaultSeatRent || 0);
    const memberMealCost = Math.round(Number(memberObj.totalMealsConsumed || 0) * mealRate);
    const memberTotalPayable = memberSeatRent + memberMealCost + perBorderUtilityShare;
    const memberDue = memberTotalPayable - Number(memberObj.totalMoneyDeposited || 0);

    return {
      id: (memberObj.id || memberObj._id || '').toString(),
      name: memberObj.name || '',
      phone: memberObj.phone || '',
      isAdmin: Boolean(memberObj.isAdmin),
      isManager: Boolean(memberObj.isManager),
      totalMealsConsumed: Number(memberObj.totalMealsConsumed || 0),
      totalMoneyDeposited: Number(memberObj.totalMoneyDeposited || 0),
      todayMealSlots,
      customDateSlots,
      seatRent: memberSeatRent,
      mealCost: memberMealCost,
      utilityShare: perBorderUtilityShare,
      totalPayable: memberTotalPayable,
      due: memberDue,
      assignedRoomId: assigned ? assigned.room.id : null,
      assignedRoomName: assigned ? assigned.room.roomName : null,
      assignedSeatId: assigned ? assigned.seat.id : null,
      assignedSeatNumber: assigned ? assigned.seat.seatNumber : null,
    };
  });

  mess.totalSeats = totalSeats;
  mess.vacantSeats = vacantSeats;
  mess.bookedSeats = bookedSeats;
  mess.totalBazarCost = totalBazarCost;
  mess.totalMessMeals = totalMessMeals;
  mess.mealRate = Number(mealRate.toFixed(2));
  mess.totalSharedBills = totalSharedBills;
  mess.perBorderUtilityShare = perBorderUtilityShare;

  return mess;
};

module.exports = {
  ROOM_TYPE_CONFIGS,
  toBengaliDigits,
  extractRoomCountsFromRooms,
  buildMessRooms,
  normalizeRoomsArray,
  calculateSeatMetrics,
  normalizeUtilityBills,
  formatManagedMess,
};

