import axios from "axios";

export default class Likes {
  constructor() {
    this._csrf = document.querySelector('[name="_csrf"]').value;
    this.openBtn = document.querySelector("#info-icon");
    this.injectHTML();
    this.loader = document.querySelector(".circle-loader-modal");
    this.resultsArea = document.querySelector(".modal-body");
    this.events();
  }

  //Events
  events() {
    this.openBtn.addEventListener("click", (event) => {
      this.showLoader();
      this.sendRequest();
    });
  }

  //Methods
  sendRequest() {
    let path = window.location.pathname;
    let postId = String(path.slice(path.lastIndexOf("/") + 1, path.length));
    axios
      .post("/getLikers", {
        postId: postId,
        _csrf: this._csrf,
      })
      .then((response) => {
        console.log(response.data);
        this.renderResultsHTML(response.data);
      })
      .catch(() => {
        alert("Please try again later.");
      });
  }

  renderResultsHTML(users) {
    if (users.length) {
      this.resultsArea.innerHTML = `
      ${users
        .map((user) => {
          return `<a href="/profile/${user.username}" class="list-group-item list-group-item-action">
        <img class="avatar-tiny" src=${user.avatar}> ${user.username}
      </a>`;
        })
        .join("")}
      `;
    } else {
      this.resultsArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">Sorry, this post does not currently have any likes.</p>`;
    }
    this.hideLoader();
  }

  showLoader() {
    this.loader.classList.add("circle-loader-modal--visible");
  }

  hideLoader() {
    this.loader.classList.remove("circle-loader-modal--visible");
  }

  injectHTML() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="modal fade" id="exampleModalLong" tabindex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content bg-dark">
      <div class="modal-header">
        <h5 class="modal-title " id="exampleModalLongTitle">Liked by:</h5>
        <button type="button" class="modal-header-close gold" data-dismiss="modal" aria-label="Close">
          <i class="fas fa-times-circle"></i>
        </button>
      </div>
      <div class="modal-body bg-light list-group">
        <div class="circle-loader-modal"></div>
      </div>
    </div>
  </div>
</div>`
    );
  }
}
