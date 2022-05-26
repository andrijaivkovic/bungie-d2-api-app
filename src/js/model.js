import { AJAX, getEntityInfo, getItemInstanceInfo } from "./helper";
import { API_URL } from "./config";

export const state = {};

export const findAccountByName = async function (accountName) {
  const [displayName, displayNameCode] = accountName.split("#");
  const uploadData = { displayName, displayNameCode };

  const searchPlayerByName = await AJAX(
    `${API_URL}/SearchDestinyPlayerByBungieName/3/`,
    uploadData
  );

  state.account = searchPlayerByName[0];
  state.searchQuery = accountName;
};

export const findAccountById = async function (accountId) {
  const searchPlayerById = await AJAX(
    `${API_URL}/3/Profile/${accountId}/?components=100`
  );

  state.account = searchPlayerById.profile.data.userInfo;
  state.searchQuery = `${searchPlayerById.profile.data.userInfo.bungieGlobalDisplayName}#${searchPlayerById.profile.data.userInfo.bungieGlobalDisplayNameCode}`;
};

export const getProfileInfo = async function (accountObject) {
  const profileInfo = await AJAX(
    `${API_URL}/${accountObject.membershipType}/Profile/${accountObject.membershipId}/?components=100,200,205,900`
  );

  const profile = {
    currentSeasonHash: profileInfo.profile.data.currentSeasonHash,
    dateLastPlayed: profileInfo.profile.data.dateLastPlayed,
    activeScore: profileInfo.profileRecords.data.activeScore,
  };

  const characters = Object.values(profileInfo.characters.data);

  state.account = { characters, ...profile, ...state.account };
};

export const calculateTimePlayed = function (charactersArray) {
  const minutesPlayedTotal = charactersArray.reduce(
    (acc, character) => acc + +character.minutesPlayedTotal,
    0
  );
  state.account.minutesPlayedTotal = minutesPlayedTotal;
};

export const getSeasonPassRank = async function (accountObject) {
  const { seasonPassHash } = await getEntityInfo(
    "DestinySeasonDefinition",
    accountObject.currentSeasonHash
  );

  const { rewardProgressionHash, prestigeProgressionHash } =
    await getEntityInfo("DestinySeasonPassDefinition", seasonPassHash);

  const {
    progressions: {
      data: { progressions },
    },
  } = await AJAX(
    `${API_URL}/${accountObject.membershipType}/Profile/${accountObject.membershipId}/Character/${accountObject.characters[0].characterId}/?components=202`
  );

  const seasonProgress = progressions[rewardProgressionHash];
  const prestigeProgress = progressions[prestigeProgressionHash];

  const prestigeMode = seasonProgress.level === seasonProgress.levelCap;

  const seasonPassRank = prestigeMode
    ? prestigeProgress.level + seasonProgress.levelCap
    : seasonProgress.level;

  state.account.seasonPassRank = seasonPassRank;
};

// Character Info

export const formatCharacterInfo = async function (charactersArray) {
  await Promise.all(
    charactersArray.map(async (character) => {
      const promiseArray = [
        getEntityInfo("DestinyClassDefinition", character.classHash),
        getEntityInfo("DestinyGenderDefinition", character.genderHash),
        getEntityInfo("DestinyRaceDefinition", character.raceHash),
        getEntityInfo("DestinyInventoryItemDefinition", character.emblemHash),
        getEntityInfo("DestinyRecordDefinition", character.titleRecordHash),
      ];

      const [gClass, gender, race, emblem, title] = await Promise.all(
        promiseArray
      );

      character.className = gClass.displayProperties.name;
      character.genderName = gender.displayProperties.name;
      character.raceName = race.displayProperties.name;
      character.emblem = emblem.secondaryOverlay;
      character.titleName = title.titleInfo.titlesByGender.Female;
    })
  );
};

export const getEquipmentInfo = async function (accountObject) {
  const membershipType = accountObject.membershipType;
  const membershipId = accountObject.membershipId;

  await Promise.all(
    accountObject.characters.map(async (character) => {
      const characterEquipment = await AJAX(
        `${API_URL}/${membershipType}/Profile/${membershipId}/Character/${character.characterId}/?components=205`
      );

      character.weapons = characterEquipment.equipment.data.items.slice(0, 3);
      character.armor = characterEquipment.equipment.data.items.slice(3, 8);
      character.misc = characterEquipment.equipment.data.items.slice(8, 11);
    })
  );
};

