import Search from "./modules/search";
import Chat from "./modules/chat";
import RegistrationForm from "./modules/registrationForm";
import Likes from "./modules/like";

if (document.querySelector(".header-search-icon")) {
  new Search();
}

if (
  document.querySelector("#user-post-interface") ||
  document.querySelector("#visitor-post-interface")
) {
  new Likes();
}

if (document.querySelector("#chat-wrapper")) {
  new Chat();
}

if (document.querySelector("#registration-form")) {
  new RegistrationForm();
}
