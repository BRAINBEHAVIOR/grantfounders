


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."all_underserved_domains"() RETURNS TABLE("agency_code" character varying, "underserved_domain" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
SELECT 
  agency_code,
  jsonb_array_elements_text(underserved_domains) AS underserved_domain
FROM agency_market_dna
ORDER BY agency_code;
$$;


ALTER FUNCTION "public"."all_underserved_domains"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_agency_market_dna"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
  ELSE
    v_action := TG_OP;
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    entity_type,
    entity_id,
    action,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    'agency_market_dna',
    COALESCE(NEW.id, OLD.id),
    v_action,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW),
      'table', TG_TABLE_NAME
    ),
    now()
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."audit_agency_market_dna"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_run_autopilot"("_org_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  _limit int;
  _used int;
begin
  -- pega o limite do plano ativo
  select (p.entitlements->>'autopilot_runs_per_month')::int
  into _limit
  from public.org_subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.org_id = _org_id and s.status = 'active'
  order by s.created_at desc
  limit 1;

  if _limit is null then
    return false; -- sem assinatura = sem autopilot
  end if;

  -- consumo no mês corrente
  select coalesce(sum(quantity), 0)
  into _used
  from public.usage_events
  where org_id = _org_id
    and event_type = 'autopilot_run'
    and created_at >= date_trunc('month', now());

  return _used < _limit;
end;
$$;


