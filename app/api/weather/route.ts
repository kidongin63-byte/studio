import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || "천안"; // 기본값 천안

    try {
        const apiKey = process.env.KAKAO_REST_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API 키가 구성되지 않았습니다." }, { status: 500 });
        }

        // 1. 카카오 로컬 API로 주소를 좌표로 변환
        const geoRes = await fetch(
            `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
            { headers: { Authorization: `KakaoAK ${apiKey}` } }
        );
        const geoData = await geoRes.json();

        let lat = "36.8151"; // 천안 기본 좌표
        let lng = "127.1139";
        let locationName = query;

        if (geoData.documents && geoData.documents.length > 0) {
            lat = geoData.documents[0].y;
            lng = geoData.documents[0].x;
            locationName = geoData.documents[0].address_name;
        }

        // 2. Open-Meteo API로 날씨 정보 조회
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FSeoul`
        );
        const weatherData = await weatherRes.json();

        if (!weatherRes.ok) {
            throw new Error("날씨 정보를 가져오지 못했습니다.");
        }

        const current = weatherData.current;
        const code = current.weather_code;

        // weather_code를 한글 설명으로 변환 (WMO 코드 기준)
        const weatherDesc: { [key: number]: { text: string, icon: string } } = {
            0: { text: "맑음", icon: "☀️" },
            1: { text: "대체로 맑음", icon: "🌤️" },
            2: { text: "구름 조금", icon: "⛅" },
            3: { text: "흐림", icon: "☁️" },
            45: { text: "안개", icon: "🌫️" },
            48: { text: "서리 안개", icon: "🌫️" },
            51: { text: "가벼운 이슬비", icon: "🌦️" },
            53: { text: "이슬비", icon: "🌦️" },
            55: { text: "강한 이슬비", icon: "🌦️" },
            61: { text: "약한 비", icon: "🌧️" },
            63: { text: "비", icon: "🌧️" },
            65: { text: "강한 비", icon: "🌧️" },
            71: { text: "약한 눈", icon: "❄️" },
            73: { text: "눈", icon: "❄️" },
            75: { text: "강한 눈", icon: "❄️" },
            95: { text: "천둥번개", icon: "⛈️" },
        };

        const result = {
            location: locationName,
            temp: Math.round(current.temperature_2m),
            feelTemp: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            desc: weatherDesc[code]?.text || "정보 없음",
            icon: weatherDesc[code]?.icon || "❓",
            wind: current.wind_speed_10m,
            precipitation: current.precipitation
        };

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Weather API Error:", error);
        return NextResponse.json({ error: "날씨 정보를 가져오는데 실패했습니다." }, { status: 500 });
    }
}
