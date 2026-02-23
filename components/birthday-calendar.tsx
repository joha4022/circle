"use client";

import { useMemo, useState } from "react";

type BirthdayItem = {
  userId: string;
  name: string;
  birthdayIso: string;
};

type Props = {
  birthdays: BirthdayItem[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BirthdayCalendar({ birthdays }: Props) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });
  const today = new Date();
  const todayYear = today.getUTCFullYear();
  const todayMonth = today.getUTCMonth();
  const todayDate = today.getUTCDate();

  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const trailingCells = (7 - ((firstWeekday + daysInMonth) % 7)) % 7;

  const birthdaysByDay = useMemo(() => {
    const byDay = new Map<number, BirthdayItem[]>();
    for (const item of birthdays) {
      const birthday = new Date(item.birthdayIso);
      if (birthday.getUTCMonth() !== month) continue;
      const day = birthday.getUTCDate();
      const current = byDay.get(day) ?? [];
      current.push(item);
      byDay.set(day, current);
    }
    return byDay;
  }, [birthdays, month]);

  function prevMonth() {
    setCursor((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)));
  }

  function nextMonth() {
    setCursor((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)));
  }

  return (
    <div className="calendar-shell">
      <div className="calendar-header">
        <h2>{monthLabel}</h2>
        <div className="calendar-nav">
          <button type="button" className="ghost" aria-label="Previous month" onClick={prevMonth}>
            ←
          </button>
          <button type="button" className="ghost" aria-label="Next month" onClick={nextMonth}>
            →
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <p key={day}>{day}</p>
        ))}
      </div>

      <div className="calendar-grid">
        {Array.from({ length: firstWeekday }).map((_, idx) => (
          <div key={`blank-start-${idx}`} className="calendar-cell calendar-cell-blank" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNumber = idx + 1;
          const dayBirthdays = birthdaysByDay.get(dayNumber) ?? [];
          const isToday = year === todayYear && month === todayMonth && dayNumber === todayDate;

          return (
            <div
              key={dayNumber}
              className={`calendar-cell${dayBirthdays.length > 0 ? " has-birthday" : ""}${isToday ? " is-today" : ""}`}
            >
              <p className="calendar-day-number">{dayNumber}</p>
              {dayBirthdays.slice(0, 2).map((entry) => (
                <p className="calendar-birthday-pill" key={entry.userId}>
                  {entry.name}
                </p>
              ))}
              {dayBirthdays.length > 2 ? <p className="calendar-birthday-more">+{dayBirthdays.length - 2} more</p> : null}
            </div>
          );
        })}

        {Array.from({ length: trailingCells }).map((_, idx) => (
          <div key={`blank-end-${idx}`} className="calendar-cell calendar-cell-blank" />
        ))}
      </div>
    </div>
  );
}
