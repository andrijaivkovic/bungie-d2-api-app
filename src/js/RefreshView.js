import View from "./View";

class RefreshView extends View {
  _parentElement = document.querySelector(".refresh__btn");

  addHandlerRefresh(handler) {
    this._parentElement.addEventListener("click", function () {
      handler();
    });
  }
}

export default new RefreshView();
