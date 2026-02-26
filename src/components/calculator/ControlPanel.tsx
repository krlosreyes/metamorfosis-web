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
        <div className="w-full">
            <div className="flex justify-between items-end mb-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">{label}</label>
                <div className={`font-black text-xl ${activeColor} transition-colors`}>{value}<span className="text-gray-500 text-sm ml-1">{unit}</span></div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-amber-500 transition-all focus:outline-none"
            />
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
        <div className="w-full flex flex-col gap-6 z-10 bg-gray-900/40 p-6 md:p-8 rounded-3xl border border-gray-800 backdrop-blur-md shadow-2xl">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-teal-400 mb-2">Biometría</h2>

            <div className="flex gap-4 mb-2">
                <button
                    className={`flex-1 py-3 rounded-xl border ${props.gender === 'male' ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-gray-900 border-gray-700 text-gray-400'} uppercase font-bold tracking-widest transition-all`}
                    onClick={() => props.setGender('male')}
                >Masculino</button>
                <button
                    className={`flex-1 py-3 rounded-xl border ${props.gender === 'female' ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-gray-900 border-gray-700 text-gray-400'} uppercase font-bold tracking-widest transition-all`}
                    onClick={() => props.setGender('female')}
                >Femenino</button>
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
