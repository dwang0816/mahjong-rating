-- Demo data. Change v_me below to YOUR sign-up email so the games land on your profile,
-- then run this file in the Supabase SQL editor AFTER migrations/0001_init.sql.
-- Safe to run before or after you sign up: the sign-up trigger links players by email.

do $$
declare
  v_me     text := 'you@example.com';   -- <<< change me
  v_logger uuid;
  d        timestamptz := now() - interval '90 days';
begin
  insert into public.players (email, display_name)
  values (lower(v_me), split_part(v_me, '@', 1))
  on conflict (email) do nothing;
  select id into v_logger from public.players where email = lower(v_me);

  -- Taiwanese 16-tile nights at Ah-Ma's, 100/20 TWD
  perform public.record_game(v_logger, d + interval '0 days', 'taiwanese', 'Ah-Ma''s Living Room', 'Taipei', 100, 20, 'TWD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 0, 'net_result', 1240),
      jsonb_build_object('email', 'mei.lin@example.com', 'display_name', 'Mei Lin', 'seat', 1, 'net_result', -680),
      jsonb_build_object('email', 'kenji.o@example.com', 'display_name', 'Kenji', 'seat', 2, 'net_result', -320),
      jsonb_build_object('email', 'auntie.wu@example.com', 'display_name', 'Auntie Wu', 'seat', 3, 'net_result', -240)));
  perform public.record_game(v_logger, d + interval '7 days', 'taiwanese', 'Ah-Ma''s Living Room', 'Taipei', 100, 20, 'TWD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 1, 'net_result', -560),
      jsonb_build_object('email', 'mei.lin@example.com', 'display_name', 'Mei Lin', 'seat', 2, 'net_result', 1520),
      jsonb_build_object('email', 'kenji.o@example.com', 'display_name', 'Kenji', 'seat', 3, 'net_result', -400),
      jsonb_build_object('email', 'auntie.wu@example.com', 'display_name', 'Auntie Wu', 'seat', 0, 'net_result', -560)));
  perform public.record_game(v_logger, d + interval '14 days', 'taiwanese', 'Ah-Ma''s Living Room', 'Taipei', 100, 20, 'TWD', 'Kenji self-drew a limit hand',
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 2, 'net_result', 300),
      jsonb_build_object('email', 'mei.lin@example.com', 'display_name', 'Mei Lin', 'seat', 3, 'net_result', -1100),
      jsonb_build_object('email', 'kenji.o@example.com', 'display_name', 'Kenji', 'seat', 0, 'net_result', 1900),
      jsonb_build_object('email', 'auntie.wu@example.com', 'display_name', 'Auntie Wu', 'seat', 1, 'net_result', -1100)));

  -- Higher stakes Taiwanese at a parlour, 300/100 TWD
  perform public.record_game(v_logger, d + interval '20 days', 'taiwanese', 'Jade Dragon Parlour', 'Taichung', 300, 100, 'TWD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 0, 'net_result', -2400),
      jsonb_build_object('email', 'boss.chen@example.com', 'display_name', 'Boss Chen', 'seat', 1, 'net_result', 4100),
      jsonb_build_object('email', 'kenji.o@example.com', 'display_name', 'Kenji', 'seat', 2, 'net_result', -900),
      jsonb_build_object('email', 'ricky.t@example.com', 'display_name', 'Ricky', 'seat', 3, 'net_result', -800)));
  perform public.record_game(v_logger, d + interval '27 days', 'taiwanese', 'Jade Dragon Parlour', 'Taichung', 300, 100, 'TWD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 1, 'net_result', 3300),
      jsonb_build_object('email', 'boss.chen@example.com', 'display_name', 'Boss Chen', 'seat', 2, 'net_result', -1500),
      jsonb_build_object('email', 'ricky.t@example.com', 'display_name', 'Ricky', 'seat', 3, 'net_result', -600),
      jsonb_build_object('email', 'sophia.h@example.com', 'display_name', 'Sophia', 'seat', 0, 'net_result', -1200)));

  -- Cantonese 13-tile games in HK, 5/10 HKD
  perform public.record_game(v_logger, d + interval '35 days', 'cantonese', 'Golden Phoenix Mahjong School', 'Hong Kong', 5, 10, 'HKD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 0, 'net_result', 640),
      jsonb_build_object('email', 'sophia.h@example.com', 'display_name', 'Sophia', 'seat', 1, 'net_result', -160),
      jsonb_build_object('email', 'uncle.lam@example.com', 'display_name', 'Uncle Lam', 'seat', 2, 'net_result', -320),
      jsonb_build_object('email', 'ricky.t@example.com', 'display_name', 'Ricky', 'seat', 3, 'net_result', -160)));
  perform public.record_game(v_logger, d + interval '42 days', 'cantonese', 'Golden Phoenix Mahjong School', 'Hong Kong', 5, 10, 'HKD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 3, 'net_result', -480),
      jsonb_build_object('email', 'sophia.h@example.com', 'display_name', 'Sophia', 'seat', 0, 'net_result', 960),
      jsonb_build_object('email', 'uncle.lam@example.com', 'display_name', 'Uncle Lam', 'seat', 1, 'net_result', -240),
      jsonb_build_object('email', 'mei.lin@example.com', 'display_name', 'Mei Lin', 'seat', 2, 'net_result', -240)));
  perform public.record_game(v_logger, d + interval '49 days', 'cantonese', 'Uncle Lam''s Flat', 'Hong Kong', 10, 20, 'HKD', 'Full-lat table',
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 2, 'net_result', 2560),
      jsonb_build_object('email', 'uncle.lam@example.com', 'display_name', 'Uncle Lam', 'seat', 3, 'net_result', -1280),
      jsonb_build_object('email', 'boss.chen@example.com', 'display_name', 'Boss Chen', 'seat', 0, 'net_result', -640),
      jsonb_build_object('email', 'sophia.h@example.com', 'display_name', 'Sophia', 'seat', 1, 'net_result', -640)));

  -- Back to Taipei
  perform public.record_game(v_logger, d + interval '60 days', 'taiwanese', 'Ah-Ma''s Living Room', 'Taipei', 100, 20, 'TWD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 0, 'net_result', 820),
      jsonb_build_object('email', 'mei.lin@example.com', 'display_name', 'Mei Lin', 'seat', 1, 'net_result', 140),
      jsonb_build_object('email', 'kenji.o@example.com', 'display_name', 'Kenji', 'seat', 2, 'net_result', -480),
      jsonb_build_object('email', 'auntie.wu@example.com', 'display_name', 'Auntie Wu', 'seat', 3, 'net_result', -480)));
  perform public.record_game(v_logger, d + interval '74 days', 'taiwanese', 'Jade Dragon Parlour', 'Taichung', 300, 100, 'TWD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 1, 'net_result', -1700),
      jsonb_build_object('email', 'boss.chen@example.com', 'display_name', 'Boss Chen', 'seat', 2, 'net_result', 2900),
      jsonb_build_object('email', 'kenji.o@example.com', 'display_name', 'Kenji', 'seat', 3, 'net_result', -600),
      jsonb_build_object('email', 'ricky.t@example.com', 'display_name', 'Ricky', 'seat', 0, 'net_result', -600)));
  perform public.record_game(v_logger, d + interval '85 days', 'taiwanese', 'Ah-Ma''s Living Room', 'Taipei', 100, 20, 'TWD', null,
    jsonb_build_array(
      jsonb_build_object('email', v_me, 'display_name', 'Me', 'seat', 3, 'net_result', 1160),
      jsonb_build_object('email', 'mei.lin@example.com', 'display_name', 'Mei Lin', 'seat', 0, 'net_result', -520),
      jsonb_build_object('email', 'kenji.o@example.com', 'display_name', 'Kenji', 'seat', 1, 'net_result', -320),
      jsonb_build_object('email', 'auntie.wu@example.com', 'display_name', 'Auntie Wu', 'seat', 2, 'net_result', -320)));
end $$;
