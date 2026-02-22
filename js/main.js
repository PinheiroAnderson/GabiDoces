import { navBarComponentTemplate } from "./../components/nav.component/nav.component.js";

import { footerComponentTemplate } from "./../components/footer.component/footer.component.js";

navBarComponentTemplate();
footerComponentTemplate();

function getElement(elementSelector) {
  return document.querySelector(elementSelector);
}

function setContentElement(elementSelector, content) {
  const element = getElement(elementSelector);

  if (element) {
    element.innerHTML = content;
  }
}
