import React, { useState } from 'react';

const IMXQuiz = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const questions = [
        {
            id: 1,
            title: "¿Cuántas veces al día comes (incluyendo snacks)?",
            category: "frequency",
            weight: 20,
            options: [
                { text: "1 o 2 veces (Ayuno intermitente)", score: 100 },
                { text: "3 veces (Desayuno, Almuerzo, Cena)", score: 70 },
                { text: "4 a 5 veces (Incluye meriendas)", score: 40 },
                { text: "6 o más veces (Picoteo constante)", score: 10 }
            ]
        },
        {
            id: 2,
            title: "¿Dónde tiendes a acumular más grasa?",
            category: "abdominal_fat",
            weight: 20,
            options: [
                { text: "Distribuida uniformemente", score: 100 },
                { text: "Caderas y muslos", score: 80 },
                { text: "Ligera barriga", score: 50 },
                { text: "Abdomen pronunciado (Grasa visceral)", score: 10 }
            ]
        },
        {
            id: 3,
            title: "¿Cuántas horas pasas sin comer entre la cena y el desayuno?",
            category: "flexibility",
            weight: 15,
            options: [
                { text: "Más de 14 horas", score: 100 },
                { text: "12 a 13 horas", score: 80 },
                { text: "8 a 10 horas", score: 40 },
                { text: "Menos de 8 horas (Ceno tarde y desayuno temprano)", score: 10 }
            ]
        },
        {
            id: 4,
            title: "¿Cómo te sientes después de almorzar?",
            category: "energy",
            weight: 15,
            options: [
                { text: "Lleno de energía y agudeza mental", score: 100 },
                { text: "Normal, sin cambios notables", score: 80 },
                { text: "Un poco somnoliento", score: 40 },
                { text: "Con mucha pesadez y sueño (Necesito siesta)", score: 10 }
            ]
        },
        {
            id: 5,
            title: "¿Podrías hacer ejercicio en ayunas sin marearte?",
            category: "fasting_performance",
            weight: 10,
            options: [
                { text: "Sí, entreno mejor en ayunas", score: 100 },
                { text: "Sí, pero prefiero comer algo pequeño", score: 70 },
                { text: "No, me siento débil o me mareo", score: 30 },
                { text: "Imposible, necesito desayunar antes", score: 10 }
            ]
        },
        {
            id: 6,
            title: "¿Sientes que tu capacidad de recuperación y fuerza ha disminuido significativamente en los últimos años?",
            category: "strength_age",
            weight: 10,
            options: [
                { text: "No, me siento más fuerte que nunca", score: 100 },
                { text: "Me mantengo igual", score: 80 },
                { text: "Un poco, me cuesta más levantar cosas", score: 40 },
                { text: "Sí, notable pérdida de masa muscular", score: 10 }
            ]
        },
        {
            id: 7,
            title: "¿Cómo es tu calidad de sueño?",
            category: "sleep",
            weight: 10,
            options: [
                { text: "Duermo profundo y despierto renovado", score: 100 },
                { text: "Aceptable, 6-7 horas seguidas", score: 70 },
                { text: "Me despierto varias veces en la noche", score: 40 },
                { text: "Insomnio frecuente o sueño no reparador", score: 10 }
            ]
        }
    ];

    const currentQuestion = questions[currentQuestionIndex];
    const progress = Math.round((currentQuestionIndex / questions.length) * 100);

    const handleStart = () => {
        setHasStarted(true);
    };

    const handleAnswer = (score: number, weight: number) => {
        const weightedPoints = (score / 100) * weight;
        const newScore = totalScore + weightedPoints;
        setTotalScore(newScore);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishQuiz(newScore);
        }
    };

    const finishQuiz = (finalScore: number) => {
        setIsThinking(true);
        setTimeout(() => {
            sessionStorage.setItem('imx_score', Math.round(finalScore).toString());
            window.location.href = '/diagnostico';
        }, 1500);
    };

    if (!hasStarted) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 text-white text-center">
                <h2 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00C49A] to-[#007BFF]">
                    Test de Diagnóstico Metabólico
                </h2>
                <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                    Descubre tu <span className="font-bold text-[#00C49A]">Índice Metabólico Personal (IMX)</span> y recibe una estrategia personalizada en menos de 2 minutos.
                </p>
                <button
                    onClick={handleStart}
                    className="w-full sm:w-auto px-8 py-4 bg-[#00C49A] hover:bg-[#00A885] text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#00C49A]/20"
                >
                    Comenzar Diagnóstico Gratuito
                </button>
            </div>
        );
    }

    if (isThinking) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/20 text-white text-center">
                <div className="w-16 h-16 border-4 border-[#00C49A] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-2xl font-bold mb-2">Analizando tus biomarcadores...</h3>
                <p className="text-gray-300">Generando tu reporte IMX personalizado.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 text-white">
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                        className="bg-[#00C49A] h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-white min-h-[64px]">
                {currentQuestion.title}
            </h3>

            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswer(option.score, currentQuestion.weight)}
                        className="w-full text-left p-4 rounded-xl border border-gray-600 bg-gray-800/50 hover:bg-[#00C49A]/20 hover:border-[#00C49A] transition-all duration-200 group flex items-center justify-between"
                    >
                        <span className="text-gray-200 group-hover:text-white font-medium">
                            {option.text}
                        </span>
                        <div className="w-5 h-5 rounded-full border border-gray-500 group-hover:border-[#00C49A] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00C49A] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default IMXQuiz;
