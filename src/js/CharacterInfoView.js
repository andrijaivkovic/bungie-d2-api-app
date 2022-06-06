import View from "./View.js";
import { B_URL } from "./config.js";

class CharacterViewInfo extends View {
  _overlay = document.querySelector(".overlay");
  _overlayBackground = document.querySelector(".overlay__background");
  _overlayItemView = document.querySelector(".overlay__item-view");

  showItemView() {
    this._overlay.classList.remove("hide");
    this._overlayBackground.classList.remove("hide");
    this._overlayItemView.classList.remove("hide");
  }

  addHandlerGetItemInfo(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const item = e.target.closest(".item");
      const itemView = e.target.closest(".card__weapons");
      const card = e.target.closest(".card");

      if (!item) return;

      const itemHash = item.dataset.itemHash;
      const itemInstanceId = item.dataset.itemInstanceId;
      const itemType = itemView.dataset.itemType;
      const characterIndex = card.dataset.character;

      handler(characterIndex, itemHash, itemInstanceId, itemType);
    });
  }

  _parentElement = document.querySelector(".cards");
  _errorMessage = "We could load your characters. Please try again!";
  _message = "";

  addHandlerChangeCardView(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const cardHeader = e.target.closest(".card__header");
      const card = e.target.closest(".card");

      if (!cardHeader) return;

      const cardView = +card.dataset.cardView === 0 ? 1 : 0;
      const characterIndex = card.dataset.character;

      handler(characterIndex, cardView);
    });
  }

  addHandlerChangeEquipmentView(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const typeButton = e.target.closest(".type");
      const card = e.target.closest(".card");

      if (!typeButton) return;

      const equipmentType = typeButton.dataset.type;
      const characterIndex = card.dataset.character;

      handler(characterIndex, equipmentType);
    });
  }

  _formatTimePlayed(timePlayed) {
    return `${Math.floor(timePlayed / 60)}h ${timePlayed % 60}m`;
  }

  _generateItemMarkup(itemsArray) {
    return itemsArray
      .map((item) => {
        return `
          <div
            data-item-instance-id="${item.itemInstanceId}"
            data-item-hash="${item.itemHash}"
            class="card__weapons--weapon item"
          >
          <div class="weapons__weapon--image">
            <img class="weapon__icon" src="https://www.bungie.net${
              item.displayProperties.icon
            }" alt="" />
            <img class="weapon__icon" src="${B_URL}${
          item.iconWatermark
        }" alt="" />
          </div>
          <div class="weapons__weapon--text">
            <div class="weapon__text--top">
              <div class="weapon__text--name">${
                item.displayProperties.name
              }</div>
              <div class="weapon__text--level">✦ ${
                item.lightLevel ? item.lightLevel : "Leveln't"
              }</div>
            </div>
            <div class="weapon__text--bottom">
              <div class="weapon__text--type">${
                item.itemTypeAndTierDisplayName
              }</div>
            </div>
          </div>
        </div>
        `;
      })
      .join("");
  }

  _generateMarkup() {
    return this._data
      .map((character, characterIndex) => {
        return `
        <div data-card-view="${
          character.cardView
        }" data-character="${characterIndex}" class="card">
        <div class="card__header">
          <div class="card__header--image">
            <img src="https://www.bungie.net/${
              character.emblem
            }" alt="Character 1 Icon" />
          </div>
          <div class="card__header--text">
            <div class="header__text--top">
              <div class="header__text--class">${character.genderName} ${
          character.raceName
        } ${character.className}</div>
            </div>
            <div class="header__text--bottom">
              <div class="header__text--time">${this._formatTimePlayed(
                +character.minutesPlayedTotal
              )}</div>
              <div class="header__text--level">✦ ${character.light}</div>
            </div>
          </div>
        </div>
        <div class="card__title ${character.cardView === 0 ? "hide" : ""}">
          <div class="card__title--text">${character.titleName}</div>
        </div>
        <div class="card__equipment-type-select ${
          character.cardView === 0 ? "hide" : ""
        }">
          <div
            class="equipment-type-select__type type flex-start flex-33"
            data-type="weapons"
          >
            <div class="equipment-type-select__type--icon">
              <div class="icon-frame">
                <svg
                  class="icon weapons ${
                    character.equipmentView.type === "weapons"
                      ? "active-icon"
                      : ""
                  }"
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
          <div
            class="equipment-type-select__type type flex-center flex-67"
            data-type="armor"
          >
            <div class="equipment-type-select__type--icon">
              <div class="icon-frame">
                <svg
                  class="icon armor  ${
                    character.equipmentView.type === "armor"
                      ? "active-icon"
                      : ""
                  }"
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
          <div
            class="equipment-type-select__type type flex-end flex-33"
            data-type="misc"
          >
            <div class="equipment-type-select__type--icon">
              <div class="icon-frame">
                <svg
                  class="icon misc ${
                    character.equipmentView.type === "misc" ? "active-icon" : ""
                  }"
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
        <div data-item-type="${
          character.equipmentView.type
        }" class="card__weapons ${character.cardView === 0 ? "hide" : ""}">
        ${this._generateItemMarkup(character.equipmentView.items)}
        </div>
      </div>
      `;
      })
      .join("");
  }
}

export default new CharacterViewInfo();
