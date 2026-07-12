"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

const PET_TYPES = [
  { id: "cat", name: "小猫", color: "#f59e0b", dark: "#d97706", blush: "#fcd9b6", accent: "#fbbf24" },
  { id: "dog", name: "小狗", color: "#8b5cf6", dark: "#7c3aed", blush: "#ddd6fe", accent: "#a78bfa" },
  { id: "bunny", name: "兔子", color: "#ec4899", dark: "#db2777", blush: "#fbcfe8", accent: "#f472b6" },
  { id: "bear", name: "小熊", color: "#a16207", dark: "#854d0e", blush: "#fef08a", accent: "#ca8a04" },
  { id: "hamster", name: "仓鼠", color: "#f97316", dark: "#ea580c", blush: "#fed7aa", accent: "#fb923c" },
  { id: "fox", name: "狐狸", color: "#ef4444", dark: "#dc2626", blush: "#fecaca", accent: "#f87171" },
];

type PetType = typeof PET_TYPES[number];
type PetState = "idle" | "dragging" | "sleeping" | "happy";

const STORAGE_KEY = "pet-type";

export function HomePet() {
  const [petType, setPetType] = useState<PetType>(PET_TYPES[0]);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = PET_TYPES.find((p) => p.id === saved);
      if (found) setPetType(found);
    }
  }, []);
  const [dragging, setDragging] = useState(false);
  const [petState, setPetState] = useState<PetState>("idle");
  const [blink, setBlink] = useState(false);
  const [heart, setHeart] = useState<{ id: number } | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [shake, setShake] = useState(false);

  const dragRef = useRef({ startX: 0, startY: 0, elX: 0, elY: 0 });
  const petRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Blink
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 2500 + Math.random() * 3000);
    return () => clearInterval(t);
  }, []);

  // Idle → sleep
  useEffect(() => {
    if (petState === "sleeping" || petState === "dragging" || petState === "happy") return;
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setPetState("sleeping"), 8000);
    return () => clearTimeout(idleTimer.current);
  }, [petState]);

  const wakeUp = useCallback(() => {
    if (petState === "sleeping") setPetState("idle");
  }, [petState]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setShowTip(false);
    setShowPicker(false);
    setDragging(true);
    setPetState("dragging");
    clearTimeout(idleTimer.current);

    const rect = petRef.current?.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elX: pos.x,
      elY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.elX + dx, y: dragRef.current.elY + dy });
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    setPetState("idle");
  }, [dragging]);

  const handleClick = useCallback(() => {
    wakeUp();
    setPetState("happy");
    setShowTip(false);
    const id = Date.now();
    setHeart({ id });
    setTimeout(() => setHeart(null), 900);
    setTimeout(() => setPetState("idle"), 600);
  }, [wakeUp]);

  const handleContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowPicker(!showPicker);
  }, [showPicker]);

  const switchPet = useCallback((p: PetType) => {
    setPetType(p);
    setShowPicker(false);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    try { localStorage.setItem(STORAGE_KEY, p.id) } catch {}
  }, []);

  return (
    <div
      className="fixed z-50 select-none touch-none"
      style={{
        left: pos.x,
        top: pos.y,
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      {/* Tip */}
      {showTip && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl glass text-xs text-muted-foreground whitespace-nowrap animate-fade-in pointer-events-none">
          拖拽我 · 右键换皮肤
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-background/80 backdrop-blur-xl border-r border-b" />
        </div>
      )}

      {/* Heart */}
      {heart && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl pointer-events-none z-10 animate-fade-in-up">
          ♥
        </div>
      )}

      {/* Zzz */}
      {petState === "sleeping" && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-xl animate-float-slow pointer-events-none">💤</div>
      )}

      {/* Name badge */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-foreground/80 text-background text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {petType.name}
      </div>

      {/* Pet picker */}
      {showPicker && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-1 p-1.5 rounded-xl glass shadow-lg animate-scale-in z-50">
          {PET_TYPES.map((p) => (
            <button
              key={p.id}
              onClick={() => switchPet(p)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110",
                p.id === petType.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
              )}
              title={p.name}
            >
              {PETS_SMALL[p.id]}
            </button>
          ))}
        </div>
      )}

      {/* Pet */}
      <div
        ref={petRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onContextMenu={handleContext}
        className={cn(
          "group relative",
          dragging && "scale-110",
          petState === "happy" && "animate-bounce",
          shake && "animate-shake"
        )}
        style={{ width: 72, height: 80, filter: "drop-shadow(0 4px 12px hsl(0 0% 0% / 0.15))" }}
      >
        <svg viewBox="0 0 72 80" className="w-full h-full">
          {/* === BODY === */}
          {PET_SVGS[petType.id]({ petType, blink, petState })}
        </svg>
      </div>
    </div>
  );
}

