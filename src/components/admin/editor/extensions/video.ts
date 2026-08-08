import { Node, mergeAttributes } from "@tiptap/core";

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (src: string) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: "video",
  group: "block",
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        controls: "true",
        style: "width:100%;border-radius:0.75rem;",
      }),
    ];
  },

  addCommands() {
    return {
      setVideo:
        (src: string) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs: { src } });
        },
    };
  },
});
