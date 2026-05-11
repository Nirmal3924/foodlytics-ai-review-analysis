"""
Simple restaurant timings parser.

It reads strings like:
Mon-Sun: 6:30 AM - 11 PM
Tue-Sat 12 Noon to 3 PM, 7 PM to 11 PM
Mon, Wed-Fri: 10 AM - 8 PM; Tue: Closed
"""
import argparse
import csv
import json
import re


DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

DAY_ALIASES = {
    "mon": "Mon",
    "monday": "Mon",
    "tue": "Tue",
    "tues": "Tue",
    "tuesday": "Tue",
    "wed": "Wed",
    "wednesday": "Wed",
    "thu": "Thu",
    "thur": "Thu",
    "thurs": "Thu",
    "thursday": "Thu",
    "fri": "Fri",
    "friday": "Fri",
    "sat": "Sat",
    "saturday": "Sat",
    "sun": "Sun",
    "sunday": "Sun",
}

DAY_PATTERN = (
    r"(?:mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|"
    r"thu(?:r|rs|rsday|rday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)"
)


def clean_text(value):
    if not value:
        return ""

    text = str(value).strip()
    for old, new in {"\u2013": "-", "\u2014": "-", "\u2212": "-", "\u00a0": " "}.items():
        text = text.replace(old, new)

    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\bto\b", "-", text, flags=re.I)
    text = re.sub(r"\bnoon\b", "12 PM", text, flags=re.I)
    text = re.sub(r"\bmidnight\b", "12 AM", text, flags=re.I)
    text = re.sub(r"(\d)(am|pm)\b", r"\1 \2", text, flags=re.I)
    return text.strip()


def normalize_day(day_text):
    key = re.sub(r"[^a-z]", "", day_text.lower())
    return DAY_ALIASES.get(key)


def expand_day_token(token):
    range_match = re.match(
        rf"^\s*({DAY_PATTERN})\s*-\s*({DAY_PATTERN})\s*$",
        token.strip(),
        flags=re.I,
    )
    if range_match:
        start = normalize_day(range_match.group(1))
        end = normalize_day(range_match.group(2))
        if not start or not end:
            return []

        start_index = DAYS.index(start)
        end_index = DAYS.index(end)
        if start_index <= end_index:
            return DAYS[start_index : end_index + 1]
        return DAYS[start_index:] + DAYS[: end_index + 1]

    found = []
    for day in re.findall(DAY_PATTERN, token, flags=re.I):
        normalized = normalize_day(day)
        if normalized and normalized not in found:
            found.append(normalized)
    return found


def expand_days(days_text):
    days = []
    for token in re.split(r"\s*,\s*|\s*&\s*|\s+and\s+", days_text, flags=re.I):
        for day in expand_day_token(token):
            if day not in days:
                days.append(day)
    return days


def normalize_time_piece(piece):
    piece = piece.strip().upper().replace(".", "")
    piece = re.sub(r"\s+", " ", piece)
    match = re.match(r"^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$", piece)
    if not match:
        return piece

    hour = int(match.group(1))
    minute = match.group(2)
    suffix = match.group(3)
    if minute and minute != "00":
        return f"{hour}:{minute} {suffix}"
    return f"{hour} {suffix}"


def normalize_times(times_text):
    text = clean_text(times_text)
    if not text:
        return ""
    if re.search(r"\b(closed|close|holiday|not open)\b", text, flags=re.I):
        return "Closed"
    if re.search(r"\b(24\s*hours|open\s*24|24/7)\b", text, flags=re.I):
        return "Open 24 hours"

    time_re = r"\d{1,2}(?::\d{2})?\s*(?:AM|PM)"
    ranges = []
    for start, end in re.findall(rf"({time_re})\s*-\s*({time_re})", text, flags=re.I):
        ranges.append(f"{normalize_time_piece(start)} - {normalize_time_piece(end)}")

    return ", ".join(ranges) if ranges else text


def split_timing_sections(text):
    pattern = re.compile(
        rf"((?:{DAY_PATTERN})(?:\s*-\s*(?:{DAY_PATTERN}))?"
        rf"(?:\s*,\s*(?:{DAY_PATTERN})(?:\s*-\s*(?:{DAY_PATTERN}))?)*)"
        rf"\s*:?\s*",
        flags=re.I,
    )
    matches = list(pattern.finditer(text))
    sections = []

    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        times_text = text[start:end].strip(" ;,")
        if times_text:
            sections.append((match.group(1), times_text))

    return sections


def parse_timings(raw_timings):
    schedule = {day: "Closed" for day in DAYS}
    text = clean_text(raw_timings)
    if not text:
        return schedule

    sections = split_timing_sections(text) or [("Mon-Sun", text)]
    for days_text, times_text in sections:
        times = normalize_times(times_text)
        for day in expand_days(days_text):
            schedule[day] = times

    return schedule


def convert_csv(input_path, output_path, timings_column="timings"):
    with open(input_path, newline="", encoding="utf-8-sig") as input_file:
        reader = csv.DictReader(input_file)
        fieldnames = list(reader.fieldnames or [])
        actual_column = next(
            (name for name in fieldnames if name.lower() == timings_column.lower()),
            timings_column,
        )
        output_column = "structured_timings"
        if output_column not in fieldnames:
            fieldnames.append(output_column)

        rows = []
        for row in reader:
            row[output_column] = json.dumps(
                parse_timings(row.get(actual_column, "")),
                ensure_ascii=False,
            )
            rows.append(row)

    with open(output_path, "w", newline="", encoding="utf-8") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description="Parse restaurant timings in a CSV file.")
    parser.add_argument("input_csv", help="Path to the input CSV file")
    parser.add_argument("output_csv", help="Path to write the output CSV file")
    parser.add_argument("--column", default="timings", help="Timings column name")
    args = parser.parse_args()

    convert_csv(args.input_csv, args.output_csv, args.column)
    print(f"Done. Wrote parsed timings to {args.output_csv}")


if __name__ == "__main__":
    main()