// === SVG PET COMPONENTS ===

type PetSVGProps = { petType: PetType; blink: boolean; petState: PetState };

function CatSVG({ petType, blink }: PetSVGProps) {
  const c = petType.color;
  return (
    <g>
      {/* Tail */}
      <path d="M18 50 C8 45, 4 32, 10 24" stroke={c} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Body */}
      <ellipse cx="36" cy="52" rx="16" ry="14" fill={c} />
      <ellipse cx="36" cy="56" rx="11" ry="9" fill={petType.accent} opacity="0.5" />
      {/* Back legs */}
      <ellipse cx="28" cy="66" rx="6" ry="5" fill={petType.dark} />
      <ellipse cx="44" cy="66" rx="6" ry="5" fill={petType.dark} />
      {/* Front legs */}
      <ellipse cx="26" cy="62" rx="4" ry="4" fill={c} />
      <ellipse cx="46" cy="62" rx="4" ry="4" fill={c} />
      {/* Big head */}
      <circle cx="36" cy="28" r="17" fill={c} />
      {/* Ears */}
      <polygon points="24,18 18,3 32,12" fill={c} />
      <polygon points="48,18 54,3 40,12" fill={c} />
      <polygon points="26,16 21,6 31,12" fill={petType.accent} />
      <polygon points="46,16 51,6 41,12" fill={petType.accent} />
      {/* Eyes */}
      {blink ? (
        <>
          <line x1="29" y1="27" x2="33" y2="27" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
          <line x1="39" y1="27" x2="43" y2="27" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="31" cy="26" r="4.5" fill="#1e1b4b" />
          <circle cx="41" cy="26" r="4.5" fill="#1e1b4b" />
          <circle cx="32.5" cy="24.5" r="2" fill="white" />
          <circle cx="42.5" cy="24.5" r="2" fill="white" />
        </>
      )}
      {/* Nose */}
      <polygon points="36,31 34.5,33 37.5,33" fill="#f472b6" />
      {/* Mouth */}
      <path d="M33 35 Q36 38 39 35" stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Whiskers */}
      <line x1="18" y1="30" x2="26" y2="32" stroke="#fffbeb" strokeWidth="0.8" opacity="0.5" />
      <line x1="18" y1="34" x2="26" y2="34" stroke="#fffbeb" strokeWidth="0.8" opacity="0.5" />
      <line x1="46" y1="32" x2="54" y2="30" stroke="#fffbeb" strokeWidth="0.8" opacity="0.5" />
      <line x1="46" y1="34" x2="54" y2="34" stroke="#fffbeb" strokeWidth="0.8" opacity="0.5" />
      {/* Blush */}
      <ellipse cx="24" cy="33" rx="4" ry="2.5" fill={petType.blush} opacity="0.6" />
      <ellipse cx="48" cy="33" rx="4" ry="2.5" fill={petType.blush} opacity="0.6" />
    </g>
  );
}

