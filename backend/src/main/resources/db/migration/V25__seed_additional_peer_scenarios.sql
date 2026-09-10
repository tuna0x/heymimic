insert into peer_scenarios
  (id, version, title, category, category_label, level, common_objective, description,
   duration_minutes, phases, recommended_vocab, published, created_at, updated_at)
values
  ('20000000-0000-0000-0000-000000000003', 1,
   'AI at work: opportunity or risk?', 'tech', 'Technology & AI', 'B2+',
   'Explain one useful AI workflow and agree on one responsible guardrail.',
   'Take turns weighing productivity gains against accuracy, privacy and human judgement.', 10,
   '[{"phase":"OPENING","title":"Name the use case","durationSeconds":90,"promptEn":"Describe one AI tool or workflow you use and the problem it solves.","promptVi":"Mô tả một công cụ hoặc quy trình AI bạn dùng và vấn đề nó giải quyết.","hints":["Start with a concrete example.","Say what changed."]},{"phase":"EXCHANGE","title":"Test the trade-off","durationSeconds":150,"promptEn":"Ask what could go wrong and respond with a practical safeguard.","promptVi":"Hỏi điều gì có thể sai và trả lời bằng một biện pháp bảo vệ thực tế.","hints":["Ask about verification.","Acknowledge a valid concern."]},{"phase":"AGREEMENT","title":"Set a guardrail","durationSeconds":150,"promptEn":"Agree on one rule for using AI responsibly at work.","promptVi":"Thống nhất một nguyên tắc dùng AI có trách nhiệm trong công việc.","hints":["Make the rule observable.","Confirm who owns the check."]}]'::jsonb,
   '["automate repetitive work","fact-check the output","human judgement"]'::jsonb, true, now(), now()),
  ('20000000-0000-0000-0000-000000000004', 1,
   'Disagree well in a team meeting', 'debate', 'Discussion & diplomacy', 'B1-B2',
   'Disagree clearly, acknowledge the other view and propose a small test.',
   'Practise polite disagreement without losing the shared goal of the meeting.', 10,
   '[{"phase":"OPENING","title":"Choose a position","durationSeconds":90,"promptEn":"State which option you support and give one reason.","promptVi":"Nêu lựa chọn bạn ủng hộ và đưa ra một lý do.","hints":["I see it differently because…","Keep the reason specific."]},{"phase":"EXCHANGE","title":"Challenge with care","durationSeconds":150,"promptEn":"Ask one question about the other option and respond to the answer.","promptVi":"Hỏi một câu về lựa chọn kia và phản hồi câu trả lời.","hints":["I see where you are coming from.","Could we test that assumption?"]},{"phase":"AGREEMENT","title":"Find the next step","durationSeconds":150,"promptEn":"Suggest a compromise or a small pilot and confirm the next step.","promptVi":"Đề xuất thỏa hiệp hoặc thử nghiệm nhỏ và xác nhận bước tiếp theo.","hints":["What if we try this for one week?","Let us define success first."]}]'::jsonb,
   '["see where you are coming from","find common ground","small pilot"]'::jsonb, true, now(), now());