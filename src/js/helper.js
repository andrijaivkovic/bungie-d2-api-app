// Imports
import { API_KEY } from "./config";
import { API_URL } from "./config";

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

// Get information for inputed entity
export const getEntityInfo = async function (entityType, hashIdentifier, type) {
  try {
    const data = await AJAX(
      `${API_URL}/Manifest/${entityType}/${hashIdentifier}/`
    );

    if (
      type === "class" ||
      type === "gender" ||
      type === "race" ||
      type === "seal"
    )
      return data.Response.displayProperties.name;

    if (type === "weapon")
      return [
        data.Response.displayProperties.name,
        data.Response.displayProperties.icon,
        data.Response.itemTypeAndTierDisplayName,
      ];

    if (type === "emblem") return data.Response.secondaryOverlay;

    if (type === "seasonDefinition")
      return [
        data.Response.displayProperties.name,
        data.Response.displayProperties.icon,
        data.Response.seasonNumber,
        data.Response.seasonPassHash,
      ];

    if (type === "seasonPassDefinition")
      return [
        data.Response.rewardProgressionHash,
        data.Response.prestigeProgressionHash,
      ];
  } catch (error) {
    console.error(error);
  }
};

// Get information for the specific item instance
export const getItemInstanceInfo = async function (
  membershipType,
  membershipId,
  itemInstanceId
) {
  try {
    const data = await AJAX(
      `${API_URL}/${membershipType}/Profile/${membershipId}/Item/${itemInstanceId}/?components=300`
    );
    return data.Response.instance.data.primaryStat.value;
  } catch (error) {
    console.error(error);
  }
};
