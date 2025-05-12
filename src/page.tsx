import { RichTextEditor } from 'tiptap-shadcn-editor';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col w-full items-center ">
      <section
        id="basic-editor"
        className="w-full container py-12 scroll-mt-10"
      >
        <RichTextEditor className="w-full" />
      </section>
    </main>
  );
}
