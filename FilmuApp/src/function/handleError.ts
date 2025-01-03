import { AxiosError } from 'axios';

// Define the structure of the error response data
interface ErrorResponse {
  message?: string;
  errors?: Array<{ msg: string }>;
}

// Success response structure
interface SuccessResponse {
  success: true;
  message: string;
  response?: any; // Optional response data
}


// Error response structure
interface FailureResponse {
  success: false;
  message: string;
}

// Unified response type
export type APIResponse = SuccessResponse | FailureResponse;

export const handleSuccess = (message: string,response:any):APIResponse => {
  return { success: true, message:message ,response:response};
};

// Error handler function with correct typing
export const handleError = (
  error: AxiosError
): APIResponse => {
  if (error.response) {
    const errorData = error.response.data as ErrorResponse; // Cast to the correct type

    // Handle the case when the server responds
    const errorMessage =
      errorData.message ||
      errorData.errors?.[0]?.msg ||
      errorData.errors?.[1]?.msg ||
      errorData.errors?.[2]?.msg ||
      `Error (Status Code: ${error.response.status})`;

    return { success: false, message: errorMessage };
  } else if (error.request) {
    // Handle the case when no response is received from the server
    return { success: false, message: 'No response from the server. Please try again later .' };
  } else {
    // Handle any other errors
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
};
