import React, { useState } from 'react';
import VideoProcessor from './VideoProcessor';
import StatsGrid from './StatsGrid';
import PostList from './PostList';
import LeadList from './LeadList';
import ManualPostInjection from './ManualPostInjection';

const AdminApp = () => {
    const [activeTab, setActiveTab] = useState<'PROCESSOR' | 'ARCHIVE' | 'LEADS' | 'INJECTOR'>('PROCESSOR');

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)]">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
                <button
                    onClick={() => setActiveTab('PROCESSOR')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm border ${activeTab === 'PROCESSOR'
                        ? 'bg-[#00C49A]/10 text-[#00C49A] border-[#00C49A]/30 shadow-[0_0_15px_rgba(0,196,154,0.1)]'
                        : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-800/50 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Procesador de Video
                </button>

                <button
                    onClick={() => setActiveTab('ARCHIVE')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm border ${activeTab === 'ARCHIVE'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-800/50 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    Archivo de Posts
                </button>

                <button
                    onClick={() => setActiveTab('LEADS')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm border ${activeTab === 'LEADS'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                        : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-800/50 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Gestión de Leads
                </button>

                <div className="mt-8 mb-2 px-4 flex items-center gap-2 text-xs font-black uppercase text-red-500/80 tracking-widest">
                    <span>Admin Utils</span>
                    <div className="h-px bg-red-500/20 flex-1"></div>
                </div>

                <button
                    onClick={() => setActiveTab('INJECTOR')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm border ${activeTab === 'INJECTOR'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                        : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-800/50 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    Inyección Manual (JSON)
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 flex flex-col gap-8">
                <StatsGrid />

                <div className="flex-1 animate-fade-in-up">
                    {activeTab === 'PROCESSOR' && (
                        <div className="h-[600px] lg:h-full">
                            <VideoProcessor />
                        </div>
                    )}
                    {activeTab === 'ARCHIVE' && (
                        <div className="h-[600px] lg:h-full">
                            <PostList />
                        </div>
                    )}
                    {activeTab === 'LEADS' && (
                        <div className="h-[600px] lg:h-full">
                            <LeadList />
                        </div>
                    )}
                    {activeTab === 'INJECTOR' && (
                        <div className="h-full">
                            <ManualPostInjection />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminApp;
