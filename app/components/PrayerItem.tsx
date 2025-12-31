import React from 'react';
import { Check, Lock, Clock } from 'lucide-react';

interface PrayerItemProps {
    name: string;
    time: string;
    isLocked: boolean;
    isDone: boolean;
    onToggle: () => void;
}

const PrayerItem: React.FC<PrayerItemProps> = ({
    name,
    time,
    isLocked,
    isDone,
    onToggle,
}) => {
    return (
        <div className={`p-4 rounded-xl border mb-3 transition-all duration-200 ${isLocked
                ? 'bg-gray-100 border-gray-200 text-gray-400'
                : isDone
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isLocked
                            ? 'bg-gray-200'
                            : isDone
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-50 text-blue-600'
                        }`}>
                        {isLocked ? <Lock size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                        <h3 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
                            {name}
                        </h3>
                        <p className="text-sm font-medium opacity-80">{time}</p>
                    </div>
                </div>

                <button
                    onClick={onToggle}
                    disabled={isLocked}
                    className={`
            flex items-center justify-center w-10 h-10 rounded-full transition-all
            ${isLocked
                            ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                            : isDone
                                ? 'bg-green-500 text-white shadow-green-200 shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }
          `}
                >
                    <Check size={20} className={isDone ? 'opacity-100' : 'opacity-50'} />
                </button>
            </div>
        </div>
    );
};

export default PrayerItem;
