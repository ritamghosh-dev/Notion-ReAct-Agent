import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { CalendarResponse } from '../types';

export const CalendarWidget: React.FC = () => {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [events, setEvents] = useState<CalendarResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<CalendarResponse>(`http://localhost:8000/calendar?date=${date}`);
                setEvents(response.data);
            } catch (err) {
                setError('Failed to load events');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchEvents, 30000);
        return () => clearInterval(interval);
    }, [date]);

    return (
        <div className="mb-6 px-2">
            <div className="flex items-center gap-2 text-[#37352F] dark:text-[#D4D4D4] mb-1 font-medium text-sm">
                <CalendarIcon size={16} className="text-[#9B9A97]" />
                <span>Calendar</span>
            </div>

            {/* Date Picker */}
            <div className="mb-2">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-1 bg-transparent border border-[#E9E9E7] dark:border-[#333] rounded text-[#37352F] dark:text-[#D4D4D4] focus:outline-none focus:border-[#9B9A97]"
                />
            </div>

            {/* Events List */}
            <div className="space-y-1">
                {loading && !events ? (
                    <div className="text-xs text-[#9B9A97] italic px-1">Loading...</div>
                ) : error ? (
                    <div className="text-xs text-red-400 px-1">{error}</div>
                ) : events?.events.length === 0 ? (
                    <div className="text-xs text-[#9B9A97] px-1">No events</div>
                ) : (
                    events?.events.map((evt, idx) => (
                        <div key={idx} className="flex items-start gap-1 p-1 hover:bg-[#EDECE9] dark:hover:bg-[#2C2C2C] rounded group cursor-default">
                            <div className="mt-0.5 text-[#9B9A97]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#E3E2E0] dark:bg-[#444] group-hover:bg-[#D3D1CB] dark:group-hover:bg-[#555]"></div>
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-[#37352F] dark:text-[#D4D4D4] leading-tight">{evt.event}</div>
                                <div className="text-[10px] text-[#9B9A97]">{evt.time}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
