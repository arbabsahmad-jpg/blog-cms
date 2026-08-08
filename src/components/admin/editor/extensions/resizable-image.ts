import TiptapImage from "@tiptap/extension-image";

export const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        renderHTML: (attributes) => ({
          style: `width: ${attributes.width}; height: auto;`,
        }),
        parseHTML: (element) => element.style.width || "100%",
      },
    };
  },
});
