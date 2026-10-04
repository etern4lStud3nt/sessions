"""Shared utility helpers."""
from datetime import datetime

def parse_js_date(value: str) -> datetime:
        value = value.strip()
        return datetime.fromisoformat(value.replace("Z", "+00:00"))


def get_date_diff(date_input : str) -> str:
    """
    Get the difference between two ISO 8601 date strings.
    :param date_input: A string in the ISO format "start_date,end_date"
    :return A string representing the difference in days, hours, minutes, and seconds (e.g., "1 day, 2 hours, 3 minutes, 4 seconds").
    """
    
    iso_dates = date_input.split(",")
    start_date = parse_js_date(iso_dates[0])
    end_date = parse_js_date(iso_dates[1])
    time_delta = end_date - start_date
    
    diff = {
        "days": time_delta.days,
        "hours": time_delta.seconds // (60 * 60),
        "minutes": time_delta.seconds % (60 * 60) // 60,
        "seconds": time_delta.seconds % (60)
    }
    
    sub_strings = []

    for key, value in diff.items():
        # Determine the correct unit (singular or plural) based on the value
        unit = key[:-1] if value == 1 else key
        # Only add to the list if the value is greater than 0
        if value > 0:
            sub_strings.append(f"{value} {unit}")

    return ", ".join(sub_strings)

def get_natural_date(date_input : str) -> str:
    """
    Convert the ISO date to natural language format (e.g., "25 March 2001, 04:00")
    :param date_input: The date in ISO format
    :return A string representing the date and time in natural language
    """
    
    date_input = parse_js_date(date_input)
    return date_input.strftime("%d %B %Y, %H:%M")
    
    
