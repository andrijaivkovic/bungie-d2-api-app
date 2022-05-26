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

  const getItemInfo = function () {
    // let sliceValues;

    // if (itemType === "weapons") {
    //   sliceValues = [0, 3];
    // }

    // if (itemType === "armor") {
    //   sliceValues = [3, 8];
    // }

    Object.values(data.Response.characterEquipment.data).forEach(
      (characterEquipment, i) => {
        const characterWeapons = characterEquipment.items.slice(0, 3);
        state.account.characters[i].weapons = characterWeapons;

        const characterArmor = characterEquipment.items.slice(3, 8);
        state.account.characters[i].armor = characterArmor;

        const characterMisc = characterEquipment.items.slice(8, 11);
        state.account.characters[i].misc = characterMisc;
      }
    );
  };

  console.time("Get Profile Info");
  getProfileInfo();
  console.timeEnd("Get Profile Info");

  console.time("Get Triumph Info");
  getTriumphScore();
  console.timeEnd("Get Triumph Info");

  console.time("Get Character Info");
  getCharactersInfo();
  console.timeEnd("Get Character Info");

  console.time("Get Item Info");
  getItemInfo();
  console.timeEnd("Get Item Info");

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

  try {
    await Promise.all(
      characterArray.map(async (character) => {
        const promiseArray = [
          getEntityInfo("DestinyClassDefinition", character.class, "class"),
          getEntityInfo("DestinyGenderDefinition", character.gender, "gender"),
          getEntityInfo("DestinyRaceDefinition", character.race, "race"),
          getEntityInfo(
            "DestinyInventoryItemDefinition",
            character.emblem,
            "emblem"
          ),
        ];

        const [gClass, gender, race, emblem] = await Promise.all(promiseArray);

        character.class = gClass;
        character.gender = gender;
        character.race = race;
        character.emblem = emblem;

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
      })
    );
  } catch (error) {
    console.error(error);
  }
  console.timeEnd("Format Character Info");
};

// == GEAR ==

// == Weapons ==

const getItemsDetails = async function (
  charactersArray,
  characterIndex,
  equipmentType
) {
  try {
    await Promise.all(
      charactersArray[characterIndex][equipmentType].map(async (item) => {
        const lightLevel = await getItemInstanceInfo(
          state.account.membershipType,
          state.account.membershipId,
          item.itemInstanceId
        );

        lightLevel
          ? (item.lightLevel = lightLevel)
          : (item.lightLevel = "Leveln't");

        const [name, icon, itemTypeAndTierDisplayName] = await getEntityInfo(
          "DestinyInventoryItemDefinition",
          item.itemHash,
          equipmentType
        );

        item.name = name;
        item.icon = icon;
        item.itemTypeAndTierDisplayName = itemTypeAndTierDisplayName;

        console.log("Called!");
      })
    );
  } catch (error) {
    console.error(error);
  }
};

const showItemInstanceDetails = async function (
  membershipType,
  membershipId,
  itemInstanceId,
  itemHash
) {
  console.time("Get Item Instance Details");

  try {
    const data = await Promise.all([
      AJAX(
        `${API_URL}/${membershipType}/Profile/${membershipId}/Item/${itemInstanceId}/?components=307,300,302,304`
      ),
      AJAX(`${API_URL}/Manifest/DestinyInventoryItemDefinition/${itemHash}`),
    ]);
    const [dataItemInstance, dataItem] = data;

    console.log(dataItemInstance.Response);
    console.log(dataItem.Response);
  } catch (error) {
    console.error(error);
  }

  console.timeEnd("Get Item Instance Details");
};

// == MARKUP ==

