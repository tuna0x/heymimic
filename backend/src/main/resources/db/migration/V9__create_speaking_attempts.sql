create table speaking_attempts (
    id uuid primary key,
    session_id uuid not null references speaking_sessions(id) on delete restrict,
    attempt_number integer not null check (attempt_number > 0),
    object_key varchar(500) not null,
    object_version varchar(200),
    checksum varchar(64),
    size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
    mime_type varchar(100) not null,
    duration_ms bigint,
    audio_state varchar(32) not null,
    processing_state varchar(32) not null,
    upload_expires_at timestamptz not null,
    retention_until timestamptz,
    version bigint not null default 0,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_speaking_attempt_number unique (session_id, attempt_number),
    constraint uq_speaking_attempt_object_key unique (object_key),
    constraint ck_speaking_attempt_mime check (mime_type in ('audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav')),
    constraint ck_speaking_attempt_audio_state check (audio_state in ('AWAITING_UPLOAD', 'AVAILABLE', 'DELETED')),
    constraint ck_speaking_attempt_processing_state check (processing_state in ('NOT_REQUESTED', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED')),
    constraint ck_speaking_attempt_duration check (duration_ms is null or duration_ms between 2000 and 180000)
);

create index ix_speaking_attempts_session on speaking_attempts (session_id, attempt_number);
create index ix_speaking_attempts_retention
    on speaking_attempts (retention_until) where audio_state = 'AVAILABLE';
