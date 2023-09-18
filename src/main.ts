import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCaretDown,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import "./style.css";
import App from "./App.vue";

library.add(faCaretDown, faMagnifyingGlass);

createApp(App).mount("#app");
