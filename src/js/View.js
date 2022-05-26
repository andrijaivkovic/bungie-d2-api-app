export default class View {
  _data;

  render(data) {
    this._data = data;
    const markup = this._generateMarkup();

    this.clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderSpinner() {
    const markup = `
          <div class="lds-ripple">
            <div></div>
            <div></div>
        `;
    this.clear();

    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
        <div class="wip">
          <p>${message}</p>
        </div>
        `;
    this.clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderMessage(message = this._message) {
    const markup = `
            <div class="message">
              <p>${message}</p>
            </div>
            `;
    this.clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  clear() {
    while (this._parentElement.firstChild) {
      this._parentElement.removeChild(this._parentElement.firstChild);
    }
  }
}
