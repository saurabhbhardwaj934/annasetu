/**
 * Standard success response shape. Every endpoint returns:
 * { success: true, statusCode: 200, message: "...", data: {...} }
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
