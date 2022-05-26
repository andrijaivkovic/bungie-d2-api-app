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

  _armorModsMarkup(armorModsArray) {
    return armorModsArray
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

  _armorCosmeticsMarkup(armorCosmeticsArray) {
    return armorCosmeticsArray
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
              ${this._data.itemInfo.source}
            </p>
          </div>
          <div class="item-view-details__stats">
            <div class="details__stats--stats-container">
              ${this._itemStats(this._data.itemInstanceInfo.stats)}
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
              ${this._data.itemInfo.source}
            </p>
          </div>
          <div class="item-view-details__stats">
            <div class="details__stats--stats-container">
              ${this._itemStats(this._data.itemInstanceInfo.stats)}
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

    if (this._data.itemRarityType === "legendary_weapons") {
      return `
      <p class="wip">Legendary Weapon Item View (WIP)</p>
      `;
    }

    if (this._data.itemRarityType === "exotic_weapons") {
      return `
      <p class="wip">Exotic Weapon Item View (WIP)</p>
      `;
    }
  }
}

export default new ItemIView();
