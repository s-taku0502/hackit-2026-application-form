import EventForm from "./components/EventForm";
import DeadlineBanner from "./components/DeadlineBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-50 p-4 md:p-8">
      <main className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4">
            <p className="text-sm md:text-base text-amber-700 font-semibold tracking-wide">KIT Developers Hub</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-2 text-amber-900" style={{fontFamily: "'Noto Sans JP', sans-serif"}}>HacKit 2026</h1>
          <p className="text-lg md:text-xl text-amber-800 font-medium mb-2">繋がる、創る、超えていく。</p>
          <p className="text-amber-700 max-w-2xl mx-auto">プロジェクトの垣根を超えた交流型ハッカソン。金沢工業大学の14プロジェクトが連携し、1年生の早期スキルアップとコネクション形成、プロエンジニアとの共創を実現します。</p>
        </div>

        {/* Form */}
        <div className="bg-white bg-opacity-80 rounded-2xl shadow-xl p-6 md:p-10 border-4 border-amber-200">
          <DeadlineBanner />
          <EventForm />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-amber-700 text-sm">
          <p className="mb-2">スケジュール: キックオフ 2026.07.25 | ハッキング 2026.08.01-02 | 最終発表 2026.08.03</p>
          <p>ご質問は <a href="https://x.com/HacKit_KIT" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">@HacKit_KIT</a> までお問い合わせください。</p>
        </div>
      </main>
    </div>
  );
}
