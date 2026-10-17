import { Booking } from '../models/Booking.js';
import { Pet } from '../models/Pet.js';
import { SitterProfile } from '../models/SitterProfile.js';

// post api/bookings
export const createBooking = async (req, res) => {
  try {
    const { sitterId, petIds, petId, startDate, endDate, serviceType, specialInstructions, customTasks } = req.body;

    const sitter = await SitterProfile.findOne({ userId: sitterId });
    if (!sitter) return res.status(404).json({ success: false, message: 'Sitter not found' });//sitter validation

    const targetPets = petIds && petIds.length > 0 ? petIds : (petId ? [petId] : []);
    if (targetPets.length === 0) return res.status(400).json({ success: false, message: 'No pets selected' });

    for (const pId of targetPets) {
      const pet = await Pet.findById(pId);
      if (!pet) return res.status(404).json({ success: false, message: `Pet not found` });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validation for date
    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
    }

    //  Blackout dates Validation
    const requestedDates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) { //incrementer by setting evry date
      requestedDates.push(new Date(d).toISOString().split('T')[0]);// split by time and take just the date
    }

    if (sitter.blockedDates && sitter.blockedDates.length > 0) {
      const blockedSet = new Set(sitter.blockedDates.map(bd => new Date(bd).toISOString().split('T')[0]));
      const hasBlackout = requestedDates.some(rd => blockedSet.has(rd));// exact moment to stop after findign one date
      if (hasBlackout) {
        return res.status(400).json({ success: false, message: 'Sitter has blackout dates during this period.' });
      }
    }

    // Dog walking doesn't block dates
    if (serviceType !== 'WALKING') {
      const overlappingBookings = await Booking.find({
        sitterId: sitter.userId,
        serviceType: { $ne: 'WALKING' },
        status: { $nin: ['CANCELLED', 'COMPLETED'] },
        startDate: { $lte: end },
        endDate: { $gte: start }
      });

      if ((overlappingBookings.length + targetPets.length) > (sitter.maxConcurrentPets || 1)) {
        return res.status(400).json({ success: false, message: 'Sitter does not have enough capacity for these dates.' });
      }
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const rate = serviceType === 'WALKING' ? sitter.rates.walking : sitter.rates.daySitting;
    // Note: The total price calculated here is PER PET.
    const totalPrice = days * (rate || 500);

    // Generate daily task logs based on Pet's medical & diet card
    const dailyLogs = [];
    for (let i = 0; i < days; i++) {
      const logDate = new Date(start);
      logDate.setDate(logDate.getDate() + i);

      const tasks = [];

      if (customTasks && customTasks.length > 0) {
        customTasks.forEach(task => {
          if (['FOOD', 'SLEEP', 'WALK'].includes(task.category)) {
            let targetTime = task.targetTime || '';
            if (!targetTime && task.time) {
              const cleanTime = task.time.replace(/\s*(AM|PM|am|pm)$/i, '').trim();
              targetTime = cleanTime ? `${cleanTime} ${task.period || 'AM'}` : '';
            }
            tasks.push({
              category: task.category,
              taskName: task.taskName,
              targetTime
            });
          }
        });
      }

      dailyLogs.push({ date: logDate, tasks });
    }

    const createdBookings = [];
    for (const pId of targetPets) {
      const booking = await Booking.create({
        ownerId: req.user._id,//middleware
        sitterId,
        petId: pId,
        startDate: start,
        endDate: end,
        serviceType,
        totalPrice,
        specialInstructions, //only type it once if schema name matches the frontend name
        dailyLogs,
      });
      createdBookings.push(booking);
    }

    // Add requested dates to blockedDates only if it is home sitting
    if (serviceType !== 'WALKING') {
      const currentBlocked = sitter.blockedDates || [];
      const newBlockedSet = new Set(currentBlocked.map(d => new Date(d).toISOString().split('T')[0]));
      requestedDates.forEach(rd => newBlockedSet.add(rd));

      sitter.blockedDates = Array.from(newBlockedSet).map(rd => new Date(rd));
      sitter.markModified('blockedDates');
      await sitter.save();
    }

    // Return the first booking as for every pet new booking is created
    res.status(201).json({ success: true, data: createdBookings[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings and avatarurl is not used
export const getMyBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'SITTER' ? { sitterId: req.user._id } : { ownerId: req.user._id };
    const bookings = await Booking.find(filter)
      .populate('petId', 'name breed avatarUrl') // populating the entire pet document in booking document as a nested object instead of id
      .populate('sitterId', 'name avatarUrl') //populating the entire sitter profile in booking document as a nested object instead of id
      .populate('ownerId', 'name phone')
      .sort({ createdAt: -1, startDate: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings/id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('petId')
      .populate('sitterId', 'name phone avatarUrl')
      .populate('ownerId', 'name phone avatarUrl');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    await booking.save(); // built in func

    if (status === 'COMPLETED') {
      const SitterProfile = (await import('../models/SitterProfile.js')).SitterProfile;
      await SitterProfile.findOneAndUpdate(
        { userId: booking.sitterId },
        { $inc: { completedStays: 1 } }
      );
    }

    if (status === 'CANCELLED' || status === 'COMPLETED') {
      const SitterProfile = (await import('../models/SitterProfile.js')).SitterProfile;
      const sitter = await SitterProfile.findOne({ userId: booking.sitterId });

      if (sitter && sitter.blockedDates && sitter.blockedDates.length > 0) {
        const datesToRemove = new Set();
        for (let d = new Date(booking.startDate); d <= new Date(booking.endDate); d.setDate(d.getDate() + 1)) {
          datesToRemove.add(new Date(d).toISOString().split('T')[0]);
        }
        const newBlockedDates = sitter.blockedDates.filter(bd => {
          const bdStr = new Date(bd).toISOString().split('T')[0];
          return !datesToRemove.has(bdStr);  //if the date is present then remove it by showing false
        });

        sitter.blockedDates = newBlockedDates;
        sitter.markModified('blockedDates');
        await sitter.save();
      }
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/bookings/:id/tasks/:taskId
export const updateCareTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { details } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    let foundTask = null;
    let foundLogDate = null;

    for (const log of booking.dailyLogs) {
      const task = log.tasks.id(taskId);
      if (task) {
        foundTask = task;
        foundLogDate = log.date;
        break;
      }
    }

    if (!foundTask) return res.status(404).json({ success: false, message: 'Task not found' });

    foundTask.isCompleted = true;
    foundTask.completedAt = new Date();
    foundTask.loggedBy = req.user._id;
    if (details) {
      const currentDetails = foundTask.details ? foundTask.details.toObject() : {};
      foundTask.details = { ...currentDetails, ...details };
    }

    await booking.save();

    // Broadcast update directly to the booking's socket listner, emit is broadcasting to the user who has opened the dashboard
    req.io.to(`booking_${booking._id}`).emit("careTaskUpdated", { //we have io as a backpack in server.js
      taskId: foundTask._id,
      updatedTask: foundTask,
    });

    res.status(200).json({ success: true, data: foundTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};