import { AboutSection } from "./components/AboutSection";
import { ChatPanel } from "./components/ChatPanel";
import { Header } from "./components/Header";

function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
        <Header />
        <section className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <ChatPanel className="h-[28rem]" />
        </section>
        <AboutSection />
      </main>
    </div>
  );
}

export default App;
