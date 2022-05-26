import View from "./View.js";

class AccountInfoView extends View {
  _parentElement = document.querySelector(".account-info");

  _errorMessage = "We could not load your account info. Please try again!";

  _message = "";

  _formatTimePlayed(timePlayed) {
    return `${Math.floor(timePlayed / 60)}h ${timePlayed % 60}m`;
  }

  _formatLastSeen(lastSeen) {
    const lastOnlineTimestamp = new Date(lastSeen).getTime();
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
  }

  _generateMarkup() {
    return `
    <div class="account-info__name">
      <p class="account-info__name--text">${
        this._data.bungieGlobalDisplayName
      }<span>#${this._data.bungieGlobalDisplayNameCode}</span></p>
    </div>
    <div class="account-info__stats">
      <div class="account-info__stats--first account-info__stats--part">
        <div class="account-info__stat account-info__stats--active-triumph-score">
        <div class="stat__upper-text">
        ${this._data.activeScore.toLocaleString("en-US")}</div>
        <div class="stat__lower-text">Active Triumph</div>
        </div>
        <div class="account-info__stat account-info__stats--time-played">
        <div class="stat__upper-text">${this._formatTimePlayed(
          this._data.minutesPlayedTotal
        )}</div>
        <div class="stat__lower-text">Time Played</div>
        </div>
      </div>
      <div class="account-info__stats--second account-info__stats--part">
        <div class="account-info__stat account-info__stats--season-pass">
        <div class="stat__upper-text pass">✦ ${this._data.seasonPassRank}</div>
        <div class="stat__lower-text">Season Pass</div>
      </div>
      <div class="account-info__stat account-info__stats--last-seen">
      <div class="stat__upper-text">${this._formatLastSeen(
        this._data.dateLastPlayed
      )}</div>
      <div div class="stat__lower-text">Last Seen</div>
      </div>
    </div>
    </div>
    `;
  }
}

export default new AccountInfoView();
