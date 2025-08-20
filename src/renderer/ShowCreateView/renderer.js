import "../js/sideBarResize";
import "./js/slideSelector";
import "./js/fileOpen";

import "bootstrap";
import "../ShowCreateView/index.scss";

import * as Sentry from "@sentry/electron/renderer";

Sentry.init({
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/electron/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [],
});

Sentry.setTag("type", "showCreator");
