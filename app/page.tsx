import EventForm from "./components/EventForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">イベント申し込みフォーム</h1>
        <EventForm />
      </main>
    </div>
  );
}
