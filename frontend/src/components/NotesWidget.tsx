import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';

export const NotesWidget: React.FC = () => {
    const [notes, setNotes] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const response = await axios.get<{ notes: string[] }>('/notes');
                setNotes(response.data.notes);
            } catch (err) {
                setError('Failed to load notes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();

        // Optional: Poll for updates every 30 seconds
        const interval = setInterval(fetchNotes, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mb-6 px-2">
            <div className="flex items-center gap-2 text-[#37352F] dark:text-[#D4D4D4] mb-1 font-medium text-sm">
                <FileText size={16} className="text-[#9B9A97]" />
                <span>Pending Notes</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {loading && notes.length === 0 ? (
                    <div className="text-xs text-[#9B9A97] italic px-1">Loading...</div>
                ) : error ? (
                    <div className="text-xs text-red-400 px-1">{error}</div>
                ) : notes.length === 0 ? (
                    <div className="text-xs text-[#9B9A97] px-1">No pending notes</div>
                ) : (
                    notes.map((note, idx) => (
                        <div key={idx} className="group p-1 hover:bg-[#EDECE9] dark:hover:bg-[#2C2C2C] rounded cursor-pointer transition-colors">
                            <div className="text-xs text-[#37352F] dark:text-[#D4D4D4] line-clamp-2 leading-relaxed pl-1 border-l-2 border-transparent group-hover:border-[#D3D1CB] dark:group-hover:border-[#555]">
                                {note}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
