export function notFoundHandler(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Document exceeds the 5MB upload limit',
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}
