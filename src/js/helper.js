// Imports
import { API_KEY } from "./config";

// Function for making AJAX calls
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPromise = uploadData
      ? fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${API_KEY}`,
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${API_KEY}`,
          },
        });

    const response = await fetchPromise;
    const data = await response.json();

    // Guard clause in case the request is rejected
    if (!response.ok)
      throw new Error(`🚫 ${data.message} (${response.status})`);

    return data;
  } catch (error) {
    // Re-throwing the error so it can be caught in the function calling this function
    throw error;
  }
};
