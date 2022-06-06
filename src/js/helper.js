// Imports
import { API_KEY, API_URL, LOCAL_URL } from "./config";

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

    return data.Response;
  } catch (error) {
    console.log(error);
  }
};

// Get information for inputed entity
export const getEntityInfo = async function (entityType, hashIdentifier) {
  try {
    const data = await AJAX(
      `${LOCAL_URL}/Platform/Destiny2/Manifest/${entityType}/${hashIdentifier}`
    );

    return data;
  } catch (error) {
    console.error(error);
  }
};

// Get information for the specific item instance
export const getItemInstanceInfo = async function (
  membershipType,
  membershipId,
  itemInstanceId,
  size = "minified"
) {
  try {
    if (size === "minified") {
      const data = await AJAX(
        `${API_URL}/${membershipType}/Profile/${membershipId}/Item/${itemInstanceId}/?components=300`
      );

      const lightLevel = data.instance.data?.primaryStat?.value
        ? data.instance.data.primaryStat.value
        : 0;

      return lightLevel;
    }

    if (size === "full") {
      const data = await AJAX(
        `${API_URL}/${membershipType}/Profile/${membershipId}/Item/${itemInstanceId}/?components=300,302,304,305,307`
      );

      return data;
    }
  } catch (error) {
    console.error(error);
  }
};
