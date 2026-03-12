export interface Note {
    content: string;
}

export interface CalendarEvent {
    event: string;
    time: string;
}

export interface CalendarResponse {
    events: CalendarEvent[];
    date: string;
}