const generateCharacterItemsMarkup = function (itemsArray) {
  const markup = itemsArray
    .map((item) => {
      return `
      <div data-item-instance-id="${item.itemInstanceId}" data-item-hash="${item.itemHash}" class="card__weapons--weapon item">
        <div class="weapons__weapon--image">
          <img src="https://www.bungie.net${item.icon}" alt="" />
        </div>
        <div class="weapons__weapon--text">
          <div class="weapon__text--top">
            <div class="weapon__text--name">${item.name}</div>
            <div class="weapon__text--level">✦ ${item?.lightLevel}</div>
          </div>
          <div class="weapon__text--bottom">
            <div class="weapon__text--type">${item.itemTypeAndTierDisplayName}</div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
  return markup;
};

const generateCharacterMarkup = function (characterIndex, equipmentType) {
  return `
  <div data-character="${characterIndex}" class="card">
  <div class="card__header">
    <div class="card__header--image">
      <img src="https://www.bungie.net${
        state.account.characters[characterIndex].emblem
      }" alt="Character 1 Icon" />
    </div>
    <div class="card__header--text">
      <div class="header__text--top">
        <div class="header__text--class">${
          state.account.characters[characterIndex].gender
        } ${state.account.characters[characterIndex].race} ${
    state.account.characters[characterIndex].class
  }</div>
      </div>
      <div class="header__text--bottom">
        <div class="header__text--time">${Math.floor(
          state.account.characters[characterIndex].minutesPlayedTotal / 60
        )}h ${
    state.account.characters[characterIndex].minutesPlayedTotal % 60
  }m</div>
        <div class="header__text--level">✦ ${
          state.account.characters[characterIndex].light
        }</div>
      </div>
    </div>
  </div>
  <div class="card__title hide">
    <div class="card__title--text">${
      state.account.characters[characterIndex].equipedSeal
    }</div>
  </div>
  <div class="card__equipment-type-select hide">
    <div
      class="equipment-type-select__type active-type type flex-start flex-33" data-type="weapons"
    >
      <div class="equipment-type-select__type--icon">
        <div class="icon-frame">
          <svg
            class="icon weapons active-icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
          >
            <path
              d="M11.975 21.616c2.662-3.092 2.907-3.14 3.075-3.287 0.376-0.326 0.711-0.696 1.064-1.046l15.886-15.892c-0.356 2.014-0.66 3.753-0.989 5.617l-14.718 14.724c-0.128-0.016-0.276-0.025-0.426-0.025-0.773 0-1.488 0.244-2.074 0.66l0.011-0.007-1.554 1.855 1.918 1.918c-1.416-0.102-2.366-1.255-3.827-0.986l-4.258 4.246-0.828-0.813c1.079-0.896 1.769-2.148 3.11-2.779 0.54-0.278 0.936-0.773 1.076-1.366l0.003-0.014c0.176-0.66 0.714-1.219 1.24-1.727 1.052-0.986 2.062-2.020 3.060-3.060 0.251-0.26 0.406-0.613-1.772 1.981-2.42 3.287-2.411 3.499-2.39 3.929l0.496-0.619c-0.218-0.122-0.353-0.209 1.897-3.311zM14.906 20.988h0.081l0.027-0.32h-0.134c0.001 0.114 0.041 0.218 0.108 0.3l-0.001-0.001h-0.081l-0.027 0.32h0.134c-0.001-0.114-0.041-0.218-0.108-0.3l0.001 0.001zM17.694 17.824h0.427l0.335 0.953c0.768-0.852 1.56-1.461 2.175-2.325l-0.421-0.215c-0.783 0.478-1.117 1.443-2.091 1.587-0.021-0.001-0.045-0.002-0.070-0.002-0.124 0-0.244 0.016-0.358 0.046l0.010-0.002v-0.081l-0.32-0.027v0.134c0.114-0.003 0.221-0.028 0.319-0.071l-0.006 0.002zM11.736 23.313h0.084l0.024-0.32h-0.131c0 0.001-0 0.003-0 0.004 0 0.113 0.041 0.216 0.108 0.295l-0.001-0.001h-0.084l-0.024 0.32h0.131c0-0 0-0.001 0-0.001 0-0.114-0.041-0.218-0.108-0.299l0.001 0.001zM21.692 15.434l7.565-7.562-0.35-0.353-7.565 7.565zM29.795 6.644c0.105-0.49 0.188-0.846 0.254-1.195 0-0.060-0.051-0.131-0.093-0.233l-0.801 0.801zM10.296 23.591l-0.17 0.206 0.63 0.472 0.096-0.12zM13.048 21.272l-0.17 0.191 0.43 0.278 0.090-0.12zM12.271 22.393l0.069-0.069-0.209-0.212-0.072 0.072zM13.819 21.266l-0.069 0.072 0.212 0.212 0.069-0.072zM11.429 24.224l0.072 0.072 0.209-0.212-0.057-0.069zM12.274 23.379l0.069 0.072 0.212-0.212-0.069-0.069z"
            ></path>
            <path
              d="M5.199 30.609l-0.974-0.974 0.774-0.774 1.246 1.249c-0.149 0.149-0.26 0.338-0.421 0.403-0.186 0.056-0.4 0.090-0.622 0.096l-0.003 0z"
            ></path>
            <path
              d="M26.807 30.609l0.98-0.974-0.774-0.774-1.246 1.249c0.149 0.149 0.26 0.338 0.421 0.403 0.184 0.055 0.396 0.090 0.615 0.096l0.003 0z"
            ></path>
            <path
              d="M21.656 23.964l0.033-0.027-0.131-0.194-0.027 0.027z"
            ></path>
            <path
              d="M23.628 25.802c-0.54-0.278-0.936-0.773-1.076-1.366l-0.003-0.014c-0.164-0.66-0.69-1.225-1.228-1.727-0.714-0.672-1.41-1.365-2.091-2.065l-0.018 0.018c0.227 0.263 0.499 0.598 0.822 0.968 0.684 0.929 1.177 1.613 1.527 2.127l0.152-0.152 0.17 0.206-0.191 0.14c0.756 1.123 0.747 1.315 0.738 1.607l-0.499-0.619c0.131-0.078 0.236-0.14-0.275-0.962l-0.409 0.299-0.096-0.12 0.379-0.379c-0.299-0.475-0.78-1.159-1.494-2.154l-0.834-0.959-1.446 1.449c0.155 0.078 0.299 0.164 0.451 0.254l1.566 1.855-1.918 1.918c1.416-0.102 2.366-1.255 3.827-0.986l4.24 4.252 0.828-0.813c-1.079-0.896-1.769-2.148-3.122-2.779zM18.698 21.741l-0.090-0.12 0.35-0.35 0.17 0.191zM19.666 23.45l-0.212-0.212 0.069-0.069 0.212 0.209zM19.735 22.393l-0.069-0.069 0.209-0.212 0.072 0.072zM20.27 23.307c0 0.108 0.018 0.212 0.024 0.32h-0.131c0-0 0-0.001 0-0.001 0-0.114 0.041-0.218 0.108-0.299l-0.001 0.001h-0.084l-0.024-0.32h0.131c0 0.001 0 0.003 0 0.004 0 0.113-0.041 0.216-0.108 0.295l0.001-0.001zM20.509 24.296l-0.209-0.212 0.069-0.069 0.212 0.209z"
            ></path>
            <path
              d="M13.099 18.293c-0.621-0.567-1.185-1.172-1.7-1.818l-0.024-0.032 0.421-0.215c0.711 0.433 1.055 1.267 1.841 1.527l1.362-1.365-14.999-14.999c0.356 2.014 0.66 3.753 0.989 5.617l11.697 11.712zM1.957 5.445c0-0.060 0.051-0.131 0.093-0.233 0.275 0.275 0.532 0.529 0.801 0.801l-0.639 0.63c-0.105-0.49-0.188-0.846-0.254-1.204zM10.314 15.434c-2.531-2.528-5.041-5.041-7.565-7.562l0.35-0.353 7.565 7.565z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="equipment-type-select__type type flex-center flex-67" data-type="armor">
      <div class="equipment-type-select__type--icon">
        <div class="icon-frame">
          <svg
            class="icon armor"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
          >
            <path
              d="M15.823 0c-8.349 0-10.723 8.877-10.723 8.877v18.55l7.031 4.573h1.582v-11.34l-4.7-3.518c-0.665-1.018-0.854-3.455 0-4.309h5.67v6.155h2.943v-6.108h5.011c1.097 0.744 0.865 3.355 0.396 4.172l-4.573 3.871v11.076h1.54l6.899-4.794v-18.46s-2.11-8.745-11.076-8.745z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="equipment-type-select__type type flex-end flex-33" data-type="misc">
      <div class="equipment-type-select__type--icon">
        <div class="icon-frame">
          <svg
            class="icon misc"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M506.056 733.874v264.813l-51.241 25.211-176.269-265.428 139.375-139.375 88.134 114.78z"
            ></path>
            <path
              d="M291.254 519.482h-266.043l-25.211 49.191 265.633 177.908 138.35-138.965-112.73-88.134z"
            ></path>
            <path
              d="M506.056 291.151v-265.838l-51.241-25.211-176.269 266.454 139.375 139.375 88.134-114.78z"
            ></path>
            <path
              d="M292.484 504.723h-266.454l-25.416-49.191 265.223-177.908 139.375 138.965-112.73 88.134z"
            ></path>
            <path
              d="M518.765 733.874v264.813l50.216 25.211 177.089-265.428-139.17-139.375-88.134 114.78z"
            ></path>
            <path
              d="M732.747 517.842h266.043l25.211 51.241-265.633 176.884-138.35-139.99 112.73-88.134z"
            ></path>
            <path
              d="M518.765 291.151v-265.838l50.216-25.211 177.089 266.454-139.17 139.375-88.134-114.78z"
            ></path>
            <path
              d="M731.517 506.363h266.454l25.416-51.241-265.223-176.884-139.375 139.99 112.73 88.134z"
            ></path>
            <path
              d="M512.411 630.571c-61.58 0-111.501-49.92-111.501-111.501s49.92-111.501 111.501-111.501c61.58 0 111.501 49.92 111.501 111.501v0c-0.116 61.533-49.967 111.384-111.489 111.501h-0.011zM512.411 428.067c-50.26 0-91.004 40.744-91.004 91.004s40.744 91.004 91.004 91.004c50.26 0 91.004-40.744 91.004-91.004v0c0-50.26-40.744-91.004-91.004-91.004v0z"
            ></path>
            <path
              d="M501.547 481.153v20.086l-16.192 15.987h-20.702v-7.993l36.894-28.080z"
            ></path>
            <path
              d="M501.547 553.301v-20.086l-16.192-15.987h-20.702v7.993l36.894 28.080z"
            ></path>
            <path
              d="M521.634 481.153v20.086l16.192 15.987h20.702v-7.993l-36.894-28.080z"
            ></path>
            <path
              d="M521.634 553.301v-20.086l16.192-15.987h20.702v7.993l-36.894 28.080z"
            ></path>
            <path
              d="M521.634 519.277c0 5.547-4.496 10.043-10.043 10.043s-10.043-4.496-10.043-10.043c0-5.547 4.496-10.043 10.043-10.043s10.043 4.496 10.043 10.043z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div class="card__weapons hide">
  ${generateCharacterItemsMarkup(
    state.account.characters[characterIndex][equipmentType]
  )}
  </div>
</div>
  `;
};

const generateAccountInfoMarkup = function () {
  const markup = `
    <div class="account-info__name">
      <p class="account-info__name--text">${state.account.displayName}<span>#${
    state.account.displayNameCode
  }</span></p>
    </div>
    <div class="account-info__stats">
      <div class="account-info__stats--first account-info__stats--part">
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
      </div>
      <div class="account-info__stats--second account-info__stats--part">
      <div class="account-info__stat account-info__stats--season-pass">
      <div class="stat__upper-text pass">✦ ${state.account.seasonPassRank}</div>
      <div class="stat__lower-text">Season Pass</div>
    </div>
    <div class="account-info__stat account-info__stats--last-seen">
      <div class="stat__upper-text">${calculateLastPlayed(
        state.account.dateLastPlayed
      )}</div>
      <div div class="stat__lower-text">Last Seen</div>
    </div>
      </div>
    </div>
  `;

  return markup;
};

const loadingSpinnerToggle = function () {
  const loadingSpinner = document.querySelector(".refresh__btn");

  loadingSpinner.classList.toggle("spinner");
};

// const addSearchQuery = function (searchQuery) {
//   state.searchQueries.push(searchQuery);
// };

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

  await Promise.all(
    state.account.characters.map(async (_, i) => {
      await getItemsDetails(state.account.characters, i, "weapons");
    })
  );

  await Promise.all([
    formatCharacterInfo(state.account.characters),
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

  state.account.characters.forEach((_, i) => {
    const markup = generateCharacterMarkup(i, "weapons");
    charactersParentElement.insertAdjacentHTML("beforeend", markup);
  });

  await Promise.all(
    state.account.characters.map(async (_, i) => {
      await getItemsDetails(state.account.characters, i, "armor");
      await getItemsDetails(state.account.characters, i, "misc");
    })
  );

  loadingSpinnerToggle();

  const testData = await AJAX(
    "http://localhost:8080/DestinyInventoryItemDefinition/-2144451934"
  );
  console.log(testData);
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

const refreshData = async function () {
  if (!state.searchQuery) return console.log("No search query!");

  console.log(`Refreshing with ${state.searchQuery}`);
  await init(state.searchQuery);
  console.log("Refreshed!");
};

refreshButton.addEventListener("click", refreshData);

window.addEventListener("keydown", function (e) {
  if (e.key === "r") refreshData();
});

window.addEventListener("load", async function () {
  const hash = window.location.hash.slice(1);

  if (hash) {
    await init(hash);
    state.searchQuery = `${state.account.displayName}#${state.account.displayNameCode}`;
  }
});

