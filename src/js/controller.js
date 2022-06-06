import * as model from "./model";

import BodyView from "./BodyView";
import SearchView from "./SearchView";
import AccountInfoView from "./AccountInfoView";
import RefreshView from "./RefreshView";
import CharacterInfoView from "./CharacterInfoView";
import ItemView from "./ItemView";

const controlSearch = async function () {
  try {
    model.state.searchQuery = SearchView.getQuery();
    const id = window.location.hash.slice(1);

    if (!model.state.searchQuery && !id) return;

    AccountInfoView.clear();
    CharacterInfoView.clear();

    AccountInfoView.renderSpinner();

    if (model.state.searchQuery) {
      await model.findAccountByName(model.state.searchQuery);
    } else if (id) {
      await model.findAccountById(id);
    }

    window.location.hash = model.state.account.membershipId;

    await model.getProfileInfo(model.state.account);
    await model.getSeasonPassRank(model.state.account);

    model.calculateTimePlayed(model.state.account.characters);

    AccountInfoView.render(model.state.account);

    CharacterInfoView.renderSpinner();

    await model.formatCharacterInfo(model.state.account.characters);
    await model.getEquipmentInfo(model.state.account);
    await model.formatEquipmentInfo(model.state.account.characters);
    await model.getEquipmentInstanceInfo(model.state.account.characters);

    model.setDefaultEquipmentView(model.state.account.characters);
    model.setDefaultCardView(model.state.account.characters);

    CharacterInfoView.render(model.state.account.characters);

    console.log(model.state);
  } catch (error) {
    AccountInfoView.renderError();
    console.error(error);
  }
};

const controlChangeEquipmentView = function (characterIndex, equipmentType) {
  model.setEquipmentView(characterIndex, equipmentType);
  CharacterInfoView.render(model.state.account.characters);
};

const controlChangeCardView = function (characterIndex, cardViewValue) {
  model.setCardView(characterIndex, cardViewValue);
  CharacterInfoView.render(model.state.account.characters);
};

const controlShowItemView = async function (
  characterIndex,
  itemHash,
  itemInstanceId,
  itemType
) {
  try {
    CharacterInfoView.showItemView();

    ItemView.renderSpinner();

    await model.getItemInfo(characterIndex, itemHash, itemInstanceId, itemType);
    await model.formatItemInfo(model.state.itemView);

    ItemView.render(model.state.itemView);

    console.log(model.state.itemView);
  } catch (error) {
    ItemView.renderError(`We couldn't load the info for the selected item.`);
    console.log(error);
  }
};

const init = function () {
  SearchView.addHandlerSearch(controlSearch);
  BodyView.addHandlerSearchOnLoad(controlSearch);
  RefreshView.addHandlerRefresh(controlSearch);
  CharacterInfoView.addHandlerChangeEquipmentView(controlChangeEquipmentView);
  CharacterInfoView.addHandlerChangeCardView(controlChangeCardView);
  CharacterInfoView.addHandlerGetItemInfo(controlShowItemView);
};

init();
