create table speaking_topics (
    id uuid primary key,
    title varchar(200) not null,
    category varchar(32) not null,
    category_label varchar(100) not null,
    level varchar(16) not null,
    prompt text not null,
    content jsonb not null,
    revision integer not null check (revision > 0),
    archived_at timestamptz,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_speaking_topic_category check (category in ('work', 'interview', 'casual', 'opinion')),
    constraint ck_speaking_topic_level check (level in ('A2-B1', 'B1-B2', 'B2+'))
);

create index ix_speaking_topics_available
    on speaking_topics (category, level, id) where archived_at is null;

create table speaking_sessions (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    topic_id uuid not null references speaking_topics(id) on delete restrict,
    topic_revision integer not null check (topic_revision > 0),
    prompt_snapshot jsonb not null,
    timezone_snapshot varchar(64) not null,
    status varchar(32) not null,
    selected_attempt_id uuid,
    version bigint not null default 0,
    started_at timestamptz not null,
    completed_at timestamptz,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_speaking_session_status check (status in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED'))
);

create unique index uq_speaking_sessions_active_user
    on speaking_sessions (user_id) where status = 'IN_PROGRESS';
create index ix_speaking_sessions_user_started
    on speaking_sessions (user_id, started_at desc, id desc);

insert into speaking_topics
    (id, title, category, category_label, level, prompt, content, revision, created_at, updated_at)
values
    ('10000000-0000-0000-0000-000000000001',
     'Cập nhật tiến độ dự án', 'work', 'Công sở & Họp nhóm', 'B1-B2',
     'Chia sẻ ngắn gọn việc đã làm, kế hoạch hôm nay và trở ngại hiện tại.',
     '{"contextDescription":"Tình huống standup 60–90 giây trong môi trường làm việc quốc tế.","starterSentence":"Yesterday, I mainly focused on wrapping up the authentication flow...","outline":["Kết quả chính hôm qua","Trọng tâm hôm nay","Trở ngại hoặc hỗ trợ cần thiết"],"keyVocabulary":[{"word":"wrap up","meaning":"hoàn tất công việc"},{"word":"blocker","meaning":"vấn đề cản trở tiến độ"}],"modelAnswer":"Yesterday, I wrapped up the authentication flow. Today, I will integrate the payment webhook. I have no major blockers."}'::jsonb,
     1, now(), now()),
    ('10000000-0000-0000-0000-000000000002',
     'Giới thiệu bản thân và thế mạnh', 'interview', 'Phỏng vấn xin việc', 'B1-B2',
     'Nêu kinh nghiệm, một thế mạnh cốt lõi và định hướng tiếp theo trong 60–90 giây.',
     '{"contextDescription":"Cấu trúc quá khứ, hiện tại và định hướng tương lai.","starterSentence":"I have spent the past three years developing web products...","outline":["Vai trò và kinh nghiệm","Thế mạnh kèm ví dụ","Định hướng tiếp theo"],"keyVocabulary":[{"word":"hands-on experience","meaning":"kinh nghiệm thực chiến"},{"word":"cross-functional","meaning":"liên phòng ban"}],"modelAnswer":"I specialize in building accessible web products and collaborating with cross-functional teams."}'::jsonb,
     1, now(), now()),
    ('10000000-0000-0000-0000-000000000003',
     'Một thói quen nhỏ tạo khác biệt', 'casual', 'Giao tiếp đời thường', 'A2-B1',
     'Kể về một thói quen hằng ngày giúp bạn tỉnh táo hoặc làm việc hiệu quả hơn.',
     '{"contextDescription":"Luyện kể chuyện tự nhiên với nhịp độ thong thả.","starterSentence":"A few months ago, I decided to change one small habit...","outline":["Thói quen là gì","Khó khăn ban đầu","Thay đổi tích cực"],"keyVocabulary":[{"word":"game changer","meaning":"thay đổi quan trọng"},{"word":"stick with","meaning":"kiên trì duy trì"}],"modelAnswer":"I stopped checking my phone first thing in the morning, and it helped me start each day more calmly."}'::jsonb,
     1, now(), now()),
    ('10000000-0000-0000-0000-000000000004',
     'Remote work hay văn phòng', 'opinion', 'Bày tỏ quan điểm', 'B2+',
     'Chọn remote, hybrid hoặc văn phòng và trình bày hai lý do chính.',
     '{"contextDescription":"Luyện nêu quan điểm, phản biện và kết luận cân bằng.","starterSentence":"In my view, while remote work offers flexibility...","outline":["Nêu quan điểm","Hai luận điểm","Kết luận cân bằng"],"keyVocabulary":[{"word":"strike a balance","meaning":"tìm điểm cân bằng"},{"word":"unmatched flexibility","meaning":"sự linh hoạt vượt trội"}],"modelAnswer":"The hybrid model strikes a useful balance between focused work and spontaneous collaboration."}'::jsonb,
     1, now(), now());
