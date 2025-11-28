export class DataUtil {
  /**
   * Transform data by replacing image URLs with API URL
   * @param data The data to transform
   * @returns Transformed data with updated image URLs
   */
  static transformData<T>(data: T): T {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.transformData(item)) as T;
    }

    // Handle objects
    if (typeof data === "object") {
      const transformed = { ...data };
      for (const key in transformed) {
        if (Object.prototype.hasOwnProperty.call(transformed, key)) {
          transformed[key] = this.transformData(transformed[key]);
        }
      }
      return transformed as T;
    }

    // Handle strings
    if (typeof data === "string") {
      // Check if it's an image URL
      if (data.includes("/uploads/images/")) {
        // If it's already a full URL, return as is
        if (data.startsWith("http")) {
          return data as T;
        }

        // For relative URLs, encode the path and combine with API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
        const imagePath = data.startsWith("/") ? data : `/${data}`;
        const encodedPath = imagePath
          .split("/")
          .map((part) => encodeURIComponent(part))
          .join("/");
        return `${apiUrl}/api/${encodedPath}` as T;
      }
    }

    return data;
  }
}
