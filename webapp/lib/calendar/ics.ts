/**
 * ICS (iCalendar) file generation utility
 * Generates RFC 5545 compliant calendar files for session invites
 */

export interface ICSEventData {
  uid: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone?: string; // IANA timezone ID (default: "Europe/London")
  location?: string;
  meetingUrl?: string;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  attendeeEmail: string;
  method: "REQUEST" | "CANCEL";
  sequence: number;
}

/**
 * Formats a date and time to iCalendar format (YYYYMMDDTHHMMSS)
 */
function formatICSDateTime(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");
  return `${year}${month}${day}T${hours}${minutes}00`;
}

/**
 * Escapes special characters in ICS text fields
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Folds long lines according to RFC 5545 (max 75 octets per line)
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const result: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    result.push(remaining.substring(0, maxLength));
    remaining = " " + remaining.substring(maxLength);
  }
  result.push(remaining);

  return result.join("\r\n");
}

/**
 * Generates a VTIMEZONE component for the given timezone.
 * Includes full DST rules for Europe/London; for other timezones,
 * relies on the calendar app to resolve the IANA TZID.
 */
function generateTimezone(tzid: string): string {
  if (tzid === "Europe/London") {
    return `BEGIN:VTIMEZONE
TZID:Europe/London
BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`;
  }

  // For other IANA timezones, emit a minimal VTIMEZONE.
  // Most modern calendar apps (Google, Apple, Outlook) resolve
  // standard IANA timezone IDs without needing full DST rules.
  return `BEGIN:VTIMEZONE
TZID:${tzid}
BEGIN:STANDARD
TZOFFSETFROM:+0000
TZOFFSETTO:+0000
TZNAME:${tzid}
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE`;
}

/**
 * Generates an ICS file content string
 */
export function generateICS(data: ICSEventData): string {
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const tzid = data.timezone || "Europe/London";
  const dtstart = formatICSDateTime(data.startDate, data.startTime);
  const dtend = formatICSDateTime(data.startDate, data.endTime);

  // Build description with meeting URL if provided
  let description = data.description || "";
  if (data.meetingUrl) {
    if (description) {
      description += "\\n\\n";
    }
    description += `Join online: ${data.meetingUrl}`;
  }

  // Build location - use meeting URL for online sessions if no physical location
  const location = data.location || (data.meetingUrl ? data.meetingUrl : "");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Find Hypnotherapy//Session Scheduler//EN",
    `METHOD:${data.method}`,
    "CALSCALE:GREGORIAN",
    generateTimezone(tzid),
    "BEGIN:VEVENT",
    `UID:${data.uid}@findhypnotherapy.co.uk`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${tzid}:${dtstart}`,
    `DTEND;TZID=${tzid}:${dtend}`,
    foldLine(`SUMMARY:${escapeICSText(data.title)}`),
    `ORGANIZER;CN=${escapeICSText(data.organizerName)}:mailto:${data.organizerEmail}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${escapeICSText(data.attendeeName)}:mailto:${data.attendeeEmail}`,
    `SEQUENCE:${data.sequence}`,
    `STATUS:${data.method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
  ];

  if (description) {
    lines.push(foldLine(`DESCRIPTION:${escapeICSText(description)}`));
  }

  if (location) {
    lines.push(foldLine(`LOCATION:${escapeICSText(location)}`));
  }

  if (data.meetingUrl) {
    // Add URL property for calendar apps that support it
    lines.push(`URL:${data.meetingUrl}`);
  }

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Generates an ICS content type header value
 */
export function getICSContentType(): string {
  return 'text/calendar; charset="utf-8"; method=REQUEST';
}
