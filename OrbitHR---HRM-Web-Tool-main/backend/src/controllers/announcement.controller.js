import Announcement from '../models/Announcement.js';

// @desc    Get all active announcements
// @route   GET /api/v1/announcements
// @access  Private
export const getAnnouncements = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { isActive: true };

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new announcement
// @route   POST /api/v1/announcements
// @access  Private/Admin
export const createAnnouncement = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const announcement = await Announcement.create(req.body);

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/v1/announcements/:id
// @access  Private/Admin
export const updateAnnouncement = async (req, res, next) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private/Admin
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
