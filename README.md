# BRAI Data Dashboard

노드 환경에서 실행되는 간단한 데이터 대시보드입니다. `spec/API_SPECIFICATION_v1.3.md`에 정의된 계통(Strains) API 명세를 기반으로 데이터세트 목록/상세 및 계통 표현형을 시각화합니다.

## 주요 기능
- **데이터세트 목록 조회**: `/api/datasets` 경유해 원본 API `/api/dataset`을 호출합니다.
- **데이터세트 상세 조회**: `/api/datasets/:id` → 원본 API `/api/dataset/:id`(POST) 호출.
- **계통 상세 및 표현형 차트**: `/api/strains/:id` → 원본 API `/api/strains/:id`(POST) 호출 후 Chart.js 바 차트 렌더링.
- **모의 데이터 모드**: 실제 API 접근이 어려운 환경을 위해 예시 응답(mock)을 제공합니다.

## 실행 방법
```bash
# 1) 저장소 클론 후 의존성 설치 (외부 네트워크가 막힌 경우 생략 가능)
# npm install

# 2) 서버 실행
USE_MOCK=true PORT=3000 node src/server.js
# 또는 package.json 스크립트
npm run dev
```

- 기본 포트: `3000`
- 환경변수:
  - `API_BASE_URL`: 실제 API 베이스 URL (기본 `http://localhost:8000`).
  - `USE_MOCK`: `true`이면 `src/mockData.js`의 예시 응답으로 동작.

서버 기동 후 `http://localhost:3000`으로 접속하면 대시보드를 확인할 수 있습니다. 상단 상태 영역에서 실제 API 연동 모드/모의 모드를 확인할 수 있습니다.
