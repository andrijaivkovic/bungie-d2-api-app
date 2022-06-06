import View from "./View";
import { B_URL } from "./config";

class ItemIView extends View {
  constructor() {
    super();

    this.addHandlerHideOverlay();
  }

  _parentElement = document.querySelector(".overlay__item-view");

  _overlay = document.querySelector(".overlay");
  _overlayBackground = document.querySelector(".overlay__background");

  addHandlerHideOverlay() {
    this._overlayBackground.addEventListener(
      "click",
      this._hideOverlay.bind(this)
    );
  }

  _hideOverlay() {
    this._parentElement.classList.add("hide");
    this._overlay.classList.add("hide");
    this._overlayBackground.classList.add("hide");
  }

  // = MARKUP =

  _itemStateMarkup(itemStateNumber) {
    if (itemStateNumber >= 4)
      return "https://i.ibb.co/5GNRrr6/masterwork-border.png";

    return "https://i.ibb.co/vc6vx9t/transparent-border.png";
  }

  _itemStats(itemStatsArray) {
    return itemStatsArray
      .map((stat) => {
        return `
          <div class="stat">
            <div class="stat__name">${stat.name}</div>
            <div class="stat__visual">
              <div style="width: ${
                (stat.value / 42) * 100
              }%" class="stat__visual--amount"></div>
            </div>
            <div class="stat__amount">${stat.value}</div>
          </div>
      `;
      })
      .join("");
  }

  _armorModsMarkup(armorModsArray = []) {
    if (armorModsArray && armorModsArray.length > 0) {
      const filteredArmorModsArray = armorModsArray.filter(
        (mod) => mod.isVisible === true
      );

      if (filteredArmorModsArray.length) {
        return filteredArmorModsArray
          .map((armorMod) => {
            return `
              <div class="slot">
                <img
                  src="${B_URL}${armorMod.icon}"
                  alt=""
                  class="slot__icon"
                />
                <img title="${armorMod.name}" src="${B_URL}${armorMod.energyTypeIcon}" alt="" class="slot__border" />
              </div>
      `;
          })
          .join("");
      }
    }

    return `<p class="overlay__text">This item doesn't accept mods.</p>`;
  }

  _armorCosmeticsMarkup(armorCosmeticsArray = []) {
    if (armorCosmeticsArray && armorCosmeticsArray.length > 0) {
      const filteredarmorCosmeticsArray = armorCosmeticsArray.filter(
        (armorCosmetic) => armorCosmetic.isVisible === true
      );

      if (filteredarmorCosmeticsArray) {
        return filteredarmorCosmeticsArray
          .map((armorCosmetic) => {
            return `
          <div class="slot">
            <img
              src="${B_URL}${armorCosmetic.icon}"
              alt=""
              class="slot__icon"
            />
            <img title="${armorCosmetic.name}" src="${B_URL}${armorCosmetic.iconWatermark}" alt="" class="slot__border" />
          </div>
        `;
          })
          .join("");
      }
    }

    return `<p class="overlay__text">This armor piece doesn't accept cosmetics.</p>`;
  }

  _weaponModsMarkup(weaponSocketsArray) {
    const weaponModsArray = weaponSocketsArray.filter(
      (socket) =>
        socket.itemTypeDisplayName === "Shader" ||
        socket.itemTypeDisplayName === "Weapon Ornament" ||
        socket.name === "Masterwork" ||
        socket.itemTypeDisplayName === "Weapon Mod" ||
        socket.itemTypeDisplayName === "Restore Defaults"
    );

    if (weaponModsArray.length > 0) {
      return weaponModsArray
        .map((weaponMod) => {
          return `
            <div class="slot">
              <img
                src="${B_URL}${weaponMod.icon}"
                alt=""
                class="slot__icon"
              />
              <img title="${weaponMod.name}" src="${B_URL}${weaponMod.iconWatermark}" alt="" class="slot__border" />
            </div>
            `;
        })
        .join("");
    }
  }

