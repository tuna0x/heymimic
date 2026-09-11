# HeyMimic — Thiết kế lại giao diện và chuyển động trong trải nghiệm học

Trạng thái: **Plan đề xuất, chưa triển khai**. Ngày: 11/09/2026.

Written against: `c5af964e86668a162b64f4336fd384ad441d7fc8` **cộng các thay đổi UI chưa commit trong working tree**. Đặc biệt, `frontend/src/styles/app.css` đã tồn tại dưới dạng file chưa được theo dõi. Phải đọc trạng thái làm việc hiện tại trước khi triển khai; không reset các thay đổi đó theo commit gốc.

## 1. Kết quả cần đạt

Người dùng đánh giá giao diện học còn xấu, tĩnh và thiếu hứng thú; đợt chỉnh khoảng cách trước đó chưa giải quyết được chất lượng trải nghiệm. Plan này biến các màn hình học thành một hệ thống có cá tính, trong đó câu học, lượt nói và kết quả là trung tâm; mỗi thao tác có phản hồi thị giác phù hợp.

Deliverable khi triển khai: phòng luyện nói làm màn hình chuẩn; flashcard/phiên ôn có chuyển động thực; dashboard dẫn vào việc học; nghe, viết và tổng kết được đồng bộ. Cả light/dark và mobile đều có thiết kế cụ thể. Thành công phải được chứng minh bằng bản render và một buổi học chạy được, không chỉ bằng build/test.

Lượt lập plan chỉ tạo tài liệu và lưu hình nguồn trong `design-plans/`. Không chỉnh mã sản phẩm, không cài dependency.

## 2. Evidence chain và ngôn ngữ thiết kế

### Phạm vi và chủ sở hữu hiện tại

- Một sản phẩm: frontend React 19 + TypeScript + Vite + Tailwind 4 + Zustand của HeyMimic.
- Runtime: `src/route/AppRoutes.tsx` → `ProtectedRoute` → `components/layout/AppShell.tsx` → `Outlet` → các page học. `AppShell` import `styles/app.css`; `main.tsx` import `styles/index.css`.
- Design sources nội bộ: `docs/PROJECT.md`, mục 5; token trong `styles/index.css`; override ứng dụng trong `styles/app.css`; component đang được route import. Các implementation plan cũ dùng để giữ phạm vi nghiệp vụ, không coi là bản thiết kế hình ảnh cuối cùng.
- Quyết định hiện hành: cyan nhận diện, một CTA màu ấm trên màn hình, heading geometric sans/body dễ đọc, một vùng thực hành chính, motion có mục đích và tránh thẻ lồng đồng loạt.
- Explicit exceptions: người dùng hiện yêu cầu hiệu ứng học tập rõ hơn. Motion trong plan là quyết định mới được đề xuất; không bị giới hạn bởi lựa chọn tắt hiệu ứng trong lần cleanup trước.
- Bằng chứng render nội bộ: những màn hình đã kiểm tra trong phiên làm việc trên desktop/mobile; tài khoản mẫu local, API có trạng thái Bad Gateway. Chưa thể dùng chúng chứng minh các trạng thái có dữ liệu thật.

### Ba vấn đề cần xử lý

| # | Vấn đề | Bằng chứng/đường đi runtime | Sửa được đề xuất | Phạm vi | Độ tin cậy |
| --- | --- | --- | --- | --- | --- |
| 1 | Vùng thực hành bị chia thành nhiều khối giải thích/điều khiển, thiếu một trung tâm thị giác | `Speaking.tsx` xếp header → chọn chủ đề → `SpeakingContextCard` → recorder → phân tích; thiết kế dự án yêu cầu một vùng học chính; người dùng xác nhận trải nghiệm tĩnh và thiếu thẩm mỹ | Tổ chức lại thành vùng thực hành lớn với hỗ trợ bên cạnh; mic và câu cần nói nằm trong khung nhìn đầu ở trạng thái sẵn sàng | Solo, sau đó dialogue/listening | Cao về cấu trúc; cần render trạng thái có dữ liệu để chốt kích thước |
| 2 | “Lật thẻ” chưa có chuyển động thể hiện thao tác; motion bị cắt rời theo component | `Vocab.tsx` dùng `FlashCard`; `VocabReview.tsx` có nhánh `flipped` riêng; cả hai thay JSX. `app.css` tắt page-enter và một số hiệu ứng thẻ | Tạo presentation flashcard chung có flip, next, pending và reduced-motion; bổ sung các phản hồi nút/trạng thái theo bảng motion | Từ vựng, phiên ôn, các CTA học | Cao, đọc trực tiếp component |
| 3 | Các màn hình thiếu biến hóa có chủ đích; hệ thống chữ/bề mặt còn phụ thuộc override toàn cục | `app.css` đổi toàn bộ `.text-xs`, h1 và `.clean-card`; các page vẫn có nhiều class riêng. Quy tắc dự án yêu cầu tránh mọi nội dung thành thẻ giống nhau | Định nghĩa biến thể typography, vùng thực hành, hỗ trợ và phản hồi tại owner chung; migrate từng consumer trước khi gỡ override | AppShell và các page học | Cao về ownership; chất lượng hình ảnh cần nghiệm thu trực quan |

