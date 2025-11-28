export class StringUtil {
  static toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  static toKebabCase(str: string): string {
    return (
      str
        // Insert hyphen between lowercase and uppercase letters
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        // Remove all non-alphanumeric characters except hyphens
        .replace(/[^a-zA-Z0-9-]/g, "")
        // Convert to lowercase
        .toLowerCase()
        // Replace multiple hyphens with single hyphen
        .replace(/-+/g, "-")
        // Remove leading and trailing hyphens
        .replace(/^-+|-+$/g, "")
    );
  }

  static createElementId(componentName: string, ...args: (string | number)[]) {
    const kebabComponentName = this.toKebabCase(componentName);
    const kebabArgs = args.map((arg) => this.toKebabCase(arg.toString()));
    return [kebabComponentName, ...kebabArgs].join("-");
  }

  static getHighlightParts(
    text: string,
    searchValue: string,
  ): { text: string; isMatch: boolean }[] {
    if (!searchValue) return [{ text, isMatch: false }];

    const escapedSearch = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedSearch})`, "gi");
    const parts = text.split(regex);

    return parts.map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === searchValue.toLowerCase(),
    }));
  }

  static wildCardSearch(list: any[], input: string): any[] {
    const searchText = (item: any, level: number): any => {
      let hasMatch = false;
      let filteredItem = { ...item };

      for (let key in item) {
        if (item[key] == null) continue;

        if (Array.isArray(item[key])) {
          const filteredArray = item[key]
            .map((subItem: any) =>
              typeof subItem === "object" && subItem !== null
                ? searchText(subItem, level + 1)
                : subItem.toString().toUpperCase().includes(input.toUpperCase())
                  ? subItem
                  : null,
            )
            .filter(Boolean);

          if (filteredArray.length > 0) {
            filteredItem[key] = filteredArray;
            hasMatch = true;
          } else {
            delete filteredItem[key];
          }
        } else if (typeof item[key] === "object") {
          const nestedMatch = searchText(item[key], level + 1);

          if (nestedMatch) {
            filteredItem[key] = nestedMatch;
            hasMatch = true;
          } else {
            delete filteredItem[key];
          }
        } else if (item[key].toString().toUpperCase().includes(input.toUpperCase())) {
          hasMatch = true;
        }
      }

      if (hasMatch && level === 0) {
        return item;
      }

      return hasMatch ? filteredItem : null;
    };

    return list.map((value) => searchText(value, 0)).filter(Boolean);
  }
}
