# Paper 1 GitHub Upload Guide 🚀

본 가이드는 `/Users/min/.gemini/antigravity/scratch/paper 1` 폴더에 있는 프로젝트를 GitHub에 업로드하는 방법을 설명합니다.

## 1단계: GitHub 저장소 만들기
1. [github.com](https://github.com)에 접속하여 로그인합니다.
2. 오른쪽 상단의 **+** 아이콘을 누르고 **New repository**를 선택합니다.
3. Repository name에 `paper-research-deconstruction` (또는 원하는 이름)을 입력합니다.
4. **Create repository** 버튼을 누릅니다.

## 2단계: 터미널에서 명령 실행하기
아래 명령어를 터미널(`paper 1` 폴더 안)에서 순서대로 입력하세요.

```bash
# 1. Git 초기화
git init

# 2. 모든 파일 추가
git add .

# 3. 첫 번째 커밋
git commit -m "Initialize Paper Research Deconstruction v95.0"

# 4. 브랜치 이름을 main으로 변경
git branch -M main

# 5. 내 저장소 연결 (GITHUB_URL 부분을 본인의 저장소 주소로 바꾸세요)
# 예: git remote add origin https://github.com/사용자아이디/저장소이름.git
git remote add origin [나의_GITHUB_URL]

# 6. 업로드 (Push)
git push -u origin main
```

## 3단계: 환경 변수 설정 (Vercel 등에 배포할 경우)
- `OPENAI_API_KEY`: 본인의 OpenAI API 키를 설정해야 정상 작동합니다.

---
**주의**: `node_modules` 폴더는 용량이 매우 크므로 절대 올리지 마세요. (이미 `paper 1` 폴더에는 제외되어 있습니다.)
