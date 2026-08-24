import { AboutSection } from "./components/AboutSection";
import { ChatPanel } from "./components/ChatPanel";
import { Header } from "./components/Header";

function App() {
  return (
    <div className="bg-bg min-h-screen">
      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
        <Header />
        <div className="stagger-in" style={{ animationDelay: "1.3s" }}>
          <ChatPanel className="h-[28rem]" />
        </div>
        <div className="stagger-in" style={{ animationDelay: "1.5s" }}>
          <AboutSection />
        </div>
      </main>
    </div>
  );
}

export default App;
