import React from 'react';

// Isolated Slider Component
interface SliderFieldProps {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    setter: (val: number) => void;
    activeColor: string;
}

export const SliderField: React.FC<SliderFieldProps> = ({ label, value, min, max, unit, setter, activeColor }) => {
    return (
        <div className="w-full relative mb-6">
            <div className="flex items-center justify-between mb-2">
                <label className="text-gray-400 font-sans text-xs uppercase tracking-widest">{label}</label>
                <div className="flex items-center">
                    <span className={`font-black text-lg ${activeColor} transition-colors`}>{value}</span>
                    <span className="text-gray-500 text-xs ml-1 font-bold">{unit}</span>
                </div>
            </div>
            <div className="relative flex items-center h-4">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => setter(Number(e.target.value))}
                    className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
                />

                {/* Custom Track */}
                <div className="absolute w-full h-[2px] bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-teal-500 transition-all duration-150 ease-out"
                        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
                    />
                </div>

                {/* Custom Thumb */}
                <div
                    className="absolute w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.8)] pointer-events-none transition-all duration-150 ease-out"
                    style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 6px)` }}
                />
            </div>
        </div>
    );
};

interface ControlPanelProps {
    gender: 'male' | 'female';
    setGender: (g: 'male' | 'female') => void;
    weight: number;
    setWeight: (w: number) => void;
    height: number;
    setHeight: (h: number) => void;
    waist: number;
    setWaist: (w: number) => void;
    hip: number;
    setHip: (h: number) => void;
    neck: number;
    setNeck: (n: number) => void;
    textColor: string;
}

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    return (
        <div className="w-full flex flex-col z-10 bg-[#0B1120]/80 p-6 md:p-8 rounded-[32px] border border-[#1E293B] shadow-2xl relative">
            <h2 className="text-xl font-black uppercase tracking-widest text-[#2DD4BF] mb-6 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">BIOMETRÍA</h2>

            <div className="flex gap-4 mb-8">
                <button
                    className={`flex-1 py-2 rounded-xl border ${props.gender === 'male' ? 'bg-[#0F172A] border-[#2DD4BF] text-[#2DD4BF]' : 'bg-[#0F172A] border-[#1E293B] text-gray-400'} uppercase text-sm font-bold tracking-widest transition-all`}
                    onClick={() => props.setGender('male')}
                >MASCULINO</button>
                <button
                    className={`flex-1 py-2 rounded-xl border ${props.gender === 'female' ? 'bg-[#0F172A] border-[#2DD4BF] text-[#2DD4BF]' : 'bg-[#0F172A] border-[#1E293B] text-gray-400'} uppercase text-sm font-bold tracking-widest transition-all`}
                    onClick={() => props.setGender('female')}
                >FEMENINO</button>
            </div>

            <div className="space-y-6">
                <SliderField label="Peso" value={props.weight} min={40} max={150} unit="kg" setter={props.setWeight} activeColor={props.textColor} />
                <SliderField label="Altura" value={props.height} min={140} max={220} unit="cm" setter={props.setHeight} activeColor={props.textColor} />
                <SliderField label="Cintura" value={props.waist} min={50} max={150} unit="cm" setter={props.setWaist} activeColor={props.textColor} />
                <SliderField label="Cadera" value={props.hip} min={50} max={160} unit="cm" setter={props.setHip} activeColor={props.textColor} />
                <SliderField label="Cuello" value={props.neck} min={25} max={60} unit="cm" setter={props.setNeck} activeColor={props.textColor} />
            </div>
        </div>
    );
};

export default ControlPanel;