ALTER FUNCTION "public"."can_run_autopilot"("_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_org_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN (
    SELECT p.current_org_id
    FROM public.profiles p
    WHERE p.id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."current_org_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_job"("_job_type" "text", "_entity_type" "text", "_entity_id" "uuid", "_org_id" "uuid", "_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  _job_id uuid;
begin
  insert into public.jobs (id, job_type, status, entity_type, entity_id, org_id, payload, attempts, max_attempts, created_at)
  values (gen_random_uuid(), _job_type, 'queued', _entity_type, _entity_id, _org_id, _payload, 0, 5, now())
  returning id into _job_id;

  return _job_id;
end;
$$;


ALTER FUNCTION "public"."enqueue_job"("_job_type" "text", "_entity_type" "text", "_entity_id" "uuid", "_org_id" "uuid", "_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_org"() RETURNS "uuid"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  SELECT current_org_id 
  FROM profiles
  WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_current_org"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_apply_gates"("_assessment_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
declare
  raw_score numeric;
  final_score numeric;
  eligible boolean := true;
  sam boolean := true;
  uei boolean := true;
  topic_fit numeric := 100;
begin
  raw_score := public.gf_compute_score(_assessment_id);
  final_score := raw_score;

  select max(value)=100 into sam
    from gf_assessment_inputs where key='sam_active' and assessment_id=_assessment_id;
  select max(value)=100 into uei
    from gf_assessment_inputs where key='uei_valid' and assessment_id=_assessment_id;
  select max(value)=100 into eligible
    from gf_assessment_inputs where key='us_size_ok' and assessment_id=_assessment_id;
  select coalesce(max(value),100) into topic_fit
    from gf_assessment_inputs where key='topic_fit' and assessment_id=_assessment_id;

  if eligible=false or sam=false or uei=false then
    final_score := least(raw_score,25);
  elsif topic_fit < 40 then
    final_score := least(raw_score,45);
  end if;

  update sbir_assessments set score = final_score where id=_assessment_id;
  return final_score;
end;
$$;


ALTER FUNCTION "public"."gf_apply_gates"("_assessment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_autopilot_generate"("top_n" integer DEFAULT 3) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  -- cria planos a partir do ranking
  insert into autopilot_plans (project_id, opportunity_id, gf_rank, approval_score, funding_forecast)
  select project_id, opportunity_id, gf_rank, approval_score, funding_forecast
  from project_grant_matches
  order by gf_rank desc
  limit top_n;

  -- cria tarefas padrão por plano
  insert into autopilot_tasks (plan_id, task_type, title, due_date)
  select p.id, 'compliance', 'Compliance checklist', current_date + 3
  from autopilot_plans p;

  insert into autopilot_tasks (plan_id, task_type, title, due_date)
  select p.id, 'narrative', 'Draft narrative', current_date + 7
  from autopilot_plans p;

  insert into autopilot_tasks (plan_id, task_type, title, due_date)
  select p.id, 'budget', 'Budget outline', current_date + 5
  from autopilot_plans p;
end;
$$;


ALTER FUNCTION "public"."gf_autopilot_generate"("top_n" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_band_from_score"("_score" numeric) RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $$
select case
  when _score>=80 then 'GREEN'
  when _score>=65 then 'YELLOW'
  when _score>=50 then 'ORANGE'
  else 'RED'
end;
$$;


ALTER FUNCTION "public"."gf_band_from_score"("_score" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_band_from_score_v2"("_score" numeric) RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $$
select case
  when _score>=85 then 'GREEN'
  when _score>=70 then 'YELLOW'
  when _score>=50 then 'ORANGE'
  else 'RED'
end;
$$;


ALTER FUNCTION "public"."gf_band_from_score_v2"("_score" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_build_master_proposal"("plan" "uuid") RETURNS "text"
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select string_agg(
    format('### %s\n\n%s', section, content),
    E'\n\n'
    order by section
  )
  from autopilot_drafts
  where plan_id = plan
    and content not like 'DRAFT%';
$$;


ALTER FUNCTION "public"."gf_build_master_proposal"("plan" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_calculate_intelligence"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  update project_grant_matches
  set
    agency_fit = case 
      when summary ilike '%NSF%' then 1 else 0.6 end,

    sector_fit = case 
      when summary ilike '%AI%' then 1 else 0.7 end,

    roi_score = 0.6 + random() * 0.4,

    approval_score = (agency_fit + sector_fit + roi_score) / 3,

    gf_rank = approval_score * 100,

    priority = ceil((1 - approval_score) * 10),

    funding_forecast = approval_score * 250000;
end;
$$;


ALTER FUNCTION "public"."gf_calculate_intelligence"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_compute_score"("_assessment_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
declare
  total_score numeric := 0;
  dim record;
  dim_score numeric;
begin
  for dim in
    select dimension_code, weight
    from gf_dimension_weights
    where agency_code = (select agency_code from sbir_assessments where id=_assessment_id)
  loop
    select sum(i.value * s.weight)/100 into dim_score
    from gf_assessment_inputs i
    join gf_subitem_weights s
      on s.subitem_code = i.key
     and s.dimension_code = dim.dimension_code
    where i.assessment_id = _assessment_id;

    total_score := total_score + (coalesce(dim_score,0) * dim.weight)/100;
  end loop;

  return least(total_score,100);
end;
$$;


ALTER FUNCTION "public"."gf_compute_score"("_assessment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_intelligence_core"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin

update project_grant_matches m
set
  agency_fit =
    case 
      when o.agency_code ilike '%NSF%' then 1
      when o.agency_code ilike '%NIH%' then 0.95
      when o.agency_code ilike '%DOD%' then 0.9
      when o.agency_code ilike '%DOE%' then 0.85
      else 0.7
    end,

  sector_fit =
    case
      when m.summary ilike '%AI%' then 1
      when m.summary ilike '%Automation%' then 0.9
      when m.summary ilike '%Health%' then 0.95
      else 0.75
    end,

  roi_score =
    case
      when m.summary ilike '%Automation%' then 0.92
      when m.summary ilike '%AI%' then 0.95
      else 0.8
    end

from opportunities o
where o.id = m.opportunity_id;

update project_grant_matches
set
  approval_score = (agency_fit + sector_fit + roi_score) / 3,
  gf_rank = approval_score * 100,
  priority = ceil((1 - approval_score) * 10),
  funding_forecast = approval_score * 300000;

end;
$$;


ALTER FUNCTION "public"."gf_intelligence_core"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_prepare_draft_payload"("plan" "uuid") RETURNS "jsonb"
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select jsonb_build_object(
    'project', p.name,
    'opportunity', o.title,
    'summary', m.summary,
    'agency', o.agency_code
  )
  from autopilot_plans ap
  join projects p on p.id = ap.project_id
  join opportunities o on o.id = ap.opportunity_id
  join project_grant_matches m 
       on m.project_id = ap.project_id and m.opportunity_id = ap.opportunity_id
  where ap.id = plan
  limit 1;
$$;


ALTER FUNCTION "public"."gf_prepare_draft_payload"("plan" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_update_band"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.band := public.gf_band_from_score(new.score);
  return new;
end;
$$;


ALTER FUNCTION "public"."gf_update_band"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_update_band_v2"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.band := public.gf_band_from_score_v2(new.score);
  return new;
end;
$$;


ALTER FUNCTION "public"."gf_update_band_v2"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gf_write_decision_record"("_assessment_id" "uuid", "_score" numeric, "_band" "text", "_gates" "jsonb", "_dimensions" "jsonb", "_fix_list" "jsonb", "_next_actions" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
declare
  _id uuid;
begin
  insert into gf_decision_records(
    assessment_id, score_total, band, gates, dimensions, fix_list, next_actions
  ) values (
    _assessment_id, _score, _band, _gates, _dimensions, _fix_list, _next_actions
  ) returning id into _id;
  return _id;
end;
$$;


ALTER FUNCTION "public"."gf_write_decision_record"("_assessment_id" "uuid", "_score" numeric, "_band" "text", "_gates" "jsonb", "_dimensions" "jsonb", "_fix_list" "jsonb", "_next_actions" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  org_id uuid;
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.organizations (name)
  values ('Default Organization')
  returning id into org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (org_id, new.id, 'owner');

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_admin"("target_org" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.org_id = target_org
      AND om.user_id = auth.uid()
      AND om.role IN ('owner','admin')
  );
END;
$$;


ALTER FUNCTION "public"."is_org_admin"("target_org" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_member"("p_org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select exists (
    select 1
    from public.organization_members om
    where om.org_id = p_org_id
      and om.user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_org_member"("p_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_grant_chunks"("p_opportunity_id" "uuid", "query_embedding" "extensions"."vector", "match_count" integer DEFAULT 5) RETURNS TABLE("chunk_id" "uuid", "chunk_index" integer, "chunk_text" "text", "score" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    gc.id as chunk_id,
    gc.chunk_index,
    gc.chunk_text,
    (1 / (1 + (gc.embedding <-> query_embedding)))::float as score
  from public.grant_chunks gc
  where gc.opportunity_id = p_opportunity_id
    and gc.embedding is not null
  order by (gc.embedding <-> query_embedding) asc
  limit match_count;
$$;


ALTER FUNCTION "public"."match_grant_chunks"("p_opportunity_id" "uuid", "query_embedding" "extensions"."vector", "match_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."match_grant_chunks"("p_opportunity_id" "uuid", "query_embedding" "extensions"."vector", "match_count" integer) IS 'GrantFounders: semantic match for grant chunks using pgvector L2 distance (<->).';



CREATE OR REPLACE FUNCTION "public"."match_opportunities"("query_embedding" "extensions"."vector", "match_count" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "opportunity_id" character varying, "opportunity_number" character varying, "title" "text", "description" "text", "agency_code" character varying, "close_date" "date", "posted_date" "date", "score" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    o.id,
    o.opportunity_id,
    o.opportunity_number,
    o.title,
    o.description,
    o.agency_code,
    o.close_date,
    o.posted_date,
    (1 / (1 + (o.embedding <-> query_embedding)))::float as score
  from public.opportunities o
  where o.embedding is not null
  order by (o.embedding <-> query_embedding) asc
  limit match_count;
$$;


ALTER FUNCTION "public"."match_opportunities"("query_embedding" "extensions"."vector", "match_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."match_opportunities"("query_embedding" "extensions"."vector", "match_count" integer) IS 'GrantFounders: semantic match for opportunities using pgvector L2 distance (<->).';



CREATE OR REPLACE FUNCTION "public"."opportunities_tsv_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.tsv :=
    to_tsvector('english',
      coalesce(new.title,'') || ' ' ||
      coalesce(new.description,'') || ' ' ||
      coalesce(new.opportunity_number,'')
    );
  return new;
end;
$$;


ALTER FUNCTION "public"."opportunities_tsv_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."org_role_rank"("p_org_id" "uuid") RETURNS integer
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select coalesce(
    (select case om.role
      when 'owner' then 4
      when 'admin' then 3
      when 'member' then 2
      when 'viewer' then 1
      else 0 end
     from public.organization_members om
     where om.org_id = p_org_id
       and om.user_id = auth.uid()
     limit 1),
  0);
$$;


ALTER FUNCTION "public"."org_role_rank"("p_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_engine_meta_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if old.meta is distinct from new.meta then
    raise exception 'Engine logs are immutable (federal blackbox)';
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."prevent_engine_meta_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."run_federal_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
declare
  _assessment_id uuid;
begin
  -- cria assessment base
  insert into public.sbir_assessments(org_id, project_id, agency_code, score, band, engine_version, rule_set_version)
  values (
    _org_id,
    _project_id,
    _agency,
    0,
    'PENDING',
    'gf_engine_v1',
    case
      when _agency='NSF' then 'nsf_rulepack_v1'
      when _agency='DoD' then 'dod_rulepack_v1'
      when _agency='NIH' then 'nih_rulepack_v1'
      else 'sbir_rules_v1'
    end
  ) returning id into _assessment_id;

  -- roda firewall correto
  perform public.run_sbir_compliance_guard(_assessment_id);

  return _assessment_id;
end;
$$;


ALTER FUNCTION "public"."run_federal_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."run_sbir_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
declare
  _score numeric := 60;
  _band text := 'ORANGE';
  _assessment_id uuid;
begin
  insert into public.sbir_assessments(org_id, project_id, agency_code, score, band, engine_version, rule_set_version)
  values (_org_id, _project_id, _agency, _score, _band, 'gf_engine_v1', 'sbir_rules_v1')
  returning id into _assessment_id;

  return _assessment_id;
end;
$$;


ALTER FUNCTION "public"."run_sbir_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."run_sbir_compliance_guard"("_assessment_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
declare
  _run_id uuid;
begin
  insert into public.sbir_compliance_runs(assessment_id, agency_code, status, rule_set_version)
  select id, agency_code, 'RUNNING', rule_set_version
  from sbir_assessments where id = _assessment_id
  returning id into _run_id;

  insert into sbir_compliance_findings(run_id, rule_key, severity, message, fix_items)
  select _run_id, key, severity, fail_message, fix_checklist
  from sbir_compliance_rules
  where agency_code = (select agency_code from sbir_assessments where id=_assessment_id);

  update sbir_compliance_runs set status='DONE' where id=_run_id;
  return _run_id;
end;
$$;


ALTER FUNCTION "public"."run_sbir_compliance_guard"("_assessment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_verticals"("search_term" "text") RETURNS TABLE("agency_code" character varying, "agency_name" character varying, "matching_verticals" "jsonb")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
SELECT 
  agency_code,
  agency_name,
  jsonb_agg(
    jsonb_build_object('vertical', v)
  ) FILTER (WHERE v ILIKE '%' || search_term || '%') AS matching_verticals
FROM agency_market_dna,
  LATERAL jsonb_array_elements_text(hot_verticals) AS v
GROUP BY agency_code, agency_name
HAVING COUNT(*) FILTER (WHERE v ILIKE '%' || search_term || '%') > 0;
$$;


ALTER FUNCTION "public"."search_verticals"("search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_current_org"("org" "uuid") RETURNS "void"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  UPDATE profiles
  SET current_org_id = org
  WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."set_current_org"("org" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_opportunity_tsv"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_opportunity_tsv"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profiles_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_profiles_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_projects_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_projects_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."funding_opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency" "text" NOT NULL,
    "title" "text" NOT NULL,
    "domain_slug" "text" NOT NULL,
    "min_budget_usd" numeric,
    "max_budget_usd" numeric,
    "trl_min" integer,
    "trl_max" integer,
    "status" "text" DEFAULT 'open'::"text",
    "source_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."funding_opportunities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organizations_type_check" CHECK (("type" = ANY (ARRAY['ngo'::"text", 'company'::"text", 'university'::"text", 'government'::"text", 'web3'::"text", 'other'::"text"])))
);

ALTER TABLE ONLY "public"."organizations" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agencies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "cognitive_style" "text" NOT NULL,
    "decision_logic" "text" NOT NULL,
    "winning_triggers" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "dominant_trl_min" integer DEFAULT 1 NOT NULL,
    "dominant_trl_max" integer DEFAULT 9 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agencies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agency_award_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "agency_code" "text" NOT NULL,
    "source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "vehicle_type" "text" NOT NULL,
    "mechanism" "text",
    "title" "text",
    "opportunity_number" "text",
    "awardee" "text",
    "pi" "text",
    "submission_date" "date",
    "award_date" "date",
    "amount_usd" numeric,
    "domains" "jsonb" DEFAULT '[]'::"jsonb",
    "trl_min" integer,
    "trl_max" integer,
    "meta" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "agency_award_events_trl_max_check" CHECK ((("trl_max" >= 1) AND ("trl_max" <= 9))),
    CONSTRAINT "agency_award_events_trl_min_check" CHECK ((("trl_min" >= 1) AND ("trl_min" <= 9)))
);


ALTER TABLE "public"."agency_award_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agency_market_dna" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text" NOT NULL,
    "hot_verticals" "jsonb" DEFAULT '[]'::"jsonb",
    "underserved_domains" "jsonb" DEFAULT '[]'::"jsonb",
    "saturated_domains" "jsonb" DEFAULT '[]'::"jsonb",
    "emerging_clusters" "jsonb" DEFAULT '[]'::"jsonb",
    "strategic_windows" "jsonb" DEFAULT '[]'::"jsonb",
    "ticket_trends" "jsonb" DEFAULT '{}'::"jsonb",
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "agency_name" character varying(100) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    "fy25_budget_ai" character varying(50),
    "fy25_growth_pct" double precision,
    "competitive_density" "jsonb" DEFAULT '{}'::"jsonb",
    "funding_signals" "jsonb" DEFAULT '[]'::"jsonb",
    "active_foas" "jsonb" DEFAULT '[]'::"jsonb",
    "recent_awards" "jsonb" DEFAULT '[]'::"jsonb",
    "data_quality" character varying(20) DEFAULT 'high'::character varying,
    "source" character varying(100) DEFAULT 'Perplexity AI GF-AGENCY DNA'::character varying,
    "org_id" "uuid",
    "agency_id" "uuid",
    "cognitive_style" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "economic_behavior" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "funding_velocity_model" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "trl_bias_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "compliance_sensitivity" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "political_risk_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "innovation_appetite_index" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "grant_density_map" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "award_pattern_fingerprint" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "time_to_award_distribution" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "contract_vs_grant_preference" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "small_business_bias_index" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "sbir_sttr_affinity" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "preferred_vehicle_map" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "funding_phase_bias" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "digitalization_level" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "agentic_readiness_index" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "privacy_tolerance" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "autonomy_acceptance" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "domain_heatmap" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "capital_flow_trends" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "decision_entropy_score" numeric(6,3) DEFAULT 0.000 NOT NULL,
    "funding_cycle_clock" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "risk_rejection_signature" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "acquisition_readiness" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "gf_rank_weight" numeric(6,3) DEFAULT 0.000 NOT NULL,
    "gf_autopilot_weight" numeric(6,3) DEFAULT 0.000 NOT NULL,
    CONSTRAINT "agency_market_dna_acquisition_range" CHECK ((("acquisition_readiness" >= (0)::numeric) AND ("acquisition_readiness" <= (100)::numeric))),
    CONSTRAINT "agency_market_dna_agentic_range" CHECK ((("agentic_readiness_index" >= (0)::numeric) AND ("agentic_readiness_index" <= (100)::numeric))),
    CONSTRAINT "agency_market_dna_autonomy_range" CHECK ((("autonomy_acceptance" >= (0)::numeric) AND ("autonomy_acceptance" <= (100)::numeric))),
    CONSTRAINT "agency_market_dna_digitalization_range" CHECK ((("digitalization_level" >= (0)::numeric) AND ("digitalization_level" <= (100)::numeric))),
    CONSTRAINT "agency_market_dna_innovation_range" CHECK ((("innovation_appetite_index" >= (0)::numeric) AND ("innovation_appetite_index" <= (100)::numeric))),
    CONSTRAINT "agency_market_dna_privacy_range" CHECK ((("privacy_tolerance" >= (0)::numeric) AND ("privacy_tolerance" <= (100)::numeric))),
    CONSTRAINT "agency_market_dna_sbir_affinity_range" CHECK ((("sbir_sttr_affinity" >= (0)::numeric) AND ("sbir_sttr_affinity" <= (100)::numeric))),
    CONSTRAINT "agency_market_dna_smallbiz_range" CHECK ((("small_business_bias_index" >= (0)::numeric) AND ("small_business_bias_index" <= (100)::numeric)))
);

ALTER TABLE ONLY "public"."agency_market_dna" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."agency_market_dna" OWNER TO "postgres";


COMMENT ON COLUMN "public"."agency_market_dna"."org_id" IS 'Owning organization (tenant) for multi-tenant RLS.';



CREATE MATERIALIZED VIEW "public"."agency_competitive_summary" AS
 SELECT "agency_code",
    "agency_name",
    "fy25_growth_pct",
    "jsonb_array_length"("hot_verticals") AS "hot_verticals_count",
    "jsonb_array_length"("underserved_domains") AS "underserved_count",
    "jsonb_array_length"("saturated_domains") AS "saturated_count",
    "jsonb_array_length"("emerging_clusters") AS "emerging_count",
    "jsonb_array_length"("strategic_windows") AS "strategic_windows_count",
    "updated_at"
   FROM "public"."agency_market_dna"
  ORDER BY "updated_at" DESC
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."agency_competitive_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agency_dna_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "agency_code" "text" NOT NULL,
    "version" "text" DEFAULT 'v1'::"text" NOT NULL,
    "source" "text" NOT NULL,
    "model" "text",
    "prompt_hash" "text",
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "priorities" "jsonb" DEFAULT '[]'::"jsonb",
    "evaluation_weights" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "rejection_patterns" "jsonb" DEFAULT '[]'::"jsonb",
    "trl_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "budget_patterns" "jsonb" DEFAULT '{}'::"jsonb",
    "structure_patterns" "jsonb" DEFAULT '[]'::"jsonb",
    "language_patterns" "jsonb" DEFAULT '[]'::"jsonb",
    "red_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "ticket_ranges" "jsonb" DEFAULT '{}'::"jsonb",
    "approval_rates" "jsonb" DEFAULT '{}'::"jsonb",
    "raw_json" "jsonb" NOT NULL,
    "quality_score" integer DEFAULT 0,
    "notes" "text"
);


ALTER TABLE "public"."agency_dna_snapshots" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."agency_dna_latest" WITH ("security_invoker"='true') AS
 SELECT DISTINCT ON ("agency_code") "id",
    "org_id",
    "agency_code",
    "version",
    "source",
    "model",
    "prompt_hash",
    "generated_at",
    "priorities",
    "evaluation_weights",
    "rejection_patterns",
    "trl_preferences",
    "budget_patterns",
    "structure_patterns",
    "language_patterns",
    "red_flags",
    "ticket_ranges",
    "approval_rates",
    "raw_json",
    "quality_score",
    "notes"
   FROM "public"."agency_dna_snapshots"
  ORDER BY "agency_code", "generated_at" DESC;


ALTER VIEW "public"."agency_dna_latest" OWNER TO "postgres";


COMMENT ON VIEW "public"."agency_dna_latest" IS 'Latest DNA snapshot for each agency. Uses SECURITY INVOKER for RLS compliance.';



CREATE TABLE IF NOT EXISTS "public"."agency_dna_profiles" (
    "agency_code" "text" NOT NULL,
    "dominant_domains" "text"[],
    "avg_award" numeric,
    "preferred_trl_min" integer,
    "preferred_trl_max" integer,
    "avg_time_to_award_days" integer,
    "approval_rate" numeric,
    "growth_vector" "jsonb",
    "budget_momentum" numeric,
    "strategic_keywords" "text"[],
    "last_updated" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."agency_dna_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agency_domain_weights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_id" "uuid" NOT NULL,
    "domain_id" "uuid" NOT NULL,
    "weight" numeric DEFAULT 1.0 NOT NULL,
    "growth_vector" "text",
    "ticket_min_usd" numeric,
    "ticket_max_usd" numeric
);


ALTER TABLE "public"."agency_domain_weights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_models" (
    "id" "text" NOT NULL,
    "vendor" "text",
    "role" "text",
    "cost_per_1k_input" numeric,
    "cost_per_1k_output" numeric,
    "latency_sla_ms" integer,
    "enabled" boolean DEFAULT true,
    CONSTRAINT "ai_models_vendor_check" CHECK (("vendor" = ANY (ARRAY['openai'::"text", 'anthropic'::"text", 'google'::"text"])))
);


ALTER TABLE "public"."ai_models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_routes" (
    "task" "text" NOT NULL,
    "model_id" "text",
    "fallback_model_id" "text",
    "max_input_tokens" integer DEFAULT 32000,
    "max_output_tokens" integer DEFAULT 4096,
    "allow_stream" boolean DEFAULT true,
    "pii_policy" "text" DEFAULT 'redact'::"text",
    "cache_ttl_seconds" integer DEFAULT 0
);


ALTER TABLE "public"."ai_routes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_usage_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "user_id" "uuid",
    "task" "text",
    "model_id" "text",
    "input_tokens" integer,
    "output_tokens" integer,
    "cost_usd" numeric,
    "latency_ms" integer,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_usage_events_status_check" CHECK (("status" = ANY (ARRAY['ok'::"text", 'fallback'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."ai_usage_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "action" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."audit_logs" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autopilot_drafts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "section" "text" NOT NULL,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."autopilot_drafts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autopilot_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "opportunity_id" "uuid" NOT NULL,
    "gf_rank" double precision,
    "approval_score" double precision,
    "funding_forecast" double precision,
    "status" "text" DEFAULT 'planned'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid"
);


ALTER TABLE "public"."autopilot_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autopilot_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "task_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "due_date" "date",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."autopilot_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_firewall_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_id" "uuid" NOT NULL,
    "rule_type" "text" NOT NULL,
    "severity" "text" DEFAULT 'high'::"text" NOT NULL,
    "rule_text" "text" NOT NULL,
    "forbidden_patterns" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "required_disclosures" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "privacy_requirements" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."compliance_firewall_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proposal_id" "uuid" NOT NULL,
    "requirement" "text" NOT NULL,
    "mandatory" boolean DEFAULT true,
    "status" "text" DEFAULT 'pending'::"text",
    "source" "text" DEFAULT 'ai'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."compliance_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dod_prompt_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section" "text",
    "template" "text",
    "prompt_version" "text"
);


ALTER TABLE "public"."dod_prompt_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dod_weights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dimension" "text",
    "weight" numeric
);


ALTER TABLE "public"."dod_weights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_flags" (
    "key" "text" NOT NULL,
    "value" "jsonb",
    "description" "text"
);


ALTER TABLE "public"."feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."federal_buyers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "technical_domain" "text",
    "buyer_email" "text",
    "confidence_score" numeric,
    "source_baa" "text",
    "last_seen" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."federal_buyers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."federal_hidden_taxonomy" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "root_baa_id" "text",
    "taxonomy_code" "text",
    "agency_code" "text",
    "domain" "text",
    "hidden_keywords" "text"[],
    "weight" numeric,
    "last_seen" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."federal_hidden_taxonomy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."federal_root_programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "root_baa_id" "text",
    "valid_until" "date",
    "classification_system" "text",
    "description" "text",
    "checksum" "text",
    "last_seen" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."federal_root_programs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."foas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_id" "uuid" NOT NULL,
    "foa_number" "text",
    "title" "text" NOT NULL,
    "url" "text",
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "open_date" "date",
    "due_date" "date",
    "trl_min" integer,
    "trl_max" integer,
    "domains" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "keywords" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "raw_text" "text",
    "embedding" "extensions"."vector"(1536),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."foas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."funding_domains" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "tier" integer NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."funding_domains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."funding_forecasts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "predicted_domain" "text",
    "predicted_budget" numeric,
    "predicted_quarter" "text",
    "probability" numeric,
    "trigger_signals" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."funding_forecasts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."funding_prediction_models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "domain" "text",
    "predicted_budget" numeric,
    "predicted_quarter" "text",
    "probability" numeric,
    "trigger_terms" "text"[],
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."funding_prediction_models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."funding_signal_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "text" NOT NULL,
    "opportunity_id" "uuid",
    "signal_score" numeric NOT NULL,
    "confidence" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."funding_signal_matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."funding_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "text" NOT NULL,
    "agency" "text" NOT NULL,
    "program_code" "text" NOT NULL,
    "signal_score" numeric NOT NULL,
    "confidence" "text" NOT NULL,
    "raw_payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."funding_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_assessment_inputs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid",
    "key" "text",
    "value" numeric
);


ALTER TABLE "public"."gf_assessment_inputs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_decision_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid",
    "score_total" numeric,
    "band" "text",
    "gates" "jsonb",
    "dimensions" "jsonb",
    "fix_list" "jsonb",
    "next_actions" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gf_decision_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_dimension_weights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "dimension_code" "text",
    "weight" numeric
);


ALTER TABLE "public"."gf_dimension_weights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_engine_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "project_id" "uuid",
    "assessment_id" "uuid",
    "engine_name" "text" DEFAULT 'gf_autopilot'::"text" NOT NULL,
    "engine_version" "text" NOT NULL,
    "rule_set_id" "uuid",
    "prompt_pack_id" "uuid",
    "rule_set_version" "text",
    "prompt_pack_version" "text",
    "inputs_hash" "text",
    "outputs_hash" "text",
    "status" "text" DEFAULT 'completed'::"text" NOT NULL,
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid",
    CONSTRAINT "chk_gf_engine_runs_inputs_hash_len" CHECK ((("inputs_hash" IS NULL) OR ("length"("inputs_hash") = 64))),
    CONSTRAINT "chk_gf_engine_runs_outputs_hash_len" CHECK ((("outputs_hash" IS NULL) OR ("length"("outputs_hash") = 64))),
    CONSTRAINT "chk_gf_engine_runs_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."gf_engine_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_engine_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "engine_code" "text" NOT NULL,
    "version" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gf_engine_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_fix_taxonomy" (
    "fix_key" "text" NOT NULL,
    "dimension" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "default_fix_text" "text",
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_gf_fix_tax_severity" CHECK (("severity" = ANY (ARRAY['P0'::"text", 'P1'::"text", 'P2'::"text"])))
);


ALTER TABLE "public"."gf_fix_taxonomy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_fos_compliance_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rule_id" "text" NOT NULL,
    "source" "text" NOT NULL,
    "description" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "rule_type" "text" NOT NULL,
    "condition_logic" "jsonb" NOT NULL,
    "audit_standard" "text",
    "audit_implication" "text",
    "rules_hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gf_fos_compliance_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_fos_decisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "text" NOT NULL,
    "drawdown_request_id" "uuid" NOT NULL,
    "grant_id" "text" NOT NULL,
    "decision" "text" NOT NULL,
    "truth_state" "text" NOT NULL,
    "risk_level" "text" NOT NULL,
    "violated_rule_ids" "jsonb" NOT NULL,
    "evidence_hash" "text" NOT NULL,
    "input_hash" "text" NOT NULL,
    "execution_timestamp" timestamp with time zone NOT NULL,
    "system_version" "text" NOT NULL,
    "entry_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "gf_fos_decisions_immutable" CHECK (("created_at" = "now"()))
);


ALTER TABLE "public"."gf_fos_decisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_fos_drawdown_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "drawdown_id" "text" NOT NULL,
    "grant_id" "text" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "agency_code" "text" NOT NULL,
    "requested_amount" numeric NOT NULL,
    "request_timestamp" timestamp with time zone NOT NULL,
    "current_cash_on_hand" numeric NOT NULL,
    "pop_start_date" "date" NOT NULL,
    "pop_end_date" "date" NOT NULL,
    "input_hash" "text" NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "project_id" "uuid",
    "organization_id" "uuid"
);


ALTER TABLE "public"."gf_fos_drawdown_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_fos_evidence_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "drawdown_request_id" "uuid" NOT NULL,
    "doc_type" "text" NOT NULL,
    "doc_id" "text" NOT NULL,
    "hash_value" "text" NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gf_fos_evidence_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_fos_truth_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "drawdown_request_id" "uuid" NOT NULL,
    "truth_state" "text" NOT NULL,
    "risk_level" "text" NOT NULL,
    "violated_rule_ids" "jsonb" NOT NULL,
    "passed_rule_ids" "jsonb" NOT NULL,
    "evaluation_timestamp" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gf_fos_truth_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_outcomes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "project_id" "uuid",
    "assessment_id" "uuid",
    "agency" "text",
    "phase" "text",
    "submitted_at" timestamp with time zone,
    "outcome" "text" DEFAULT 'pending'::"text" NOT NULL,
    "score_at_submission" numeric(5,2),
    "band_at_submission" "text",
    "p0_open" integer,
    "p1_open" integer,
    "rule_set_version" "text",
    "prompt_pack_version" "text",
    "engine_version" "text",
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid",
    CONSTRAINT "chk_gf_outcomes_outcome" CHECK (("outcome" = ANY (ARRAY['pass'::"text", 'fail'::"text", 'pending'::"text"]))),
    CONSTRAINT "chk_gf_outcomes_p0" CHECK ((("p0_open" IS NULL) OR ("p0_open" >= 0))),
    CONSTRAINT "chk_gf_outcomes_p1" CHECK ((("p1_open" IS NULL) OR ("p1_open" >= 0))),
    CONSTRAINT "chk_gf_outcomes_phase" CHECK ((("phase" IS NULL) OR ("phase" = ANY (ARRAY['I'::"text", 'II'::"text", 'III'::"text", 'ANY'::"text"]))))
);


ALTER TABLE "public"."gf_outcomes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_outcomes_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "project_id" "uuid",
    "agency_code" "text",
    "mechanism" "text",
    "result" "text",
    "awarded_amount" numeric,
    "cycle" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid"
);


ALTER TABLE "public"."gf_outcomes_tracking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_prompt_packs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "version" "text" NOT NULL,
    "agency" "text",
    "phase" "text",
    "sections" "text"[] DEFAULT '{}'::"text"[],
    "prompt_text" "text" NOT NULL,
    "guardrails" "text",
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_gf_prompt_packs_phase" CHECK ((("phase" IS NULL) OR ("phase" = ANY (ARRAY['I'::"text", 'II'::"text", 'III'::"text", 'ANY'::"text"]))))
);


ALTER TABLE "public"."gf_prompt_packs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_prompt_sets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "section" "text",
    "version" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gf_prompt_sets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_rule_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rule_set_id" "uuid" NOT NULL,
    "rule_key" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "rule_type" "text" NOT NULL,
    "config" "jsonb" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "fix_text" "text",
    "fix_links" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_gf_rule_items_rule_type" CHECK (("rule_type" = ANY (ARRAY['INPUT_BOOL'::"text", 'ARTIFACT_SECTION'::"text", 'PAGE_LIMIT'::"text", 'ATTACHMENT'::"text", 'BUDGET'::"text", 'CUSTOM'::"text"]))),
    CONSTRAINT "chk_gf_rule_items_severity" CHECK (("severity" = ANY (ARRAY['P0'::"text", 'P1'::"text", 'P2'::"text"])))
);


ALTER TABLE "public"."gf_rule_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_rule_sets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "mechanism" "text",
    "version" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "agency" "text",
    "phase" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "description" "text",
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text"
);


ALTER TABLE "public"."gf_rule_sets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gf_subitem_weights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "dimension_code" "text",
    "subitem_code" "text",
    "weight" numeric
);


ALTER TABLE "public"."gf_subitem_weights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."golden_corridors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "domain" "text",
    "agencies" "text"[],
    "momentum" numeric,
    "avg_award" numeric,
    "win_rate" numeric,
    "demand_growth" numeric,
    "predicted_lifespan_years" integer
);


ALTER TABLE "public"."golden_corridors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."grant_chunks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "opportunity_id" "uuid",
    "chunk_text" "text" NOT NULL,
    "embedding" "extensions"."vector"(1536),
    "chunk_index" integer DEFAULT 0 NOT NULL,
    "content_hash" character varying(64),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."grant_chunks" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."grant_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."grants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "opportunity_id" "text",
    "title" "text",
    "description" "text",
    "agency" "text",
    "close_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."grants" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."grants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "payload" "jsonb",
    "result" "jsonb",
    "error_details" "jsonb",
    "attempts" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 5 NOT NULL,
    "started_at" timestamp with time zone,
    "finished_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "org_id" "uuid"
);

