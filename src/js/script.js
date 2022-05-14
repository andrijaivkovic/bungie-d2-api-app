// Imports
import { AJAX } from "./helper";
import { API_URL } from "./config";

// Helpers
const getEntityInfo = async function (entityType, hashIdentifier, type) {
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

const getItemInfo = async function (
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

const getTriumphScore = async function (membershipType, membershipId) {
  try {
    const data = await AJAX(
      `${API_URL}/${membershipType}/Profile/${membershipId}/?components=900`
    );
    return data.Response.profileRecords.data.activeScore;
  } catch (error) {
    console.error(error);
  }
};

// == APP STATE ==

export const state = {
  searchQuery: "",
  searchQueries: [],
  account: {
    membershipId: "",
    membershipType: "",
    displayName: "",
    displayNameCode: 0,
    dateLastPlayed: "",
    minutesPlayedTotal: 0,
    characters: {},
    currentSeason: {
      progression: {},
    },
  },
};

// == ACCOUNT ==

const findAccount = async function (accName) {
  const [displayName, displayNameCode] = accName.split("#");
  const uploadData = { displayName, displayNameCode };

  try {
    const data = await AJAX(
      `${API_URL}/SearchDestinyPlayerByBungieName/3/`,
      uploadData
    );

    state.account.membershipId = data.Response[0].membershipId;
    state.account.membershipType = data.Response[0].membershipType;
  } catch (error) {
    console.error(error);
  }
};

const getAccountInfo = async function (membershipType, membershipId) {
  const data = await AJAX(
    `${API_URL}/${membershipType}/Profile/${membershipId}/?components=100`
  );

  state.account.activeScore = await getTriumphScore(
    state.account.membershipType,
    state.account.membershipId
  );
  state.account.dateLastPlayed = data.Response.profile.data.dateLastPlayed;
  state.account.displayName =
    data.Response.profile.data.userInfo.bungieGlobalDisplayName;
  state.account.displayNameCode =
    data.Response.profile.data.userInfo.bungieGlobalDisplayNameCode;
  state.account.currentSeason.seasonHash =
    data.Response.profile.data.currentSeasonHash;
};

const getSeasonalInfo = async function (character) {
  const [seasonName, seasonIcon, seasonNumber, seasonPassHash] =
    await getEntityInfo(
      "DestinySeasonDefinition",
      "2809059431",
      "seasonDefinition"
    );

  state.account.currentSeason.seasonName = seasonName;
  state.account.currentSeason.seasonIcon = seasonIcon;
  state.account.currentSeason.seasonNumber = seasonNumber;
  state.account.currentSeason.seasonPassHash = seasonPassHash;

  const [rewardProgressionHash, prestigeProgressionHash] = await getEntityInfo(
    "DestinySeasonPassDefinition",
    seasonPassHash,
    "seasonPassDefinition"
  );

  state.account.currentSeason.progression.rewardProgressionHash =
    rewardProgressionHash;
  state.account.currentSeason.progression.prestigeProgressionHash =
    prestigeProgressionHash;

  const characterProgression = await AJAX(
    `${API_URL}/${state.account.membershipType}/Profile/${state.account.membershipId}/Character/${character.characterId}/?components=202`
  );

  const seasonProgress =
    characterProgression.Response.progressions.data.progressions[
      rewardProgressionHash
    ];

  const prestigeProgress =
    characterProgression.Response.progressions.data.progressions[
      prestigeProgressionHash
    ];

  const prestigeMode = seasonProgress.level === seasonProgress.levelCap;

  const seasonPassRank = prestigeMode
    ? prestigeProgress.level + seasonProgress.levelCap
    : seasonProgress.level;

  state.account.seasonPassRank = seasonPassRank;
};

const calculateTimePlayed = function (characterArray) {
  state.account.minutesPlayedTotal = 0;
  characterArray.forEach(
    (character) =>
      (state.account.minutesPlayedTotal += character.minutesPlayedTotal)
  );
};

const calculateLastPlayed = function (lastOnline) {
  const lastOnlineTimestamp = new Date(lastOnline).getTime();
  const nowTimestamp = new Date().getTime();

  const daysPassed = Math.round(
    Math.abs((nowTimestamp - lastOnlineTimestamp) / (1000 * 60 * 60 * 24))
  );

  if (daysPassed === 0) {
    return "Today";
  }

  if (daysPassed === 1) {
    return "Yesterday";
  }

  if (daysPassed <= 7) {
    return `${daysPassed} day ago`;
  }

  return "> 7 days ago";
};

// == CHARACTERS ==

const getCharactersInfo = async function (membershipType, membershipId) {
  try {
    const data = await AJAX(
      `${API_URL}/${membershipType}/Profile/${membershipId}/?components=200`
    );

    state.account.characters = Object.values(data.Response.characters.data).map(
      (character) => {
        const characterNew = {
          characterId: character.characterId,
          class: character.classHash,
          dateLastPlayed: character.dateLastPlayed,
          emblem: character.emblemHash,
          gender: character.genderHash,
          light: character.light,
          minutesPlayedTotal: +character.minutesPlayedTotal,
          race: character.raceHash,
          equipedSeal: character.titleRecordHash
            ? character.titleRecordHash
            : "No Title Equipped",
        };
        return characterNew;
      }
    );
  } catch (error) {
    console.error(error);
  }
};

const formatCharacterInfo = async function (characterArray) {
  await Promise.all(
    characterArray.map(async (character) => {
      try {
        character.class = await getEntityInfo(
          "DestinyClassDefinition",
          character.class,
          "class"
        );

        character.gender = await getEntityInfo(
          "DestinyGenderDefinition",
          character.gender,
          "gender"
        );

        character.race = await getEntityInfo(
          "DestinyRaceDefinition",
          character.race,
          "race"
        );

        character.emblem = await getEntityInfo(
          "DestinyInventoryItemDefinition",
          character.emblem,
          "emblem"
        );

        if (
          character.equipedSeal &&
          character.equipedSeal !== "No Title Equipped"
        ) {
          character.equipedSeal = await getEntityInfo(
            "DestinyRecordDefinition",
            character.equipedSeal,
            "seal"
          );
        }
      } catch (error) {
        console.error(error);
      }
    })
  );
};

// == GEAR ==

// == Weapons ==

const getWeapons = async function (membershipType, membershipId, characterId) {
  try {
    const data = await AJAX(
      `${API_URL}/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=205`
    );
    return data.Response.equipment.data.items.slice(0, 3);
  } catch (error) {
    console.error(error);
  }
};

const getWeaponsInfo = async function (charactersArray) {
  await Promise.all(
    charactersArray.map(async (character) => {
      try {
        const weapons = await getWeapons(
          state.account.membershipType,
          state.account.membershipId,
          character.characterId
        );

        character.weapons = weapons.map((weapon) => {
          const weaponNew = {
            itemInstanceId: weapon.itemInstanceId,
            itemHash: weapon.itemHash,
          };
          return weaponNew;
        });
      } catch (error) {
        console.error(error);
      }
    })
  );
};

const getWeaponsDetails = async function (characterArray) {
  await Promise.all(
    characterArray.map(
      async (character) =>
        await Promise.all(
          character.weapons.map(async (weapon) => {
            try {
              const lightLevel = await getItemInfo(
                state.account.membershipType,
                state.account.membershipId,
                weapon.itemInstanceId
              );
              weapon.lightLevel = lightLevel;

              const [name, icon, itemTypeAndTierDisplayName] =
                await getEntityInfo(
                  "DestinyInventoryItemDefinition",
                  weapon.itemHash,
                  "weapon"
                );

              weapon.name = name;
              weapon.icon = icon;
              weapon.itemTypeAndTierDisplayName = itemTypeAndTierDisplayName;
            } catch (error) {
              console.error(error);
            }
          })
        )
    )
  );
};

// == MARKUP ==

const generateCharacterWeaponsMarkup = function (weaponsArray) {
  const markup = weaponsArray
    .map((weapon) => {
      return `
      <div data-item-instance-id="${weapon.itemInstanceId}" class="card__weapons--weapon">
        <div class="weapons__weapon--image">
          <img src="https://www.bungie.net${weapon.icon}" alt="" />
        </div>
        <div class="weapons__weapon--text">
          <div class="weapon__text--top">
            <div class="weapon__text--name">${weapon.name}</div>
            <div class="weapon__text--level">✦ ${weapon.lightLevel}</div>
          </div>
          <div class="weapon__text--bottom">
            <div class="weapon__text--type">${weapon.itemTypeAndTierDisplayName}</div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
  return markup;
};

const generateCharacterMarkup = function () {
  const markup = state.account.characters
    .map((character) => {
      return `
        <div class="card">
        <div class="card__header">
          <div class="card__header--image">
            <img src="https://www.bungie.net${
              character.emblem
            }" alt="Character 1 Icon" />
          </div>
          <div class="card__header--text">
            <div class="header__text--top">
              <div class="header__text--class">${character.gender} ${
        character.race
      } ${character.class}</div>
            </div>
            <div class="header__text--bottom">
              <div class="header__text--time">${Math.floor(
                character.minutesPlayedTotal / 60
              )}h ${character.minutesPlayedTotal % 60}m</div>
              <div class="header__text--level">✦ ${character.light}</div>
            </div>
          </div>
        </div>
        <div class="card__title">
          <div class="card__title--text">${character.equipedSeal}</div>
        </div>
        <div class="card__weapons">
        ${generateCharacterWeaponsMarkup(character.weapons)}
        </div>
        </div>
    `;
    })
    .join("");

  return markup;
};

const generateAccountInfoMarkup = function () {
  const markup = `
    <div class="account-info__name">
      <p class="account-info__name--text">${state.account.displayName}<span>#${
    state.account.displayNameCode
  }</span></p>
    </div>
    <div class="account-info__stats">
      <div class="account-info__stat account-info__stats--active-triumph-score">
        <div class="stat__upper-text">${state.account.activeScore.toLocaleString(
          "en-US"
        )}</div>
        <div class="stat__lower-text">Active Triumph</div>
      </div>
      <div class="account-info__stat account-info__stats--time-played">
        <div class="stat__upper-text">${Math.floor(
          state.account.minutesPlayedTotal / 60
        )}h ${state.account.minutesPlayedTotal % 60}m</div>
        <div class="stat__lower-text">Time Played</div>
      </div>
        <div class="account-info__stat account-info__stats--season-pass">
        <div class="stat__upper-text pass">✦ ${
          state.account.seasonPassRank
        }</div>
        <div class="stat__lower-text">Season Pass</div>
      </div>
      <div class="account-info__stat account-info__stats--last-seen">
        <div class="stat__upper-text">${calculateLastPlayed(
          state.account.dateLastPlayed
        )}</div>
        <div div class="stat__lower-text">Last Seen</div>
      </div>
    </div>
  `;

  return markup;
};

const loadingSpinnerToggle = function () {
  const loadingSpinner = document.querySelector(".refresh__btn");

  loadingSpinner.classList.toggle("spinner");
};

const addSearchQuery = function (searchQuery) {
  state.searchQueries.push(searchQuery);
};

// == INITIALIZATION ==

const charactersParentElement = document.querySelector(".cards");
const accountParentElement = document.querySelector(".account-info");

const searchButton = document.querySelector(".search__btn");
const refreshButton = document.querySelector(".refresh__btn");

const init = async function (accName) {
  loadingSpinnerToggle();

  await findAccount(accName);

  await getAccountInfo(
    state.account.membershipType,
    state.account.membershipId
  );

  await getCharactersInfo(
    state.account.membershipType,
    state.account.membershipId
  );

  await formatCharacterInfo(state.account.characters);

  await getWeaponsInfo(state.account.characters);

  await getWeaponsDetails(state.account.characters);

  await getSeasonalInfo(state.account.characters[0]);

  calculateTimePlayed(state.account.characters);

  console.log(state);

  charactersParentElement.innerHTML = "";
  accountParentElement.innerHTML = "";

  const accountMarkup = generateAccountInfoMarkup();
  accountParentElement.insertAdjacentHTML("beforeend", accountMarkup);

  const charactersMarkup = generateCharacterMarkup();
  charactersParentElement.insertAdjacentHTML("beforeend", charactersMarkup);

  loadingSpinnerToggle();
};

searchButton.addEventListener("click", async function (e) {
  e.preventDefault();

  const searchField = document.querySelector(".search__field");

  const searchQuery = searchField.value;

  searchField.value = "";
  searchField.blur();
  // console.log(document.activeElement);

  await init(searchQuery);

  state.searchQuery = searchQuery;

  // addSearchQuery(searchQuery);
  // console.log(state.searchQueries);
});

refreshButton.addEventListener("click", async function () {
  if (!state.searchQuery) return console.log("No search query!");

  console.log(`Refreshing with ${state.searchQuery}`);
  await init(state.searchQuery);
  console.log("Refreshed!");
});
