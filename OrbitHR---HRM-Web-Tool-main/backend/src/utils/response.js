export function createSuccessResponse(message, data = {}) {
  return {
    success: true,
    message,
    data,
  };
}

export const sendResponse = (res, statusCode, data) => {
  return res.status(statusCode).json(data);
};

export const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
