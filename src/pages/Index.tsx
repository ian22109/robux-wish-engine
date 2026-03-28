import { useState, useEffect, useRef } from "react";
import { Search, Coins, CheckCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import charactersBanner from "@/assets/characters-banner.jpg";

type RobloxUser = {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
};

const COIN_PACKAGES = [
  { coins: 400, price: 4.99, bonus: 0 },
  { coins: 800, price: 9.99, bonus: 0 },
  { coins: 1700, price: 19.99, bonus: "6%" },
  { coins: 4500, price: 49.99, bonus: "12%" },
  { coins: 10000, price: 99.99, bonus: "25%" },
];

const PROXY = "https://api.allorigins.win/raw?url=";

const getAvatarUrl = (userId: number) =>
  `${PROXY}${encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`)}`;

const fetchAvatarDirect = async (userId: number): Promise<string> => {
  try {
    const res = await fetch(getAvatarUrl(userId));
    const data = await res.json();
    return data?.data?.[0]?.imageUrl ?? "/placeholder.svg";
  } catch {
    return "/placeholder.svg";
  }
};

const Index = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RobloxUser[]>([]);
  const [avatars, setAvatars] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RobloxUser | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<typeof COIN_PACKAGES[0] | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<"select" | "confirm" | "done">("select");
  const [dialogOpen, setDialogOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchUsers = async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${PROXY}${encodeURIComponent(`https://users.roblox.com/v1/users/search?keyword=${keyword}&limit=10`)}`
      );
      const data = await res.json();
      const users: RobloxUser[] = data.data ?? [];
      setResults(users);
      setShowResults(true);

      // Fetch avatars in parallel
      if (users.length > 0) {
        const ids = users.map(u => u.id);
        try {
          const thumbRes = await fetch(
            `${PROXY}${encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ids.join(",")}&size=150x150&format=Png&isCircular=true`)}`
          );
          const thumbData = await thumbRes.json();
          const newAvatars: Record<number, string> = {};
          (thumbData?.data ?? []).forEach((t: { targetId: number; imageUrl: string }) => {
            if (t.imageUrl) newAvatars[t.targetId] = t.imageUrl;
          });
          setAvatars(prev => ({ ...prev, ...newAvatars }));
        } catch {
          console.error("Failed to load avatars");
        }
      }
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(value), 200);
  };

  const pickUser = (user: RobloxUser) => {
    setSelectedUser(user);
    setQuery(user.name);
    setShowResults(false);
    setSelectedPackage(null);
    setPurchaseStep("select");
    setDialogOpen(true);
  };

  const handlePurchase = () => {
    setPurchaseStep("confirm");
  };

  const confirmPurchase = () => {
    setPurchaseStep("done");
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setPurchaseStep("select");
    setSelectedPackage(null);
  };

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
        <div className="relative mb-12" ref={wrapperRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            placeholder="Search Roblox Username"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="h-12 pl-12 text-base border-border rounded-lg shadow-sm"
          />

          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {loading && (
                <div className="px-4 py-3 text-sm text-muted-foreground">Searching…</div>
              )}
              {!loading && results.length === 0 && query.trim() && (
                <div className="px-4 py-3 text-sm text-muted-foreground">No users found</div>
              )}
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => pickUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                >
                  <img
                    src={avatars[user.id] ?? "/placeholder.svg"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div>
                    <span className="font-semibold text-sm text-foreground">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">@{user.name}</span>
                    {user.hasVerifiedBadge && (
                      <CheckCircle className="inline-block ml-1 h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected user badge */}
        {selectedUser && (
          <div className="flex items-center gap-3 mb-8 p-4 rounded-lg bg-accent border border-border">
            <img
              src={avatars[selectedUser.id] ?? "/placeholder.svg"}
              alt={selectedUser.name}
              className="w-10 h-10 rounded-full bg-muted"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{selectedUser.displayName}</p>
              <p className="text-xs text-muted-foreground">@{selectedUser.name}</p>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
              <Coins className="h-4 w-4" />
              Gift Coins
            </Button>
          </div>
        )}

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

      {/* Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {purchaseStep === "done" ? "Kauf abgeschlossen!" : "Coins schenken"}
            </DialogTitle>
            <DialogDescription>
              {purchaseStep === "done"
                ? "Dies war ein Demo-Kauf. Es wurde nichts berechnet."
                : `Wähle ein Paket für ${selectedUser?.displayName ?? "den Nutzer"}`}
            </DialogDescription>
          </DialogHeader>

          {purchaseStep === "select" && (
            <div className="space-y-3 py-2">
              {COIN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.coins}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                    selectedPackage?.coins === pkg.coins
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      {pkg.coins.toLocaleString()} Coins
                    </span>
                    {pkg.bonus !== 0 && (
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        +{pkg.bonus} Bonus
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-foreground">${pkg.price}</span>
                </button>
              ))}

              <Button
                className="w-full mt-2"
                disabled={!selectedPackage}
                onClick={handlePurchase}
              >
                Weiter
              </Button>
            </div>
          )}

          {purchaseStep === "confirm" && selectedPackage && (
            <div className="space-y-4 py-2">
              <div className="bg-accent rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Empfänger</span>
                  <span className="font-medium text-foreground">@{selectedUser?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paket</span>
                  <span className="font-medium text-foreground">
                    {selectedPackage.coins.toLocaleString()} Coins
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="font-semibold text-foreground">Gesamt</span>
                  <span className="font-bold text-foreground">${selectedPackage.price}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Dies ist ein Demo-Kauf. Es wird nichts berechnet.
              </p>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setPurchaseStep("select")}>
                  Zurück
                </Button>
                <Button className="flex-1" onClick={confirmPurchase}>
                  Demo kaufen
                </Button>
              </div>
            </div>
          )}

          {purchaseStep === "done" && (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {selectedPackage?.coins.toLocaleString()} Coins
                </p>
                <p className="text-sm text-muted-foreground">
                  wurden an @{selectedUser?.name} gesendet (Demo)
                </p>
              </div>
              <Button onClick={closeDialog} className="w-full">
                Schließen
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
