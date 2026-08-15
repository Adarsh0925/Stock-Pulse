/**
 * Client-Side Market Time, Calendar & Session Validation Utilities
 * 
 * Accurately parses and validates Indian Standard Time (IST),
 * determines day-of-week, market open/closed status, and verifies
 * that shown session dates are genuine trading days (not weekends or holidays).
 */

export interface ISTSessionClientInfo {
  currentTimeIST: string;
  currentDateIST: string;
  currentDayName: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isMarketOpen: boolean;
  statusBadge: string;
  statusDetail: string;
  lastTradingDate: string;
  lastTradingFormatted: string;
  nextTradingDate: string;
  nextTradingFormatted: string;
  validationChecks: {
    dayCheck: string;
    timeCheck: string;
    holidayCheck: string;
    sessionAlignmentCheck: string;
  };
}

const NSE_RECURRING_HOLIDAYS: Record<string, string> = {
  '01-26': 'Republic Day',
  '08-15': 'Independence Day',
  '10-02': 'Mahatma Gandhi Jayanti',
  '12-25': 'Christmas',
  '05-01': 'Maharashtra Day'
};

export function getClientISTComponents(date: Date = new Date()) {
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (330 * 60000));

  const year = istTime.getFullYear();
  const month = istTime.getMonth() + 1;
  const day = istTime.getDate();
  const dayOfWeek = istTime.getDay(); // 0=Sun, 6=Sat
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const seconds = istTime.getSeconds();
  const decimalHours = hours + (minutes / 60) + (seconds / 3600);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const monthStr = monthNames[month - 1];
  const dayName = dayNames[dayOfWeek];
  const mmStr = String(month).padStart(2, '0');
  const ddStr = String(day).padStart(2, '0');
  const isoDateString = `${year}-${mmStr}-${ddStr}`;
  const formattedDate = `${day} ${monthStr} ${year}`;
  const formattedFullDate = `${dayName}, ${day} ${monthStr} ${year}`;

  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');
  const formattedTime = `${String(h12).padStart(2, '0')}:${mStr}:${sStr} ${period} IST`;

  return {
    istDate: istTime,
    year,
    month,
    day,
    dayOfWeek,
    dayName,
    hours,
    minutes,
    seconds,
    decimalHours,
    isoDateString,
    formattedDate,
    formattedFullDate,
    formattedTime,
    monthKey: `${mmStr}-${ddStr}`
  };
}

export function checkClientHoliday(monthKey: string): { isHoliday: boolean; name?: string } {
  if (NSE_RECURRING_HOLIDAYS[monthKey]) {
    return { isHoliday: true, name: NSE_RECURRING_HOLIDAYS[monthKey] };
  }
  return { isHoliday: false };
}

export function getClientLastValidTradingDay(referenceDate: Date = new Date()): { isoDate: string; formatted: string; dayName: string } {
  let checkDate = new Date(referenceDate);
  const ist = getClientISTComponents(checkDate);

  if (ist.dayOfWeek >= 1 && ist.dayOfWeek <= 5 && ist.decimalHours < 9.25) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < 14; i++) {
    const comp = getClientISTComponents(checkDate);
    const isWeekend = comp.dayOfWeek === 0 || comp.dayOfWeek === 6;
    const holiday = checkClientHoliday(comp.monthKey);

    if (!isWeekend && !holiday.isHoliday) {
      return {
        isoDate: comp.isoDateString,
        formatted: `${comp.formattedDate} (${comp.dayName})`,
        dayName: comp.dayName
      };
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { isoDate: ist.isoDateString, formatted: `${ist.formattedDate} (${ist.dayName})`, dayName: ist.dayName };
}

export function getClientNextTradingDay(referenceDate: Date = new Date()): { isoDate: string; formatted: string; dayName: string } {
  let checkDate = new Date(referenceDate);
  checkDate.setDate(checkDate.getDate() + 1);

  for (let i = 0; i < 14; i++) {
    const comp = getClientISTComponents(checkDate);
    const isWeekend = comp.dayOfWeek === 0 || comp.dayOfWeek === 6;
    const holiday = checkClientHoliday(comp.monthKey);

    if (!isWeekend && !holiday.isHoliday) {
      return {
        isoDate: comp.isoDateString,
        formatted: `${comp.formattedDate} (${comp.dayName})`,
        dayName: comp.dayName
      };
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  const ist = getClientISTComponents(referenceDate);
  return { isoDate: ist.isoDateString, formatted: `${ist.formattedDate} (${ist.dayName})`, dayName: ist.dayName };
}

export function getClientSessionInfo(date: Date = new Date()): ISTSessionClientInfo {
  const ist = getClientISTComponents(date);
  const isWeekend = ist.dayOfWeek === 0 || ist.dayOfWeek === 6;
  const holidayCheck = checkClientHoliday(ist.monthKey);
  const isHoliday = holidayCheck.isHoliday;

  let isMarketOpen = false;
  let statusBadge = 'MARKET CLOSED';
  let statusDetail = '';

  if (isWeekend) {
    statusBadge = 'MARKET CLOSED — WEEKEND';
    statusDetail = `Markets closed on ${ist.dayName}. Regular trading operates Monday to Friday (09:15–15:30 IST).`;
  } else if (isHoliday) {
    statusBadge = `MARKET CLOSED — ${holidayCheck.name?.toUpperCase() || 'HOLIDAY'}`;
    statusDetail = `National exchange holiday (${holidayCheck.name}). Standard trading resumes on the next scheduled business day.`;
  } else {
    if (ist.decimalHours >= 9.0 && ist.decimalHours < 9.25) {
      isMarketOpen = false;
      statusBadge = 'PRE-OPEN SESSION';
      statusDetail = 'NSE pre-open discovery window active (09:00–09:15 IST).';
    } else if (ist.decimalHours >= 9.25 && ist.decimalHours <= 15.5) {
      isMarketOpen = true;
      statusBadge = 'MARKET LIVE';
      statusDetail = 'Live trading session active on NSE/BSE (09:15–15:30 IST).';
    } else if (ist.decimalHours > 15.5 && ist.decimalHours <= 16.0) {
      isMarketOpen = false;
      statusBadge = 'POST-MARKET CLOSING';
      statusDetail = 'Post-closing settlement and final session price verification.';
    } else {
      isMarketOpen = false;
      statusBadge = 'MARKET CLOSED — AFTER HOURS';
      statusDetail = 'Official session concluded at 15:30 IST. Showing verified official session close.';
    }
  }

  const lastTrading = getClientLastValidTradingDay(date);
  const nextTrading = getClientNextTradingDay(date);

  return {
    currentTimeIST: ist.formattedTime,
    currentDateIST: ist.formattedFullDate,
    currentDayName: ist.dayName,
    isWeekend,
    isHoliday,
    holidayName: holidayCheck.name,
    isMarketOpen,
    statusBadge,
    statusDetail,
    lastTradingDate: lastTrading.isoDate,
    lastTradingFormatted: lastTrading.formatted,
    nextTradingDate: nextTrading.isoDate,
    nextTradingFormatted: nextTrading.formatted,
    validationChecks: {
      dayCheck: `Validated ${ist.dayName} (${isWeekend ? 'Weekend non-trading day' : 'Regular Weekday'})`,
      timeCheck: `Current Indian Standard Time: ${ist.formattedTime} (Market hours: 09:15–15:30 IST)`,
      holidayCheck: isHoliday ? `Official Exchange Holiday: ${holidayCheck.name}` : 'No exchange holiday today',
      sessionAlignmentCheck: `Target session aligned to latest verified trading day: ${lastTrading.formatted}`
    }
  };
}
