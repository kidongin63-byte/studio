// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc, query, where, orderBy, limit, getDocs } from "firebase/firestore";

// .env.local에 저장한 키값을 불러옵니다.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 앱 초기화 (중복 실행 방지)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- [ 1. 인증 로직 ] ---

// 구글 로그인 (박아들, 이주무관용)
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
};

// 익명 로그인 (김할머니가 번거로운 가입 없이 시작할 때)
export const signInUserAnonymously = async () => {
    return await signInAnonymously(auth);
};

// --- [ 2. Firestore 데이터 저장 (CRUD) ] ---

/**
 * 1단계: 사용자 정보 생성 (users 컬렉션)
 * 김할머니 정보, 동의 여부, AI 학습 기초 데이터를 저장합니다.
 */
export const createUserProfile = async (userId: string, data: any) => {
    try {
        return await updateDoc(doc(db, "users", userId), {
            ...data,
            agreedAt: serverTimestamp(), // 동의 시각 저장
            status: "safe", // 초기 상태는 항상 '안전'
        });
    } catch (e) {
        console.error("Firebase Error (createUserProfile):", e);
    }
};

/**
 * 2단계: 대화 기록 저장 (conversations 컬렉션)
 * AI와 할머니의 따뜻한 대화를 저장합니다.
 */
export const saveConversation = async (userId: string, message: string, sender: "user" | "ai", extraData?: any) => {
    try {
        return await addDoc(collection(db, "conversations"), {
            userId,
            message,
            sender,
            timestamp: serverTimestamp(),
            ...extraData
        });
    } catch (e) {
        console.error("Firebase Error (saveConversation):", e);
    }
};

/**
 * 2.5단계: 최근 대화 내용 가져오기
 * AI에게 이전 대화의 맥락(Memory)을 제공하기 위해 사용합니다.
 */
export const getRecentConversations = async (userId: string, count: number = 6) => {
    try {
        const q = query(
            collection(db, "conversations"),
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(count)
        );
        const querySnapshot = await getDocs(q);
        // 최신순으로 가져오되, 다시 대화 순서대로(오름차순) 정렬하여 반환
        return querySnapshot.docs
            .map(doc => doc.data())
            .reverse();
    } catch (e) {
        console.error("Firebase Error (getRecentConversations):", e);
        return [];
    }
};

/**
 * 3단계: 이상징후 로그 생성 (alerts 컬렉션)
 * Level 1(주의), 2(경고), 3(위험)으로 구분합니다.
 */
export const createAlert = async (userId: string, level: 1 | 2 | 3, reason: string) => {
    try {
        return await addDoc(collection(db, "alerts"), {
            userId,
            level,
            reason,
            isResolved: false, // 이주무관이 확인했는지 여부
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Firebase Error (createAlert):", e);
    }
};

/**
 * 4단계: 푸시 알림 전송 (FCM/가상)
 * 실제 서비스 시 FCM 토큰 기반 발송으로 고도화가 필요합니다.
 */
export const sendPushNotification = async (target: string, title: string, body: string) => {
    console.log(`[Push Notification] To: ${target} | Title: ${title} | Body: ${body}`);
    // 실제 FCM 구현 시 이곳에 로직 추가
    return { success: true, messageId: "simulated-id" };
};

/**
 * 5단계: 일정 저장 (schedules 컬렉션)
 * AI가 추출한 일정을 저장합니다.
 */
export const saveSchedule = async (userId: string, schedule: { title: string, date: string, time: string }) => {
    try {
        return await addDoc(collection(db, "schedules"), {
            userId,
            ...schedule,
            status: "pending", // 알림 대기 중
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Firebase Error (saveSchedule):", e);
    }
};