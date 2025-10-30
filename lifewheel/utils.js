(function (global) {
  const LW = (global.LW = global.LW || {});

  const ISO_FORMAT_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

  function uuid() {
    if (global.crypto && global.crypto.randomUUID) {
      return global.crypto.randomUUID();
    }
    const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return template.replace(/[xy]/g, (c) => {
      let r = Math.random() * 16;
      if (global.crypto && global.crypto.getRandomValues) {
        r = global.crypto.getRandomValues(new Uint8Array(1))[0] / 16;
      }
      const v = c === 'x' ? Math.floor(r) : (Math.floor(r) & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function toLocalDate(date) {
    return new Date(date);
  }

  function formatDate(date) {
    if (!date) return '';
    return toLocalDate(date).toLocaleDateString(undefined, ISO_FORMAT_OPTIONS);
  }

  function formatDateTime(date) {
    if (!date) return '';
    return toLocalDate(date).toLocaleString(undefined, {
      ...ISO_FORMAT_OPTIONS,
      hour: 'numeric',
      minute: 'numeric'
    });
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  function toCsv(headers, rows) {
    const csvRows = [headers.join(',')];
    for (const row of rows) {
      const escaped = row.map((value) => {
        if (value == null) return '';
        const str = String(value).replace(/"/g, '""');
        if (/[,"\n]/.test(str)) {
          return `"${str}"`;
        }
        return str;
      });
      csvRows.push(escaped.join(','));
    }
    return csvRows.join('\n');
  }

  function downloadFile(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv(filename, headers, rows) {
    const csv = toCsv(headers, rows);
    downloadFile(filename, csv, 'text/csv');
  }

  function exportIcs(filename, events) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LifeWheel//EN'];
    events.forEach((event) => {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.uid || uuid()}`);
      if (event.start) {
        lines.push(`DTSTART:${formatIcsDate(event.start)}`);
      }
      if (event.end) {
        lines.push(`DTEND:${formatIcsDate(event.end)}`);
      }
      lines.push(`SUMMARY:${escapeIcs(event.summary || 'Life-Wheel Event')}`);
      if (event.description) {
        lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
      }
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    downloadFile(filename, lines.join('\r\n'), 'text/calendar');
  }

  function formatIcsDate(date) {
    const d = new Date(date);
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
      d.getUTCMinutes()
    )}${pad(d.getUTCSeconds())}Z`;
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function escapeIcs(text) {
    return String(text).replace(/,|;|\\n/g, (match) => {
      if (match === ',') return '\\,';
      if (match === ';') return '\\;';
      return '\\n';
    });
  }

  async function readFileAsDataURL(file) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  function humanizeCadence(cadence) {
    switch (cadence) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      default:
        return cadence || 'Custom';
    }
  }

  LW.utils = {
    uuid,
    toLocalDate,
    formatDate,
    formatDateTime,
    nowIso,
    startOfDay,
    daysAgo,
    exportCsv,
    exportIcs,
    readFileAsDataURL,
    chunk,
    humanizeCadence
  };
})(window);