ALTER TABLE ONLY "public"."jobs" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nih_prompt_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section" "text",
    "template" "text",
    "prompt_version" "text"
);


ALTER TABLE "public"."nih_prompt_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nih_weights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dimension" "text",
    "weight" numeric
);


ALTER TABLE "public"."nih_weights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "type" character varying(50) NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "metadata" "jsonb",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."notifications" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nsf_prompt_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section" "text",
    "template" "text",
    "prompt_version" "text"
);


ALTER TABLE "public"."nsf_prompt_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nsf_weights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dimension" "text",
    "weight" numeric
);


ALTER TABLE "public"."nsf_weights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opportunities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "opportunity_id" character varying(100),
    "opportunity_number" character varying(40),
    "title" "text" NOT NULL,
    "description" "text",
    "category" character(1),
    "agency_code" character varying(20),
    "posted_date" "date",
    "close_date" "date",
    "is_forecast" boolean DEFAULT false,
    "cost_sharing" boolean,
    "tsv" "tsvector",
    "content_hash" character varying(64),
    "inserted_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "org_id" "uuid",
    "embedding" "extensions"."vector"(1536),
    "win_probability" numeric
);

ALTER TABLE ONLY "public"."opportunities" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."org_plans" (
    "org_id" "uuid" NOT NULL,
    "plan" "text",
    "monthly_token_quota" integer,
    "monthly_cost_cap" numeric,
    "hard_cap" boolean DEFAULT false
);


ALTER TABLE "public"."org_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."org_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'inactive'::"text" NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."org_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "user_id" "uuid",
    "role" "text" DEFAULT 'member'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organization_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'member'::"text", 'viewer'::"text"])))
);

ALTER TABLE ONLY "public"."organization_members" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "user_id" "uuid",
    "provider" "text",
    "amount" numeric,
    "currency" "text" DEFAULT 'usd'::"text",
    "stripe_payment_intent_id" "text",
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payments_provider_check" CHECK (("provider" = ANY (ARRAY['stripe_card'::"text", 'stripe_usdc'::"text"]))),
    CONSTRAINT "payments_status_check" CHECK (("status" = ANY (ARRAY['succeeded'::"text", 'failed'::"text", 'pending'::"text"])))
);

ALTER TABLE ONLY "public"."payments" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "monthly_price_usd" numeric DEFAULT 0 NOT NULL,
    "entitlements" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "display_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "current_org_id" "uuid"
);

ALTER TABLE ONLY "public"."profiles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_funding_strategy" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "agency_id" "uuid" NOT NULL,
    "target_foa_id" "uuid",
    "trl_current" integer,
    "trl_target" integer,
    "fit_score" numeric DEFAULT 0 NOT NULL,
    "confidence" numeric DEFAULT 0.5 NOT NULL,
    "rationale" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "recommended_vehicle" "text",
    "recommended_domains" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "compliance_risks" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "next_actions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid"
);


ALTER TABLE "public"."project_funding_strategy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_grant_matches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "opportunity_id" "uuid",
    "score" numeric(5,2) DEFAULT 0 NOT NULL,
    "summary" "text",
    "explanation" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "agency_fit" numeric DEFAULT 0,
    "sector_fit" numeric DEFAULT 0,
    "roi_score" numeric DEFAULT 0,
    "approval_score" numeric DEFAULT 0,
    "gf_rank" double precision DEFAULT 0,
    "priority" integer DEFAULT 0,
    "funding_forecast" double precision DEFAULT 0,
    "organization_id" "uuid"
);

ALTER TABLE ONLY "public"."project_grant_matches" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_grant_matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_profile_vectors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "raw_text" "text",
    "embedding" "extensions"."vector"(1536),
    "content_hash" character varying(64),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid"
);

ALTER TABLE ONLY "public"."project_profile_vectors" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_profile_vectors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text",
    "description" "text",
    "status" character varying(20) DEFAULT 'draft'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "org_id" "uuid",
    "name" "text",
    "organization_id" "uuid"
);

