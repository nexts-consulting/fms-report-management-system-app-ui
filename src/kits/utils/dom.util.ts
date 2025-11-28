export class DomUtil {
  static scrollToElementById(
    id: string,
    options: ScrollIntoViewOptions = {
      behavior: "smooth",
      block: "center",
    },
  ) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView(options);
    }
  }

  static scrollToElement(
    element: HTMLElement,
    options: ScrollIntoViewOptions = {
      behavior: "smooth",
      block: "center",
    },
  ) {
    element.scrollIntoView(options);
  }
}
