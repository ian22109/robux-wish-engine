import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import charactersBanner from "@/assets/characters-banner.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
            Gift Coins
          </h1>
          <p className="text-lg text-muted-foreground">
            Send up to 25% more Coins to friends and family!
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search Username"
            className="h-12 pl-12 text-base border-border rounded-lg shadow-sm"
          />
        </div>

        {/* Info Sections */}
        <div className="space-y-8 mb-10">
          <section>
            <h2 className="text-xl font-bold mb-2">What's GameX?</h2>
            <p className="text-muted-foreground leading-relaxed">
              GameX is a global platform where millions of people create, play, and connect.
              Coins are the virtual currency that lets users customize their avatar, access
              experiences, and more.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">What's Gift Coins?</h2>
            <p className="text-muted-foreground leading-relaxed">
              This feature lets you send Coins directly to the GameX account of the person
              who shared this link. Just follow the steps to complete your gift — no codes
              or gift cards needed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">Don't know the person?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you don't know the person sending the link, you can ignore it and contact{" "}
              <a href="#" className="text-accent-foreground font-medium hover:underline">
                GameX support
              </a>
              .
            </p>
          </section>
        </div>

        {/* Banner */}
        <div className="rounded-lg overflow-hidden mb-10">
          <img
            src={charactersBanner}
            alt="GameX characters"
            width={1024}
            height={512}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Footer disclaimer */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Coins are provided to you by GameX. When you buy Coins you receive only a limited,
          non-refundable, non-transferable, revocable license to use Coins, which has no value
          in real currency. By proceeding, (1) you agree that you are over 18 and that you
          authorize us to charge your account, and (2) you represent that you understand and
          agree to the{" "}
          <a href="#" className="underline hover:text-foreground">Terms of Use</a>, which
          includes an agreement to arbitrate any dispute between you and GameX, and{" "}
          <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
        </p>
      </main>
    </div>
  );
};

export default Index;