ALTER TABLE ONLY "public"."projects" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposal_exports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "file_type" "text",
    "file_path" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "proposal_exports_file_type_check" CHECK (("file_type" = ANY (ARRAY['pdf'::"text", 'docx'::"text"])))
);


ALTER TABLE "public"."proposal_exports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposal_sections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "proposal_id" "uuid",
    "section_order" integer,
    "section_title" "text",
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."proposal_sections" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposal_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "grant_id" "uuid",
    "status" character varying(20) DEFAULT 'generating'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "org_id" "uuid",
    "organization_id" "uuid"
);

ALTER TABLE ONLY "public"."proposals" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbir_artifacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid",
    "section" "text",
    "content" "text",
    "prompt_version" "text",
    "engine_version" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sbir_artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbir_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "project_id" "uuid",
    "agency_code" "text",
    "score" numeric,
    "band" "text",
    "engine_version" "text",
    "rule_set_version" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid"
);


ALTER TABLE "public"."sbir_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbir_compliance_findings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid",
    "rule_key" "text",
    "severity" "text",
    "message" "text",
    "fix_items" "jsonb"
);


ALTER TABLE "public"."sbir_compliance_findings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbir_compliance_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_code" "text",
    "key" "text",
    "severity" "text",
    "fail_message" "text",
    "fix_checklist" "jsonb",
    "rule_set_version" "text"
);


ALTER TABLE "public"."sbir_compliance_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbir_compliance_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid",
    "agency_code" "text",
    "status" "text",
    "rule_set_version" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sbir_compliance_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signal_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "text" NOT NULL,
    "input" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'completed'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."signal_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "plan" "text" DEFAULT 'free'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_plan_check" CHECK (("plan" = ANY (ARRAY['free'::"text", 'pro_monthly'::"text", 'pro_yearly'::"text"]))),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'trialing'::"text", 'past_due'::"text", 'canceled'::"text", 'incomplete'::"text"])))
);

ALTER TABLE ONLY "public"."subscriptions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timelines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proposal_id" "uuid" NOT NULL,
    "milestone" "text" NOT NULL,
    "due_date" "date",
    "dependency" "text",
    "risk_level" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."timelines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trl_vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_id" "uuid" NOT NULL,
    "trl_min" integer NOT NULL,
    "trl_max" integer NOT NULL,
    "vehicle" "text" NOT NULL,
    "notes" "text",
    "blockers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "accelerators" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL
);


ALTER TABLE "public"."trl_vehicles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_events" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_orgs" WITH ("security_invoker"='true') AS
 SELECT "org_id"
   FROM "public"."organization_members"
  WHERE ("user_id" = "auth"."uid"());


ALTER VIEW "public"."user_orgs" OWNER TO "postgres";


COMMENT ON VIEW "public"."user_orgs" IS 'Organizations for current user. Uses SECURITY INVOKER for RLS compliance.';



CREATE TABLE IF NOT EXISTS "public"."wallets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "address" "text" NOT NULL,
    "chain" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "wallets_chain_check" CHECK (("chain" = ANY (ARRAY['ethereum'::"text", 'polygon'::"text", 'arbitrum'::"text", 'optimism'::"text", 'solana'::"text"])))
);

ALTER TABLE ONLY "public"."wallets" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."wallets" OWNER TO "postgres";


ALTER TABLE ONLY "public"."agencies"
    ADD CONSTRAINT "agencies_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."agencies"
    ADD CONSTRAINT "agencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agency_award_events"
    ADD CONSTRAINT "agency_award_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agency_dna_profiles"
    ADD CONSTRAINT "agency_dna_profiles_pkey" PRIMARY KEY ("agency_code");



ALTER TABLE ONLY "public"."agency_dna_snapshots"
    ADD CONSTRAINT "agency_dna_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agency_domain_weights"
    ADD CONSTRAINT "agency_domain_weights_agency_id_domain_id_key" UNIQUE ("agency_id", "domain_id");



ALTER TABLE ONLY "public"."agency_domain_weights"
    ADD CONSTRAINT "agency_domain_weights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agency_market_dna"
    ADD CONSTRAINT "agency_market_dna_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_models"
    ADD CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_routes"
    ADD CONSTRAINT "ai_routes_pkey" PRIMARY KEY ("task");



ALTER TABLE ONLY "public"."ai_usage_events"
    ADD CONSTRAINT "ai_usage_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autopilot_drafts"
    ADD CONSTRAINT "autopilot_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autopilot_plans"
    ADD CONSTRAINT "autopilot_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autopilot_tasks"
    ADD CONSTRAINT "autopilot_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_firewall_rules"
    ADD CONSTRAINT "compliance_firewall_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_items"
    ADD CONSTRAINT "compliance_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dod_prompt_templates"
    ADD CONSTRAINT "dod_prompt_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dod_weights"
    ADD CONSTRAINT "dod_weights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."federal_buyers"
    ADD CONSTRAINT "federal_buyers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."federal_hidden_taxonomy"
    ADD CONSTRAINT "federal_hidden_taxonomy_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."federal_root_programs"
    ADD CONSTRAINT "federal_root_programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."foas"
    ADD CONSTRAINT "foas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funding_domains"
    ADD CONSTRAINT "funding_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funding_domains"
    ADD CONSTRAINT "funding_domains_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."funding_forecasts"
    ADD CONSTRAINT "funding_forecasts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funding_opportunities"
    ADD CONSTRAINT "funding_opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funding_prediction_models"
    ADD CONSTRAINT "funding_prediction_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funding_signal_matches"
    ADD CONSTRAINT "funding_signal_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funding_signals"
    ADD CONSTRAINT "funding_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_assessment_inputs"
    ADD CONSTRAINT "gf_assessment_inputs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_decision_records"
    ADD CONSTRAINT "gf_decision_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_dimension_weights"
    ADD CONSTRAINT "gf_dimension_weights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_engine_runs"
    ADD CONSTRAINT "gf_engine_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_engine_versions"
    ADD CONSTRAINT "gf_engine_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_fix_taxonomy"
    ADD CONSTRAINT "gf_fix_taxonomy_pkey" PRIMARY KEY ("fix_key");



ALTER TABLE ONLY "public"."gf_fos_compliance_rules"
    ADD CONSTRAINT "gf_fos_compliance_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_fos_compliance_rules"
    ADD CONSTRAINT "gf_fos_compliance_rules_rule_id_key" UNIQUE ("rule_id");



ALTER TABLE ONLY "public"."gf_fos_decisions"
    ADD CONSTRAINT "gf_fos_decisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_fos_decisions"
    ADD CONSTRAINT "gf_fos_decisions_transaction_id_key" UNIQUE ("transaction_id");



ALTER TABLE ONLY "public"."gf_fos_drawdown_requests"
    ADD CONSTRAINT "gf_fos_drawdown_requests_drawdown_id_key" UNIQUE ("drawdown_id");



ALTER TABLE ONLY "public"."gf_fos_drawdown_requests"
    ADD CONSTRAINT "gf_fos_drawdown_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_fos_evidence_documents"
    ADD CONSTRAINT "gf_fos_evidence_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_fos_truth_results"
    ADD CONSTRAINT "gf_fos_truth_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_outcomes"
    ADD CONSTRAINT "gf_outcomes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_outcomes_tracking"
    ADD CONSTRAINT "gf_outcomes_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_prompt_packs"
    ADD CONSTRAINT "gf_prompt_packs_name_version_agency_phase_key" UNIQUE ("name", "version", "agency", "phase");



ALTER TABLE ONLY "public"."gf_prompt_packs"
    ADD CONSTRAINT "gf_prompt_packs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_prompt_sets"
    ADD CONSTRAINT "gf_prompt_sets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_rule_items"
    ADD CONSTRAINT "gf_rule_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_rule_items"
    ADD CONSTRAINT "gf_rule_items_rule_set_id_rule_key_key" UNIQUE ("rule_set_id", "rule_key");



ALTER TABLE ONLY "public"."gf_rule_sets"
    ADD CONSTRAINT "gf_rule_sets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_subitem_weights"
    ADD CONSTRAINT "gf_subitem_weights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."golden_corridors"
    ADD CONSTRAINT "golden_corridors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."grant_chunks"
    ADD CONSTRAINT "grant_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."grants"
    ADD CONSTRAINT "grants_opportunity_id_key" UNIQUE ("opportunity_id");



ALTER TABLE ONLY "public"."grants"
    ADD CONSTRAINT "grants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nih_prompt_templates"
    ADD CONSTRAINT "nih_prompt_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nih_weights"
    ADD CONSTRAINT "nih_weights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nsf_prompt_templates"
    ADD CONSTRAINT "nsf_prompt_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nsf_weights"
    ADD CONSTRAINT "nsf_weights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_opportunity_id_key" UNIQUE ("opportunity_id");



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_org_opportunity_unique" UNIQUE ("org_id", "opportunity_id");



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."org_plans"
    ADD CONSTRAINT "org_plans_pkey" PRIMARY KEY ("org_id");



ALTER TABLE ONLY "public"."org_subscriptions"
    ADD CONSTRAINT "org_subscriptions_org_id_key" UNIQUE ("org_id");



ALTER TABLE ONLY "public"."org_subscriptions"
    ADD CONSTRAINT "org_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_funding_strategy"
    ADD CONSTRAINT "project_funding_strategy_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_funding_strategy"
    ADD CONSTRAINT "project_funding_strategy_project_id_agency_id_key" UNIQUE ("project_id", "agency_id");



ALTER TABLE ONLY "public"."project_grant_matches"
    ADD CONSTRAINT "project_grant_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_profile_vectors"
    ADD CONSTRAINT "project_profile_vectors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposal_exports"
    ADD CONSTRAINT "proposal_exports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposal_sections"
    ADD CONSTRAINT "proposal_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbir_artifacts"
    ADD CONSTRAINT "sbir_artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbir_assessments"
    ADD CONSTRAINT "sbir_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbir_compliance_findings"
    ADD CONSTRAINT "sbir_compliance_findings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbir_compliance_rules"
    ADD CONSTRAINT "sbir_compliance_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbir_compliance_runs"
    ADD CONSTRAINT "sbir_compliance_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signal_runs"
    ADD CONSTRAINT "signal_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timelines"
    ADD CONSTRAINT "timelines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trl_vehicles"
    ADD CONSTRAINT "trl_vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gf_rule_sets"
    ADD CONSTRAINT "uq_gf_rule_sets_kernel" UNIQUE ("name", "version", "agency", "phase");



ALTER TABLE ONLY "public"."usage_events"
    ADD CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("id");



CREATE INDEX "agency_award_events_award_date_idx" ON "public"."agency_award_events" USING "btree" ("award_date");



CREATE INDEX "agency_award_events_org_agency_idx" ON "public"."agency_award_events" USING "btree" ("org_id", "agency_code");



CREATE INDEX "agency_market_dna_agency_code_idx" ON "public"."agency_market_dna" USING "btree" ("agency_code");



CREATE UNIQUE INDEX "agency_market_dna_agency_uidx" ON "public"."agency_market_dna" USING "btree" ("agency_id");



CREATE INDEX "agency_market_dna_capital_flow_gin" ON "public"."agency_market_dna" USING "gin" ("capital_flow_trends");



CREATE INDEX "agency_market_dna_domain_heatmap_gin" ON "public"."agency_market_dna" USING "gin" ("domain_heatmap");



CREATE INDEX "agency_market_dna_trl_bias_gin" ON "public"."agency_market_dna" USING "gin" ("trl_bias_profile");



CREATE INDEX "ai_usage_events_org_created_idx" ON "public"."ai_usage_events" USING "btree" ("org_id", "created_at");



CREATE INDEX "ai_usage_events_org_task_idx" ON "public"."ai_usage_events" USING "btree" ("org_id", "task");



CREATE INDEX "foas_domains_idx" ON "public"."foas" USING "gin" ("domains");



