// app/home/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
    Mic, Send, Keyboard, Heart, Sparkles, MessageCircle, Pencil,
    BarChart3, AlertCircle, Phone, MapPin, Pill, Activity, Settings, X, Volume2, ChevronRight, ChevronLeft, Zap, SlidersHorizontal, Calendar, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import YouTube from "react-youtube";
import { saveSchedule, db } from "@/lib/firebase";
import { Solar, Lunar } from "lunar-javascript";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addYears,
    subYears,
    getYear,
    getMonth,
    addDays,
    subDays
} from "date-fns";
import { ko } from "date-fns/locale";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface Message {
    role: "user" | "ai";
    content: string;
    videoId?: string;
    placeData?: {
        name: string;
        address: string;
        mapUrl: string;
        mapEmbedUrl?: string;
        category?: string;
        phone?: string;
        operatingHours?: string;
        lat?: string;
        lng?: string;
    };
    scheduleData?: {
        title: string;
        date: string;
        time: string;
    };
}

declare global {
    interface Window {
        kakao: any;
    }
}

const KakaoMap = ({ lat, lng }: { lat?: string, lng?: string }) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!lat || !lng || !mapRef.current) return;

        const initMap = () => {
            window.kakao.maps.load(() => {
                if (!mapRef.current) return;
                const options = {
                    center: new window.kakao.maps.LatLng(lat, lng),
                    level: 3
                };
                const map = new window.kakao.maps.Map(mapRef.current, options);
                const markerPosition = new window.kakao.maps.LatLng(lat, lng);
                const marker = new window.kakao.maps.Marker({
                    position: markerPosition
                });
                marker.setMap(map);
            });
        };

        // 카카오 객체가 로드될 때까지 잠시 기다렸다가 초기화
        const checkKakao = setInterval(() => {
            if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
                initMap();
                clearInterval(checkKakao);
            }
        }, 100);

        return () => clearInterval(checkKakao);
    }, [lat, lng]);

    return <div ref={mapRef} className="w-full h-full min-h-[180px] bg-slate-100" />;
};

const MemoView = ({ setHomeView, setInput, input }: { setHomeView: (view: "dashboard" | "chat" | "memo" | "calendar") => void, setInput: (val: string) => void, input: string }) => (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom-20 duration-500">
        <header className="p-4 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
            <Button
                variant="ghost"
                className="flex items-center gap-1 px-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl"
                onClick={() => setHomeView("dashboard")}
            >
                <ChevronLeft className="w-6 h-6" />
                <span className="font-bold text-lg">이전</span>
            </Button>
            <div className="text-slate-800 font-black text-xl">메모 남기기</div>
            <Button
                variant="ghost"
                className="text-brand-purple font-black text-lg"
                onClick={() => {
                    setHomeView("dashboard");
                    setInput("");
                }}
            >
                완료
            </Button>
        </header>

        <div className="flex-1 p-8 flex flex-col space-y-6">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
                <Pencil className="w-6 h-6" />
                <span className="font-bold text-lg">현재 나를 메모해보세요</span>
            </div>
            <textarea
                autoFocus
                className="w-full flex-1 bg-slate-50/50 rounded-[32px] p-8 text-2xl font-bold border-2 border-dashed border-slate-200 outline-none focus:border-brand-purple/30 focus:bg-white transition-all resize-none leading-relaxed placeholder:text-slate-300"
                placeholder="여기에 내용을 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>

        <div className="p-8 pb-12 shrink-0">
            <Button
                onClick={() => {
                    setHomeView("dashboard");
                    setInput("");
                }}
                className="w-full h-18 rounded-full bg-brand-purple text-white text-2xl font-black shadow-lg shadow-brand-purple/20"
            >
                저장하고 돌아가기
            </Button>
        </div>
    </div>
);