function DogSVG({ petType, blink }: PetSVGProps) {
  const c = petType.color;
  return (
    <g>
      {/* Tail */}
      <path d="M18 48 C8 42, 6 28, 12 22" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Body */}
      <ellipse cx="36" cy="52" rx="16" ry="14" fill={c} />
      <ellipse cx="36" cy="56" rx="11" ry="9" fill={petType.accent} opacity="0.4" />
      <ellipse cx="28" cy="66" rx="6" ry="5" fill={petType.dark} />
      <ellipse cx="44" cy="66" rx="6" ry="5" fill={petType.dark} />
      <ellipse cx="26" cy="62" rx="4" ry="4" fill={c} />
      <ellipse cx="46" cy="62" rx="4" ry="4" fill={c} />
      {/* Head */}
      <circle cx="36" cy="28" r="17" fill={c} />
      {/* Floppy ears */}
      <ellipse cx="20" cy="26" rx="6" ry="10" fill={petType.dark} transform="rotate(15 20 26)" />
      <ellipse cx="52" cy="26" rx="6" ry="10" fill={petType.dark} transform="rotate(-15 52 26)" />
      {/* Face - lighter patch */}
      <ellipse cx="36" cy="32" rx="11" ry="10" fill={petType.accent} opacity="0.4" />
      {/* Eyes */}
      {blink ? (
        <>
          <line x1="29" y1="26" x2="33" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
          <line x1="39" y1="26" x2="43" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="31" cy="26" r="4.5" fill="#1e1b4b" />
          <circle cx="41" cy="26" r="4.5" fill="#1e1b4b" />
          <circle cx="32.5" cy="24.5" r="2" fill="white" />
          <circle cx="42.5" cy="24.5" r="2" fill="white" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="36" cy="32" rx="2.5" ry="2" fill="#1e1b4b" />
      {/* Tongue */}
      <ellipse cx="36" cy="37" rx="2.5" ry="3" fill="#f472b6" />
      {/* Blush */}
      <ellipse cx="24" cy="32" rx="4" ry="2.5" fill={petType.blush} opacity="0.6" />
      <ellipse cx="48" cy="32" rx="4" ry="2.5" fill={petType.blush} opacity="0.6" />
    </g>
  );
}

function BunnySVG({ petType, blink }: PetSVGProps) {
  const c = petType.color;
  return (
    <g>
      {/* Body */}
      <ellipse cx="36" cy="52" rx="15" ry="14" fill={c} />
      <ellipse cx="36" cy="56" rx="10" ry="8" fill={petType.accent} opacity="0.4" />
      {/* Legs */}
      <ellipse cx="28" cy="66" rx="6" ry="5" fill={petType.dark} />
      <ellipse cx="44" cy="66" rx="6" ry="5" fill={petType.dark} />
      {/* Paws */}
      <ellipse cx="26" cy="62" rx="4" ry="3" fill={c} />
      <ellipse cx="46" cy="62" rx="4" ry="3" fill={c} />
      {/* Head */}
      <circle cx="36" cy="28" r="16" fill={c} />
      {/* Long ears */}
      <ellipse cx="28" cy="6" rx="5" ry="14" fill={c} transform="rotate(-10 28 6)" />
      <ellipse cx="28" cy="6" rx="2.5" ry="10" fill={petType.accent} transform="rotate(-10 28 6)" />
      <ellipse cx="44" cy="6" rx="5" ry="14" fill={c} transform="rotate(10 44 6)" />
      <ellipse cx="44" cy="6" rx="2.5" ry="10" fill={petType.accent} transform="rotate(10 44 6)" />
      {/* Eyes */}
      {blink ? (
        <>
          <line x1="29" y1="26" x2="33" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
          <line x1="39" y1="26" x2="43" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="31" cy="26" r="4" fill="#1e1b4b" />
          <circle cx="41" cy="26" r="4" fill="#1e1b4b" />
          <circle cx="32.5" cy="24.5" r="1.8" fill="white" />
          <circle cx="42.5" cy="24.5" r="1.8" fill="white" />
        </>
      )}
      {/* Nose */}
      <polygon points="36,30 34.5,32 37.5,32" fill="#f472b6" />
      {/* Mouth */}
      <path d="M34 34 Q36 36 38 34" stroke="#1e1b4b" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
      {/* Blush */}
      <ellipse cx="24" cy="32" rx="4" ry="2.5" fill={petType.blush} opacity="0.5" />
      <ellipse cx="48" cy="32" rx="4" ry="2.5" fill={petType.blush} opacity="0.5" />
      {/* Tail */}
      <circle cx="52" cy="56" r="5" fill={petType.accent} />
    </g>
  );
}

function BearSVG({ petType, blink }: PetSVGProps) {
  const c = petType.color;
  return (
    <g>
      {/* Body */}
      <ellipse cx="36" cy="52" rx="17" ry="15" fill={c} />
      <ellipse cx="36" cy="56" rx="11" ry="10" fill={petType.accent} opacity="0.4" />
      <ellipse cx="28" cy="67" rx="7" ry="5" fill={petType.dark} />
      <ellipse cx="44" cy="67" rx="7" ry="5" fill={petType.dark} />
      <ellipse cx="26" cy="62" rx="5" ry="4" fill={c} />
      <ellipse cx="46" cy="62" rx="5" ry="4" fill={c} />
      {/* Head */}
      <circle cx="36" cy="28" r="18" fill={c} />
      {/* Round ears */}
      <circle cx="22" cy="16" r="7" fill={c} />
      <circle cx="22" cy="16" r="4" fill={petType.accent} />
      <circle cx="50" cy="16" r="7" fill={c} />
      <circle cx="50" cy="16" r="4" fill={petType.accent} />
      {/* Muzzle */}
      <ellipse cx="36" cy="33" rx="9" ry="7" fill={petType.accent} opacity="0.5" />
      {/* Eyes */}
      {blink ? (
        <>
          <line x1="29" y1="26" x2="33" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
          <line x1="39" y1="26" x2="43" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="30" cy="26" r="4" fill="#1e1b4b" />
          <circle cx="42" cy="26" r="4" fill="#1e1b4b" />
          <circle cx="31.5" cy="24.5" r="1.8" fill="white" />
          <circle cx="43.5" cy="24.5" r="1.8" fill="white" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="36" cy="32" rx="2.5" ry="2" fill="#1e1b4b" />
      {/* Mouth */}
      <path d="M33 36 Q36 38 39 36" stroke="#1e1b4b" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
      {/* Blush */}
      <ellipse cx="23" cy="33" rx="4" ry="2.5" fill={petType.blush} opacity="0.5" />
      <ellipse cx="49" cy="33" rx="4" ry="2.5" fill={petType.blush} opacity="0.5" />
    </g>
  );
}

function HamsterSVG({ petType, blink }: PetSVGProps) {
  const c = petType.color;
  return (
    <g>
      {/* Body */}
      <ellipse cx="36" cy="54" rx="18" ry="16" fill={c} />
      <ellipse cx="36" cy="58" rx="12" ry="10" fill={petType.accent} opacity="0.4" />
      {/* Legs */}
      <ellipse cx="26" cy="70" rx="6" ry="4" fill={petType.dark} />
      <ellipse cx="46" cy="70" rx="6" ry="4" fill={petType.dark} />
      {/* Head */}
      <circle cx="36" cy="28" r="18" fill={c} />
      {/* Cheek pouches */}
      <ellipse cx="24" cy="33" rx="9" ry="7" fill={petType.accent} opacity="0.4" />
      <ellipse cx="48" cy="33" rx="9" ry="7" fill={petType.accent} opacity="0.4" />
      {/* Ears */}
      <circle cx="24" cy="16" r="5" fill={c} />
      <circle cx="24" cy="16" r="3" fill={petType.accent} />
      <circle cx="48" cy="16" r="5" fill={c} />
      <circle cx="48" cy="16" r="3" fill={petType.accent} />
      {/* Eyes */}
      {blink ? (
        <>
          <line x1="30" y1="26" x2="33" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
          <line x1="39" y1="26" x2="42" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="31" cy="26" r="3.5" fill="#1e1b4b" />
          <circle cx="41" cy="26" r="3.5" fill="#1e1b4b" />
          <circle cx="32.5" cy="25" r="1.5" fill="white" />
          <circle cx="42.5" cy="25" r="1.5" fill="white" />
        </>
      )}
      {/* Nose */}
          <circle cx="36" cy="31" r="2" fill="#f472b6" />
      {/* Cheek blush */}
      <ellipse cx="22" cy="36" rx="5" ry="3" fill={petType.blush} opacity="0.5" />
      <ellipse cx="50" cy="36" rx="5" ry="3" fill={petType.blush} opacity="0.5" />
    </g>
  );
}

function FoxSVG({ petType, blink }: PetSVGProps) {
  const c = petType.color;
  return (
    <g>
      {/* Tail */}
      <path d="M20 50 C8 46, 2 30, 6 22" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="6" cy="22" r="4" fill={petType.accent} />
      {/* Body */}
      <ellipse cx="36" cy="52" rx="15" ry="14" fill={c} />
      <ellipse cx="36" cy="56" rx="10" ry="9" fill={petType.accent} opacity="0.4" />
      <ellipse cx="28" cy="66" rx="6" ry="5" fill={petType.dark} />
      <ellipse cx="44" cy="66" rx="6" ry="5" fill={petType.dark} />
      <ellipse cx="26" cy="62" rx="4" ry="4" fill={c} />
      <ellipse cx="46" cy="62" rx="4" ry="4" fill={c} />
      {/* Head */}
      <circle cx="36" cy="28" r="16" fill={c} />
      {/* Pointy ears */}
      <polygon points="24,18 18,2 32,12" fill={c} />
      <polygon points="48,18 54,2 40,12" fill={c} />
      <polygon points="26,16 21,6 31,12" fill={petType.accent} />
      <polygon points="46,16 51,6 41,12" fill={petType.accent} />
      {/* White face patch */}
      <ellipse cx="36" cy="34" rx="10" ry="8" fill={petType.accent} opacity="0.3" />
      {/* Eyes */}
      {blink ? (
        <>
          <line x1="29" y1="26" x2="33" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
          <line x1="39" y1="26" x2="43" y2="26" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="31" cy="26" r="4" fill="#1e1b4b" />
          <circle cx="41" cy="26" r="4" fill="#1e1b4b" />
          <circle cx="32.5" cy="24.5" r="1.8" fill="white" />
          <circle cx="42.5" cy="24.5" r="1.8" fill="white" />
        </>
      )}
      {/* Nose */}
          <circle cx="36" cy="31" r="2.5" fill="#1e1b4b" />
      {/* Blush */}
      <ellipse cx="24" cy="33" rx="4" ry="2.5" fill={petType.blush} opacity="0.6" />
      <ellipse cx="48" cy="33" rx="4" ry="2.5" fill={petType.blush} opacity="0.6" />
    </g>
  );
}

const PET_SVGS: Record<string, (props: PetSVGProps) => React.ReactElement> = {
  cat: CatSVG,
  dog: DogSVG,
  bunny: BunnySVG,
  bear: BearSVG,
  hamster: HamsterSVG,
  fox: FoxSVG,
};

const PETS_SMALL: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  bunny: "🐰",
  bear: "🐻",
  hamster: "🐹",
  fox: "🦊",
};