CREATE INDEX "foas_embedding_idx" ON "public"."foas" USING "ivfflat" ("embedding" "extensions"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "foas_keywords_idx" ON "public"."foas" USING "gin" ("keywords");



CREATE INDEX "grant_chunks_embedding_idx" ON "public"."grant_chunks" USING "ivfflat" ("embedding" "extensions"."vector_cosine_ops");



CREATE INDEX "idx_agency_dna_agency_code" ON "public"."agency_dna_snapshots" USING "btree" ("agency_code");



CREATE INDEX "idx_agency_dna_generated_at" ON "public"."agency_dna_snapshots" USING "btree" ("generated_at" DESC);



CREATE INDEX "idx_audit_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_user" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_chunks_embedding_hnsw" ON "public"."grant_chunks" USING "hnsw" ("embedding" "extensions"."vector_ip_ops");



CREATE INDEX "idx_chunks_opportunity" ON "public"."grant_chunks" USING "btree" ("opportunity_id");



CREATE INDEX "idx_competitive_summary_agency" ON "public"."agency_competitive_summary" USING "btree" ("agency_code");



CREATE INDEX "idx_emerging_clusters_gin" ON "public"."agency_market_dna" USING "gin" ("emerging_clusters");



CREATE INDEX "idx_funding_signals_org" ON "public"."funding_signals" USING "btree" ("org_id");



CREATE INDEX "idx_funding_signals_score" ON "public"."funding_signals" USING "btree" ("signal_score" DESC);



CREATE INDEX "idx_gf_engine_runs_org" ON "public"."gf_engine_runs" USING "btree" ("org_id");



CREATE INDEX "idx_gf_engine_runs_proj" ON "public"."gf_engine_runs" USING "btree" ("project_id");



CREATE INDEX "idx_gf_engine_runs_status" ON "public"."gf_engine_runs" USING "btree" ("status");



CREATE INDEX "idx_gf_fix_tax_severity" ON "public"."gf_fix_taxonomy" USING "btree" ("severity");



CREATE INDEX "idx_gf_fos_decisions_drawdown_request_id" ON "public"."gf_fos_decisions" USING "btree" ("drawdown_request_id");



CREATE INDEX "idx_gf_fos_decisions_transaction_id" ON "public"."gf_fos_decisions" USING "btree" ("transaction_id");



CREATE INDEX "idx_gf_fos_drawdown_requests_grant_id" ON "public"."gf_fos_drawdown_requests" USING "btree" ("grant_id");



CREATE INDEX "idx_gf_fos_drawdown_requests_org_id" ON "public"."gf_fos_drawdown_requests" USING "btree" ("org_id");



CREATE INDEX "idx_gf_fos_drawdown_requests_project_id" ON "public"."gf_fos_drawdown_requests" USING "btree" ("project_id");



CREATE INDEX "idx_gf_fos_drawdown_requests_status" ON "public"."gf_fos_drawdown_requests" USING "btree" ("status");



CREATE INDEX "idx_gf_outcomes_org" ON "public"."gf_outcomes" USING "btree" ("org_id");



CREATE INDEX "idx_gf_outcomes_outcome" ON "public"."gf_outcomes" USING "btree" ("outcome");



CREATE INDEX "idx_gf_outcomes_proj" ON "public"."gf_outcomes" USING "btree" ("project_id");



CREATE INDEX "idx_gf_prompt_packs_active" ON "public"."gf_prompt_packs" USING "btree" ("is_active");



CREATE INDEX "idx_gf_prompt_packs_agency" ON "public"."gf_prompt_packs" USING "btree" ("agency");



CREATE INDEX "idx_gf_rule_items_ruleset" ON "public"."gf_rule_items" USING "btree" ("rule_set_id");



CREATE INDEX "idx_gf_rule_items_severity" ON "public"."gf_rule_items" USING "btree" ("severity");



CREATE INDEX "idx_gf_rule_sets_agency" ON "public"."gf_rule_sets" USING "btree" ("agency");



CREATE INDEX "idx_gf_rule_sets_status" ON "public"."gf_rule_sets" USING "btree" ("status");



CREATE INDEX "idx_hot_verticals_gin" ON "public"."agency_market_dna" USING "gin" ("hot_verticals");



CREATE INDEX "idx_jobs_entity" ON "public"."jobs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_jobs_org_id" ON "public"."jobs" USING "btree" ("org_id");



CREATE INDEX "idx_jobs_type" ON "public"."jobs" USING "btree" ("job_type");



CREATE INDEX "idx_notifications_is_read" ON "public"."notifications" USING "btree" ("is_read");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_profile_vectors_hnsw" ON "public"."project_profile_vectors" USING "hnsw" ("embedding" "extensions"."vector_ip_ops");



CREATE INDEX "idx_profile_vectors_project" ON "public"."project_profile_vectors" USING "btree" ("project_id");



CREATE INDEX "idx_projects_organization_id" ON "public"."projects" USING "btree" ("organization_id");



CREATE INDEX "idx_strategic_windows_gin" ON "public"."agency_market_dna" USING "gin" ("strategic_windows");



CREATE INDEX "idx_updated_at" ON "public"."agency_market_dna" USING "btree" ("updated_at" DESC);



CREATE INDEX "jobs_status_idx" ON "public"."jobs" USING "btree" ("status");



CREATE INDEX "notifications_user_id_is_read_idx" ON "public"."notifications" USING "btree" ("user_id", "is_read");



CREATE INDEX "opportunities_agency_code_idx" ON "public"."opportunities" USING "btree" ("agency_code");



CREATE INDEX "opportunities_close_date_idx" ON "public"."opportunities" USING "btree" ("close_date");



CREATE INDEX "opportunities_content_hash_idx" ON "public"."opportunities" USING "btree" ("content_hash");



CREATE INDEX "opportunities_embedding_idx" ON "public"."opportunities" USING "ivfflat" ("embedding" "extensions"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "opportunities_org_id_idx" ON "public"."opportunities" USING "btree" ("org_id");



CREATE UNIQUE INDEX "org_member_unique" ON "public"."organization_members" USING "btree" ("org_id", "user_id");



CREATE INDEX "project_grant_matches_project_id_idx" ON "public"."project_grant_matches" USING "btree" ("project_id");



CREATE INDEX "project_grant_matches_score_idx" ON "public"."project_grant_matches" USING "btree" ("score" DESC);



CREATE INDEX "project_profile_vectors_embedding_idx" ON "public"."project_profile_vectors" USING "ivfflat" ("embedding" "extensions"."vector_cosine_ops");



CREATE UNIQUE INDEX "uq_gf_outcomes_project_submitted_at" ON "public"."gf_outcomes" USING "btree" ("project_id", "submitted_at") WHERE ("submitted_at" IS NOT NULL);



CREATE UNIQUE INDEX "wallet_unique_address" ON "public"."wallets" USING "btree" ("address");



CREATE OR REPLACE TRIGGER "agency_market_dna_updated_at" BEFORE UPDATE ON "public"."agency_market_dna" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_timestamp_agency_award_events" BEFORE UPDATE ON "public"."agency_award_events" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp_opportunities" BEFORE UPDATE ON "public"."opportunities" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_agency_award_events_updated_at" BEFORE UPDATE ON "public"."agency_award_events" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_agency_market_dna_audit" AFTER INSERT OR UPDATE ON "public"."agency_market_dna" FOR EACH ROW EXECUTE FUNCTION "public"."audit_agency_market_dna"();



CREATE OR REPLACE TRIGGER "trg_agency_market_dna_updated_at" BEFORE UPDATE ON "public"."agency_market_dna" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_band_update" BEFORE UPDATE OF "score" ON "public"."sbir_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."gf_update_band_v2"();



CREATE OR REPLACE TRIGGER "trg_foas_updated_at" BEFORE UPDATE ON "public"."foas" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_gf_engine_runs_immutable" BEFORE UPDATE ON "public"."gf_engine_runs" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_engine_meta_update"();



CREATE OR REPLACE TRIGGER "trg_gf_engine_runs_updated_at" BEFORE UPDATE ON "public"."gf_engine_runs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_gf_fix_tax_updated_at" BEFORE UPDATE ON "public"."gf_fix_taxonomy" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_gf_outcomes_updated_at" BEFORE UPDATE ON "public"."gf_outcomes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_gf_prompt_packs_updated_at" BEFORE UPDATE ON "public"."gf_prompt_packs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_gf_rule_items_updated_at" BEFORE UPDATE ON "public"."gf_rule_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_gf_rule_sets_updated_at" BEFORE UPDATE ON "public"."gf_rule_sets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_grant_chunks_updated_at" BEFORE UPDATE ON "public"."grant_chunks" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_jobs_updated_at" BEFORE UPDATE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_notifications_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_opportunities_tsv" BEFORE INSERT OR UPDATE OF "title", "description", "opportunity_number" ON "public"."opportunities" FOR EACH ROW EXECUTE FUNCTION "public"."opportunities_tsv_update"();



CREATE OR REPLACE TRIGGER "trg_opportunities_updated_at" BEFORE UPDATE ON "public"."opportunities" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_project_funding_strategy_updated_at" BEFORE UPDATE ON "public"."project_funding_strategy" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_project_grant_matches_updated_at" BEFORE UPDATE ON "public"."project_grant_matches" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_project_profile_vectors_updated_at" BEFORE UPDATE ON "public"."project_profile_vectors" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_proposal_sections_updated_at" BEFORE UPDATE ON "public"."proposal_sections" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_proposals_updated_at" BEFORE UPDATE ON "public"."proposals" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_timelines_updated_at" BEFORE UPDATE ON "public"."timelines" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_trl_vehicles_updated_at" BEFORE UPDATE ON "public"."trl_vehicles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "tsv_update_trigger" BEFORE INSERT OR UPDATE ON "public"."opportunities" FOR EACH ROW EXECUTE FUNCTION "public"."update_opportunity_tsv"();



ALTER TABLE ONLY "public"."agency_award_events"
    ADD CONSTRAINT "agency_award_events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agency_domain_weights"
    ADD CONSTRAINT "agency_domain_weights_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agency_domain_weights"
    ADD CONSTRAINT "agency_domain_weights_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "public"."funding_domains"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agency_market_dna"
    ADD CONSTRAINT "agency_market_dna_agency_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_routes"
    ADD CONSTRAINT "ai_routes_fallback_model_id_fkey" FOREIGN KEY ("fallback_model_id") REFERENCES "public"."ai_models"("id");



ALTER TABLE ONLY "public"."ai_routes"
    ADD CONSTRAINT "ai_routes_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."autopilot_plans"
    ADD CONSTRAINT "autopilot_plans_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_firewall_rules"
    ADD CONSTRAINT "compliance_firewall_rules_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_items"
    ADD CONSTRAINT "compliance_items_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id");



ALTER TABLE ONLY "public"."gf_engine_runs"
    ADD CONSTRAINT "fk_gf_engine_runs_assessment" FOREIGN KEY ("assessment_id") REFERENCES "public"."sbir_assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gf_outcomes"
    ADD CONSTRAINT "fk_gf_outcomes_assessment" FOREIGN KEY ("assessment_id") REFERENCES "public"."sbir_assessments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."foas"
    ADD CONSTRAINT "foas_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."funding_signal_matches"
    ADD CONSTRAINT "funding_signal_matches_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."funding_opportunities"("id");



ALTER TABLE ONLY "public"."gf_engine_runs"
    ADD CONSTRAINT "gf_engine_runs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gf_engine_runs"
    ADD CONSTRAINT "gf_engine_runs_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gf_engine_runs"
    ADD CONSTRAINT "gf_engine_runs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gf_engine_runs"
    ADD CONSTRAINT "gf_engine_runs_prompt_pack_id_fkey" FOREIGN KEY ("prompt_pack_id") REFERENCES "public"."gf_prompt_packs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gf_engine_runs"
    ADD CONSTRAINT "gf_engine_runs_rule_set_id_fkey" FOREIGN KEY ("rule_set_id") REFERENCES "public"."gf_rule_sets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gf_fos_decisions"
    ADD CONSTRAINT "gf_fos_decisions_drawdown_request_id_fkey" FOREIGN KEY ("drawdown_request_id") REFERENCES "public"."gf_fos_drawdown_requests"("id");



ALTER TABLE ONLY "public"."gf_fos_drawdown_requests"
    ADD CONSTRAINT "gf_fos_drawdown_requests_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gf_fos_drawdown_requests"
    ADD CONSTRAINT "gf_fos_drawdown_requests_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."gf_fos_drawdown_requests"
    ADD CONSTRAINT "gf_fos_drawdown_requests_project_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gf_fos_evidence_documents"
    ADD CONSTRAINT "gf_fos_evidence_documents_drawdown_request_id_fkey" FOREIGN KEY ("drawdown_request_id") REFERENCES "public"."gf_fos_drawdown_requests"("id");



ALTER TABLE ONLY "public"."gf_fos_truth_results"
    ADD CONSTRAINT "gf_fos_truth_results_drawdown_request_id_fkey" FOREIGN KEY ("drawdown_request_id") REFERENCES "public"."gf_fos_drawdown_requests"("id");



ALTER TABLE ONLY "public"."gf_outcomes"
    ADD CONSTRAINT "gf_outcomes_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gf_outcomes"
    ADD CONSTRAINT "gf_outcomes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gf_outcomes_tracking"
    ADD CONSTRAINT "gf_outcomes_tracking_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gf_rule_items"
    ADD CONSTRAINT "gf_rule_items_rule_set_id_fkey" FOREIGN KEY ("rule_set_id") REFERENCES "public"."gf_rule_sets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."grant_chunks"
    ADD CONSTRAINT "grant_chunks_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."org_subscriptions"
    ADD CONSTRAINT "org_subscriptions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_subscriptions"
    ADD CONSTRAINT "org_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_current_org_id_fkey" FOREIGN KEY ("current_org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_funding_strategy"
    ADD CONSTRAINT "project_funding_strategy_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."project_funding_strategy"
    ADD CONSTRAINT "project_funding_strategy_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_funding_strategy"
    ADD CONSTRAINT "project_funding_strategy_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_funding_strategy"
    ADD CONSTRAINT "project_funding_strategy_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_funding_strategy"
    ADD CONSTRAINT "project_funding_strategy_target_foa_id_fkey" FOREIGN KEY ("target_foa_id") REFERENCES "public"."foas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."project_grant_matches"
    ADD CONSTRAINT "project_grant_matches_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_grant_matches"
    ADD CONSTRAINT "project_grant_matches_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_profile_vectors"
    ADD CONSTRAINT "project_profile_vectors_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_organization_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposal_sections"
    ADD CONSTRAINT "proposal_sections_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_grant_id_fkey" FOREIGN KEY ("grant_id") REFERENCES "public"."grants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sbir_assessments"
    ADD CONSTRAINT "sbir_assessments_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timelines"
    ADD CONSTRAINT "timelines_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id");



ALTER TABLE ONLY "public"."trl_vehicles"
    ADD CONSTRAINT "trl_vehicles_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_events"
    ADD CONSTRAINT "usage_events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_events"
    ADD CONSTRAINT "usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."agencies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agency_award_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agency_dna_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agency_dna_snapshots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agency_dna_snapshots_select" ON "public"."agency_dna_snapshots" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."agency_domain_weights" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agency_domain_weights_select" ON "public"."agency_domain_weights" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."agency_market_dna" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agency_market_dna_insert_admins" ON "public"."agency_market_dna" FOR INSERT WITH CHECK ((("org_id" IS NULL) OR "public"."is_org_admin"("org_id")));



CREATE POLICY "agency_market_dna_no_delete" ON "public"."agency_market_dna" FOR DELETE USING (false);



CREATE POLICY "agency_market_dna_select_org_members" ON "public"."agency_market_dna" FOR SELECT USING ((("org_id" IS NULL) OR "public"."is_org_member"("org_id")));



CREATE POLICY "agency_market_dna_update_admins" ON "public"."agency_market_dna" FOR UPDATE USING ((("org_id" IS NULL) OR "public"."is_org_admin"("org_id"))) WITH CHECK ((("org_id" IS NULL) OR "public"."is_org_admin"("org_id")));



ALTER TABLE "public"."ai_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_routes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_usage_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_insert" ON "public"."audit_logs" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_select" ON "public"."audit_logs" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "authenticated can read agencies" ON "public"."agencies" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."autopilot_drafts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "autopilot_drafts_select" ON "public"."autopilot_drafts" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."autopilot_plans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "autopilot_plans_select" ON "public"."autopilot_plans" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."autopilot_tasks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "autopilot_tasks_select" ON "public"."autopilot_tasks" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."compliance_firewall_rules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "compliance_firewall_rules_select" ON "public"."compliance_firewall_rules" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."compliance_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "compliance_select" ON "public"."compliance_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "compliance_items"."proposal_id") AND "public"."is_org_member"("pr"."org_id")))));



CREATE POLICY "compliance_write" ON "public"."compliance_items" USING ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "compliance_items"."proposal_id") AND "public"."is_org_member"("pr"."org_id") AND ("public"."org_role_rank"("pr"."org_id") >= 2))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "compliance_items"."proposal_id") AND "public"."is_org_member"("pr"."org_id") AND ("public"."org_role_rank"("pr"."org_id") >= 2)))));



