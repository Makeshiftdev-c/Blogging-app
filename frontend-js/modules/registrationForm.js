import axios from "axios";

export default class RegistrationForm {
  constructor() {
    this._csrf = document.querySelector('[name="_csrf"]').value;
    this.form = document.querySelector("#registration-form");
    this.allFields = document.querySelectorAll(
      "#registration-form .form-control"
    );
    this.insertValidationElements();
    this.username = document.querySelector("#username-register");
    this.username.previousValue = "";
    this.email = document.querySelector("#email-register");
    this.email.previousValue = "";
    this.password = document.querySelector("#password-register");
    this.password.previousValue = "";
    this.username.isUnique = false;
    this.email.isUnique = false;
    this.events();
  }

  // Events
  events() {
    this.username.addEventListener("keyup", () => {
      this.isEntry(this.username, this.usernameHandler);
    });
    this.email.addEventListener("keyup", () => {
      this.isEntry(this.email, this.emailHandler);
    });
    this.password.addEventListener("keyup", () => {
      this.isEntry(this.password, this.passwordHandler);
    });
    this.username.addEventListener("blur", () => {
      this.isEntry(this.username, this.usernameHandler);
    });
    this.email.addEventListener("blur", () => {
      this.isEntry(this.email, this.emailHandler);
    });
    this.password.addEventListener("blur", () => {
      this.isEntry(this.password, this.passwordHandler);
    });
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.formSubmitHandler();
    });
  }

  // Methods
  formSubmitHandler() {
    this.usernameImmediately();
    this.usernameAfterDelay();
    this.emailAfterDelay();
    this.passwordImmediately();
    this.passwordAfterDelay();

    if (
      this.username.isUnique &&
      !this.username.errors &&
      this.email.isUnique &&
      !this.email.errors &&
      !this.password.errors
    ) {
      this.form.submit();
    }
  }

  isEntry(element, handler) {
    if (element.previousValue != element.value) {
      handler.call(this);
    }
    element.previousValue = element.value;
  }

  usernameHandler() {
    this.username.errors = false;
    this.usernameImmediately();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(() => this.usernameAfterDelay(), 800);
  }

  emailHandler() {
    this.email.errors = false;
    clearTimeout(this.email.timer);
    this.email.timer = setTimeout(() => this.emailAfterDelay(), 800);
  }

  passwordHandler() {
    this.password.errors = false;
    this.passwordImmediately();
    clearTimeout(this.password.timer);
    this.password.timer = setTimeout(() => this.passwordAfterDelay(), 800);
  }

  usernameImmediately() {
    if (
      this.username.value != "" &&
      !/^([a-zA-Z0-9]+)$/.test(this.username.value)
    ) {
      this.showValidationError(
        this.username,
        "Username can only contain letters and numbers."
      );
    }

    if (this.username.value.length > 30) {
      this.showValidationError(
        this.username,
        "Username cannot exceed 30 characters."
      );
    }

    if (!this.username.errors) {
      this.hideValidationError(this.username);
    }
  }

  passwordImmediately() {
    if (this.password.value.length > 50) {
      this.showValidationError(
        this.password,
        "Password cannot exceed 50 characters."
      );
    }

    if (!this.password.errors) {
      this.hideValidationError(this.password);
    }
  }

  usernameAfterDelay() {
    if (this.username.value.length < 3) {
      this.showValidationError(
        this.username,
        "Username must be at least 3 characters."
      );
    }

    if (!this.username.errors) {
      axios
        .post("/doesUsernameExist", {
          username: this.username.value,
          _csrf: this._csrf,
        })
        .then((response) => {
          if (response.data) {
            this.showValidationError(
              this.username,
              "That username is already taken."
            );
            this.username.isUnique = false;
          } else {
            this.username.isUnique = true;
            this.showValidationSuccessCue(this.username);
          }
        })
        .catch(() => {
          console.log("Please try again later.");
        });
    }
  }

  emailAfterDelay() {
    if (!/^\S+@\S+$/.test(this.email.value)) {
      this.showValidationError(
        this.email,
        "You must provide a valid email address."
      );
    }

    if (!this.email.errors) {
      axios
        .post("/doesEmailExist", { email: this.email.value, _csrf: this._csrf })
        .then((response) => {
          if (response.data) {
            this.email.isUnique = false;
            this.showValidationError(
              this.email,
              "That email is already being used."
            );
          } else {
            this.email.isUnique = true;
            this.showValidationSuccessCue(this.email);
            this.hideValidationError(this.email);
          }
        })
        .catch(() => {
          console.log("Please try again later.");
        });
    }
  }

  passwordAfterDelay() {
    if (this.password.value.length < 8) {
      this.showValidationError(
        this.password,
        "Password must be at least 8 characters."
      );
    } else {
      this.showValidationSuccessCue(this.password);
    }
  }

  showValidationSuccessCue(element) {
    element.classList.add("form-control-success");
  }

  hideValidationSuccessCue(element) {
    element.classList.remove("form-control-success");
  }

  showValidationError(element, message) {
    this.hideValidationSuccessCue(element);
    element.classList.add("form-control-error");
    element.nextElementSibling.innerHTML = message;
    element.nextElementSibling.classList.add("liveValidateMessage--visible");
    element.errors = true;
  }

  hideValidationError(element) {
    element.classList.remove("form-control-error");
    element.nextElementSibling.classList.remove("liveValidateMessage--visible");
  }

  insertValidationElements() {
    this.allFields.forEach((element) => {
      element.insertAdjacentHTML(
        "afterend",
        "<div class='alert alert-danger small liveValidateMessage'></div>"
      );
    });
  }
}
