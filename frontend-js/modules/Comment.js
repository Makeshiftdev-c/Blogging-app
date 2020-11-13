export default class FocusControl {
  constructor() {
    this.toggleCreateBtn = document.querySelector("#comment-icon");
    this.createWrapper = document.querySelector(".create-comment-wrapper");
    this.createField = document.querySelector("#create-comment-field");
    this.editCommentBtns = document.querySelectorAll("#edit-comment");
    this.editCommentFields = document.querySelectorAll(".edit-comment-field");
    this.events();
  }

  //Events
  events() {
    this.toggleCreateBtn.addEventListener("click", () => {
      this.createHandler();
    });
    this.editCommentBtns.forEach((Btn) =>
      Btn.addEventListener("click", (event) => {
        let element = event.target.closest(".edit-comment");
        this.editHandler(element.getAttribute("aria-controls"));
      })
    );
  }

  //Methods
  createHandler() {
    if (!this.createWrapper.classList.contains("show")) {
      setTimeout(() => {
        this.createField.focus();
      }, 330);
    }
  }
  editHandler(identifier) {
    let wrapper = document.querySelector(`div #${identifier}`);
    let id = identifier.substring("collapse".length);
    let textArea = document.querySelector(`#ident${id}`);
    if (wrapper.classList.contains("show")) {
      setTimeout(() => {
        textArea.selectionStart = textArea.selectionEnd = textArea.value.length;
        textArea.focus();
      }, 300);
    }
  }
}