CREATE POLICY "deny deletes award events" ON "public"."agency_award_events" FOR DELETE USING (false);



CREATE POLICY "deny_delete_audit_logs" ON "public"."audit_logs" FOR DELETE USING (false);



CREATE POLICY "deny_delete_grant_chunks" ON "public"."grant_chunks" FOR DELETE USING (false);



CREATE POLICY "deny_delete_grants" ON "public"."grants" FOR DELETE USING (false);



CREATE POLICY "deny_delete_jobs" ON "public"."jobs" FOR DELETE USING (false);



CREATE POLICY "deny_delete_notifications" ON "public"."notifications" FOR DELETE USING (false);



CREATE POLICY "deny_delete_project_grant_matches" ON "public"."project_grant_matches" FOR DELETE USING (false);



CREATE POLICY "deny_delete_project_profile_vectors" ON "public"."project_profile_vectors" FOR DELETE USING (false);



CREATE POLICY "deny_delete_projects" ON "public"."projects" FOR DELETE USING (false);



CREATE POLICY "deny_delete_proposal_sections" ON "public"."proposal_sections" FOR DELETE USING (false);



CREATE POLICY "deny_delete_proposals" ON "public"."proposals" FOR DELETE USING (false);



CREATE POLICY "deny_insert_audit_logs" ON "public"."audit_logs" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_grant_chunks" ON "public"."grant_chunks" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_grants" ON "public"."grants" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_jobs" ON "public"."jobs" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_notifications" ON "public"."notifications" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_project_grant_matches" ON "public"."project_grant_matches" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_project_profile_vectors" ON "public"."project_profile_vectors" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_projects" ON "public"."projects" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_proposal_sections" ON "public"."proposal_sections" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_insert_proposals" ON "public"."proposals" FOR INSERT WITH CHECK (false);



CREATE POLICY "deny_select_audit_logs" ON "public"."audit_logs" FOR SELECT USING (false);



CREATE POLICY "deny_select_grant_chunks" ON "public"."grant_chunks" FOR SELECT USING (false);



CREATE POLICY "deny_select_grants" ON "public"."grants" FOR SELECT USING (false);



CREATE POLICY "deny_select_jobs" ON "public"."jobs" FOR SELECT USING (false);



CREATE POLICY "deny_select_notifications" ON "public"."notifications" FOR SELECT USING (false);



CREATE POLICY "deny_select_project_grant_matches" ON "public"."project_grant_matches" FOR SELECT USING (false);



CREATE POLICY "deny_select_project_profile_vectors" ON "public"."project_profile_vectors" FOR SELECT USING (false);



CREATE POLICY "deny_select_projects" ON "public"."projects" FOR SELECT USING (false);



CREATE POLICY "deny_select_proposal_sections" ON "public"."proposal_sections" FOR SELECT USING (false);



CREATE POLICY "deny_select_proposals" ON "public"."proposals" FOR SELECT USING (false);



CREATE POLICY "deny_update_audit_logs" ON "public"."audit_logs" FOR UPDATE USING (false);



CREATE POLICY "deny_update_grant_chunks" ON "public"."grant_chunks" FOR UPDATE USING (false);



CREATE POLICY "deny_update_grants" ON "public"."grants" FOR UPDATE USING (false);



CREATE POLICY "deny_update_jobs" ON "public"."jobs" FOR UPDATE USING (false);



CREATE POLICY "deny_update_notifications" ON "public"."notifications" FOR UPDATE USING (false);



CREATE POLICY "deny_update_project_grant_matches" ON "public"."project_grant_matches" FOR UPDATE USING (false);



CREATE POLICY "deny_update_project_profile_vectors" ON "public"."project_profile_vectors" FOR UPDATE USING (false);



CREATE POLICY "deny_update_projects" ON "public"."projects" FOR UPDATE USING (false);



CREATE POLICY "deny_update_proposal_sections" ON "public"."proposal_sections" FOR UPDATE USING (false);



CREATE POLICY "deny_update_proposals" ON "public"."proposals" FOR UPDATE USING (false);



ALTER TABLE "public"."dod_prompt_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dod_weights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feature_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."federal_buyers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."federal_hidden_taxonomy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."federal_root_programs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."foas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "foas_select" ON "public"."foas" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."funding_domains" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "funding_domains_select" ON "public"."funding_domains" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."funding_forecasts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."funding_opportunities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."funding_prediction_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."funding_signal_matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."funding_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_assessment_inputs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_decision_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_dimension_weights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_engine_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_engine_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_fix_taxonomy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_fos_compliance_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_fos_decisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_fos_drawdown_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_fos_evidence_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_fos_truth_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_outcomes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_outcomes_tracking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_prompt_packs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_prompt_sets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_rule_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_rule_sets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gf_subitem_weights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."golden_corridors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."grant_chunks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "grant_chunks_select_org_member" ON "public"."grant_chunks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."opportunities" "o"
  WHERE (("o"."id" = "grant_chunks"."opportunity_id") AND "public"."is_org_member"("o"."org_id")))));



CREATE POLICY "grant_chunks_write_block" ON "public"."grant_chunks" USING (false) WITH CHECK (false);



ALTER TABLE "public"."grants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "grants_select" ON "public"."grants" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "grants_write_block" ON "public"."grants" USING (false) WITH CHECK (false);



ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "jobs_none" ON "public"."jobs" USING (false) WITH CHECK (false);



ALTER TABLE "public"."nih_prompt_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nih_weights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_delete" ON "public"."notifications" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "notifications_insert" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "notifications_select" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "notifications_update" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."nsf_prompt_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nsf_weights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "opportunities_delete_deny" ON "public"."opportunities" FOR DELETE USING (false);



CREATE POLICY "opportunities_insert_by_org" ON "public"."opportunities" FOR INSERT TO "dashboard_user", "authenticated" WITH CHECK (("org_id" = "public"."current_org_id"()));



CREATE POLICY "opportunities_insert_org_admin" ON "public"."opportunities" FOR INSERT WITH CHECK (("public"."org_role_rank"("org_id") >= 3));



CREATE POLICY "opportunities_no_delete" ON "public"."opportunities" FOR DELETE TO "dashboard_user", "authenticated" USING (false);



CREATE POLICY "opportunities_select_by_org" ON "public"."opportunities" FOR SELECT TO "dashboard_user", "authenticated" USING ((("org_id" IS NULL) OR ("org_id" = "public"."current_org_id"())));



CREATE POLICY "opportunities_select_org_member" ON "public"."opportunities" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "opportunities_update_by_org" ON "public"."opportunities" FOR UPDATE TO "dashboard_user", "authenticated" USING (("org_id" = "public"."current_org_id"())) WITH CHECK (("org_id" = "public"."current_org_id"()));



CREATE POLICY "opportunities_update_org_admin" ON "public"."opportunities" FOR UPDATE USING (("public"."org_role_rank"("org_id") >= 3)) WITH CHECK (("public"."org_role_rank"("org_id") >= 3));



CREATE POLICY "org admins can write award events" ON "public"."agency_award_events" USING (("public"."org_role_rank"("org_id") >= 3)) WITH CHECK (("public"."org_role_rank"("org_id") >= 3));



CREATE POLICY "org members can insert strategies" ON "public"."project_funding_strategy" FOR INSERT WITH CHECK ("public"."is_org_member"("org_id"));



CREATE POLICY "org members can read award events" ON "public"."agency_award_events" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "org members can read strategies" ON "public"."project_funding_strategy" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "org members can read subscription" ON "public"."org_subscriptions" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "org members can read usage" ON "public"."usage_events" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "org members can update strategies" ON "public"."project_funding_strategy" FOR UPDATE USING ("public"."is_org_member"("org_id")) WITH CHECK ("public"."is_org_member"("org_id"));



