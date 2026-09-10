create table peer_scenarios (
    id uuid primary key,
    version integer not null check (version > 0),
    title varchar(200) not null,
    category varchar(32) not null,
    category_label varchar(100) not null,
    level varchar(16) not null,
    common_objective text not null,
    description text not null,
    duration_minutes integer not null check (duration_minutes between 5 and 30),
    phases jsonb not null,
    recommended_vocab jsonb not null default '[]'::jsonb,
    published boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_peer_scenario_category check (category in ('work', 'interview', 'tech', 'daily', 'debate')),
    constraint ck_peer_scenario_level check (level in ('A2-B1', 'B1-B2', 'B2+')),
    constraint uq_peer_scenario_version unique (id, version)
);
create index ix_peer_scenarios_catalog on peer_scenarios (category, level, title) where published;

create table peer_sessions (
    id uuid primary key,
    host_user_id uuid not null references identity_users(id) on delete cascade,
    scenario_id uuid not null references peer_scenarios(id) on delete restrict,
    scenario_version integer not null,
    status varchar(16) not null,
    version bigint not null default 0,
    started_at timestamptz,
    phase_deadline timestamptz,
    expires_at timestamptz not null,
    ended_at timestamptz,
    end_reason varchar(64),
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint fk_peer_session_scenario_version foreign key (scenario_id, scenario_version)
      references peer_scenarios(id, version),
    constraint ck_peer_session_status check (status in ('WAITING', 'READY', 'ACTIVE', 'ENDED', 'CANCELLED', 'EXPIRED'))
);
create index ix_peer_sessions_host on peer_sessions (host_user_id, created_at desc);
create index ix_peer_sessions_expiry on peer_sessions (expires_at) where status in ('WAITING', 'READY', 'ACTIVE');

create table peer_participants (
    id uuid primary key,
    session_id uuid not null references peer_sessions(id) on delete cascade,
    user_id uuid not null references identity_users(id) on delete cascade,
    slot smallint not null check (slot in (1, 2)),
    role varchar(16) not null check (role in ('HOST', 'GUEST')),
    status varchar(16) not null check (status in ('JOINING', 'CONNECTED', 'RECONNECTING', 'LEFT')),
    ready boolean not null default false,
    media_connected boolean not null default false,
    joined_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_peer_participant_user unique (session_id, user_id),
    constraint uq_peer_participant_slot unique (session_id, slot)
);
create index ix_peer_participants_user on peer_participants (user_id, updated_at desc);

create table peer_active_reservations (
    user_id uuid primary key references identity_users(id) on delete cascade,
    session_id uuid not null unique references peer_sessions(id) on delete cascade,
    created_at timestamptz not null
);

create table peer_invites (
    id uuid primary key,
    session_id uuid not null references peer_sessions(id) on delete cascade,
    token_hash varchar(64) not null unique,
    expires_at timestamptz not null,
    accepted_by uuid references identity_users(id) on delete set null,
    accepted_at timestamptz,
    revoked_at timestamptz,
    created_at timestamptz not null
);
create index ix_peer_invites_session on peer_invites (session_id, expires_at);

insert into peer_scenarios
  (id, version, title, category, category_label, level, common_objective, description,
   duration_minutes, phases, recommended_vocab, published, created_at, updated_at)
values
  ('20000000-0000-0000-0000-000000000001', 1,
   'A difficult project handoff', 'work', 'Work & projects', 'B1-B2',
   'Agree on a clear handoff plan and next action.',
   'Practise clarifying ownership, timelines and blockers with another learner.', 10,
   '[{"phase":"OPENING","title":"Set the context","durationSeconds":90,"promptEn":"Explain what changed and why the handoff matters.","promptVi":"Giải thích điều gì đã thay đổi và vì sao cần bàn giao.","hints":["Start with the outcome.","Name one concrete example."]},{"phase":"EXCHANGE","title":"Compare priorities","durationSeconds":150,"promptEn":"Ask about the other person''s priorities and constraints.","promptVi":"Hỏi về ưu tiên và giới hạn của người kia.","hints":["Ask one follow-up question.","Use a softener."]},{"phase":"AGREEMENT","title":"Close the loop","durationSeconds":150,"promptEn":"Summarise the plan and confirm the next step.","promptVi":"Tóm tắt kế hoạch và xác nhận bước tiếp theo.","hints":["Use a time marker.","Check shared understanding."]}]'::jsonb,
   '["clarify ownership","to keep someone in the loop","by Friday"]'::jsonb, true, now(), now()),
  ('20000000-0000-0000-0000-000000000002', 1,
   'A thoughtful interview answer', 'interview', 'Interview practice', 'B1-B2',
   'Build a concise answer with a specific example and a clear result.',
   'Take turns asking and answering a behavioural interview question.', 10,
   '[{"phase":"OPENING","title":"Frame your answer","durationSeconds":90,"promptEn":"Tell a story about a time you solved a difficult problem.","promptVi":"Kể về một lần bạn giải quyết một vấn đề khó.","hints":["Set the scene.","Keep the context short."]},{"phase":"EXCHANGE","title":"Ask deeper","durationSeconds":150,"promptEn":"Ask one question that helps your partner add useful detail.","promptVi":"Hỏi một câu giúp bạn học bổ sung chi tiết hữu ích.","hints":["Ask about the decision.","Ask what changed."]},{"phase":"AGREEMENT","title":"Give a takeaway","durationSeconds":150,"promptEn":"Share one strength you heard in your partner''s answer.","promptVi":"Chia sẻ một điểm mạnh bạn nghe được trong câu trả lời.","hints":["Be specific.","Use a kind, direct sentence."]}]'::jsonb,
   '["the situation was","what I learned was","as a result"]'::jsonb, true, now(), now());