const DashboardView = ({ setHomeView, setActiveTab, toggleVoice, setIsSettingsOpen }: { setHomeView: (view: "dashboard" | "chat" | "memo" | "calendar") => void, setActiveTab: (tab: string) => void, toggleVoice: () => void, setIsSettingsOpen: (open: boolean) => void }) => (
    <div className="flex flex-col h-full bg-transparent text-slate-800 animate-in fade-in duration-500">
        <header className="p-6 flex justify-between items-center bg-transparent shrink-0">
            <div className="w-10" />
            <div className="text-slate-400 font-bold text-lg">곁이 함께하고 있어요</div>
            <Button
                onClick={() => setIsSettingsOpen(true)}
                variant="ghost"
                className="w-10 h-10 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all p-0"
            >
                <Settings className="w-6 h-6" />
            </Button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-start pt-4 px-8 text-center overflow-y-auto hide-scrollbar">
            <div className="mb-10 mt-2 flex justify-center w-full">
                <div className="relative w-44 h-44">
                    <div className="absolute inset-0 bg-brand-purple/10 rounded-full animate-pulse-ring" style={{ animationDelay: '0s' }} />
                    <div className="absolute inset-0 bg-brand-purple/10 rounded-full animate-pulse-ring" style={{ animationDelay: '1s' }} />
                    <div className="absolute inset-0 bg-brand-purple/10 rounded-full animate-pulse-ring" style={{ animationDelay: '2s' }} />

                    <div className="relative w-full h-full bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner border border-white/50">
                        <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-45 overflow-hidden">
                            <div className="transform -rotate-45 flex items-center justify-center p-3">
                                <Image src="/gyeot-logo.svg" alt="Logo" width={90} height={90} className="object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-8 bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-[32px] shadow-sm max-w-[320px] mx-auto">
                <h2 className="text-[28px] md:text-[32px] font-black leading-tight tracking-tight">
                    지금 상태가<br />평소와 조금 다른 것 같아요
                </h2>
                <p className="text-[17px] text-slate-500 font-medium leading-relaxed">
                    잠시 호흡을 가다듬고<br />
                    상태를 확인해보는 건 어떨까요?
                </p>
            </div>

            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-brand-purple/10 text-brand-purple rounded-full text-[13px] font-black tracking-widest uppercase mb-12">
                <div className="w-4.5 h-4.5 bg-brand-purple rounded-md flex items-center justify-center shadow-sm shadow-brand-purple/30">
                    <BarChart3 className="w-3 h-3 text-white" />
                </div>
                LIVE ANALYSIS
            </div>
        </div>

        <div className="dashboard-card bg-white p-10 pb-14 shadow-[0_-15px_40px_rgba(0,0,0,0.04)] animate-in slide-in-from-bottom-12 duration-700 shrink-0">
            <div className="max-w-[340px] mx-auto w-full space-y-10">
                <Button
                    onClick={() => setHomeView("chat")}
                    className="w-full h-18 rounded-[28px] bg-brand-purple hover:bg-brand-purple/95 text-white text-[28px] font-black flex items-center justify-center gap-4 shadow-[0_12px_24px_rgba(161,99,241,0.25)] transition-all hover:scale-[1.02] active:scale-95"
                >
                    <MessageCircle className="w-7 h-7 fill-white/20" />
                    대화하기
                </Button>

                <div className="grid grid-cols-2 gap-6">
                    <Button
                        variant="secondary"
                        onClick={toggleVoice}
                        className="h-16 rounded-[24px] bg-blue-100/80 hover:bg-blue-200 text-blue-700 font-black text-[19px] border border-blue-200/50 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <Mic className="w-5 h-5 text-blue-600" />
                        음성/말하기
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setActiveTab("report")}
                        className="h-16 rounded-[24px] bg-emerald-100/80 hover:bg-emerald-200 text-emerald-700 font-black text-[19px] border border-emerald-200/50 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <BarChart3 className="w-5 h-5 text-emerald-600" />
                        리포트
                    </Button>
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={() => setHomeView("memo")}
                        className="flex-1 h-28 rounded-[28px] bg-white border border-slate-100 flex flex-col items-center justify-center gap-3 shadow-md shadow-slate-200/40 hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-all group"
                    >
                        <div className="w-10 h-10 bg-brand-purple/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Pencil className="w-5 h-5 text-brand-purple" />
                        </div>
                        <span className="text-lg font-black text-slate-700">메모 작성</span>
                    </Button>

                    <Button
                        onClick={() => setHomeView("calendar")}
                        className="flex-1 h-28 rounded-[28px] bg-white border border-slate-100 flex flex-col items-center justify-center gap-3 shadow-md shadow-slate-200/40 hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-10 h-10 bg-emerald-500/5 rounded-bl-3xl -mr-3 -mt-3 transition-transform group-hover:scale-150" />

                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-emerald-100/50">
                            <div className="relative">
                                <Calendar className="w-7 h-7 text-emerald-600" />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce" />
                            </div>
                        </div>
                        <span className="text-lg font-black text-slate-700">달력 보기</span>
                    </Button>
                </div>

                <div className="pt-2">
                    <Button
                        onClick={() => setActiveTab("emergency")}
                        className="w-full h-20 rounded-[28px] bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-[24px] font-black flex items-center justify-center gap-4 border border-red-500 shadow-[0_12px_24px_rgba(255,77,77,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <AlertCircle className="w-8 h-8 fill-white/20" />
                        긴급호출
                    </Button>
                </div>
            </div>
        </div>
    </div>
);