export const formatEquipmentInfo = async function (charactersArray) {
  await Promise.all(
    charactersArray.map(async (character) => {
      await Promise.all(
        character.weapons.map(async (weapon) => {
          const weaponInfo = await getEntityInfo(
            "DestinyInventoryItemDefinition",
            weapon.itemHash
          );
          Object.assign(weapon, weaponInfo);
        })
      );
      await Promise.all(
        character.armor.map(async (armor) => {
          const armorInfo = await getEntityInfo(
            "DestinyInventoryItemDefinition",
            armor.itemHash
          );
          Object.assign(armor, armorInfo);
        })
      );
      await Promise.all(
        character.misc.map(async (misc) => {
          const miscInfo = await getEntityInfo(
            "DestinyInventoryItemDefinition",
            misc.itemHash
          );
          Object.assign(misc, miscInfo);
        })
      );
    })
  );
};

export const getEquipmentInstanceInfo = async function (characterArray) {
  await Promise.all(
    characterArray.map(async (character) => {
      await Promise.all(
        character.weapons.map(async (weapon) => {
          weapon.lightLevel = await getItemInstanceInfo(
            character.membershipType,
            character.membershipId,
            weapon.itemInstanceId
          );
        })
      );
      await Promise.all(
        character.armor.map(async (armor) => {
          armor.lightLevel = await getItemInstanceInfo(
            character.membershipType,
            character.membershipId,
            armor.itemInstanceId
          );
        })
      );
    })
  );
};

export const getItemInfo = async function (
  characterIndex,
  itemHash,
  itemInstanceId,
  itemType
) {
  const { membershipId, membershipType } =
    state.account.characters[characterIndex];

  const itemInfoData = await getEntityInfo(
    "DestinyInventoryItemDefinition",
    itemHash
  );

  const itemInstanceInfoData = await getItemInstanceInfo(
    membershipType,
    membershipId,
    itemInstanceId,
    "full"
  );

  const collectibleHash = itemInfoData.collectibleHash;

  const itemInfo = {
    name: itemInfoData.displayProperties.name,
    icon: itemInfoData.displayProperties.icon,
    iconWatermark: itemInfoData.iconWatermark,
    screenshot: itemInfoData.screenshot,
    itemTypeAndTierDisplayName: itemInfoData.itemTypeAndTierDisplayName,
  };

  const itemRarity = itemInfoData.inventory.tierTypeName;
  const itemRarityType = `${itemRarity.toLowerCase()}_${itemType}`;

  const itemStatsArray = Object.values(itemInstanceInfoData.stats.data.stats);

  // const itemStatsArray =
  //   itemInstanceInfoData.stats.data?.stats &&
  //   itemInstanceInfoData.stats.data.stats.length > 0
  //     ? Object.values(itemInstanceInfoData.stats.data.stats)
  //     : [];

  //.filter(perk) => perk.isActive === true && perk.visible === true);

  // const itemSocketsArray = itemInstanceInfoData.sockets.data.sockets.filter(
  //   (socket) => socket.isEnabled === true && socket.isVisible === true
  // );

  const itemInstanceInfo = {
    state: itemInstanceInfoData.item.data.state,
    level: itemInstanceInfoData.instance.data.primaryStat?.value,
    stats: itemStatsArray,
    sockets: itemInstanceInfoData.sockets.data.sockets,
    damageType: {
      damageTypeHash: itemInstanceInfoData.instance.data?.damageTypeHash,
    },
    energyType: {
      energyTypeHash:
        itemInstanceInfoData.instance.data?.energy?.energyTypeHash,
      energyCapacity:
        itemInstanceInfoData.instance.data?.energy?.energyCapacity,
    },
  };

  state.itemView = {
    collectibleHash,
    itemRarityType,
    itemHash,
    itemInstanceId,
    itemInfo,
    itemInstanceInfo,
  };
};

