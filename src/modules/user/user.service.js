const User = require('../auth/user.model');
const ManagedMess = require('../mess/mess.model');
const { normalizePhoneNumber } = require('../auth/auth.validation');

class UserService {
  /**
   * Check an existing user's active affiliation / residency status across all messes
   * Returns null if in General Mode (free to join or change), or an object detailing their current mess & role.
   *
   * @param {string} userId
   * @param {string} phone
   * @param {string} [excludeMessId] - optional mess ID to ignore (e.g. when checking within same mess)
   */
  async getUserActiveAffiliation(userId, phone, excludeMessId = null) {
    const userIdStr = userId ? userId.toString() : '';
    const cleanPhone = phone ? normalizePhoneNumber(phone) : '';

    const filter = {
      $or: [
        ...(userIdStr ? [{ managerId: userIdStr }] : []),
        ...(cleanPhone ? [{ managerPhone: cleanPhone }] : []),
        ...(userIdStr ? [{ 'members.id': userIdStr }] : []),
        ...(cleanPhone ? [{ 'members.phone': cleanPhone }] : []),
        ...(cleanPhone ? [{ 'rooms.seats.occupantPhone': cleanPhone }] : []),
      ],
    };

    if (excludeMessId) {
      filter._id = { $ne: excludeMessId };
      filter.propertyId = { $ne: excludeMessId };
    }

    const mess = await ManagedMess.findOne(filter).lean();
    if (!mess) {
      if (userIdStr) {
        const currentUser = await User.findById(userIdStr).select('activeMode').lean();
        if (currentUser && currentUser.activeMode === 'family') {
          return {
            messId: null,
            messName: 'পারিবারিক বাসা',
            mode: 'family',
            roleText: 'পারিবারিক হিসাব',
            typeText: 'পারিবারিক বাসা',
            bookedSeatNumber: null,
            bookedRoomName: null,
            message: 'আপনি বর্তমানে পারিবারিক খরচ (Family Mode) ট্র্যাকিংয়ে আছেন।',
          };
        }
      }
      return null;
    }

    const messName = mess.name || 'একটি মেস/বাসা';
    const isManagedMessType =
      (mess.rooms && mess.rooms.length > 0) ||
      (mess.totalSeats !== undefined && mess.totalSeats > 0);

    const isManager =
      (userIdStr && mess.managerId === userIdStr) ||
      (cleanPhone && mess.managerPhone === cleanPhone);

    // Check if assigned to a specific seat in rooms
    let bookedSeat = null;
    let bookedRoom = null;
    if (cleanPhone && Array.isArray(mess.rooms)) {
      for (const room of mess.rooms) {
        for (const seat of room.seats || []) {
          if (seat.isBooked && seat.occupantPhone === cleanPhone) {
            bookedSeat = seat;
            bookedRoom = room;
            break;
          }
        }
        if (bookedSeat) break;
      }
    }

    const memberObj = (mess.members || []).find(
      (m) => (userIdStr && m.id === userIdStr) || (cleanPhone && m.phone === cleanPhone)
    );

    let mode = 'general';
    let roleText = 'বর্ডার';
    let typeText = isManagedMessType ? 'মেসে' : 'ব্যাচেলর বাসায়';

    if (isManager) {
      mode = isManagedMessType ? 'messManager' : 'bachelorAdmin';
      roleText = isManagedMessType ? 'মেস ম্যানেজার' : 'ব্যাচেলর মেস এডমিন/ম্যানেজার';
    } else if (bookedSeat) {
      mode = 'messBorder';
      roleText = 'মেস সিট বর্ডার';
    } else if (memberObj && (memberObj.isAdmin || memberObj.isManager)) {
      mode = 'bachelorAdmin';
      roleText = 'ব্যাচেলর মেস এডমিন';
    } else if (memberObj) {
      mode = isManagedMessType ? 'messBorder' : 'bachelorMember';
      roleText = isManagedMessType ? 'মেস বর্ডার' : 'ব্যাচেলর মেস বর্ডার';
    }

    return {
      messId: (mess._id || mess.id).toString(),
      messName,
      mode,
      roleText,
      typeText,
      bookedSeatNumber: bookedSeat ? bookedSeat.seatNumber : null,
      bookedRoomName: bookedRoom ? bookedRoom.roomName : null,
      message: `এই ব্যক্তি ইতিমধ্যে "${messName}" ${typeText} (${roleText}) হিসেবে যুক্ত আছেন। নতুন মেসে যোগ করার পূর্বে তাকে আগের বাসা/মেস থেকে লিভ নিতে (Leave নিতে) বলুন।`,
    };
  }

  /**
   * Normalize a phone query and extract last 10/11 digits for reliable matching
   * @param {string} rawPhone
   */
  extractPhoneSearchCriteria(rawPhone) {
    if (!rawPhone) return null;
    const normalized = normalizePhoneNumber(rawPhone);
    const digitsOnly = String(rawPhone).replace(/\D/g, '');
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    const last11 = digitsOnly.length >= 11 ? digitsOnly.slice(-11) : digitsOnly;

    return {
      normalized,
      digitsOnly,
      last10,
      last11,
    };
  }

