import re
from datetime import datetime

def parse_time(t_str):
    t_str = t_str.strip().lower()
    if 'noon' in t_str:
        return 12, 0
    if 'midnight' in t_str:
        return 0, 0
    
    # match like "11:30 am" or "11 am" or "11am"
    m = re.match(r'(\d+)(?::(\d+))?\s*(am|pm)', t_str)
    if not m:
        return None
    h = int(m.group(1))
    m_val = int(m.group(2)) if m.group(2) else 0
    ampm = m.group(3)
    
    if ampm == 'pm' and h < 12:
        h += 12
    if ampm == 'am' and h == 12:
        h = 0
    return h, m_val

def is_open_now(timings_str, current_time=None):
    if not timings_str:
        return False
        
    timings_str_lower = timings_str.lower()
    if '24 hours' in timings_str_lower or '24 hrs' in timings_str_lower:
        return True
    
    if current_time is None:
        current_time = datetime.now()
        
    curr_h = current_time.hour
    curr_m = current_time.minute
    curr_minutes = curr_h * 60 + curr_m
    
    # Clean up day restrictions like "(Mon-Sun)"
    timings_str = re.sub(r'\(.*?\)', '', timings_str)
    
    intervals = timings_str.split(',')
    for interval in intervals:
        parts = interval.split(' to ')
        if len(parts) != 2:
            parts = interval.split('-')
        if len(parts) == 2:
            start_t = parse_time(parts[0])
            end_t = parse_time(parts[1])
            
            if start_t and end_t:
                start_mins = start_t[0] * 60 + start_t[1]
                end_mins = end_t[0] * 60 + end_t[1]
                
                if end_mins <= start_mins: # spans midnight
                    if curr_minutes >= start_mins or curr_minutes <= end_mins:
                        return True
                else:
                    if start_mins <= curr_minutes <= end_mins:
                        return True
    return False
