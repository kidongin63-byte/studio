import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: "검색어가 필요합니다." }, { status: 400 });
    }

    try {
        // 실제 운영 시에는 Google Places API, Kakao Map API 등을 연동합니다.
        // 현재는 시뮬레이션 데이터를 반환하여 UI 흐름을 확인합니다.

        console.log(`[Place Search Requested] Query: ${query}`);

        // 검색어에 따른 맞춤형 가짜 데이터 생성
        let items = [
            {
                id: "place-01",
                name: `${query.replace("추천", "").trim()}`,
                address: query.includes("서울") ? `서울특별시 종로구 ${query.split(' ')[0]}길 42` :
                    query.includes("강원") ? `강원특별자치도 강릉시 해안로 123` :
                        query.includes("인천") ? `인천광역시 남동구 문화로 77` :
                            query.includes("부산") ? `부산광역시 해운대구 해변로 55` :
                                `바다님 근처 ${query.split(' ')[0]} 관련 장소`,
                mapUrl: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
                mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
                category: query.includes("명소") || query.includes("여행") ? "추천" : "장소"
            }
        ];

        // 병원 관련 검색일 경우 태그 추가
        if (query.includes("병원") || query.includes("약국") || query.includes("의원")) {
            items[0].category = "의료";
        } else if (query.includes("맛집") || query.includes("식당")) {
            items[0].category = "음식";
        }

        return NextResponse.json({ items });
    } catch (error: any) {
        console.error("Place Search API Error:", error);
        return NextResponse.json({ error: "장소 검색 중 오류가 발생했습니다." }, { status: 500 });
    }
}