const ChatView = ({ messages, input, setInput, handleSendMessage, toggleVoice, setHomeView, isListening, isLoading, scrollRef, userName }: { messages: Message[], input: string, setInput: (val: string) => void, handleSendMessage: (text?: string) => void, toggleVoice: () => void, setHomeView: (view: "dashboard" | "chat" | "memo" | "calendar") => void, isListening: boolean, isLoading: boolean, scrollRef: React.RefObject<HTMLDivElement | null>, userName: string }) => (
    <div className="flex flex-col h-full bg-[#FDFCF8] animate-in slide-in-from-right-10 duration-500">
        <header className="p-4 flex justify-between items-center bg-white/60 backdrop-blur-md z-10 border-b border-slate-100">
            <Button
                variant="ghost"
                className="flex items-center gap-1 px-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl"
                onClick={() => setHomeView("dashboard")}
            >
                <ChevronLeft className="w-6 h-6" />
                <span className="font-bold text-lg">이전</span>
            </Button>
            <div className="font-bold text-slate-700">반디와 대화</div>
            <div className="w-16" />
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-3 hide-scrollbar min-h-0">
            <div className="space-y-20 max-w-[380px] mx-auto pb-16 px-1">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col mb-[20px] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`flex items-end gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                            <Avatar className={cn(
                                "border-none shadow-none shrink-0",
                                msg.role === "ai" ? "!w-[70px] !h-[70px] bg-transparent" : "!w-12 !h-12 bg-transparent"
                            )}>
                                <AvatarImage src={msg.role === "ai" ? "/gyeot-logo.svg" : ""} className="object-contain" />
                                <AvatarFallback className={cn(
                                    "rounded-full border-2",
                                    msg.role === "ai" ? "bg-brand-purple/5 border-transparent" : "bg-green-50 border-green-200"
                                )}>
                                    {msg.role === "ai" ? (
                                        <Sparkles className="w-6 h-6 text-brand-purple" />
                                    ) : (
                                        <span className={cn(
                                            "font-black text-green-700",
                                            userName.length > 2 ? "text-xs px-1" : "text-sm"
                                        )}>
                                            {userName}
                                        </span>
                                    )}
                                </AvatarFallback>
                            </Avatar>

                            <div className={cn(
                                "p-4 px-5 rounded-2xl font-bold leading-snug shadow-sm w-fit",
                                msg.role === "user"
                                    ? "bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] rounded-br-none text-[18px] max-w-[100%] mr-[10px] p-[7px]"
                                    : "bg-white text-slate-800 rounded-tl-none border border-slate-50 text-[18px] max-w-[100%] p-[7px]"
                            )}>
                                {msg.content}
                                {msg.videoId && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                                        <YouTube
                                            videoId={msg.videoId}
                                            opts={{
                                                width: "100%",
                                                height: "180",
                                                playerVars: {
                                                    autoplay: 1,
                                                    origin: typeof window !== "undefined" ? window.location.origin : "",
                                                },
                                            }}
                                            onReady={(event) => {
                                                event.target.playVideo();
                                            }}
                                        />
                                    </div>
                                )}
                                {msg.placeData && (
                                    <div className="mt-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3 shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                                                        msg.placeData.category === "의료" ? "bg-red-50 text-red-600" :
                                                            msg.placeData.category === "음식" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {msg.placeData.category || "장소"}
                                                    </div>
                                                </div>
                                                <p className="font-black text-slate-800 text-xl leading-tight mb-2">{msg.placeData.name}</p>

                                                <div className="flex flex-col gap-2 bg-slate-100/50 p-3 rounded-xl border border-slate-100">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                                                        <p className="text-[15px] text-slate-700 font-bold leading-tight">
                                                            <span className="text-slate-900 mr-1">장소 :</span> {msg.placeData.address}
                                                        </p>
                                                    </div>

                                                    {msg.placeData.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                                                            <p className="text-[15px] text-slate-700 font-bold leading-tight">
                                                                <span className="text-slate-900 mr-1">TEL :</span> {msg.placeData.phone}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {msg.placeData.operatingHours && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
                                                            <p className="text-[15px] text-slate-700 font-bold leading-tight">
                                                                <span className="text-slate-900 mr-1">근무시간 :</span> {msg.placeData.operatingHours}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-brand-purple shrink-0">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                        </div>

                                        {/* 지도 미리보기 (카카오 지도 SDK) */}
                                        <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-100 h-[180px] relative">
                                            <KakaoMap lat={msg.placeData.lat} lng={msg.placeData.lng} />
                                        </div>

                                        <Button
                                            className="w-full h-11 rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm"
                                            onClick={() => window.open(msg.placeData?.mapUrl, "_blank")}
                                        >
                                            <MapPin className="w-4 h-4" />
                                            내비게이션으로 길 찾기 (앱 연동)
                                        </Button>
                                    </div>
                                )}
                                {msg.scheduleData && (
                                    <div className="mt-3 p-5 bg-white rounded-2xl border-2 border-brand-purple/20 flex flex-col gap-3 shadow-md animate-in zoom-in-95 duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple shrink-0">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black text-brand-purple uppercase tracking-tight">반디 일정 비서</p>
                                                <p className="font-black text-slate-800 text-lg leading-tight">{msg.scheduleData.title}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-600 font-bold">{msg.scheduleData.date || "날짜 미상"}</p>
                                            </div>
                                            {msg.scheduleData.time && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    <p className="text-sm text-slate-600 font-bold">{msg.scheduleData.time}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 h-11 rounded-xl bg-brand-purple text-white font-black text-sm shadow-sm"
                                                onClick={async () => {
                                                    if (msg.scheduleData) {
                                                        await saveSchedule("kim-grandma-01", msg.scheduleData);
                                                        alert("일정이 저장되었습니다! 당일에 반디가 잊지 않고 알려드릴게요. ✨");
                                                    }
                                                }}
                                            >
                                                저장하기
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 animate-pulse opacity-70 mt-1">
                        <div className="w-5 h-5 bg-brand-purple/5 rounded-full flex items-center justify-center">
                            <Sparkles className="w-2.5 h-2.5 text-brand-purple" />
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl text-[13px] font-bold text-slate-400">
                            반디가 생각 중...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
        </div>

        <div className="p-3 pb-8 bg-white border-t border-slate-100">
            <div className="flex gap-2 items-center bg-slate-100/50 p-1 rounded-full border border-slate-200 focus-within:bg-white focus-within:border-brand-purple/30 transition-all z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleVoice}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-brand-purple shadow-sm"
                    )}
                >
                    <Mic className="w-4 h-4" />
                </Button>
                <input
                    autoFocus
                    className="flex-1 h-10 bg-transparent px-2 text-[15px] font-bold outline-none text-slate-800 min-w-0"
                    placeholder="메시지를 입력하세요..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <Button
                    size="icon"
                    className="w-10 h-10 rounded-full bg-brand-purple hover:bg-brand-purple/90 shrink-0 transition-all active:scale-95 shadow-md flex items-center justify-center"
                    onClick={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    disabled={!input.trim() || isLoading}
                >
                    <Send className="w-4 h-4 text-white" />
                </Button>
            </div>
        </div>
    </div>
);


const CalendarView = ({ setHomeView }: { setHomeView: (view: "dashboard" | "chat" | "memo" | "calendar") => void }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"month" | "year" | "day">("month");
    const [schedules, setSchedules] = useState<any[]>([]);

    useEffect(() => {
        // Firebase에서 일정 가져오기
        const q = query(collection(db, "schedules"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSchedules(data);
        });
        return () => unsubscribe();
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextYear = () => setCurrentDate(addYears(currentDate, 1));
    const prevYear = () => setCurrentDate(subYears(currentDate, 1));

    const getLunarInfo = (date: Date) => {
        // @ts-ignore
        const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
        const lunar = solar.getLunar();
        const nextLunar = solar.next(1).getLunar();

        const isFirstDay = lunar.getDay() === 1;
        const is15thDay = lunar.getDay() === 15;
        const isLastDay = nextLunar.getDay() === 1;

        let lunarDateStr = "";
        if (isFirstDay || is15thDay || isLastDay) {
            // "음) M.dd" 형식
            lunarDateStr = `${lunar.getMonth()}.${lunar.getDay() < 10 ? '0' + lunar.getDay() : lunar.getDay()}`;
        } else {
            // "음) dd일" 형식
            lunarDateStr = `${lunar.getDay()}일`;
        }

        const jieQi = lunar.getJieQi(); // 절기
        const festivals = lunar.getFestivals(); // 공휴일/명절

        return {
            lunarDay: `음) ${lunarDateStr}`,
            jieQi: jieQi || null,
            isFestival: festivals.length > 0
        };
    };

    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-10 duration-500 overflow-hidden">
            <header className="p-4 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
                <Button
                    variant="ghost"
                    className="flex items-center gap-1 px-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl"
                    onClick={() => setHomeView("dashboard")}
                >
                    <ChevronLeft className="w-6 h-6" />
                    <span className="font-bold text-lg">이전</span>
                </Button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={prevYear} className="p-1 text-slate-300 hover:text-brand-purple"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-slate-800 font-black text-xl">{format(currentDate, "yyyy년", { locale: ko })}</span>
                        <button onClick={nextYear} className="p-1 text-slate-300 hover:text-brand-purple"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={prevMonth} className="p-1 text-slate-300 hover:text-brand-purple"><ChevronLeft className="w-6 h-6" /></button>
                        <span className="text-brand-purple font-black text-2xl">{format(currentDate, "M월", { locale: ko })}</span>
                        <button onClick={nextMonth} className="p-1 text-slate-300 hover:text-brand-purple"><ChevronRight className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="w-10" /> {/* Balance */}
            </header>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
                <div className="grid grid-cols-7 mb-2">
                    {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                        <div key={d} className={cn(
                            "text-center font-black text-sm pb-2",
                            i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-slate-400"
                        )}>{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {days.map((day, i) => {
                        const { lunarDay, jieQi, isFestival } = getLunarInfo(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        const daySchedules = schedules.filter(s => s.date === format(day, "yyyy-MM-dd"));

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[100px] bg-white p-2 flex flex-col gap-1 transition-colors hover:bg-slate-50 cursor-pointer",
                                    !isCurrentMonth && "bg-slate-50/50 opacity-40"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-lg font-black",
                                        isToday && "w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center -m-1",
                                        !isToday && (
                                            (i % 7 === 0 || isFestival) ? "text-red-500" :
                                                (i % 7 === 6) ? "text-blue-500" :
                                                    "text-slate-700"
                                        )
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {jieQi && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">{jieQi}</span>}
                                </div>
                                <div className={cn(
                                    "text-[10px] font-medium",
                                    (i % 7 === 0 || isFestival) ? "text-red-400" :
                                        (i % 7 === 6) ? "text-blue-400" :
                                            "text-slate-400"
                                )}>{lunarDay}</div>

                                <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                                    {daySchedules.map((s, idx) => (
                                        <div key={idx} className="text-[10px] bg-brand-purple/10 text-brand-purple px-1 py-0.5 rounded truncate font-bold">
                                            {s.title} {s.time && `(${s.time})`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 pb-10">
                    <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-brand-purple" />
                        이번 달 주요 일정
                    </h3>
                    <div className="space-y-3">
                        {schedules
                            .filter(s => isSameMonth(new Date(s.date), currentDate))
                            .sort((a, b) => a.date.localeCompare(b.date))
                            .map((s, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-slate-400">{format(new Date(s.date), "M월")}</span>
                                        <span className="text-lg font-black text-brand-purple">{format(new Date(s.date), "d")}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-lg font-black text-slate-800">
                                            {s.title} {s.time && `(${s.time})`}
                                        </div>
                                        <div className="text-sm font-bold text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {s.time}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[12px] font-bold",
                                        s.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                        {s.status === "completed" ? "완료" : "예정"}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex gap-3">
                <Button className="flex-1 h-14 rounded-2xl bg-brand-purple text-white text-lg font-black shadow-lg shadow-brand-purple/20">
                    <Pencil className="w-5 h-5 mr-2" />
                    새 일정 직접 적기
                </Button>
            </div>
        </div>
    );
};


export default function HomePage() {
    const [userName, setUserName] = useState("바다");
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: `${userName}님~ 저 반디예요! 오늘 기분은 좀 어떠세요? ✨` }
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("home");
    const [homeView, setHomeView] = useState<"dashboard" | "chat" | "memo" | "calendar">("dashboard");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedFont, setSelectedFont] = useState("font-nanum-gothic");
    const [selectedVoice, setSelectedVoice] = useState<number>(0);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [currentPlayingVideoId, setCurrentPlayingVideoId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // TTS 설정
    const [femaleVoices, setFemaleVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [maleVoices, setMaleVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceType, setSelectedVoiceType] = useState<"female" | "male">("female");
    const [voiceIndex, setVoiceIndex] = useState(0);

    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            const korVoices = allVoices.filter(v => v.lang.includes("ko"));

            // 단순 인덱스 방식이 브라우저마다 다르므로, 뉘앙스로 구분 시도
            // (보통 이름에 'Dami', 'Heami' 등은 여성, 'Jinhwan' 등은 남성인 경우가 많음)
            const females = korVoices.filter(v =>
                v.name.includes("Dami") || v.name.includes("Heami") || v.name.includes("Sun-Hi") || v.name.includes("Hye-Hyeon") || !v.name.includes("Jinhwan")
            );
            const males = korVoices.filter(v => v.name.includes("Jinhwan") || v.name.includes("Kwang-Ho"));

            setFemaleVoices(females);
            setMaleVoices(males);
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        const savedFont = localStorage.getItem("bandi-font");
        const savedVoiceConfig = localStorage.getItem("bandi-voice-config"); // { type: 'female', index: 0 }
        const savedName = localStorage.getItem("bandi-user-name");

        if (savedFont) setSelectedFont(savedFont);
        if (savedVoiceConfig) {
            const config = JSON.parse(savedVoiceConfig);
            setSelectedVoiceType(config.type);
            setVoiceIndex(config.index);
        }
        if (savedName) {
            setUserName(savedName);
            setMessages([{ role: "ai", content: `${savedName}님~ 저 반디예요! 오늘 기분은 좀 어떠세요? ✨` }]);
        }
    }, []);

    const speak = (text: string) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        // 미모티콘 및 이모지 읽기 방지를 위해 텍스트에서 이모지 제거
        const cleanText = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);

        const targetVoices = selectedVoiceType === "female" ? femaleVoices : maleVoices;
        if (targetVoices[voiceIndex]) {
            utterance.voice = targetVoices[voiceIndex];
        }

        utterance.lang = "ko-KR";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (scrollRef.current && activeTab === "home" && homeView === "chat") {
            // UI가 렌더링되고 비디오 플레이어가 자리 잡을 시간을 약간 준 뒤 스크롤 실행
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 150);
        }
    }, [messages, activeTab, homeView]);

    const handleSendMessage = async (text?: string) => {
        const messageToSend = text || input;
        if (!messageToSend.trim() || isLoading) return;

        setInput("");
        setShowKeyboard(false);
        setIsListening(false);

        // 새로운 대화 시작 시 기존 재생 중이던 음악/영상 종료 (사용자 요청 사항)
        setCurrentPlayingVideoId(null);
        setMessages(prev => prev.map(msg => ({ ...msg, videoId: undefined })));

        setMessages(prev => [...prev, { role: "user", content: messageToSend }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: "kim-grandma-01",
                    userName: userName,
                    message: messageToSend,
                    guardianContact: "010-1234-5678"
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
            speak(data.reply);

            // 음악 재생 신호가 있으면 유튜브 검색 및 재생 (오디오 전용: 숨김 플레이어)
            if (data.playMusicKeyword) {
                try {
                    const ytResponse = await fetch(`/api/youtube?q=${encodeURIComponent(data.playMusicKeyword)}`);
                    const ytData = await ytResponse.json();
                    if (ytData.videoId) {
                        setCurrentPlayingVideoId(null); // 잠시 초기화 후 다시 세팅하여 리렌더링 유도
                        setTimeout(() => setCurrentPlayingVideoId(ytData.videoId), 100);
                    }
                } catch (ytError) {
                    console.error("YouTube Search Error:", ytError);
                }
            }

            // 영상 시청 신호가 있으면 유튜브 검색 후 말풍선에 비디오 ID 추가 (비디오: 화면 표시)
            if (data.showVideoKeyword) {
                try {
                    const ytResponse = await fetch(`/api/youtube?q=${encodeURIComponent(data.showVideoKeyword)}`);
                    const ytData = await ytResponse.json();
                    if (ytData.videoId) {
                        setMessages(prev => {
                            const newMessages = [...prev];
                            // 방금 추가된 AI의 답변 객체에 videoId를 추가
                            newMessages[newMessages.length - 1] = {
                                ...newMessages[newMessages.length - 1],
                                videoId: ytData.videoId
                            };
                            return newMessages;
                        });
                    }
                } catch (ytError) {
                    console.error("YouTube Search Error:", ytError);
                }
            }

            // 장소 검색 신호가 있으면 장소 검색 후 말풍선에 데이터 추가
            if (data.searchPlaceKeyword) {
                try {
                    const placeRes = await fetch(`/api/places?q=${encodeURIComponent(data.searchPlaceKeyword)}`);
                    const placeData = await placeRes.json();
                    if (placeData.items && placeData.items.length > 0) {
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = {
                                ...newMessages[newMessages.length - 1],
                                placeData: placeData.items[0]
                            };
                            return newMessages;
                        });
                    }
                } catch (placeError) {
                    console.error("Place Search Error:", placeError);
                }
            }

            // 일정 추가 신호가 있으면 말풍선에 데이터 추가
            if (data.scheduleData) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        ...newMessages[newMessages.length - 1],
                        scheduleData: data.scheduleData
                    };
                    return newMessages;
                });
            }
        } catch (error) {
            const errorMsg = `아이구 ${userName}님, 잠시 반디가 졸았나봐요. 다시 말씀해 주시겠어요?`;
            setMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoice = () => {
        if (typeof window === "undefined") return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "ko-KR";
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => handleSendMessage(event.results[0][0].transcript);
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
        recognitionRef.current = recognition;
    };



    return (
        <div className={cn("flex flex-col h-[100dvh] bg-transparent relative overflow-hidden transition-all duration-500", selectedFont)}>
            <div className="flex-1 overflow-hidden relative">
                {activeTab === "home" && (
                    homeView === "dashboard" ? <DashboardView
                        setHomeView={setHomeView}
                        setActiveTab={setActiveTab}
                        toggleVoice={toggleVoice}
                        setIsSettingsOpen={setIsSettingsOpen}
                    /> :
                        homeView === "chat" ? <ChatView
                            messages={messages}
                            input={input}
                            setInput={setInput}
                            handleSendMessage={handleSendMessage}
                            toggleVoice={toggleVoice}
                            setHomeView={setHomeView}
                            isListening={isListening}
                            isLoading={isLoading}
                            scrollRef={scrollRef}
                            userName={userName}
                        /> :
                            homeView === "calendar" ? <CalendarView
                                setHomeView={setHomeView}
                            /> :
                                <MemoView
                                    setHomeView={setHomeView}
                                    setInput={setInput}
                                    input={input}
                                />
                )}

                {activeTab === "report" && (
                    <ScrollArea className="h-full px-5 py-8 hide-scrollbar bg-white">
                        <div className="max-w-md mx-auto space-y-6 pb-32">
                            <div className="flex items-center justify-between mb-8 relative">
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-1 px-2 -ml-2 text-[#465166] hover:bg-slate-50 rounded-xl z-10"
                                    onClick={() => { setActiveTab("home"); setHomeView("dashboard"); }}
                                >
                                    <ChevronLeft className="w-5 h-5 -ml-1" />
                                    <span className="font-bold text-[15px]">이전</span>
                                </Button>
                                <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
                                    <h2 className="text-[18px] font-black text-slate-800 tracking-tight">곁리포트</h2>
                                </div>
                            </div>

                            <div className="bg-[#F8F6FC] p-[10px] mt-[15px] mb-[10px] rounded-[32px] flex flex-col space-y-5 shadow-sm border border-purple-100/30">
                                <div className="flex items-center gap-2 text-brand-purple pt-[10px]">
                                    <div className="w-9 h-9 bg-brand-purple rounded-full flex justify-center items-center shadow-sm">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[20px] font-black tracking-tight">&nbsp;반디의 요약</span>
                                </div>
                                <p className="text-[18px] font-bold leading-[1.8] text-slate-800 tracking-normal min-h-[5rem] px-[10px]">
                                    "${userName}님, 오늘 기분도 좋으시고 약도 잘 챙겨 드셨네요! 산책 다녀오신 것도 정말 잘하셨어요. 대화도 많이 해서 반디가 기뻐요."
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-[10px]">
                                <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 h-[150px]">
                                    <div className="w-11 h-11 bg-blue-50 rounded-full flex justify-center items-center mb-1">
                                        <Zap className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                                    </div>
                                    <span className="text-slate-400 text-[13px] font-bold">활동량</span>
                                    <span className="text-[16px] text-slate-800 font-black">충분함</span>
                                </div>
                                <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 h-[150px]">
                                    <div className="w-11 h-11 bg-emerald-50 rounded-full flex justify-center items-center mb-1">
                                        <SlidersHorizontal className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-400 text-[13px] font-bold">약 복용</span>
                                    <span className="text-[16px] text-slate-800 font-black">완료</span>
                                </div>
                            </div>

                            <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 mt-2">
                                <h3 className="text-[20px] p-[10px] pl-[20px] mb-8 text-slate-800 font-black tracking-tight" style={{ textShadow: "0 0 1px rgba(0,0,0,0.1)" }}>오늘의 대화 패턴</h3>
                                <div className="relative h-28 mt-2 mx-2">
                                    <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.15" />
                                                <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,35 C15,10 25,18 30,25 C45,45 55,45 65,30 C75,5 85,15 100,30 L100,50 L0,50 Z" fill="url(#chartGradient)" />
                                        <path d="M0,35 C15,10 25,18 30,25 C45,45 55,45 65,30 C75,5 85,15 100,30" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="21" cy="18" r="2.5" fill="#A855F7" />
                                        <circle cx="75" cy="10" r="2.5" fill="#A855F7" />
                                    </svg>
                                </div>
                                <div className="flex justify-between mt-4 text-[16px] text-slate-400 font-bold px-2 p-[10px] tracking-wide">
                                    <span>오전</span><span>정오</span><span>오후</span>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                )}

                {activeTab === "emergency" && (
                    <div className="h-full px-6 py-8 flex flex-col items-center space-y-12 bg-white animate-in slide-in-from-bottom-20 duration-500">
                        <header className="w-full flex justify-between items-center bg-transparent mb-4">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-1 px-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl"
                                onClick={() => { setActiveTab("home"); setHomeView("dashboard"); }}
                            >
                                <ChevronLeft className="w-6 h-6" />
                                <span className="font-bold text-lg">이전</span>
                            </Button>
                            <div className="font-bold text-slate-700 text-lg">긴급 상황</div>
                            <div className="w-16" />
                        </header>
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-black text-red-600 animate-pulse">도움이 필요하신가요?</h2>
                            <p className="text-xl font-bold text-slate-400">아래 버튼을 3초간 꾹 눌러주세요</p>
                        </div>

                        <button className="w-72 h-72 bg-red-500 rounded-full shadow-[0_30px_60px_rgba(239,68,68,0.3)] border-[15px] border-red-50 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 group-active:animate-none" />
                            <AlertCircle className="w-24 h-24 text-white" />
                            <span className="text-3xl font-black text-white">긴급출동</span>
                        </button>

                        <div className="w-full max-w-sm space-y-4">
                            <div className="bg-slate-50 p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500">
                                        <Phone className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-black uppercase tracking-wider">보호자 (박아들)</p>
                                        <p className="text-xl font-black text-slate-700">010-1234-5678</p>
                                    </div>
                                </div>
                                <Button size="icon" className="rounded-full bg-blue-500 w-12 h-12 shadow-lg shadow-blue-500/20">
                                    <Phone className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-500">
                                        <MapPin className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-black uppercase tracking-wider">내 위치 확인</p>
                                        <p className="text-lg font-black text-slate-700">집 (서울 종로구)</p>
                                    </div>
                                </div>
                                <Button size="icon" variant="outline" className="rounded-full w-12 h-12 bg-white shadow-sm">
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F8F6FC] animate-in fade-in duration-300">
                    <div className="bg-[#F8F6FC] w-full h-full max-w-md shadow-2xl overflow-hidden flex flex-col relative">
                        {/* Header */}
                        {/* Header */}
                        <div className="p-4 sm:p-6 flex items-center justify-center relative shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors z-10"
                                onClick={() => setIsSettingsOpen(false)}
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </Button>
                            <h2 className="text-xl font-bold text-brand-purple">
                                반디 설정
                            </h2>
                        </div>

                        <div className="p-5 sm:p-6 space-y-8 overflow-y-auto flex-1 hide-scrollbar bg-[#F8F6FC] pb-32">
                            {/* 나의 호칭 설정 */}
                            <section className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-400 px-1">
                                    나의 호칭 설정
                                </h3>
                                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-purple-100/50 flex flex-col items-center justify-center space-y-4">
                                    <div className="text-5xl font-black text-brand-purple tracking-tight">
                                        {userName || "대장"}
                                    </div>
                                    <p className="text-sm font-medium text-slate-400">
                                        반디가 당신을 부르는 호칭입니다
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="mt-2 rounded-full px-6 h-10 border-brand-purple/20 text-brand-purple text-sm font-bold hover:bg-brand-purple/5 transition-colors"
                                        onClick={() => {
                                            const newName = prompt("새로운 호칭을 입력해주세요 (최대 10자)", userName);
                                            if (newName !== null && newName.trim() !== "") {
                                                const truncated = newName.trim().slice(0, 10);
                                                setUserName(truncated);
                                                localStorage.setItem("bandi-user-name", truncated);
                                            }
                                        }}
                                    >
                                        변경하기
                                    </Button>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-400 px-1">
                                    반디 목소리
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[14px] font-bold text-slate-500 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                            여성
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(femaleVoices.length > 0 ? femaleVoices : [null, null, null]).slice(0, 3).map((v, idx) => (
                                                <Button
                                                    key={`female-${idx}`}
                                                    variant={selectedVoiceType === "female" && voiceIndex === idx ? "default" : "outline"}
                                                    className={cn(
                                                        "h-12 rounded-full font-bold text-[14px] transition-all border",
                                                        selectedVoiceType === "female" && voiceIndex === idx
                                                            ? "bg-white border-brand-purple text-brand-purple shadow-sm"
                                                            : "bg-white border-white text-slate-600 hover:border-brand-purple/30 shadow-sm"
                                                    )}
                                                    onClick={() => {
                                                        setSelectedVoiceType("female");
                                                        setVoiceIndex(idx);
                                                        localStorage.setItem("bandi-voice-config", JSON.stringify({ type: "female", index: idx }));
                                                        const testMsg = "반디 여성 목소리예요!";
                                                        const utterance = new SpeechSynthesisUtterance(testMsg);
                                                        if (femaleVoices[idx]) utterance.voice = femaleVoices[idx];
                                                        window.speechSynthesis.cancel();
                                                        window.speechSynthesis.speak(utterance);
                                                    }}
                                                >
                                                    {`여성 ${idx + 1}`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[14px] font-bold text-slate-500 px-1 mt-6">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                            남성
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(maleVoices.length > 0 ? maleVoices : [null, null, null]).slice(0, 3).map((v, idx) => (
                                                <Button
                                                    key={`male-${idx}`}
                                                    variant={selectedVoiceType === "male" && voiceIndex === idx ? "default" : "outline"}
                                                    className={cn(
                                                        "h-12 rounded-full font-bold text-[14px] transition-all border",
                                                        selectedVoiceType === "male" && voiceIndex === idx
                                                            ? "bg-white border-brand-purple text-brand-purple shadow-sm"
                                                            : "bg-white border-white text-slate-600 hover:border-brand-purple/30 shadow-sm"
                                                    )}
                                                    onClick={() => {
                                                        if (maleVoices.length === 0) {
                                                            alert("이 기기에서는 남성 목소리를 지원하지 않을 수 있습니다.");
                                                            return;
                                                        }
                                                        setSelectedVoiceType("male");
                                                        setVoiceIndex(idx);
                                                        localStorage.setItem("bandi-voice-config", JSON.stringify({ type: "male", index: idx }));
                                                        const testMsg = "반디 남성 목소리예요!";
                                                        const utterance = new SpeechSynthesisUtterance(testMsg);
                                                        if (maleVoices[idx]) utterance.voice = maleVoices[idx];
                                                        window.speechSynthesis.cancel();
                                                        window.speechSynthesis.speak(utterance);
                                                    }}
                                                >
                                                    {`남성 ${idx + 1}`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-400 px-1">
                                    글꼴 선택
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { id: "font-nanum-gothic", name: "표준 정석체 (나눔고딕)", class: "font-nanum-gothic" },
                                        { id: "font-nanum-myeongjo", name: "인자한 명조체 (나눔명조)", class: "font-nanum-myeongjo" },
                                        { id: "font-black-han-sans", name: "진하고 굵은체 (블랙한산스)", class: "font-black-han-sans" }
                                    ].map((font) => (
                                        <Button
                                            key={font.id}
                                            variant={selectedFont === font.id ? "default" : "outline"}
                                            className={cn(
                                                "w-full h-14 rounded-full text-[15px] font-bold justify-center border transition-all shadow-sm",
                                                font.class,
                                                selectedFont === font.id
                                                    ? "bg-white border-brand-purple text-brand-purple"
                                                    : "bg-white border-white hover:border-brand-purple/30 text-slate-600"
                                            )}
                                            onClick={() => {
                                                setSelectedFont(font.id);
                                                localStorage.setItem("bandi-font", font.id);
                                            }}
                                        >
                                            {font.name}
                                        </Button>
                                    ))}
                                </div>
                            </section>

                            {/* Footer area inside scroll for mobile feel */}
                            <div className="pt-8 pb-4 flex flex-col items-center justify-center opacity-40">
                                <p className="text-xl font-bold tracking-[0.2em] text-brand-purple mb-1">GYEOT</p>
                                <p className="text-[10px] text-slate-400">© 2024 GYEOT. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 숨겨진 유튜브 오디오 플레이어 (브라우저 자동재생 정책 대응을 위해 display:none 대신 화면 밖 배치) */}
            {currentPlayingVideoId && (
                <div className="fixed -top-full -left-full w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
                    <YouTube
                        videoId={currentPlayingVideoId}
                        opts={{
                            width: "64",
                            height: "64",
                            playerVars: {
                                autoplay: 1,
                                controls: 0,
                                disablekb: 1,
                                fs: 0,
                                origin: typeof window !== "undefined" ? window.location.origin : "",
                            },
                        }}
                        onReady={(event) => {
                            event.target.playVideo();
                        }}
                    />
                </div>
            )}
        </div>
    );
}