  _weaponAmmoTypeMarkup(weaponAmmoType) {
    if (weaponAmmoType === 1)
      return `
      <img
        class="details__element--ammotype"
        src="https://i.ibb.co/TBjWsc8/primary-ammo-icon.png"
        title="This weapon uses primary ammo."
        alt=""
      />
      `;

    if (weaponAmmoType === 2)
      return `
        <img
          class="details__element--ammotype"
          src="https://i.ibb.co/cx9k6MK/special-ammo-icon.png"
          title="This weapon uses special ammo."
          alt=""
        />
      `;

    if (weaponAmmoType === 3)
      return `
        <img
          class="details__element--ammotype"
          src="https://i.ibb.co/SvpXTVr/heavy-ammo-icon.png"
          title="This weapon uses heavy ammo."
          alt=""
        />
      `;
  }

  _weaponPerksMarkup(weaponSocketArray) {
    const weaponPerksArray = weaponSocketArray.filter(
      (socket) =>
        socket.itemTypeDisplayName === "Scope" ||
        socket.itemTypeDisplayName === "Barrel" ||
        socket.itemTypeDisplayName === "Magazine" ||
        socket.itemTypeDisplayName === "Trait" ||
        socket.itemTypeDisplayName === "Origin Trait" ||
        socket.itemTypeDisplayName === "Battery" ||
        socket.itemTypeDisplayName === "Arrow" ||
        socket.itemTypeDisplayName === "Bowstring" ||
        socket.itemTypeDisplayName === "Haft" ||
        socket.itemTypeDisplayName === "Enhanced Trait" ||
        socket.itemTypeDisplayName === "Blade" ||
        socket.itemTypeDisplayName === "Guard"
    );

    if (weaponPerksArray.length > 0) {
      return weaponPerksArray
        .map((weaponPerk) => {
          return `
            <div class="weapon-perk">
              <img
                class="weapon-perk__icon"
                src="${B_URL}${weaponPerk.icon}"
                alt=""
                title="${weaponPerk.name}\n${weaponPerk.description}"
              />
            </div>
          `;
        })
        .join("");
    }

    // if (weaponPerksArray && weaponPerksArray.length > 0) {
    //   const filteredWeaponPerksArray = weaponPerksArray.filter(
    //     (weaponPerk) => weaponPerk.isVisible === true
    //   );

    //   return filteredWeaponPerksArray
    //     .map((weaponPerk) => {
    //       return `
    // <div class="weapon-perk">
    //   <img
    //     class="weapon-perk__icon"
    //     src="${B_URL}${weaponPerk.icon}"
    //     alt=""
    //     title="${weaponPerk.name}\n${weaponPerk.description}"
    //   />
    // </div>
    //     `;
    //     })
    //     .join("");
    // }
  }

  _weaponStatsMarkup(weaponStatsArray) {
    if (weaponStatsArray.length > 0) {
      return weaponStatsArray
        .map((stat) => {
          return `
            <div class="stat">
              <div class="stat__name">${stat.name}</div>
                <div class="stat__visual">
                  <div style="width: ${stat.value}%" class="stat__visual--amount"></div>
                </div>
              <div class="stat__amount">${stat.value}</div>
            </div>
            `;
        })
        .join("");
    }
  }

  _weaponFrameDetailsMarkup(statsArray) {
    if (statsArray && statsArray.length > 0) {
      const impactIndex = statsArray.findIndex(
        (stat) => stat.name === "Impact"
      );
      const impact = statsArray[impactIndex].value;

      if (this._data.itemInfo.itemTypeAndTierDisplayName.includes("Bow")) {
        const drawTimeIndex = statsArray.findIndex(
          (stat) => stat.name === "Draw Time"
        );

        const drawTime = statsArray[drawTimeIndex].value;

        return `${drawTime}ms / ${impact} impact`;
      }

      if (this._data.itemInfo.itemTypeAndTierDisplayName.includes("Fusion")) {
        const chargeTimeIndex = statsArray.findIndex(
          (stat) => stat.name === "Charge Time"
        );
        const chargeTime = statsArray[chargeTimeIndex].value;

        return `${chargeTime}ms / ${impact} impact`;
      }

      if (this._data.itemInfo.itemTypeAndTierDisplayName.includes("Sword")) {
        return "";
      }

      const roundsPerMinuteIndex = statsArray.findIndex(
        (stat) => stat.name === "RPM"
      );
      const roundsPerMinute = statsArray[roundsPerMinuteIndex].value;

      return `${roundsPerMinute}rpm / ${impact} impact`;
    }

    return "Penis Macedonovic";
  }

