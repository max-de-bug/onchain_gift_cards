"use client";

import * as React from "react";
import { Calendar } from "primereact/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface CustomDatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  timeOnly?: boolean;
  dateFormat?: string;
}

export function CustomDatePicker({
  date,
  onSelect,
  placeholder = "Pick a date and time",
  disabled = false,
  minDate,
  maxDate,
  showTime = true,
  timeOnly = false,
  dateFormat = "dd/mm/yy",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleChange = (e: any) => {
    const value = e.value;
    if (value) {
      const selectedDate = Array.isArray(value) ? value[0] : value;
      onSelect(selectedDate);
    } else {
      onSelect(undefined);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !date && "text-[var(--muted-foreground)]"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          {date ? (
            <span className="truncate">{format(date, showTime ? "PPP p" : "PPP")}</span>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" onInteractOutside={() => setIsOpen(false)}>
        <div className="p-3">
          <Calendar
            value={date || null}
            onChange={handleChange}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            showTime={showTime}
            timeOnly={timeOnly}
            dateFormat={dateFormat}
            hourFormat="24"
            showIcon={false}
            inline
            showButtonBar
            monthNavigator
            yearNavigator
            yearRange="2020:2030"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
