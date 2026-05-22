const uploadAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(201).json({
      success: true,
      data: { fileUrl }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadAudio };
