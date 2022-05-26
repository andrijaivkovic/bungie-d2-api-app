class BodyView {
  _parentElement = document.querySelector(".body__container");

  addHandlerSearchOnLoad(handler) {
    window.addEventListener("load", function () {
      handler();
    });
  }
}

export default new BodyView();