export const formatItemInfo = async function (itemInfoObject) {
  const damageTypeHash =
    itemInfoObject.itemInstanceInfo.damageType.damageTypeHash;

  if (damageTypeHash) {
    const damageTypeInfoData = await getEntityInfo(
      "DestinyDamageTypeDefinition",
      damageTypeHash
    );

    const damageTypeInfo = {
      name: damageTypeInfoData.displayProperties.name,
      icon: damageTypeInfoData.displayProperties.icon,
      description: damageTypeInfoData.displayProperties.description,
    };

    Object.assign(itemInfoObject.itemInstanceInfo.damageType, damageTypeInfo);
  }

  const energyTypeHash =
    itemInfoObject.itemInstanceInfo.energyType.energyTypeHash;

  if (energyTypeHash) {
    const energyTypeInfoData = await getEntityInfo(
      "DestinyEnergyTypeDefinition",
      energyTypeHash
    );

    const energyTypeInfo = {
      name: energyTypeInfoData.displayProperties.name,
      icon: energyTypeInfoData.displayProperties.icon,
      description: energyTypeInfoData.displayProperties.description,
    };

    Object.assign(itemInfoObject.itemInstanceInfo.energyType, energyTypeInfo);
  }

  if (itemInfoObject.itemInstanceInfo.sockets.length > 0) {
    await Promise.all(
      itemInfoObject.itemInstanceInfo.sockets.map(async (socket) => {
        const plugHash = socket?.plugHash;
        if (plugHash) {
          const socketInfoData = await getEntityInfo(
            "DestinyInventoryItemDefinition",
            plugHash
          );

          const socketInfo = {
            name: socketInfoData?.displayProperties?.name,
            icon: socketInfoData?.displayProperties?.icon,
            iconWatermark: socketInfoData?.iconWatermark,
            description: socketInfoData?.displayProperties?.description,
            energyTypeIcon:
              "/common/destiny2_content/icons/435daeef2fc277af6476f2ffb9b18bcb.png",
            energyTypeName: "This item is not a mod.",
          };

          socketInfo.iconWatermark =
            socketInfoData?.iconWatermark ||
            "/common/destiny2_content/icons/435daeef2fc277af6476f2ffb9b18bcb.png";

          const statTypeHash = socketInfoData?.investmentStats[0]?.statTypeHash;

          if (statTypeHash) {
            const socketEnergyInfoData = await getEntityInfo(
              "DestinyStatDefinition",
              statTypeHash
            );
            socketInfo.energyTypeIcon =
              socketEnergyInfoData?.displayProperties?.icon;
            socketInfo.energyTypeName =
              socketEnergyInfoData?.displayProperties?.name;
          }

          Object.assign(socket, socketInfo);
        }
      })
    );
  }

  await Promise.all(
    itemInfoObject.itemInstanceInfo.stats.map(async (stat) => {
      const statHash = stat.statHash;
      const statInfoData = await getEntityInfo(
        "DestinyStatDefinition",
        statHash
      );

      const statInfo = {
        name: statInfoData.displayProperties.name,
        description: statInfoData.displayProperties.description,
      };

      Object.assign(stat, statInfo);
    })
  );

  const collectibleHash = itemInfoObject?.collectibleHash;

  itemInfoObject.itemInfo.source = "Source: Source not found.";

  if (collectibleHash) {
    const collectibleInfoData = await getEntityInfo(
      "DestinyCollectibleDefinition",
      collectibleHash
    );

    itemInfoObject.itemInfo.source = collectibleInfoData?.sourceString;
  }
};

export const setDefaultEquipmentView = function (characterArray) {
  characterArray.forEach((character) => {
    character.equipmentView = {
      type: "weapons",
      items: character.weapons,
    };
  });
};

export const setDefaultCardView = function (characterArray) {
  characterArray.forEach((character) => {
    character.cardView = 0;
  });
};

export const setEquipmentView = function (characterIndex, equipmentType) {
  state.account.characters[characterIndex].equipmentView.type = equipmentType;
  state.account.characters[characterIndex].equipmentView.items =
    state.account.characters[characterIndex][equipmentType];
};

export const setCardView = function (characterIndex, cardViewValue) {
  state.account.characters[characterIndex].cardView = cardViewValue;
};
