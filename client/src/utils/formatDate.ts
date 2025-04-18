export const formatDate = (date: number | string) => {
  if (!date) return 'N/A';

  try {
    let parsedDate;

    // Check if date is a number (Unix timestamp) or string
    if (typeof date === 'number') {
      // Numeric Unix timestamp (seconds since epoch)
      parsedDate = new Date(date * 1000); // Convert seconds to milliseconds
    } else if (typeof date === 'string') {
      // Check if the string is actually a numeric Unix timestamp
      if (/^\d+$/.test(date)) {
        // String contains only digits, treat as Unix timestamp
        parsedDate = new Date(parseInt(date, 10) * 1000);
      } else {
        // For ISO strings like "2014-12-24T17:49:19Z"
        parsedDate = new Date(date);
      }
    } else {
      return 'Invalid Date';
    }

    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date';
    }

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    console.error('Error formatting date:', e, 'Value was:', date);
    return 'Invalid Date';
  }
};