CREATE POLICY "org_isolation" ON "public"."autopilot_plans" TO "authenticated" USING (("organization_id" IN ( SELECT "autopilot_plans"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "autopilot_plans"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."gf_engine_runs" TO "authenticated" USING (("organization_id" IN ( SELECT "gf_engine_runs"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "gf_engine_runs"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."gf_fos_drawdown_requests" TO "authenticated" USING (("organization_id" IN ( SELECT "gf_fos_drawdown_requests"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "gf_fos_drawdown_requests"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."gf_outcomes" TO "authenticated" USING (("organization_id" IN ( SELECT "gf_outcomes"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "gf_outcomes"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."gf_outcomes_tracking" TO "authenticated" USING (("organization_id" IN ( SELECT "gf_outcomes_tracking"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "gf_outcomes_tracking"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."project_funding_strategy" TO "authenticated" USING (("organization_id" IN ( SELECT "project_funding_strategy"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "project_funding_strategy"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."project_grant_matches" TO "authenticated" USING (("organization_id" IN ( SELECT "project_grant_matches"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "project_grant_matches"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."project_profile_vectors" TO "authenticated" USING (("organization_id" IN ( SELECT "project_profile_vectors"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "project_profile_vectors"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."projects" TO "authenticated" USING (("organization_id" IN ( SELECT "projects"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "projects"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."proposals" TO "authenticated" USING (("organization_id" IN ( SELECT "proposals"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "proposals"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation" ON "public"."sbir_assessments" TO "authenticated" USING (("organization_id" IN ( SELECT "sbir_assessments"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "sbir_assessments"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "org_isolation_all" ON "public"."agency_award_events" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_ai" ON "public"."ai_usage_events" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_opp" ON "public"."opportunities" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_org_members" ON "public"."organization_members" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_org_plans" ON "public"."org_plans" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_org_subs" ON "public"."org_subscriptions" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_payments" ON "public"."payments" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_pfstrategy" ON "public"."project_funding_strategy" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_projects" ON "public"."projects" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_proposals" ON "public"."proposals" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_all_usage" ON "public"."usage_events" USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select" ON "public"."agency_award_events" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_ai" ON "public"."ai_usage_events" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_foa" ON "public"."foas" FOR SELECT USING (("agency_id" IN ( SELECT "agencies"."id"
   FROM "public"."agencies")));



CREATE POLICY "org_isolation_select_opp" ON "public"."opportunities" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_org_members" ON "public"."organization_members" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_org_plans" ON "public"."org_plans" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_org_subs" ON "public"."org_subscriptions" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_payments" ON "public"."payments" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_pfstrategy" ON "public"."project_funding_strategy" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_pgmatch" ON "public"."project_grant_matches" FOR SELECT USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"))));



CREATE POLICY "org_isolation_select_projects" ON "public"."projects" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_proposals" ON "public"."proposals" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_isolation_select_usage" ON "public"."usage_events" FOR SELECT USING (("org_id" = ("current_setting"('request.jwt.claims.org_id'::"text", true))::"uuid"));



CREATE POLICY "org_members_delete" ON "public"."organization_members" FOR DELETE USING (("public"."org_role_rank"("org_id") >= 3));



CREATE POLICY "org_members_insert_admins" ON "public"."organization_members" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om2"
  WHERE (("om2"."org_id" = "om2"."org_id") AND ("om2"."user_id" = "auth"."uid"()) AND ("om2"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "org_members_no_delete" ON "public"."organization_members" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "org_members_select_self" ON "public"."organization_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "org_members_self" ON "public"."organization_members" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "org_members_self_read" ON "public"."organization_members" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "org_members_update" ON "public"."organization_members" FOR UPDATE USING (("public"."org_role_rank"("org_id") >= 3)) WITH CHECK (("public"."org_role_rank"("org_id") >= 3));



CREATE POLICY "org_members_update_admins" ON "public"."organization_members" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om2"
  WHERE (("om2"."org_id" = "om2"."org_id") AND ("om2"."user_id" = "auth"."uid"()) AND ("om2"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om2"
  WHERE (("om2"."org_id" = "om2"."org_id") AND ("om2"."user_id" = "auth"."uid"()) AND ("om2"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "org_owner_select_subscriptions" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING (("org_id" IN ( SELECT "organizations"."id"
   FROM "public"."organizations"
  WHERE ("organizations"."owner_id" = "auth"."uid"()))));



ALTER TABLE "public"."org_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."org_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizations_insert" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "organizations_select" ON "public"."organizations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."org_id" = "om"."id") AND ("om"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "organizations_select_member" ON "public"."organizations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."org_id" = "om"."id") AND ("om"."user_id" = "auth"."uid"())))));



CREATE POLICY "organizations_update" ON "public"."organizations" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."org_id" = "om"."id") AND ("om"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."org_id" = "om"."id") AND ("om"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_delete" ON "public"."payments" FOR DELETE USING (("public"."org_role_rank"("org_id") >= 4));



CREATE POLICY "payments_insert" ON "public"."payments" FOR INSERT WITH CHECK (("public"."is_org_member"("org_id") AND ("user_id" = "auth"."uid"())));



CREATE POLICY "payments_select" ON "public"."payments" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "payments_update" ON "public"."payments" FOR UPDATE USING (("public"."org_role_rank"("org_id") >= 3)) WITH CHECK (("public"."org_role_rank"("org_id") >= 3));



CREATE POLICY "pgm_delete" ON "public"."project_grant_matches" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_grant_matches"."project_id") AND "public"."is_org_member"("p"."org_id") AND ("public"."org_role_rank"("p"."org_id") >= 3)))));



CREATE POLICY "pgm_insert" ON "public"."project_grant_matches" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_grant_matches"."project_id") AND "public"."is_org_member"("p"."org_id") AND ("public"."org_role_rank"("p"."org_id") >= 2)))));



CREATE POLICY "pgm_select" ON "public"."project_grant_matches" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_grant_matches"."project_id") AND "public"."is_org_member"("p"."org_id")))));



CREATE POLICY "pgm_update" ON "public"."project_grant_matches" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_grant_matches"."project_id") AND "public"."is_org_member"("p"."org_id") AND ("public"."org_role_rank"("p"."org_id") >= 2))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_grant_matches"."project_id") AND "public"."is_org_member"("p"."org_id") AND ("public"."org_role_rank"("p"."org_id") >= 2)))));



ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "plans_select" ON "public"."plans" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "ppv_delete" ON "public"."project_profile_vectors" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_profile_vectors"."project_id") AND "public"."is_org_member"("p"."org_id") AND ("public"."org_role_rank"("p"."org_id") >= 3)))));



CREATE POLICY "ppv_insert" ON "public"."project_profile_vectors" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_profile_vectors"."project_id") AND "public"."is_org_member"("p"."org_id") AND ("public"."org_role_rank"("p"."org_id") >= 2)))));



CREATE POLICY "ppv_select" ON "public"."project_profile_vectors" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_profile_vectors"."project_id") AND "public"."is_org_member"("p"."org_id")))));



CREATE POLICY "ppv_update" ON "public"."project_profile_vectors" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_profile_vectors"."project_id") AND "public"."is_org_member"("p"."org_id") AND ("public"."org_role_rank"("p"."org_id") >= 2))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_profile_vectors"."project_id") AND "public"."is_org_member"("p"."org_id") AND ("public"."org_role_rank"("p"."org_id") >= 2)))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete" ON "public"."profiles" FOR DELETE USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_insert" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_read_self" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_self" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_update_self" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."project_funding_strategy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_grant_matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_profile_vectors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "projects_delete" ON "public"."projects" FOR DELETE USING (("public"."is_org_member"("org_id") AND ("public"."org_role_rank"("org_id") >= 3)));



CREATE POLICY "projects_insert" ON "public"."projects" FOR INSERT WITH CHECK (("public"."is_org_member"("org_id") AND ("user_id" = "auth"."uid"())));



CREATE POLICY "projects_select" ON "public"."projects" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "projects_update" ON "public"."projects" FOR UPDATE USING (("public"."is_org_member"("org_id") AND ("public"."org_role_rank"("org_id") >= 2))) WITH CHECK (("public"."is_org_member"("org_id") AND ("public"."org_role_rank"("org_id") >= 2)));



ALTER TABLE "public"."proposal_exports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "proposal_exports_select" ON "public"."proposal_exports" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."proposal_sections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "proposal_sections_select" ON "public"."proposal_sections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "proposal_sections"."proposal_id") AND "public"."is_org_member"("pr"."org_id")))));



CREATE POLICY "proposal_sections_write" ON "public"."proposal_sections" USING ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "proposal_sections"."proposal_id") AND "public"."is_org_member"("pr"."org_id") AND ("public"."org_role_rank"("pr"."org_id") >= 2))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "proposal_sections"."proposal_id") AND "public"."is_org_member"("pr"."org_id") AND ("public"."org_role_rank"("pr"."org_id") >= 2)))));



ALTER TABLE "public"."proposals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "proposals_delete" ON "public"."proposals" FOR DELETE USING (("public"."is_org_member"("org_id") AND ("public"."org_role_rank"("org_id") >= 3)));



CREATE POLICY "proposals_insert" ON "public"."proposals" FOR INSERT WITH CHECK (("public"."is_org_member"("org_id") AND ("public"."org_role_rank"("org_id") >= 2)));



CREATE POLICY "proposals_select" ON "public"."proposals" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "proposals_update" ON "public"."proposals" FOR UPDATE USING (("public"."is_org_member"("org_id") AND ("public"."org_role_rank"("org_id") >= 2))) WITH CHECK (("public"."is_org_member"("org_id") AND ("public"."org_role_rank"("org_id") >= 2)));



CREATE POLICY "read_only" ON "public"."agencies" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."agency_award_events" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."agency_dna_profiles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."agency_dna_snapshots" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."agency_domain_weights" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."agency_market_dna" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."ai_models" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."ai_routes" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."ai_usage_events" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."audit_logs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."autopilot_drafts" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."autopilot_plans" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."autopilot_tasks" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."compliance_firewall_rules" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."compliance_items" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."dod_prompt_templates" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."dod_weights" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."feature_flags" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."federal_buyers" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."federal_hidden_taxonomy" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."federal_root_programs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."foas" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."funding_domains" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."funding_forecasts" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."funding_opportunities" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."funding_prediction_models" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."funding_signal_matches" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."funding_signals" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_assessment_inputs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_decision_records" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_dimension_weights" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_engine_runs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_engine_versions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_fix_taxonomy" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_fos_compliance_rules" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_fos_decisions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_fos_drawdown_requests" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_fos_evidence_documents" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_fos_truth_results" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_outcomes" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_outcomes_tracking" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_prompt_packs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_prompt_sets" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_rule_items" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_rule_sets" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."gf_subitem_weights" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."golden_corridors" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."grant_chunks" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."grants" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."jobs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."nih_prompt_templates" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."nih_weights" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."notifications" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."nsf_prompt_templates" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."nsf_weights" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."opportunities" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."org_plans" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."org_subscriptions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."organization_members" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."organizations" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."payments" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."plans" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."profiles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."project_funding_strategy" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."project_grant_matches" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."project_profile_vectors" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."projects" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."proposal_exports" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."proposal_sections" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."proposals" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."sbir_artifacts" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."sbir_assessments" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."sbir_compliance_findings" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."sbir_compliance_rules" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."sbir_compliance_runs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."signal_runs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."subscriptions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."timelines" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."trl_vehicles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."usage_events" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "read_only" ON "public"."wallets" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."sbir_artifacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sbir_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sbir_compliance_findings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sbir_compliance_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sbir_compliance_runs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_all" ON "public"."agencies" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."agency_award_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."agency_dna_profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."agency_dna_snapshots" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."agency_domain_weights" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."agency_market_dna" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."ai_models" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."ai_routes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."ai_usage_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."audit_logs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."autopilot_drafts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."autopilot_plans" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."autopilot_tasks" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."compliance_firewall_rules" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."compliance_items" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."dod_prompt_templates" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."dod_weights" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."feature_flags" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."federal_buyers" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."federal_hidden_taxonomy" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."federal_root_programs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."foas" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."funding_domains" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."funding_forecasts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."funding_opportunities" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."funding_prediction_models" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."funding_signal_matches" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."funding_signals" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_assessment_inputs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_decision_records" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_dimension_weights" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_engine_runs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_engine_versions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_fix_taxonomy" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_fos_compliance_rules" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_fos_decisions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_fos_drawdown_requests" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_fos_evidence_documents" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_fos_truth_results" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_outcomes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_outcomes_tracking" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_prompt_packs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_prompt_sets" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_rule_items" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_rule_sets" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."gf_subitem_weights" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."golden_corridors" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."grant_chunks" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."grants" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."jobs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."nih_prompt_templates" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."nih_weights" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."notifications" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."nsf_prompt_templates" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."nsf_weights" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."opportunities" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."org_plans" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."org_subscriptions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."organization_members" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."organizations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."payments" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."plans" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."project_funding_strategy" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."project_grant_matches" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."project_profile_vectors" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."projects" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."proposal_exports" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."proposal_sections" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."proposals" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."sbir_artifacts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."sbir_assessments" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."sbir_compliance_findings" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."sbir_compliance_rules" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."sbir_compliance_runs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."signal_runs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."subscriptions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."timelines" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."trl_vehicles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."usage_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."wallets" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."signal_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscriptions_select" ON "public"."subscriptions" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "subscriptions_write" ON "public"."subscriptions" USING (("public"."org_role_rank"("org_id") >= 3)) WITH CHECK (("public"."org_role_rank"("org_id") >= 3));



ALTER TABLE "public"."timelines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "timelines_select" ON "public"."timelines" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "timelines"."proposal_id") AND "public"."is_org_member"("pr"."org_id")))));



CREATE POLICY "timelines_write" ON "public"."timelines" USING ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "timelines"."proposal_id") AND "public"."is_org_member"("pr"."org_id") AND ("public"."org_role_rank"("pr"."org_id") >= 2))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."proposals" "pr"
  WHERE (("pr"."id" = "timelines"."proposal_id") AND "public"."is_org_member"("pr"."org_id") AND ("public"."org_role_rank"("pr"."org_id") >= 2)))));



ALTER TABLE "public"."trl_vehicles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trl_vehicles_select" ON "public"."trl_vehicles" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."usage_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_select_own_profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "users_update_own_profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."wallets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "wallets_delete" ON "public"."wallets" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "wallets_insert" ON "public"."wallets" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "wallets_select" ON "public"."wallets" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "wallets_update" ON "public"."wallets" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."all_underserved_domains"() TO "anon";
GRANT ALL ON FUNCTION "public"."all_underserved_domains"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."all_underserved_domains"() TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_agency_market_dna"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_agency_market_dna"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_agency_market_dna"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_run_autopilot"("_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_run_autopilot"("_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_run_autopilot"("_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."current_org_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_org_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_org_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_job"("_job_type" "text", "_entity_type" "text", "_entity_id" "uuid", "_org_id" "uuid", "_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."enqueue_job"("_job_type" "text", "_entity_type" "text", "_entity_id" "uuid", "_org_id" "uuid", "_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_job"("_job_type" "text", "_entity_type" "text", "_entity_id" "uuid", "_org_id" "uuid", "_payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_org"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_org"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_org"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_apply_gates"("_assessment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."gf_apply_gates"("_assessment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_apply_gates"("_assessment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_autopilot_generate"("top_n" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."gf_autopilot_generate"("top_n" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_autopilot_generate"("top_n" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_band_from_score"("_score" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."gf_band_from_score"("_score" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_band_from_score"("_score" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_band_from_score_v2"("_score" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."gf_band_from_score_v2"("_score" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_band_from_score_v2"("_score" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_build_master_proposal"("plan" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."gf_build_master_proposal"("plan" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_build_master_proposal"("plan" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_calculate_intelligence"() TO "anon";
GRANT ALL ON FUNCTION "public"."gf_calculate_intelligence"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_calculate_intelligence"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_compute_score"("_assessment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."gf_compute_score"("_assessment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_compute_score"("_assessment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_intelligence_core"() TO "anon";
GRANT ALL ON FUNCTION "public"."gf_intelligence_core"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_intelligence_core"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_prepare_draft_payload"("plan" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."gf_prepare_draft_payload"("plan" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_prepare_draft_payload"("plan" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_update_band"() TO "anon";
GRANT ALL ON FUNCTION "public"."gf_update_band"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_update_band"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_update_band_v2"() TO "anon";
GRANT ALL ON FUNCTION "public"."gf_update_band_v2"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_update_band_v2"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gf_write_decision_record"("_assessment_id" "uuid", "_score" numeric, "_band" "text", "_gates" "jsonb", "_dimensions" "jsonb", "_fix_list" "jsonb", "_next_actions" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."gf_write_decision_record"("_assessment_id" "uuid", "_score" numeric, "_band" "text", "_gates" "jsonb", "_dimensions" "jsonb", "_fix_list" "jsonb", "_next_actions" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gf_write_decision_record"("_assessment_id" "uuid", "_score" numeric, "_band" "text", "_gates" "jsonb", "_dimensions" "jsonb", "_fix_list" "jsonb", "_next_actions" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_org_admin"("target_org" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_admin"("target_org" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_admin"("target_org" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_org_member"("p_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_member"("p_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_member"("p_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_grant_chunks"("p_opportunity_id" "uuid", "query_embedding" "extensions"."vector", "match_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."match_grant_chunks"("p_opportunity_id" "uuid", "query_embedding" "extensions"."vector", "match_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_grant_chunks"("p_opportunity_id" "uuid", "query_embedding" "extensions"."vector", "match_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."match_opportunities"("query_embedding" "extensions"."vector", "match_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."match_opportunities"("query_embedding" "extensions"."vector", "match_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_opportunities"("query_embedding" "extensions"."vector", "match_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."opportunities_tsv_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."opportunities_tsv_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."opportunities_tsv_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."org_role_rank"("p_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."org_role_rank"("p_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."org_role_rank"("p_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_engine_meta_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_engine_meta_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_engine_meta_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."run_federal_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."run_federal_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_federal_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."run_sbir_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."run_sbir_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_sbir_assessment"("_org_id" "uuid", "_project_id" "uuid", "_agency" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."run_sbir_compliance_guard"("_assessment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."run_sbir_compliance_guard"("_assessment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_sbir_compliance_guard"("_assessment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_verticals"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_verticals"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_verticals"("search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_current_org"("org" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_current_org"("org" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_current_org"("org" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_opportunity_tsv"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_opportunity_tsv"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_opportunity_tsv"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profiles_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profiles_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profiles_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_projects_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_projects_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_projects_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."funding_opportunities" TO "anon";
GRANT ALL ON TABLE "public"."funding_opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."funding_opportunities" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."agencies" TO "anon";
GRANT ALL ON TABLE "public"."agencies" TO "authenticated";
GRANT ALL ON TABLE "public"."agencies" TO "service_role";



GRANT ALL ON TABLE "public"."agency_award_events" TO "anon";
GRANT ALL ON TABLE "public"."agency_award_events" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_award_events" TO "service_role";



GRANT ALL ON TABLE "public"."agency_market_dna" TO "anon";
GRANT ALL ON TABLE "public"."agency_market_dna" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_market_dna" TO "service_role";



GRANT ALL ON TABLE "public"."agency_competitive_summary" TO "anon";
GRANT ALL ON TABLE "public"."agency_competitive_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_competitive_summary" TO "service_role";



GRANT ALL ON TABLE "public"."agency_dna_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."agency_dna_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_dna_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."agency_dna_latest" TO "anon";
GRANT ALL ON TABLE "public"."agency_dna_latest" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_dna_latest" TO "service_role";



GRANT ALL ON TABLE "public"."agency_dna_profiles" TO "anon";
GRANT ALL ON TABLE "public"."agency_dna_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_dna_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."agency_domain_weights" TO "anon";
GRANT ALL ON TABLE "public"."agency_domain_weights" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_domain_weights" TO "service_role";



GRANT ALL ON TABLE "public"."ai_models" TO "anon";
GRANT ALL ON TABLE "public"."ai_models" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_models" TO "service_role";



GRANT ALL ON TABLE "public"."ai_routes" TO "anon";
GRANT ALL ON TABLE "public"."ai_routes" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_routes" TO "service_role";



GRANT ALL ON TABLE "public"."ai_usage_events" TO "anon";
GRANT ALL ON TABLE "public"."ai_usage_events" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_usage_events" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."autopilot_drafts" TO "anon";
GRANT ALL ON TABLE "public"."autopilot_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."autopilot_drafts" TO "service_role";



GRANT ALL ON TABLE "public"."autopilot_plans" TO "anon";
GRANT ALL ON TABLE "public"."autopilot_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."autopilot_plans" TO "service_role";



GRANT ALL ON TABLE "public"."autopilot_tasks" TO "anon";
GRANT ALL ON TABLE "public"."autopilot_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."autopilot_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_firewall_rules" TO "anon";
GRANT ALL ON TABLE "public"."compliance_firewall_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_firewall_rules" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_items" TO "anon";
GRANT ALL ON TABLE "public"."compliance_items" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_items" TO "service_role";



GRANT ALL ON TABLE "public"."dod_prompt_templates" TO "anon";
GRANT ALL ON TABLE "public"."dod_prompt_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."dod_prompt_templates" TO "service_role";



GRANT ALL ON TABLE "public"."dod_weights" TO "anon";
GRANT ALL ON TABLE "public"."dod_weights" TO "authenticated";
GRANT ALL ON TABLE "public"."dod_weights" TO "service_role";



GRANT ALL ON TABLE "public"."feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_flags" TO "service_role";



GRANT ALL ON TABLE "public"."federal_buyers" TO "anon";
GRANT ALL ON TABLE "public"."federal_buyers" TO "authenticated";
GRANT ALL ON TABLE "public"."federal_buyers" TO "service_role";



GRANT ALL ON TABLE "public"."federal_hidden_taxonomy" TO "anon";
GRANT ALL ON TABLE "public"."federal_hidden_taxonomy" TO "authenticated";
GRANT ALL ON TABLE "public"."federal_hidden_taxonomy" TO "service_role";



GRANT ALL ON TABLE "public"."federal_root_programs" TO "anon";
GRANT ALL ON TABLE "public"."federal_root_programs" TO "authenticated";
GRANT ALL ON TABLE "public"."federal_root_programs" TO "service_role";



GRANT ALL ON TABLE "public"."foas" TO "anon";
GRANT ALL ON TABLE "public"."foas" TO "authenticated";
GRANT ALL ON TABLE "public"."foas" TO "service_role";



GRANT ALL ON TABLE "public"."funding_domains" TO "anon";
GRANT ALL ON TABLE "public"."funding_domains" TO "authenticated";
GRANT ALL ON TABLE "public"."funding_domains" TO "service_role";



GRANT ALL ON TABLE "public"."funding_forecasts" TO "anon";
GRANT ALL ON TABLE "public"."funding_forecasts" TO "authenticated";
GRANT ALL ON TABLE "public"."funding_forecasts" TO "service_role";



GRANT ALL ON TABLE "public"."funding_prediction_models" TO "anon";
GRANT ALL ON TABLE "public"."funding_prediction_models" TO "authenticated";
GRANT ALL ON TABLE "public"."funding_prediction_models" TO "service_role";



GRANT ALL ON TABLE "public"."funding_signal_matches" TO "anon";
GRANT ALL ON TABLE "public"."funding_signal_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."funding_signal_matches" TO "service_role";



GRANT ALL ON TABLE "public"."funding_signals" TO "anon";
GRANT ALL ON TABLE "public"."funding_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."funding_signals" TO "service_role";



GRANT ALL ON TABLE "public"."gf_assessment_inputs" TO "anon";
GRANT ALL ON TABLE "public"."gf_assessment_inputs" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_assessment_inputs" TO "service_role";



GRANT ALL ON TABLE "public"."gf_decision_records" TO "anon";
GRANT ALL ON TABLE "public"."gf_decision_records" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_decision_records" TO "service_role";



GRANT ALL ON TABLE "public"."gf_dimension_weights" TO "anon";
GRANT ALL ON TABLE "public"."gf_dimension_weights" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_dimension_weights" TO "service_role";



GRANT ALL ON TABLE "public"."gf_engine_runs" TO "service_role";



GRANT ALL ON TABLE "public"."gf_engine_versions" TO "anon";
GRANT ALL ON TABLE "public"."gf_engine_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_engine_versions" TO "service_role";



GRANT ALL ON TABLE "public"."gf_fix_taxonomy" TO "service_role";



GRANT ALL ON TABLE "public"."gf_fos_compliance_rules" TO "anon";
GRANT ALL ON TABLE "public"."gf_fos_compliance_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_fos_compliance_rules" TO "service_role";



GRANT ALL ON TABLE "public"."gf_fos_decisions" TO "anon";
GRANT ALL ON TABLE "public"."gf_fos_decisions" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_fos_decisions" TO "service_role";



GRANT ALL ON TABLE "public"."gf_fos_drawdown_requests" TO "anon";
GRANT ALL ON TABLE "public"."gf_fos_drawdown_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_fos_drawdown_requests" TO "service_role";



GRANT ALL ON TABLE "public"."gf_fos_evidence_documents" TO "anon";
GRANT ALL ON TABLE "public"."gf_fos_evidence_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_fos_evidence_documents" TO "service_role";



GRANT ALL ON TABLE "public"."gf_fos_truth_results" TO "anon";
GRANT ALL ON TABLE "public"."gf_fos_truth_results" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_fos_truth_results" TO "service_role";



GRANT ALL ON TABLE "public"."gf_outcomes" TO "service_role";



GRANT ALL ON TABLE "public"."gf_outcomes_tracking" TO "anon";
GRANT ALL ON TABLE "public"."gf_outcomes_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_outcomes_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."gf_prompt_packs" TO "service_role";



GRANT ALL ON TABLE "public"."gf_prompt_sets" TO "anon";
GRANT ALL ON TABLE "public"."gf_prompt_sets" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_prompt_sets" TO "service_role";



GRANT ALL ON TABLE "public"."gf_rule_items" TO "service_role";



GRANT ALL ON TABLE "public"."gf_rule_sets" TO "service_role";



GRANT ALL ON TABLE "public"."gf_subitem_weights" TO "anon";
GRANT ALL ON TABLE "public"."gf_subitem_weights" TO "authenticated";
GRANT ALL ON TABLE "public"."gf_subitem_weights" TO "service_role";



GRANT ALL ON TABLE "public"."golden_corridors" TO "anon";
GRANT ALL ON TABLE "public"."golden_corridors" TO "authenticated";
GRANT ALL ON TABLE "public"."golden_corridors" TO "service_role";



GRANT ALL ON TABLE "public"."grant_chunks" TO "anon";
GRANT ALL ON TABLE "public"."grant_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."grant_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."grants" TO "anon";
GRANT ALL ON TABLE "public"."grants" TO "authenticated";
GRANT ALL ON TABLE "public"."grants" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."nih_prompt_templates" TO "anon";
GRANT ALL ON TABLE "public"."nih_prompt_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."nih_prompt_templates" TO "service_role";



GRANT ALL ON TABLE "public"."nih_weights" TO "anon";
GRANT ALL ON TABLE "public"."nih_weights" TO "authenticated";
GRANT ALL ON TABLE "public"."nih_weights" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."nsf_prompt_templates" TO "anon";
GRANT ALL ON TABLE "public"."nsf_prompt_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."nsf_prompt_templates" TO "service_role";



GRANT ALL ON TABLE "public"."nsf_weights" TO "anon";
GRANT ALL ON TABLE "public"."nsf_weights" TO "authenticated";
GRANT ALL ON TABLE "public"."nsf_weights" TO "service_role";



GRANT ALL ON TABLE "public"."opportunities" TO "anon";
GRANT ALL ON TABLE "public"."opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunities" TO "service_role";



GRANT ALL ON TABLE "public"."org_plans" TO "anon";
GRANT ALL ON TABLE "public"."org_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."org_plans" TO "service_role";



GRANT ALL ON TABLE "public"."org_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."org_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."org_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_funding_strategy" TO "anon";
GRANT ALL ON TABLE "public"."project_funding_strategy" TO "authenticated";
GRANT ALL ON TABLE "public"."project_funding_strategy" TO "service_role";



GRANT ALL ON TABLE "public"."project_grant_matches" TO "anon";
GRANT ALL ON TABLE "public"."project_grant_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."project_grant_matches" TO "service_role";



GRANT ALL ON TABLE "public"."project_profile_vectors" TO "anon";
GRANT ALL ON TABLE "public"."project_profile_vectors" TO "authenticated";
GRANT ALL ON TABLE "public"."project_profile_vectors" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_exports" TO "anon";
GRANT ALL ON TABLE "public"."proposal_exports" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_exports" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_sections" TO "anon";
GRANT ALL ON TABLE "public"."proposal_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_sections" TO "service_role";



GRANT ALL ON TABLE "public"."proposals" TO "anon";
GRANT ALL ON TABLE "public"."proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."proposals" TO "service_role";



GRANT ALL ON TABLE "public"."sbir_artifacts" TO "anon";
GRANT ALL ON TABLE "public"."sbir_artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."sbir_artifacts" TO "service_role";



GRANT ALL ON TABLE "public"."sbir_assessments" TO "anon";
GRANT ALL ON TABLE "public"."sbir_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."sbir_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."sbir_compliance_findings" TO "anon";
GRANT ALL ON TABLE "public"."sbir_compliance_findings" TO "authenticated";
GRANT ALL ON TABLE "public"."sbir_compliance_findings" TO "service_role";



GRANT ALL ON TABLE "public"."sbir_compliance_rules" TO "anon";
GRANT ALL ON TABLE "public"."sbir_compliance_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."sbir_compliance_rules" TO "service_role";



GRANT ALL ON TABLE "public"."sbir_compliance_runs" TO "anon";
GRANT ALL ON TABLE "public"."sbir_compliance_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."sbir_compliance_runs" TO "service_role";



GRANT ALL ON TABLE "public"."signal_runs" TO "anon";
GRANT ALL ON TABLE "public"."signal_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_runs" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."timelines" TO "anon";
GRANT ALL ON TABLE "public"."timelines" TO "authenticated";
GRANT ALL ON TABLE "public"."timelines" TO "service_role";



GRANT ALL ON TABLE "public"."trl_vehicles" TO "anon";
GRANT ALL ON TABLE "public"."trl_vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."trl_vehicles" TO "service_role";



GRANT ALL ON TABLE "public"."usage_events" TO "anon";
GRANT ALL ON TABLE "public"."usage_events" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_events" TO "service_role";



GRANT ALL ON TABLE "public"."user_orgs" TO "anon";
GRANT ALL ON TABLE "public"."user_orgs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_orgs" TO "service_role";



GRANT ALL ON TABLE "public"."wallets" TO "anon";
GRANT ALL ON TABLE "public"."wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."wallets" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