  _generateMarkup() {
    if (this._data.itemRarityType === "exotic_armor") {
      return `
        <div
          class="overlay__item-view--exotic-armor-details overlay__item-view-details"
        >
          <div
            class="item-exotic-armor-details__header item-view-details__header"
          >
            <div class="exotic-armor-details__icon item__icon">
              <img
                class="exotic-armor-details__icon--icon item__icon--icon"
                src="${B_URL}${this._data.itemInfo.icon}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${B_URL}${this._data.itemInfo.iconWatermark}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${this._itemStateMarkup(
                  this._data.itemInstanceInfo.state
                )}"
                alt=""
              />
            </div>
            <div class="exotic-armor-details__details item-details__details">
              <div class="item-details__details--name-type">
                <p class="details__name">${this._data.itemInfo.name}</p>
                <p class="details__type">${
                  this._data.itemInfo.itemTypeAndTierDisplayName
                }</p>
              </div>
              <div class="item-details__details--element-lvl">
                <div class="details__element">
                  <img
                    class="details__element--element"
                    src="${B_URL}${this._data.itemInstanceInfo.energyType.icon}"
                    alt=""
                  />
                  <p class="details__energy">${
                    this._data.itemInstanceInfo.energyType.energyCapacity
                  } Energy</p>
                </div>
                <div class="details__level">
                  <p class="details__level">✦ ${
                    this._data.itemInstanceInfo.level
                  }</p>
                </div>
              </div>
            </div>
          </div>
          <div class="item-view-details__source">
            <p class="item-view-details__source--source">
              ${this._data.itemInfo.flavorText}
            </p>
          </div>
          <div class="item-view-details__stats">
            <div class="details__stats--stats-container">
              ${this._itemStats(this._data.itemInstanceInfo.stats)}
              <div class="stat">
                <div class="stat__name">Total</div>
                <div class="stat__amount">${
                  this._data.itemInstanceInfo.statsTotal
                }</div>
              </div>
            </div>
          </div>
          <div class="item-view-details__perk">
            <div class="item-view-details__perk--icon">
              <img
                src="${B_URL}${this._data.itemInstanceInfo.sockets[11].icon}"
                alt=""
                class="perk__icon"
                title="${this._data.itemInstanceInfo.sockets[11].name} Icon"
              />
            </div>
            <div class="item-view-details__perk--description">
              <p class="perk__description--title">${
                this._data.itemInstanceInfo.sockets[11].name
              }</p>
              <p class="perk__description--body">
              ${this._data.itemInstanceInfo.sockets[11].description}
              </p>
            </div>
          </div>
          <div class="item-view-details__mods-cosmetics">
            <div class="item-view-details__mods">
              <div class="item-view-details__mods--title details__title">
                Armor Mods
              </div>
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
                ${this._armorModsMarkup(
                  this._data.itemInstanceInfo.sockets.slice(0, 4)
                )}
              </div>
            </div>
            <div class="item-view-details__cosmetics">
              <div class="item-view-details__mods--title details__title">
                Armor Cosmetics
              </div>
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
              ${this._armorCosmeticsMarkup([
                this._data.itemInstanceInfo.sockets[4],
                this._data.itemInstanceInfo.sockets[10],
              ])}
              </div>
            </div>
          </div>
        </div>
        <div
          style="background-image: url('${B_URL}${
        this._data.itemInfo.screenshot
      }');"
          class="overlay__item-view--item-screenshot overlay__item-view-screenshot"
        ></div>
      `;
    }

    if (this._data.itemRarityType === "legendary_armor") {
      return `
          <div
          class="overlay__item-view--exotic-armor-details overlay__item-view-details"
        >
          <div
            class="item-exotic-armor-details__header item-view-details__header"
          >
            <div class="exotic-armor-details__icon item__icon">
              <img
                class="exotic-armor-details__icon--icon item__icon--icon"
                src="${B_URL}${this._data.itemInfo.icon}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${B_URL}${this._data.itemInfo.iconWatermark}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${this._itemStateMarkup(
                  this._data.itemInstanceInfo.state
                )}"
                alt=""
              />
            </div>
            <div class="exotic-armor-details__details item-details__details">
              <div class="item-details__details--name-type">
                <p class="details__name">${this._data.itemInfo.name}</p>
                <p class="details__type">${
                  this._data.itemInfo.itemTypeAndTierDisplayName
                }</p>
              </div>
              <div class="item-details__details--element-lvl">
                <div class="details__element">
                  <img
                    class="details__element--element"
                    src="${B_URL}${this._data.itemInstanceInfo.energyType.icon}"
                    alt=""
                  />
                  <p class="details__energy">${
                    this._data.itemInstanceInfo.energyType.energyCapacity
                  } Energy</p>
                </div>
                <div class="details__level">
                  <p class="details__level">✦ ${
                    this._data.itemInstanceInfo.level
                  }</p>
                </div>
              </div>
            </div>
          </div>
          <div class="item-view-details__source">
            <p class="item-view-details__source--source">
              ${this._data.itemInfo.flavorText}
            </p>
          </div>
          <div class="item-view-details__stats">
            <div class="details__stats--stats-container">
              ${this._itemStats(this._data.itemInstanceInfo.stats)}
              <div class="stat">
              <div class="stat__name">Total</div>
              <div class="stat__amount">${
                this._data.itemInstanceInfo.statsTotal
              }</div>
            </div>
            </div>
          </div>
          <div class="item-view-details__mods-cosmetics">
            <div class="item-view-details__mods">
              <div class="item-view-details__mods--title details__title">
                Armor Mods
              </div>
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
                ${this._armorModsMarkup(
                  this._data.itemInstanceInfo.sockets.slice(0, 4)
                )}
              </div>
            </div>
            <div class="item-view-details__cosmetics">
              <div class="item-view-details__mods--title details__title">
                Armor Cosmetics
              </div>
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
              ${this._armorCosmeticsMarkup([
                this._data.itemInstanceInfo.sockets[4],
                this._data.itemInstanceInfo.sockets[10],
              ])}
              </div>
            </div>
          </div>
        </div>
        <div
          style="background-image: url('${B_URL}${
        this._data.itemInfo.screenshot
      }');"
          class="overlay__item-view--item-screenshot overlay__item-view-screenshot"
        ></div>
      `;
    }

    if (this._data.itemRarityType === "rare_armor") {
      return `
          <div
          class="overlay__item-view--exotic-armor-details overlay__item-view-details"
        >
          <div
            class="item-exotic-armor-details__header item-view-details__header"
          >
            <div class="exotic-armor-details__icon item__icon">
              <img
                class="exotic-armor-details__icon--icon item__icon--icon"
                src="${B_URL}${this._data.itemInfo.icon}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${B_URL}${this._data.itemInfo.iconWatermark}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${this._itemStateMarkup(
                  this._data.itemInstanceInfo.state
                )}"
                alt=""
              />
            </div>
            <div class="exotic-armor-details__details item-details__details">
              <div class="item-details__details--name-type">
                <p class="details__name">${this._data.itemInfo.name}</p>
                <p class="details__type">${
                  this._data.itemInfo.itemTypeAndTierDisplayName
                }</p>
              </div>
              <div class="item-details__details--element-lvl">
                <div class="details__element">
                  <img
                    class="details__element--element"
                    src="${B_URL}${this._data.itemInstanceInfo.energyType.icon}"
                    alt=""
                  />
                  <p class="details__energy">${
                    this._data.itemInstanceInfo.energyType.energyCapacity
                  } Energy</p>
                </div>
                <div class="details__level">
                  <p class="details__level">✦ ${
                    this._data.itemInstanceInfo.level
                  }</p>
                </div>
              </div>
            </div>
          </div>
          <div class="item-view-details__source">
            <p class="item-view-details__source--source">
              ${this._data.itemInfo.flavorText}
            </p>
          </div>
          <div class="item-view-details__stats">
            <div class="details__stats--stats-container">
              ${this._itemStats(this._data.itemInstanceInfo.stats)}
              <div class="stat">
                <div class="stat__name">Total</div>
                <div class="stat__amount">${
                  this._data.itemInstanceInfo.statsTotal
                }</div>
            </div>
            </div>
          </div>
          <div class="item-view-details__mods-cosmetics">
            <div class="item-view-details__mods">
              <div class="item-view-details__mods--title details__title">
                Armor Mods
              </div>
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
                ${this._armorModsMarkup(
                  this._data.itemInstanceInfo.sockets.slice(0, 2)
                )}
              </div>
            </div>
            <div class="item-view-details__cosmetics">
              <div class="item-view-details__mods--title details__title">
                Armor Cosmetics
              </div>
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
              ${this._armorCosmeticsMarkup([
                this._data.itemInstanceInfo.sockets[4],
              ])}
              </div>
            </div>
          </div>
        </div>
        <div
          style="background-image: url('${B_URL}${
        this._data.itemInfo.screenshot
      }');"
          class="overlay__item-view--item-screenshot overlay__item-view-screenshot"
        ></div>
      `;
    }

    if (
      this._data.itemRarityType === "common_armor" ||
      this._data.itemRarityType === "uncommon_armor"
    ) {
      return `
          <div
          class="overlay__item-view--exotic-armor-details overlay__item-view-details"
        >
          <div
            class="item-exotic-armor-details__header item-view-details__header"
          >
            <div class="exotic-armor-details__icon item__icon">
              <img
                class="exotic-armor-details__icon--icon item__icon--icon"
                src="${B_URL}${this._data.itemInfo.icon}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${B_URL}${this._data.itemInfo.iconWatermark}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${this._itemStateMarkup(
                  this._data.itemInstanceInfo.state
                )}"
                alt=""
              />
            </div>
            <div class="exotic-armor-details__details item-details__details">
              <div class="item-details__details--name-type">
                <p class="details__name">${this._data.itemInfo.name}</p>
                <p class="details__type">${
                  this._data.itemInfo.itemTypeAndTierDisplayName
                }</p>
              </div>
              <div class="item-details__details--element-lvl">
                <div class="details__level">
                  <p class="details__level">✦ ${
                    this._data.itemInstanceInfo.level
                  }</p>
                </div>
              </div>
            </div>
          </div>
          <div class="item-view-details__source">
            <p class="item-view-details__source--source">
              ${this._data.itemInfo.flavorText}
            </p>
          </div>
          <div class="item-view-details__stats">
            <div class="details__stats--stats-container">
              ${this._itemStats(this._data.itemInstanceInfo.stats)}
              <div class="stat">
                <div class="stat__name">Total</div>
                <div class="stat__amount">${
                  this._data.itemInstanceInfo.statsTotal
                }</div>
              </div>
            </div>
          </div>
          <div class="item-view-details__mods-cosmetics">
          <div class="item-view-details__mods">
            <div class="item-view-details__mods--title details__title">
              Armor Mods
            </div>
            <div
              class="item-view-details__mods--mods-container slot__container"
            >
              ${this._armorModsMarkup(
                this._data.itemInstanceInfo.sockets
                  ? this._data.itemInstanceInfo.sockets.slice(0, 2)
                  : undefined
              )}
            </div>
          </div>
          <div class="item-view-details__cosmetics">
            <div class="item-view-details__mods--title details__title">
              Armor Cosmetics
            </div>
            <div
              class="item-view-details__mods--mods-container slot__container"
            >
            ${this._armorCosmeticsMarkup(
              this._data.itemInstanceInfo.sockets
                ? [this._data.itemInstanceInfo.sockets[4]]
                : undefined
            )}
            </div>
          </div>
        </div>
        </div>
        <div
          style="background-image: url('${B_URL}${
        this._data.itemInfo.screenshot
      }');"
          class="overlay__item-view--item-screenshot overlay__item-view-screenshot"
        ></div>
      `;
    }

    if (this._data.itemRarityType === "legendary_weapons") {
      return `
        <div
          class="overlay__item-view--exotic-armor-details overlay__item-view-details"
        >
          <div
            class="item-exotic-armor-details__header item-view-details__header"
          >
            <div class="exotic-armor-details__icon item__icon">
              <img
                class="exotic-armor-details__icon--icon item__icon--icon"
                src="${B_URL}${this._data.itemInfo.icon}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${B_URL}${this._data.itemInfo.iconWatermark}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--masterwork item__icon--masterwork"
                src="${this._itemStateMarkup(
                  this._data.itemInstanceInfo.state
                )}"
                alt=""
              />
            </div>
            <div class="exotic-armor-details__details item-details__details">
              <div class="item-details__details--name-type">
                <p class="details__name">${this._data.itemInfo.name}</p>
                <p class="details__type">${
                  this._data.itemInfo.itemTypeAndTierDisplayName
                }</p>
              </div>
              <div class="item-details__details--element-lvl">
                <div class="details__element">
                  <img
                    class="details__element--element"
                    src="${B_URL}${this._data.itemInstanceInfo.damageType.icon}"
                    title="${this._data.itemInstanceInfo.damageType.name} // ${
        this._data.itemInstanceInfo.damageType.description
      }"
                    alt=""
                  />
                  ${this._weaponAmmoTypeMarkup(this._data.itemInfo.ammoType)}
                </div>
                <div class="details__level">
                  <p class="details__level">✦ ${
                    this._data.itemInstanceInfo.level
                  }</p>
                </div>
              </div>
            </div>
          </div>
          <div class="item-view-details__source">
            <p class="item-view-details__source--source">
              ${this._data.itemInfo.flavorText}
            </p>
          </div>
          <div class="item-view-details__stats">
            <div class="details__stats--stats-container">
                ${this._weaponStatsMarkup(this._data.itemInstanceInfo.stats)}
            </div>
          </div>
          <div class="item-view-details__perks">
            <div class="details__perks--perks-container">
                    ${this._weaponPerksMarkup(
                      this._data.itemInstanceInfo.sockets
                    )}
            </div>
          </div>
          <div class="item-view-details__mods-cosmetics">
            <div class="item-view-details__mods">
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
                <div title="${this._data.itemInstanceInfo.sockets[0].name}\n${
        this._data.itemInstanceInfo.sockets[0].description
      }" class="frame">
                  <img
                    src="${B_URL}${this._data.itemInstanceInfo.sockets[0].icon}"
                    alt=""
                    class="frame__icon"
                  />
                  <div class="frame__text">
                    <p class="frame__text--title">${
                      this._data.itemInstanceInfo.sockets[0].name
                    }</p>
                    <p class="frame__text--details">${this._weaponFrameDetailsMarkup(
                      this._data.itemInstanceInfo.stats
                    )}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="item-view-details__cosmetics">
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
                      ${this._weaponModsMarkup(
                        this._data.itemInstanceInfo.sockets
                      )}
              </div>
            </div>
          </div>
        </div>
        <div
        style="background-image: url('${B_URL}${
        this._data.itemInfo.screenshot
      }');"
        class="overlay__item-view--item-screenshot"
      ></div>
      `;
    }

    if (this._data.itemRarityType === "exotic_weapons") {
      return `
      <p class="wip">Exotic Weapon Item View (WIP)</p>
      `;
    }

    if (
      this._data.itemRarityType.includes("misc") &&
      this._data.itemInfo.itemTypeAndTierDisplayName.includes("Ghost")
    ) {
      return `
        <div
          class="overlay__item-view--exotic-armor-details overlay__item-view-details"
        >
          <div
            class="item-exotic-armor-details__header item-view-details__header"
          >
            <div class="exotic-armor-details__icon item__icon">
              <img
                class="exotic-armor-details__icon--icon item__icon--icon"
                src="${B_URL}${this._data.itemInfo.icon}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${B_URL}${this._data.itemInfo.iconWatermark}"
                alt=""
              />
              <img
                class="exotic-armor-details__icon--border item__icon--border"
                src="${this._itemStateMarkup(
                  this._data.itemInstanceInfo.state
                )}"
                alt=""
              />
            </div>
            <div class="exotic-armor-details__details item-details__details">
              <div class="item-details__details--name-type">
                <p class="details__name">${this._data.itemInfo.name}</p>
                <p class="details__type">${
                  this._data.itemInfo.itemTypeAndTierDisplayName
                }</p>
              </div>
              <div class="item-details__details--element-lvl">
                <div class="details__element">
                  <p class="details__energy">${
                    this._data.itemInstanceInfo.energyType.energyCapacity
                  } Energy</p>
                </div>
              </div>
            </div>
          </div>
          <div class="item-view-details__source">
            <p class="item-view-details__source--source">
              ${this._data.itemInfo.flavorText}
            </p>
          </div>
          <div class="item-view-details__mods-cosmetics">
            <div class="item-view-details__mods">
              <div class="item-view-details__mods--title details__title">
                Ghost Mods
              </div>
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
                ${this._armorModsMarkup(
                  this._data.itemInstanceInfo.sockets.slice(2, 7)
                )}
              </div>
            </div>
            <div class="item-view-details__cosmetics">
              <div class="item-view-details__mods--title details__title">
                Ghost Cosmetics
              </div>
              <div
                class="item-view-details__mods--mods-container slot__container"
              >
              ${this._armorCosmeticsMarkup([
                this._data.itemInstanceInfo.sockets[0],
                this._data.itemInstanceInfo.sockets[1],
              ])}
              </div>
            </div>
          </div>
        </div>
        <div
          style="background-image: url('${B_URL}${
        this._data.itemInfo.screenshot
      }');"
          class="overlay__item-view--item-screenshot misc__screenshot"
        ></div>
      `;
    }

    if (
      this._data.itemRarityType.includes("misc") &&
      this._data.itemInfo.itemTypeAndTierDisplayName.includes("Ship")
    ) {
      return `
        <div
        class="overlay__item-view--exotic-armor-details overlay__item-view-details"
      >
        <div
          class="item-exotic-armor-details__header item-view-details__header"
        >
          <div class="exotic-armor-details__icon item__icon">
            <img
              class="exotic-armor-details__icon--icon item__icon--icon"
              src="${B_URL}${this._data.itemInfo.icon}"
              alt=""
            />
            <img
              class="exotic-armor-details__icon--border item__icon--border"
              src="${B_URL}${this._data.itemInfo.iconWatermark}"
              alt=""
            />
            <img
              class="exotic-armor-details__icon--border item__icon--border"
              src="${this._itemStateMarkup(this._data.itemInstanceInfo.state)}"
              alt=""
            />
          </div>
          <div class="exotic-armor-details__details item-details__details">
            <div class="item-details__details--name-type">
              <p class="details__name">${this._data.itemInfo.name}</p>
              <p class="details__type">${
                this._data.itemInfo.itemTypeAndTierDisplayName
              }</p>
            </div>
          </div>
        </div>
        <div class="item-view-details__source">
          <p class="item-view-details__source--source">
            ${this._data.itemInfo.flavorText}
          </p>
        </div>
        <div class="item-view-details__mods-cosmetics">
          <div class="item-view-details__mods">
            <div class="item-view-details__mods--title details__title">
              Ghost Mods
            </div>
            <div
              class="item-view-details__mods--mods-container slot__container"
            >
              ${this._armorModsMarkup()}
            </div>
          </div>
          <div class="item-view-details__cosmetics">
            <div class="item-view-details__mods--title details__title">
              Ghost Cosmetics
            </div>
            <div
              class="item-view-details__mods--mods-container slot__container"
            >
            ${this._armorCosmeticsMarkup([
              this._data.itemInstanceInfo.sockets[0],
              this._data.itemInstanceInfo.sockets[1],
            ])}
            </div>
          </div>
        </div>
      </div>
      <div
        style="background-image: url('${B_URL}${
        this._data.itemInfo.screenshot
      }');"
        class="overlay__item-view--item-screenshot misc__screenshot"
      ></div>
      `;
    }

    if (
      this._data.itemRarityType.includes("misc") &&
      this._data.itemInfo.itemTypeAndTierDisplayName.includes("Vehicle")
    ) {
      return `
      <p class="wip">Sparrow Item View (WIP)</p>
      `;
    }

    return `<p class="wip">Item View for this item category<br> has not been implemented yet!</p>`;
  }
}

export default new ItemIView();