  /**
   * Format user document consistently for Flutter frontend
   */
  formatUser(user) {
    if (!user) return null;
    const id = (user._id || user.id).toString();
    return {
      _id: user._id,
      id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      phone: user.phoneNumber,
      email: user.email || null,
      avatar: user.avatar || null,
      role: user.role || 'Seeker',
      isPhoneVerified: Boolean(user.isPhoneVerified),
      createdAt: user.createdAt,
    };
  }

  /**
   * Find registered user by phone number
   * Throws 404 with exact Bengali message if not found
   */
  async findByPhone(rawPhone) {
    const criteria = this.extractPhoneSearchCriteria(rawPhone);
    if (!criteria || !criteria.digitsOnly) {
      const error = new Error('অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন।');
      error.statusCode = 400;
      throw error;
    }

    const orFilters = [{ phoneNumber: criteria.normalized }];
    if (criteria.last11 && criteria.last11.length === 11) {
      orFilters.push({ phoneNumber: criteria.last11 });
    }
    if (criteria.last10 && criteria.last10.length === 10) {
      orFilters.push({ phoneNumber: `0${criteria.last10}` });
      orFilters.push({ phoneNumber: { $regex: `${criteria.last10}$` } });
    }

    const user = await User.findOne({ $or: orFilters }).select('-password').lean();

    if (!user) {
      const error = new Error(
        'এই নম্বরে কোনো অ্যাকাউন্ট নেই! অনুগ্রহ করে তাকে আগে অ্যাকাউন্ট খুলতে বলুন।'
      );
      error.statusCode = 404;
      throw error;
    }

    const formatted = this.formatUser(user);
    const activeAffiliation = await this.getUserActiveAffiliation(user._id, user.phoneNumber);
    formatted.activeAffiliation = activeAffiliation;

    return formatted;
  }

  /**
   * Search users by query (phone number or name)
   */
  async searchUsers(query) {
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) {
      const error = new Error(
        'এই নম্বরে কোনো অ্যাকাউন্ট নেই! অনুগ্রহ করে তাকে আগে অ্যাকাউন্ট খুলতে বলুন।'
      );
      error.statusCode = 404;
      throw error;
    }

    const criteria = this.extractPhoneSearchCriteria(cleanQuery);
    const orFilters = [];

    if (criteria && criteria.digitsOnly.length >= 4) {
      orFilters.push({ phoneNumber: criteria.normalized });
      if (criteria.last11.length === 11) {
        orFilters.push({ phoneNumber: criteria.last11 });
      }
      if (criteria.last10.length === 10) {
        orFilters.push({ phoneNumber: `0${criteria.last10}` });
        orFilters.push({ phoneNumber: { $regex: `${criteria.last10}$` } });
      } else {
        orFilters.push({ phoneNumber: { $regex: criteria.digitsOnly } });
      }
    }

    // Also allow matching by name if not purely phone
    const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    orFilters.push({ name: new RegExp(escaped, 'i') });

    const users = await User.find({ $or: orFilters })
      .select('-password')
      .limit(20)
      .lean();

    if (!users || users.length === 0) {
      const error = new Error(
        'এই নম্বরে কোনো অ্যাকাউন্ট নেই! অনুগ্রহ করে তাকে আগে অ্যাকাউন্ট খুলতে বলুন।'
      );
      error.statusCode = 404;
      throw error;
    }

    const formattedUsers = await Promise.all(
      users.map(async (u) => {
        const fmt = this.formatUser(u);
        fmt.activeAffiliation = await this.getUserActiveAffiliation(u._id, u.phoneNumber);
        return fmt;
      })
    );

    return {
      user: formattedUsers[0],
      users: formattedUsers,
      ...formattedUsers[0],
    };
  }

  /**
   * Set or switch active mode for user (e.g. 'family' or 'general')
   * @param {string} userId
   * @param {string} mode
   */
  async setUserMode(userId, mode) {
    const validModes = ['general', 'family'];
    if (!validModes.includes(mode)) {
      const error = new Error('সঠিক মোড নির্বাচন করুন (Valid modes are general or family)');
      error.statusCode = 400;
      throw error;
    }

    if (mode === 'family') {
      const existingAffiliation = await this.getUserActiveAffiliation(userId, null);
      if (existingAffiliation && existingAffiliation.mode !== 'family') {
        const error = new Error(
          `আপনি ইতিমধ্যে "${existingAffiliation.messName}" (${existingAffiliation.roleText}) হিসেবে যুক্ত আছেন। ফ্যামিলি মোডে যাওয়ার আগে পূর্বের বাসা বা মেস থেকে লিভ নিন।`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    await User.findByIdAndUpdate(userId, { activeMode: mode });

    const authService = require('../auth/auth.service');
    const updatedUser = await authService.getProfile(userId);

    return {
      user: updatedUser,
      activeMode: mode,
      activeAffiliation: updatedUser.activeAffiliation,
    };
  }
}

module.exports = new UserService();

