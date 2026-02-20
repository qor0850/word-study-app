# WordApp — 개인 영어 단어 학습 앱

브라우저의 Web Speech API를 통한 발음 기능을 제공하는 개인 영어 단어 학습 웹 앱입니다.
단어는 1일차 ~ 30일차 구조로 관리하며, 모든 CRUD는 별도 인증 없이 사용 가능합니다.

## 기술 스택

| 계층       | 기술                                                     |
|------------|----------------------------------------------------------|
| 백엔드     | Python 3.12, FastAPI, SQLAlchemy (async), PostgreSQL     |
| 프론트엔드 | React 18, Vite, Tailwind CSS, React Router, react-i18next |
| PWA        | vite-plugin-pwa (오프라인 캐싱, 홈 화면 설치 가능)       |
| 인프라     | Docker Compose (db + backend + frontend/nginx)           |

## 빠른 시작

```bash
# 1. 프로젝트 진입
cd word-service

# 2. env 파일 복사 (필요하면 수정)
cp .env.example .env

# 3. 전체 빌드 및 실행
docker compose up --build
```

브라우저에서 **http://localhost** 를 열어주세요.

## 개발 환경 (Docker 제외)

**백엔드**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

export DATABASE_URL="postgresql+asyncpg://worduser:wordpass@localhost:5432/worddb"
uvicorn app.main:app --reload --port 8000
```

**프론트엔드**
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000 에서 실행됨
```

> `npm run dev` 실행 중 `/words`, `/days` 경로의 API 호출은 `http://localhost:8000` 으로 자동 프록시됩니다.

## 화면 구성

| 경로               | 설명                              |
|--------------------|-----------------------------------|
| `/`                | 1~30일차 학습 일정 그리드         |
| `/days/:n`         | 해당 일차 단어 목록 + 추가/수정/삭제 |
| `/words/new`       | 새 단어 추가 폼                   |
| `/words/:id`       | 단어 상세 보기                    |
| `/words/:id/edit`  | 단어 수정 폼                      |
| `/study`           | 플래시카드 학습 모드               |

## API 참고

| 메서드 | 경로              | 설명              |
|--------|-------------------|-------------------|
| GET    | /days             | 30개 일차 + 단어 수 조회 |
| GET    | /days/{n}/words   | 해당 일차 단어 목록 |
| GET    | /words            | 전체 단어 목록 (검색/필터) |
| POST   | /words            | 단어 생성          |
| GET    | /words/{id}       | 단어 상세 조회      |
| PUT    | /words/{id}       | 단어 수정          |
| DELETE | /words/{id}       | 단어 삭제          |
| GET    | /health           | 상태 확인          |

### 단어 스키마

```json
{
  "id": "uuid",
  "word": "ephemeral",
  "meaning": "매우 짧은 시간 동안 지속되는.",
  "example": "The ephemeral beauty of cherry blossoms.",
  "study_day": 3,
  "created_at": "2026-02-19T00:00:00"
}
```

## 발음

**스피커 버튼**을 클릭하면 브라우저의 **Web Speech API**를 사용합니다.
API 키가 필요하지 않으며, 모든 최신 브라우저와 모바일에서 작동합니다.

## PWA 설치

모바일(Chrome/Safari)에서 앱을 열고 **"홈 화면에 추가"** 를 사용하여 네이티브 앱처럼 설치하세요.

## 환경 변수

| 변수명           | 기본값                                              | 설명                        |
|------------------|-----------------------------------------------------|-----------------------------|
| `DATABASE_URL`   | `postgresql+asyncpg://worduser:wordpass@db:5432/worddb` | PostgreSQL 연결 URL         |
| `CORS_ORIGINS`   | `http://localhost,http://localhost:80`              | 허용할 CORS 오리진 (쉼표 구분) |
