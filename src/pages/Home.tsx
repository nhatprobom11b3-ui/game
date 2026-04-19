import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Play, Settings, Camera, Download } from 'lucide-react';
import Webcam from 'react-webcam';
import { Leaderboard } from '../components/Leaderboard';
import { cn } from '../lib/utils';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function Home() {
  const navigate = useNavigate();
  const { startGame, isLoading } = useGame();
  const { isInstallable, promptInstall } = usePWAInstall();
  
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [level, setLevel] = useState('all');
  const [camError, setCamError] = useState<string | null>(null);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !className || isLoading) return;
    
    startGame({ name, className, level });
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-4 md:p-8 flex flex-col items-center relative overflow-x-hidden overflow-y-auto font-sans">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-[var(--color-accent)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="w-full max-w-6xl mt-12 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 relative z-10">
        {/* Left Side: Game Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.05)] border-4 border-[var(--color-secondary)] self-start"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black text-[var(--color-primary)] mb-4 tracking-tight">
              SỬ VIỆT KỲ THÚ
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-px w-8 bg-slate-200"></span>
              <p className="text-[var(--color-dark)] font-black text-sm uppercase tracking-widest opacity-60">Điều khiển bằng cử chỉ tay 🖐️</p>
              <span className="h-px w-8 bg-slate-200"></span>
            </div>
          </div>

          <div className="mb-10 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[var(--color-accent)] shadow-xl bg-slate-200 relative flex items-center justify-center">
              {/* @ts-ignore */}
              <Webcam 
                audio={false} 
                mirrored={true} 
                muted={true}
                playsInline={true}
                className="w-full h-full object-cover" 
                videoConstraints={{ facingMode: "user" }}
                onUserMediaError={(err: any) => setCamError(err?.message || err?.name || "Lỗi")}
              />
              <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-300">
                <Camera className="w-8 h-8 animate-pulse" />
              </div>
              {camError ? (
                <div className="absolute inset-0 bg-red-100/90 flex items-center justify-center p-2 text-center">
                  <span className="text-red-600 text-[9px] font-black uppercase tracking-tight">Lỗi: {camError}</span>
                </div>
              ) : (
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="bg-[var(--color-dark)] text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                    Camera Test
                  </span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-4 text-center px-4 uppercase tracking-wide">
              {camError === "Permission denied" || camError === "NotAllowedError" 
                ? "Trình duyệt đang chặn Camera. Hãy bấm vào biểu tượng 🔒 trên thanh địa chỉ để Cho phép." 
                : camError 
                  ? "Vui lòng cấp quyền Camera trên trình duyệt và tải lại trang." 
                  : "Hãy cho phép truy cập Camera để chơi game"}
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">Họ và Tên</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[var(--color-secondary)] transition-all outline-none font-bold text-slate-700"
                  placeholder="Nhập tên..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">Lớp học</label>
                <input 
                  type="text" 
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[var(--color-secondary)] transition-all outline-none font-bold text-slate-700"
                  placeholder="VD: 5A1"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">Cấp độ thử thách</label>
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[var(--color-secondary)] transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả câu hỏi 🌍</option>
                <option value="easy">Cấp độ Dễ 🌱</option>
                <option value="medium">Cấp độ Trung bình ⚔️</option>
                <option value="hard">Cấp độ Khó 🔥</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full text-white font-black text-2xl py-5 rounded-2xl shadow-[0_6px_0_#9b2c2c] transition-all flex items-center justify-center gap-3 mt-10 active:scale-[0.98]",
                isLoading 
                  ? "bg-slate-400 shadow-[0_6px_0_#64748b] cursor-not-allowed" 
                  : "bg-[var(--color-primary)] hover:translate-y-[2px] hover:shadow-[0_3px_0_#9b2c2c] active:translate-y-[4px] active:shadow-none shadow-[0_6px_0_#9b2c2c]"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ĐANG CHUẨN BỊ...
                </>
              ) : (
                <>
                  <Play className="w-8 h-8 fill-current" />
                  BẮT ĐẦU VẬN ĐỘNG
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full mt-4 py-4 bg-slate-50/80 hover:bg-slate-100 text-slate-500 hover:text-[var(--color-primary)] border-2 border-transparent hover:border-slate-200 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <Settings className="w-5 h-5" /> Quản trị hệ thống
            </button>

            {isInstallable && (
              <button 
                type="button"
                onClick={promptInstall}
                className="w-full mt-4 py-4 bg-blue-50/80 hover:bg-blue-100 text-blue-600 border-2 border-transparent hover:border-blue-200 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <Download className="w-5 h-5" /> Cài đặt ứng dụng lên máy tính
              </button>
            )}
          </form>
        </motion.div>

        {/* Right Side: Leaderboard split into Top 3 and List */}
        <motion.div
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
        >
          <Leaderboard limit={15} />
        </motion.div>
      </div>
    </div>
  );
}
