import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCaretDown,
  faMagnifyingGlass,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import "./style.css";
import App from "./App.vue";

library.add(faCaretDown, faMagnifyingGlass, faX);

createApp(App).mount("#app");
