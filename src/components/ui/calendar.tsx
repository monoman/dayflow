"use client"

import * as React from "react"
import DayPickerClassNames from "react-day-picker/style.module.css";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils"


export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames = DayPickerClassNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        ...classNames,
        month_grid: "w-full border-collapse space-y-1",
        weekday: "day weekday",
        day_button: "day-button",
        day: "day",        
        selected: "day-selected",
        today: "today",
        outside: "day-outside",
        disabled: "day-disabled",
        hidden: "invisible",
        chevron: `${defaultClassNames.chevron} h-4 w-4 fill-amber-600`
      }}
      disabled={{ before: new Date() }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