charactersParentElement.addEventListener("click", async function (e) {
  const card = e.target.closest(".card");
  const item = e.target.closest(".item");
  const eqTypeSelect = e.target.closest(".type");

  if (!card) return;

  const itemContainer = card.querySelector(".card__weapons");
  const typeIcons = card.querySelectorAll(".icon");

  if (eqTypeSelect) {
    const eqType = eqTypeSelect.dataset.type;
    const characterIndex = +card.dataset.character;

    typeIcons.forEach((icon) => {
      icon.classList.remove("active-icon");

      if (icon.classList.contains(eqType)) icon.classList.add("active-icon");
    });

    const markup = generateCharacterItemsMarkup(
      state.account.characters[characterIndex][eqType]
    );

    itemContainer.innerHTML = "";
    itemContainer.insertAdjacentHTML("afterbegin", markup);

    return;
  }

  if (item) {
    const itemInstanceId = item.dataset.itemInstanceId;
    const itemHash = item.dataset.itemHash;

    await showItemInstanceDetails(
      state.account.membershipType,
      state.account.membershipId,
      itemInstanceId,
      itemHash
    );

    return;
  }

  const cardTitle = card.querySelector(".card__title");
  const cardWeapons = card.querySelector(".card__weapons");
  const cardEquipmentSelect = card.querySelector(
    ".card__equipment-type-select"
  );

  cardTitle.classList.toggle("hide");
  cardWeapons.classList.toggle("hide");
  cardEquipmentSelect.classList.toggle("hide");
});
