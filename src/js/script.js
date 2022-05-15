// Imports
import { AJAX } from "./helper";
import { getEntityInfo } from "./helper";
import { getItemInstanceInfo } from "./helper";

import { API_URL } from "./config";
import { SEALS } from "./config";

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
  console.time("Find Account");
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
  console.timeEnd("Find Account");
};

const findAccountById = async function (membershipId) {
  state.account.membershipId = membershipId;
  state.account.membershipType = "3";
};

const getAccountInfo = async function (membershipType, membershipId) {
  console.time("Get Account Info");

  const data = await AJAX(
    `${API_URL}/${membershipType}/Profile/${membershipId}/?components=100,200,205,900`
  );

  const getProfileInfo = function () {
    state.account.dateLastPlayed = data.Response.profile.data.dateLastPlayed;
    state.account.displayName =
      data.Response.profile.data.userInfo.bungieGlobalDisplayName;
    state.account.displayNameCode =
      data.Response.profile.data.userInfo.bungieGlobalDisplayNameCode;
    state.account.currentSeason.seasonHash =
      data.Response.profile.data.currentSeasonHash;
  };

  const getTriumphScore = function () {
    state.account.activeScore = data.Response.profileRecords.data.activeScore;
  };

  const getCharactersInfo = function () {
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
        // console.log(JSON.stringify(characterNew));
        return characterNew;
      }
    );
  };

  const getWeaponsInfo = function () {
    Object.values(data.Response.characterEquipment.data).forEach(
      (characterEquipment, i) => {
        const characterWeapons = characterEquipment.items.slice(0, 3);
        state.account.characters[i].weapons = characterWeapons;
      }
    );
  };

  getProfileInfo();
  getTriumphScore();
  getCharactersInfo();
  getWeaponsInfo();

  console.timeEnd("Get Account Info");
};

const getSeasonalInfo = async function (character) {
  console.time("Get Seasonal Info");
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

  console.timeEnd("Get Seasonal Info");
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

const formatSealNames = function (characterArray) {
  characterArray.forEach((character) => {
    if (character.equipedSeal) {
      const sealIndex = SEALS.findIndex(
        (seal) => seal[0] === character.equipedSeal
      );
      character.equipedSeal =
        sealIndex !== -1
          ? (character.equipedSeal = SEALS[sealIndex][1])
          : character.equipedSeal;
    }
  });
};

// == CHARACTERS ==

const formatCharacterInfo = async function (characterArray) {
  console.time("Format Character Info");
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

        // Closure
        const formatSeal = async function () {
          if (character.equipedSeal !== "No Title Equipped") {
            if (character.equipedSeal === 2909250963) {
              character.equipedSeal = "Garden of Salvation";
              return;
            }

            if (character.equipedSeal === 317521250) {
              character.equipedSeal = "Black Armory";
              return;
            }

            character.equipedSeal = await getEntityInfo(
              "DestinyRecordDefinition",
              character.equipedSeal,
              "seal"
            );
          }
        };

        await formatSeal();
      } catch (error) {
        console.error(error);
      }
    })
  );
  console.timeEnd("Format Character Info");
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
  console.time("Get Weapons Info");
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
  console.timeEnd("Get Weapons Info");
};

const getWeaponsDetails = async function (characterArray) {
  console.time("Get Weapons Details");
  await Promise.all(
    characterArray.map(
      async (character) =>
        await Promise.all(
          character.weapons.map(async (weapon) => {
            try {
              const lightLevel = await getItemInstanceInfo(
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
  console.timeEnd("Get Weapons Details");
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
        <div class="stat__upper-text">
        ${state.account.activeScore.toLocaleString("en-US")}</div>
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

const init = async function (account) {
  loadingSpinnerToggle();

  console.time("Got everything!");

  if (parseInt(account)) {
    findAccountById(account);
  } else {
    await findAccount(account);
  }

  await getAccountInfo(
    state.account.membershipType,
    state.account.membershipId
  );

  window.location.hash = state.account.membershipId;

  await Promise.all([
    formatCharacterInfo(state.account.characters),
    getWeaponsDetails(state.account.characters),
    getSeasonalInfo(state.account.characters[0]),
  ]);

  calculateTimePlayed(state.account.characters);

  formatSealNames(state.account.characters);

  console.timeEnd("Got everything!");

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

  if (!searchField.value) return;

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

window.addEventListener("load", async function () {
  const hash = window.location.hash.slice(1);

  if (hash) {
    await init(hash);
    state.searchQuery = `${state.account.displayName}#${state.account.displayNameCode}`;
  }
});