### Nguồn tham khảo bên ngoài và quyết định sử dụng

Hồ sơ đầy đủ, ảnh đã xem và giới hạn xác minh: [learning-ui-references/README.md](learning-ui-references/README.md).

| Nguồn | Dùng cho quyết định nào của HeyMimic | Giới hạn áp dụng |
| --- | --- | --- |
| [Speak](https://www.speak.com/) | Câu học/lượt nói là phần có trọng lượng thị giác lớn; góp ý đi gần câu liên quan | Hình công bố là minh họa sản phẩm; chưa đo tương tác trong app |
| [ELSA AI](https://elsaspeak.com/en/ai/) | Tách giai đoạn thực hành và nhận xét; phân nhóm thông tin kết quả | Chỉ hiển thị nhóm chỉ số HeyMimic thực sự có |
| [Duolingo core tabs redesign](https://blog.duolingo.com/core-tabs-redesign/) | Thống nhất hệ thống nhưng thay bố cục theo nhiệm vụ; giảm viền lồng không cần thiết | Không sao chép mascot, hệ điểm hoặc toàn bộ một hướng concept |
| [Quizlet Flashcards Help](https://help.quizlet.com/hc/en-us/articles/360030988091-Studying-with-Flashcards) | Lật thẻ, chuyển thẻ và quyết định mức nhớ là một vòng thao tác rõ | Tham khảo tài liệu thao tác; chưa xác minh hình thức/motion của phiên bản app |

**Improve first:** sửa vấn đề 1 bằng phòng Solo hoàn chỉnh. Đây là nơi người học trực tiếp thực hành và cũng là mẫu để đánh giá chất lượng typography, mic, feedback, surface và chuyển động. Bắt đầu từ đây sau một lớp foundation tối thiểu.

## 3. Quyết định thiết kế cho HeyMimic

Các thông số sau là **đề xuất riêng**, không phải thông số sao chép từ đối chuẩn.

### 3.1 Bố cục và cá tính

- Dùng phong cách phòng luyện tập sáng rõ, thân thiện với người lớn. Giữ nền trung tính và cyan; màu ấm thuộc hành động quan trọng nhất trong trạng thái hiện tại.
- Chỉ ba vai trò bề mặt: `stage` cho hoạt động học; `support` cho gợi ý/từ mang theo; `feedback` cho kết quả. Thư viện và lịch sử dùng hàng danh sách, không bắt mọi nhóm có hộp riêng.
- Stage có nền `--surface`, một cấp shadow-sm và bo góc `rounded-2xl`; trường hợp nổi bật dùng `--primary-soft` cho vùng nhỏ có mục đích. Support dùng nền muted, không shadow; feedback phân biệt bằng cấu trúc, icon và nhãn.
- Độ nổi xuất hiện ở phần có thể thao tác hoặc cần ưu tiên, không rải shadow và hiệu ứng nâng trên mọi thẻ.
- Chất riêng đến từ cách trình bày câu/cụm từ, nét sóng âm và chuyển động nhịp nhàng. Không cần thêm mascot hoặc ảnh trang trí để hoàn thành scope này.

### 3.2 Token, typography và kích thước

Giữ owner màu `styles/index.css` và override `.learning-app` tại `styles/app.css`. Không tạo một bộ palette cạnh tranh.

| Vai trò | Quyết định |
| --- | --- |
| Font heading | Plus Jakarta Sans, đang được tải; weight 600/700 |
| Font nội dung app | Inter; fallback hệ thống; kiểm tra dấu tiếng Việt |
| Tiêu đề trang | 28px mobile, 32–36px desktop; chỉ một h1 |
| Câu học/từ đang ôn | 28–40px tùy độ dài; cụm từ/từ riêng có thể 40px; không giảm câu dài xuống chữ chú thích |
| Nội dung thực hành | 16px, line-height khoảng 1.6–1.7 |
| Nhãn/nút | 14px; metadata phụ 12–13px; không dùng 10/11px cho nội dung phải đọc để học |
| Spacing | Scale Tailwind 4/8/12/16/24/32/48; padding stage 24px mobile, 32px desktop |
| Target bấm | Tối thiểu 44px; CTA chính 48px; mic 112–128px |
| Bo góc | Điều khiển 12px; stage 16px; dùng radius lớn hơn chỉ khi có lý do cụ thể |
| Layout rộng | Content tối đa 1280px; stage/support khoảng 2:1 khi mỗi cột vẫn đủ đọc |
| Layout hẹp | Một cột theo thứ tự nhiệm vụ; support thành disclosure; control không đè phần nội dung cuối |

Màu hành động tái sử dụng giá trị app hiện tại: primary `#087C89`/dark `#64CDD5`, accent `#A94F31`/dark `#E9A184`. Dùng semantic `study-*` trong component. Giữ text/surface/semantic success/error hiện có và đo contrast tại các cặp thực tế; không giả định mọi tổ hợp đều đạt.

Phải migrate `.text-xs`/h1 bằng component hoặc class có vai trò rõ trước khi gỡ override toàn cục. Sau migration, marketing không bị đổi font/màu hoặc motion.

### 3.3 Trải nghiệm trên mobile

- Navigation hiện có vẫn truy cập được; không tự ghi đè preference sidebarCollapsed để tạo focus mode.
- Trong viewport chuẩn 390×844, trạng thái Solo sẵn sàng cần thấy chủ đề ngắn, mic và nút bắt đầu. Gợi ý dài mở khi cần.
- Không giấu thông báo lỗi/permission để đạt tiêu chí “trên màn hình đầu”. Trường hợp có lỗi dài được phép tăng chiều cao.
- Bottom controls theo safe-area; trên màn hình có bàn phím ảo, điều khiển không che input hay kết quả.
- Không thêm băng chuyền swipe bắt buộc. Mọi hành động học đều có nút/phím thay thế.

## 4. Hệ thống motion đề xuất

Mục tiêu là người học nhìn thấy phản hồi khi thao tác, hiểu trạng thái tiếp theo và cảm nhận được tiến bộ. Không chạy hoạt ảnh trang trí ở trạng thái idle.

| Sự kiện | Hình thức và thời lượng đề xuất | Tín hiệu thực | Reduced motion |
| --- | --- | --- | --- |
| Hover nút/row | Màu/opacity 120ms; chỉ phần tử tương tác | Pointer hover | Giữ màu, không nâng dịch |
| Nhấn CTA | scale 1→0.98→1 trong 120–160ms | Pointer/keyboard activate | Không scale |
| Tab/segment thay đổi | Crossfade 160ms; indicator đổi vị trí không kéo nội dung | State tab thật | Đổi tức thì |
| Lật flashcard | rotateY 180° trong 200ms; hai mặt cùng khung | `flipped`, không gửi API | Thay mặt tức thì |
| Thẻ tiếp theo | Outgoing dịch 12px/opacity 160ms, incoming 160ms | API rate/undo đã trả thành công | Thay nội dung tức thì |
| Mic bắt đầu/dừng | Icon/trạng thái crossfade 160ms; vòng thu thay opacity/scale | Recorder thật vào/ra recording | Icon + nhãn trạng thái |
| Sóng âm | 24–32 cột cố định chiều cao, biến đổi scaleY; smoothing khoảng 100ms | `liveVolume` đã có | Chỉ báo mức âm giản lược, không vòng pulse |
| Chờ đánh giá | Dấu trạng thái opacity tuần hoàn nhỏ; label rõ | `evaluationBusy`/isProcessing | Nhãn chờ tĩnh |
| Nhận góp ý | Một nhóm kết quả crossfade 200ms | `analysis` xuất hiện | Hiện tức thì |
| Tiến độ bài học | scaleX fill 200ms, số liệu cập nhật cùng state | Giá trị đã xác nhận | Fill đổi tức thì |
| Hoàn thành | Checkmark scale/opacity 200ms, không khóa nút tiếp theo | Server xác nhận hoàn thành | Checkmark tĩnh |

Quy tắc thực thi:

1. CSS cho hover/press đơn giản; dùng `motion/react` cho chuyển state có enter/exit và flip. Không thêm GSAP, Lottie, Rive hoặc animation canvas cho scope này.
2. Dependency đề xuất khi triển khai: `motion`, `clsx`, `tailwind-merge`; dùng Yarn và chỉ cập nhật `frontend/yarn.lock`, không tạo lockfile thứ hai. [Hướng dẫn Motion](https://motion.dev/docs/react-installation) xác nhận package và import `motion/react`; phải chọn phiên bản tương thích và ghi nhận vào lockfile khi thực thi.
3. Thêm owner `components/shared/learningMotion.ts` cho durations/variants và `lib/cn.ts` cho conditional class; không rải duration tùy ý trong từng page.
4. Đặt `MotionConfig reducedMotion="user"` trong shell ứng dụng; flip/waveform có handling riêng. [Tài liệu reduced-motion](https://motion.dev/docs/react-accessibility).
5. Gỡ các lệnh tắt motion trong `app.css` khi consumer đã chuyển sang hệ thống mới. Không bật lại hàng loạt scroll-reveal/page-enter cũ. Giữ media query giảm chuyển động, điều chỉnh để không cắt mất thông tin trạng thái.
6. Không animate width/height/top/left; dùng opacity/transform và vùng chứa ổn định. Đừng animate đoạn transcript từng chữ vì đó là dữ liệu đang cập nhật, không phải hiệu ứng đánh máy.
7. Không trì hoãn fetch, ghi âm, hủy thao tác hoặc navigation để chờ animation. Callback mutation chỉ phát sinh từ thao tác người dùng, không đặt trong `onAnimationComplete`.
8. Unmount/cancel phải dừng hoạt ảnh cục bộ. Offscreen hoặc tab ẩn ngừng hiệu ứng trang trí; không ngắt bản ghi đang chạy chỉ để tối ưu hình ảnh.

## 5. Kế hoạch triển khai theo thứ tự

### P0 — Bản thiết kế có thể xem trước

**Đầu ra:** frame desktop/mobile cho Solo-ready, Solo-feedback và VocabReview-front/back, cùng storyboard cho flip/recording/result. Đây là đề xuất HeyMimic, phải phân biệt với ảnh tham khảo chính hãng.

- Dùng dữ liệu mẫu đã gắn nhãn fixture, gồm câu tiếng Anh đủ dài và mô tả tiếng Việt thực tế; không dùng lorem ipsum.
- Chỉ ra nguồn tham khảo và lý do cho từng vùng; đảm bảo có ít nhất một thay đổi về bố cục nội dung thực hành, không chỉ đổi màu.
- Dựng reference board dưới `design-plans/learning-ui-references/` từ ảnh đã có nếu cần. Không đưa hình hãng khác vào `frontend/public`.
- Chụp baseline hiện tại trước khi sửa. Chốt hướng triển khai bằng kiểm tra các tiêu chí ở mục 7; không coi một phương án chưa render là đã đạt thẩm mỹ.

### P1 — Foundation dùng chung

**Owner:** `styles/app.css`, `styles/index.css`, `components/shared/UI.tsx`, `components/layout/AppShell.tsx`, `components/layout/Sidebar.tsx`, `frontend/package.json`, `frontend/yarn.lock`.

**Tạo thêm khi triển khai:** `components/shared/LearningStage.tsx`, `components/shared/learningMotion.ts`, `lib/cn.ts`.

- `LearningStage` chỉ quản lý title/content/support/actions và bố cục responsive, không giữ session state hay gọi API. Hiện chưa có owner chung cho cấu trúc này; consumers đầu tiên: Speaking solo và Listening. VocabReview giữ surface chuyên biệt cho flip.
- Mở rộng `UI.tsx` bằng biến thể nút/trạng thái có semantic rõ; link vẫn là Link, button vẫn là button. Không tạo wrapper có thể làm mất disabled/ref/aria behavior.
- Giữ glyph và logo HeyMimic. Sidebar có active/hover/focus/pressed đủ phân biệt; nested speaking route không làm hai nhóm cùng active.
- Typography: migrate các page trong scope sang semantic class/variant rồi mới xóa override rộng. Kiểm tra system theme và các cặp màu nút ở cả light/dark.
- **Giữ:** routes, bảo vệ đăng nhập, menu mobile, Ctrl+B, theme và sidebar preference.
- **Verify:** đọc được nhãn dài; menu mở/đóng giữ focus hợp lý; không overflow 360/390/768/1024/1440px; marketing không nhận style app.

### P2 — Phòng luyện nói làm chuẩn chất lượng

**Owner:** `pages/Speaking.tsx`, `components/speaking/SpeakingContextCard.tsx`, `SpeakingStudioRecorder.tsx`, `RecordButton.tsx`, `Waveform.tsx`, `LiveTranscriptionDisplay.tsx`, `SpeakingAnalysisSection.tsx`, `SentenceDiffCard.tsx`, `FeedbackCard.tsx`, `AudioPlayerBar.tsx`, `AcousticMetrics.tsx`.

**Ready/recording — desktop:**

```text
App navigation | Tiêu đề ngắn + đường quay lại
               | Chủ đề hiện tại + thời lượng
               | [ Vùng thực hành lớn       ] [ Gợi ý bài nói ]
               | [ Câu/tình huống cần nói   ] [ Từ mang theo  ]
               | [ Transcript khi đang nói ] [ Nghe mẫu      ]
               | [ Sóng âm + mic + timer   ] [ Dàn ý mở thêm ]
```

**Mobile:** chủ đề → stage/mic → hỗ trợ có thể mở. Chi tiết vẫn tồn tại và truy cập được.

- Chuyển các phần ambient sound, lịch sử và chọn mode sang toolbar phụ; chủ đề không bị đổi khi recording/serverSession đang khóa.
- Dùng `liveVolume` hiện có cho waveform; không biến cột âm lượng thành đồ thị âm vị hoặc điểm phát âm.
- Nút bắt đầu dùng accent; khi recording chuyển sang semantic recording/danger với nhãn dừng; xử lý dùng trạng thái pending rõ. Chặn double-start theo trạng thái hiện có.
- Không unmount recorder/hook khi chuyển layout; key transition chỉ nằm ở presentation để tránh dừng mic hoặc mất transcript.
- **Feedback:** tổng quan ngắn dựa trên dữ liệu → một câu/gợi ý để thử lại → nghe bản ghi → chi tiết chỉ số và feedback. Giữ toàn bộ phản hồi truy cập được; phần chuyên sâu có thể mở thêm.
- Không tạo lời khen/điểm số khi `result.feedback`, rephrases hoặc metric không có. `source: demo` vẫn được ghi rõ; thông báo nội bộ provider chuyển thành nhãn người học hiểu được nhưng không che nguồn demo.
- Bỏ hiển thị fallback 78 giây như “thực tế” trong `SpeakingAnalysisSection`/`AudioPlayerBar`; thời lượng không có thì hiển thị chưa có dữ liệu. Đây là sửa cách trình bày thông tin đã thiếu, không tạo dữ liệu mới.
- Error hoặc quota block phải nằm gần hành động, vẫn thấy Retry/điều kiện sử dụng. Không animation completed trước khi server trả kết quả.
- **Giữ:** `useAudioRecorder`, evaluation retry, serverSession, capabilityGate, audioBlob, transcript, carryWords, thực hành câu và hoàn tất Study.
- **Verify:** ready, mic-denied, recording, stopping, processing, error/retry, complete; không gọi start/finish hai lần khi bấm nhanh. Khi kết quả dài, mic/input/action không bị che.

### P3 — Một trải nghiệm flashcard thống nhất

**Owner:** `pages/Vocab.tsx`, `pages/VocabReview.tsx`, `components/vocab/FlashCard.tsx`, `components/vocab/VocabList.tsx`, `components/vocab/ContextCapture.tsx`, `components/shared/UI.tsx`.

**Tạo thêm:** `components/vocab/FlashcardFace.tsx` là presentation controlled. Cả FlashCard và VocabReview đều có markup hai mặt riêng nên cần owner chung để tránh hai hệ motion. Session/API vẫn ở từng page.

- Kho từ: danh sách tìm kiếm/chọn từ và preview có phân cấp; trên mobile ưu tiên danh sách, mở nội dung từ đã chọn rõ ràng. CTA ôn tập dùng số lượng thật, có trạng thái không có từ đến hạn.
- Phiên ôn: header nhỏ (thoát + tiến độ), một thẻ trung tâm, nghe phát âm, flip, hai nút đánh giá ngang nhau về diện tích. Nút “Đã nhớ” dùng semantic success; không phủ nhiều màu trang trí.
- Hai mặt dùng chung kích thước dự kiến; nội dung dài tăng chiều cao tự nhiên và cho phép scroll trang, không ép font nhỏ/cắt nghĩa. Chỉ mặt đang hiển thị nhận focus; nút phát âm không kích hoạt flip.
- Reset mặt trước theo `word.id`. Giữ nguyên `busy`, `eventId`, startKey, `handleRate`, `handleUndo`, `handleExit`, `handleProceed` của page.
- Hiệu ứng chuyển từ bắt đầu sau API thành công. Khi lỗi, thẻ cũ và quyết định chưa xác nhận giữ nguyên; cho thử lại. Không chỉ dựa vào trạng thái animation để chống ghi trùng.
- Giữ phím/nút thao tác rõ; không thêm swipe đánh giá ngay trong scope đầu vì dễ xung đột scroll và ghi nhận nhầm.
- **Verify:** đổi từ dài/ngắn, phát âm thiếu hỗ trợ, flip nhanh, rate pending/failure, undo, quay lại phiên, từ cuối, session rỗng. Chỉ 1 mutation cho mỗi quyết định hợp lệ.

### P4 — Dashboard và lối vào bài học

**Owner:** `pages/Dashboard.tsx`, `pages/SpeakingHub.tsx`, toàn bộ `components/dashboard/`.

- Dashboard lấy buổi học tiếp theo làm trọng tâm. Trong khối chính hiển thị chủ đề thật hoặc tên kế hoạch, thời lượng và bước hiện tại; dùng `TodaySessionFocus` làm owner thay vì tạo hero thứ hai.
- Tiến độ tuần là thông tin phụ. Khi chưa tải dữ liệu, hiển thị đang tải/chưa tải được; không diễn giải mảng rỗng do lỗi thành “bạn chưa học”. Khi đúng là người mới, đưa một hành động bắt đầu.
- `DailyPriorityGateways` là hai lối vào từ vựng/nói với trọng lượng tùy gợi ý có sẵn; chỉ một CTA màu ấm tại một thời điểm. Tránh nhiều phần cùng lặp “bắt đầu ngay”.
- `FlagshipFeaturesBanner` và `PersonalSkillPillarsGrid` là danh sách khám phá gọn, có hover/press nhẹ. Không phải thêm các card khổng lồ chỉ để có visual.
- SpeakingHub rút phần hướng dẫn thành preview bài/ba bước ngắn. Solo, peer, dialogue mỗi mode có một hành động rõ; mở bài là đi đến phòng thực hành, không chèn thêm màn giới thiệu.
- Mobile: buổi học → hai lối vào → tiến độ → khám phá. Dùng CSS layout order không làm thứ tự đọc bằng bàn phím mâu thuẫn; ưu tiên giữ DOM theo thứ tự này cho mọi viewport.
- **Giữ:** recommendation, profile, activeStudySession, loading/error và navigation. Không thêm streak/XP/đề bài giả để làm đẹp.
- **Verify:** người mới, có bài dở, đã hoàn thành, profile tên dài, không có chủ đề, API lỗi và retry. Một người xem phải chỉ được hành động học tiếp theo sau vài giây quan sát.

### P5 — Nghe, viết, tổng kết và các bề mặt cùng hệ thống

| Bề mặt và owner | Thay đổi triển khai | Giữ nguyên và giới hạn | Nghiệm thu cụ thể |
| --- | --- | --- | --- |
| `pages/Listening.tsx` | Stage tập trung câu hiện tại; bản dịch nằm cấp phụ; controls nghe/lặp/tốc độ nằm cạnh nhau; trạng thái đang phát rõ; chuyển câu 160ms | Hiện dùng speechSynthesis và `handleSimulateShadowing`. Ghi nhãn trải nghiệm shadowing là demo; không thêm waveform giả như đang nghe mic. Chưa có word timestamps nên chỉ đánh dấu cả câu đang phát, không karaoke theo từng từ | Câu ngắn/dài, đổi tốc độ, loop, next/prev, empty, thiếu TTS; selector không tràn |
| `pages/Writing.tsx` | Hai chế độ rõ: “Học cách diễn đạt” và “Tự luyện dịch”; bố cục so sánh bản gốc–bản mẫu dễ đọc; bài tự luyện có ô nhập rộng và phần giải thích mở sau thao tác; copy có trạng thái xác nhận | Trang hiện đọc writingTemplates/reflexPrompts. Không hứa chấm bài tự do bằng AI hoặc biến input thành yêu cầu API chưa tồn tại | Nội dung email dài, dấu xuống dòng, mobile keyboard, copied/reset, đáp án mở/đóng; không animate từng ký tự khi nhập |
| `pages/SessionSummary.tsx` | Kết quả thật ở đầu; một điều vừa luyện, từ cần gặp lại và hành động tiếp theo; checkmark ngắn sau khi dữ liệu xác nhận | Giữ flow đọc Study/Review/Speaking/Progress; trạng thái chưa hoàn tất và thiếu dữ liệu vẫn rõ | Refresh tổng kết, pending projection, partial session, API lỗi; không hiển thị completed sai |
| `pages/Progress.tsx`, `pages/MistakeDetail.tsx` | Nhịp học, lỗi lặp và hành động luyện lại được phân cấp; biểu đồ có dữ liệu/số đọc được; chỉ một lần chuyển fill khi giá trị thật cập nhật | Không tạo thống kê/metric mới; giữ filter và trạng thái lỗi | 0, số lớn, thiếu metric, nhãn dài, light/dark; không chỉ dựa vào màu để đọc |
| `pages/SpeakingDialogue.tsx` | Hội thoại là trung tâm, tách vai nói và gợi ý; pending chỉ cho lượt đang chờ; feedback gắn với lượt/câu | Giữ nguồn dữ liệu và giới hạn demo hiện tại; không tạo avatar gọi video hay tuyên bố phản hồi realtime mới | Đoạn chat dài, gửi/pending/error, keyboard mobile; không animate lại toàn bộ lịch sử |
| `pages/VideoLearning.tsx`, `pages/VideoShadowingLab.tsx` | Thư viện rõ thumbnail/nội dung; ở lab ưu tiên video và dòng phụ đề hiện tại; phần điểm/gợi ý là hỗ trợ | Giữ playback, nguồn video và nhãn acoustic demo; không diễn giải điểm demo thành đo thật | Tua, đổi câu, viewport hẹp, video lỗi, điều khiển không bị che |
| `pages/PeerPractice.tsx`, `pages/PeerRoom.tsx`, `components/peer/PeerServerRoom.tsx` | Đồng nhất header/controls và vai người nói; trạng thái chờ/đến lượt/kết thúc rõ; giữ layout tập trung cuộc hội thoại | Không đổi matching, room lifecycle, participant state hoặc backend peer | Tên dài, đang chờ, đủ người, mất kết nối, room kết thúc; motion không báo đến lượt sai |
| `pages/SpeakingHistory.tsx`, `pages/SpeakingSessionDetail.tsx`, `pages/Settings.tsx` | Áp dụng typography/surface/action variant đã chuẩn hóa, không redesign nghiệp vụ | Giữ filters, dữ liệu và form; không thêm hiệu ứng gây mất focus | Smoke test mọi route và form khi có/không có dữ liệu |

Nguồn ngoài chỉ định hướng các pattern đã quan sát; bố cục nghe/viết/video/peer ở bảng này là đề xuất của HeyMimic dựa trên công việc thực tế trong repo.

### P6 — Nghiệm thu trực quan, tương tác và chất lượng mã

Đầu ra: ảnh trước/sau, bản ghi thao tác ngắn và báo cáo test gắn với build được kiểm tra. Không đánh dấu hoàn tất khi chỉ chạy được compiler.

## 6. Kế thừa, loại trừ và phụ thuộc

**Kế thừa:** các route sau đăng nhập dưới AppShell nhận token/typography/nút đã migrate. Tên route giữ nguyên. Không làm biến mất các tính năng thứ cấp khi rút gọn bố cục.

**Cần smoke test:** `/dashboard`, `/app`, `/speaking`, `/speaking/solo`, `/speaking/dialogue`, `/speaking/history`, `/speaking/history/:sessionId`, `/vocab`, `/vocab/review`, `/session/:sessionId/summary`, `/listening`, `/writing`, `/progress`, `/progress/mistakes/:mistakeId`, `/video-learning`, `/video-learning/:videoId`, `/peer-practice`, các route phòng/mời peer, `/settings`.

**Ngoài scope:** marketing, đăng nhập/onboarding redesign, backend, schema API, thuật toán ôn tập, thêm provider AI, thật hóa các tính năng demo, hệ thống điểm thưởng/mascot mới. Nếu cần thao tác dữ liệu mới để có một hiệu ứng, thu hẹp hiệu ứng theo contract hiện có.

**Thứ tự phụ thuộc:** P0 → P1 tối thiểu → P2 → P3 → P4 → P5 → P6. Mỗi pha phải tự kiểm tra trước khi sang pha sau; không dồn toàn bộ kiểm tra responsive vào P6. Không cần migration API. Chỉ P1 thay dependency và lockfile.

**Cách chia thay đổi:** foundation; speaking stage; speaking feedback; flashcard; dashboard; từng nhóm bề mặt phụ; final QA. Mỗi thay đổi có ảnh và trạng thái cụ thể, không trộn nhiều màn hình chưa kiểm tra trong một lượt.

## 7. Tiêu chí chấp nhận đo được

### 7.1 Sản phẩm và hình ảnh

- [ ] Solo-ready ở 1440×900 và 390×844 nhìn thấy tình huống ngắn, mic và hành động bắt đầu mà không cuộn qua một khối giới thiệu dài. Có lỗi/permission dài thì ưu tiên đọc lỗi rõ.
- [ ] Trong stage, câu học lớn hơn nhãn giao diện; bản dịch là cấp phụ; chuỗi chữ dài vẫn đọc được, không bị truncate phần kiến thức.
- [ ] Không có một hàng nhiều card đồng trọng lượng lấn át hoạt động chính. Các vùng stage/support/feedback phân biệt được cả trong dark mode.
- [ ] Flashcard có flip nhìn thấy được, mặt sau không đọc ngược; đổi thẻ không làm nút rating nhảy vị trí với nội dung ngắn.
- [ ] Nút/row có trạng thái hover, pressed, focus, disabled và pending; feedback không chỉ có khi dùng chuột.
- [ ] Hoàn thành buổi học có phản hồi rõ, không trì hoãn nút điều hướng và không đếm tiến độ giả.
- [ ] Có ảnh kiểm tra 360×800, 390×844, 768×1024, 1024×768 và 1440×900. `scrollWidth <= clientWidth + 1` ở page; scroller nội bộ có chủ đích được phép.
- [ ] Thử zoom 200%, tên dài, câu tiếng Anh 180–250 ký tự, transcript 600–1000 từ, danh sách rỗng và nhiều mục.
- [ ] Khi bật reduced motion, hiểu được mọi trạng thái mà không cần flip/pulse/slide; thông tin không biến mất.
- [ ] User control không che nội dung sau cùng hoặc ô nhập khi bàn phím mobile mở. Không dùng chiều cao cố định khiến nội dung vượt khỏi stage bị cắt.

### 7.2 Trạng thái bắt buộc

| Luồng | Các trạng thái phải có bằng chứng |
| --- | --- |
| Solo | loading topics, no topic, ready, quota blocked, mic denied, recording, pending analysis, retryable error, analysis complete, reset/re-record |
| Vocab/Review | loading, empty, front/back, TTS unavailable, rate pending, rate error, undo, resumed, last card, complete |
| Dashboard | new learner, ready, in-progress, completed, API error, data unavailable khác với số 0 |
| Nghe/Viết | nội dung mẫu, đang nghe, chuyển câu, demo shadowing, so sánh bản mẫu, tự nhập/hiện giải thích, input dài |
| Summary/Progress | partial/pending, persisted complete, missing metric, error/retry, zero progress |
| Shell | expanded/collapsed, mobile menu, nested route active, light/dark/system, keyboard focus |

Dữ liệu test có thể dùng fixture trong test harness hoặc mock network dành cho QA. Phải ghi nhãn fixture và giữ tách khỏi source production; không mở bypass auth hoặc nhét điểm giả vào store thật để tạo screenshot đẹp. Trạng thái mic/voice cần ít nhất một lượt kiểm tra với quyền mic và âm thanh thật khi môi trường cho phép; nếu không, báo đúng phần chưa kiểm tra.

### 7.3 Motion và hành vi

- [ ] Người xem bản ghi thao tác phân biệt được trước–sau của flip, start/stop mic, pending→feedback và complete.
- [ ] Rate/undo/start/stop/finish không gửi mutation trùng khi double-click hoặc animation bị hủy.
- [ ] Điều hướng ra ngoài, reduced-motion và unmount không giữ node tương tác vô hình hoặc timer trang trí còn chạy.
- [ ] Performance trace không có tác vụ dài do animation tự thêm; kiểm tra waveform/flip trong CPU throttling. Không tuyên bố đảm bảo 60fps trên mọi máy chỉ từ CSS.
- [ ] Không có animation width/height trên chart/waveform; không will-change thường trực khắp trang; không làm React re-render toàn bộ page theo từng cột sóng.
- [ ] Không chèn khoảng đợi giả hoặc phần trăm tiến độ giả vào API processing để kéo dài hiệu ứng.

### 7.4 Repository

Từ thư mục `frontend/`:

```powershell
yarn build
yarn test
yarn lint
```

Và từ root:

```powershell
git diff --check
git status --short
```

- Build phải pass. Bộ test hiện tại phải pass; baseline ở lượt UI trước là 43 test/13 file, chỉ là mốc tham chiếu, không phải kết quả chạy trong lượt lập plan này.
- Lint hiện có warning ngoài phạm vi; so sánh baseline, không tạo error hoặc warning mới trong file chỉnh sửa.
- Thêm test hành vi có ý nghĩa cho flashcard rate/undo khi pending/error, recorder không restart do presentation, và reduced-motion vẫn thể hiện kết quả. Không snapshot từng class CSS.
- Kiểm tra route marketing để phát hiện rò rỉ token/motion; không thay dependency/format toàn repo ngoài scope.
- Nếu thêm Playwright vào dự án, để devDependency và script riêng cho visual/interaction QA, không đưa vào runtime. Không coi ảnh screenshot đơn thuần là xác nhận luồng dữ liệu.

## 8. Rủi ro và xử lý khi triển khai

| Rủi ro đã biết | Cách xử lý |
| --- | --- |
| Working tree đã có nhiều sửa UI chưa commit | Ghi nhận baseline diff; chỉnh nối tiếp tại owner, không reset hoặc áp patch giả định file gốc |
| Token Tailwind resolve qua CSS variable và override app | Kiểm tra computed style light/dark, gồm text trên nút; giữ một chuỗi alias rõ |
| Hai presentation flashcard tách nhau | Shared face có state controlled; giữ API/session riêng, kiểm tra cả hai consumers |
| Key/AnimatePresence làm remount recorder | Đặt animation bên trong presentation; không key/unmount owner hook/media theo trạng thái |
| Vocab rating pending bị animation che trạng thái | Disable theo busy thật; chỉ chuyển word sau server thành công; lỗi giữ word hiện tại |
| Dữ liệu demo nhìn giống dữ liệu thật | Nhãn nguồn dễ hiểu, không thêm lời khen/điểm/timeline âm thanh không có contract |
| Chỉ cleanup thay vì đổi trải nghiệm | P2/P3 phải có stage và tương tác mới nhìn thấy trong video; không chấp nhận chỉ giảm shadow/chỉnh font |
| Tài liệu hãng thay đổi | Giữ ảnh đã xem và nguồn trong reference dossier; recheck nếu định sao chép một hành vi chưa được chứng minh |

## 9. Điều kiện dừng hoặc thu hẹp

- Nếu API/model không có trường cần cho UI, hiển thị trạng thái thiếu thông tin hoặc bỏ visual phụ thuộc trường đó; không tự mở rộng backend.
- Nếu layout mới làm mất route/action hiện có, sửa phương án bố cục trước khi tiếp tục.
- Nếu motion gây mất input, mic hoặc quyết định ôn tập, giữ bản static đúng chức năng và sửa cách quản lý presentation; không chấp nhận animation để đổi lấy dữ liệu.
- Nếu một vùng yêu cầu thêm nghiệp vụ thực sự (chấm phát âm âm vị, AI sửa văn bản tự do, karaoke có timestamps), ghi thành dependency tương lai và hoàn tất phần UI độc lập.
- Nếu production source khác đáng kể so với baseline ghi ở đầu plan, cập nhật evidence/owner trước khi áp dụng. Không lấy những thay đổi cũ còn tên tương tự làm bằng chứng runtime.

## 10. Hồ sơ bàn giao và cập nhật tài liệu sau triển khai

Bàn giao theo từng pha: danh sách file đổi; ảnh desktop/mobile light/dark; bản ghi flip/recording/feedback; kết quả check; trạng thái chưa xác minh do môi trường. Báo rõ dữ liệu thật hay fixture cho mỗi ảnh.

Sau khi giao diện được nghiệm thu và chạy ổn định, cập nhật mục 5 trong `docs/PROJECT.md`: vai trò stage/support/feedback, type scale, mapping primary/accent thực tế, motion tokens và reduced-motion. Việc đó thuộc implementation; lượt lập plan hiện tại không đổi tài liệu thiết kế hiện hành.

**Định nghĩa hoàn tất:** có một buổi học từ chọn bài → ôn từ → luyện nói → nhận góp ý → tổng kết được chạy và kiểm tra, các màn hình cùng hệ thống có UI nhất quán, và hiệu ứng thể hiện rõ thao tác mà không làm sai trạng thái nghiệp vụ.
