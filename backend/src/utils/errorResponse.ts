// backend/src/utils/errorResponse.ts
export class ErrorResponse extends Error {
    constructor(
      public statusCode: number,
      message: string,
      public details?: any
    ) {
      super(message);
      Object.setPrototypeOf(this, ErrorResponse.prototype);
    }
  
    serializeErrors() {
      return {
        success: false,
        message: this.message,
        details: this.details
      };
    }
  }