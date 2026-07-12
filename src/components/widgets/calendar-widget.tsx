"use client";

import { useState } from "react";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarWidget() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const today = now.getDate();

  const days = daysInMonth(year, month);
  const start = firstDayOfMonth(year, month);
  const startOffset = start === 0 ? 6 : start - 1;

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const monthNames = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted/50 text-xs transition-colors">&lt;</button>
        <span className="text-sm font-medium">{year}年{monthNames[month]}</span>
        <button onClick={next} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted/50 text-xs transition-colors">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-xs mb-1">
        {WEEKDAYS.map(d => <div key={d} className="py-1 text-muted-foreground/60 font-medium">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-xs">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const isToday = d === today && month === now.getMonth() && year === now.getFullYear();
          return (
            <div
              key={d}
              className={`py-1 rounded transition-colors ${
                isToday ? "bg-primary/20 text-primary font-bold" : "text-foreground/80 hover:bg-muted/30"
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
