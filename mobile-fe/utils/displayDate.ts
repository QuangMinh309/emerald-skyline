import { format, isToday, isTomorrow } from 'date-fns';
import { vi } from 'date-fns/locale';

// format kiểu: "Hôm nay", "Ngày mai", "Thứ Hai" ...
const getDisplayDate = (date: Date) => {
  const dayOfWeek = format(date, 'eeee', { locale: vi });

  if (isToday(date)) {
    return `Hôm nay, ${dayOfWeek}`;
  }
  if (isTomorrow(date)) {
    return `Ngày mai, ${dayOfWeek}`;
  }
  return `${dayOfWeek}`;
};

export { getDisplayDate };
