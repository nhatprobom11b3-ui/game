import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '../lib/utils';

interface LeaderboardEntry {
  id: string;
  name: string;
  className: string;
  score: number;
  date: string;
}

export function Leaderboard({ limit = 10 }: { limit?: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const loadLeaderboard = () => {
      const data = localStorage.getItem('leaderboard');
      if (data) {
        let parsed = JSON.parse(data);
        // De-duplicate by ID to prevent key collision errors
        const seen = new Set();
        const unique = parsed.filter((item: any) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setEntries(unique);
      }
    };
    loadLeaderboard();
    
    window.addEventListener('storage', loadLeaderboard);
    return () => window.removeEventListener('storage', loadLeaderboard);
  }, []);

  if (entries.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        Chưa có dữ liệu. Hãy là người đầu tiên chơi!
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const others = entries.slice(3, limit);

  return (
    <div className="flex flex-col gap-6">
      {/* Top 3 Vinh Danh */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-4 text-white text-center">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-100" />
            <h2 className="text-lg font-black uppercase tracking-tight">Top 3 Vinh Danh</h2>
          </div>
        </div>
        
        <div className="p-2 space-y-1">
          {top3.map((entry, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={entry.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-all",
                index === 0 ? "bg-amber-50 border border-amber-100" : 
                index === 1 ? "bg-slate-50 border border-slate-100" : 
                "bg-orange-50/50 border border-orange-100"
              )}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">
                {index === 0 ? <Trophy className="w-5 h-5 text-amber-500" /> :
                 index === 1 ? <Medal className="w-5 h-5 text-slate-400" /> :
                 <Award className="w-5 h-5 text-orange-400" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800 text-sm truncate">{entry.name}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Lớp {entry.className}</div>
              </div>
              
              <div className="text-right">
                <div className="font-black text-lg text-blue-600 leading-none">{entry.score}</div>
                <div className="text-[8px] text-slate-400 font-bold">ĐIỂM</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Danh sách học sinh tham gia */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 flex-1">
        <div className="bg-slate-800 p-3 text-white">
          <h3 className="text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Học sinh tham gia
          </h3>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
          {others.length > 0 ? (
            others.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-300 w-4">#{index + 4}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-700">{entry.name}</div>
                    <div className="text-[9px] text-slate-400 font-medium">Lớp {entry.className}</div>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-400">{entry.score} đ</div>
              </div>
            ))
          ) : (
             entries.length <= 3 && (
               <div className="p-6 text-center text-[10px] text-slate-400 font-medium italic">
                 Kết quả các bạn khác sẽ hiện tại đây
               </div>
             )
          )}
        </div>
      </div>
    </div>
  );
}
