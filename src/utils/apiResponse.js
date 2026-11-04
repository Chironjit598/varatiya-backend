/**
 * Standardized API Response Formatter
 */
class ApiResponse {
  /**
   * Send a successful JSON response
   * @param {import('express').Response} res
   * @param {Object} options
   * @param {number} [options.statusCode=200]
   * @param {string} [options.message='Success']
   * @param {*} [options.data={}]
   */
  static success(res, { statusCode = 200, message = 'Success', data = {} } = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send an error JSON response
   * @param {import('express').Response} res
   * @param {Object} options
   * @param {number} [options.statusCode=500]
   * @param {string} [options.message='Internal Server Error']
   * @param {*} [options.data=null]
   * @param {*} [options.errors=null]
   */
  static error(res, { statusCode = 500, message = 'Something went wrong', data = null, errors = null } = {}) {
    const responsePayload = {
      success: false,
      message,
    };

    if (data !== null) {
      responsePayload.data = data;
    }

    if (errors !== null) {
      responsePayload.errors = errors;
    }

    return res.status(statusCode).json(responsePayload);
  }
}

module.exports = ApiResponse;
