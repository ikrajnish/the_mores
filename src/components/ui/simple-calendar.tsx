"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SimpleCalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date) => void;
}

export function SimpleCalendar({ className, selected, onSelect }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={cn("p-3 bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-[280px]", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-200">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-slate-500 font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
           const isSelected = selected && isSameDay(day, selected);
           const isCurrentMonth = isSameMonth(day, currentMonth);
           const isDayToday = isToday(day);

           return (
             <button
               key={day.toISOString()}
               onClick={() => onSelect?.(day)}
               className={cn(
                 "h-8 w-8 text-sm rounded-md flex items-center justify-center transition-colors relative",
                 !isCurrentMonth && "text-slate-600 opacity-50",
                 isCurrentMonth && !isSelected && "text-slate-200 hover:bg-slate-800",
                 isSelected && "bg-purple-600 text-white font-medium hover:bg-purple-700",
                 isDayToday && !isSelected && "text-purple-400 font-semibold ring-1 ring-purple-900/50"
               )}
             >
               {format(day, "d")}
             </button>
           );
        })}
      </div>
    </div>
  );
}
