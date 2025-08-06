--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (PGlite 0.2.0)
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = off;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

--
-- Name: meta; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA meta;


ALTER SCHEMA meta OWNER TO postgres;

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: embeddings; Type: TABLE; Schema: meta; Owner: postgres
--

CREATE TABLE meta.embeddings (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    content text NOT NULL,
    embedding public.vector(384) NOT NULL
);


ALTER TABLE meta.embeddings OWNER TO postgres;

--
-- Name: embeddings_id_seq; Type: SEQUENCE; Schema: meta; Owner: postgres
--

ALTER TABLE meta.embeddings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME meta.embeddings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: migrations; Type: TABLE; Schema: meta; Owner: postgres
--

CREATE TABLE meta.migrations (
    version text NOT NULL,
    name text,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE meta.migrations OWNER TO postgres;

--
-- Name: symptoms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.symptoms (
    id bigint NOT NULL,
    category text,
    symptom text,
    detail text,
    condition text
);


ALTER TABLE public.symptoms OWNER TO postgres;

--
-- Name: symptoms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.symptoms ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.symptoms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: embeddings; Type: TABLE DATA; Schema: meta; Owner: postgres
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: meta; Owner: postgres
--

INSERT INTO meta.migrations VALUES ('202407160001', 'embeddings', '2025-08-06 14:51:52.284+00');


--
-- Data for Name: symptoms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1, 'Vertigo ', ' Rising ', ' On standing ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (2, 'Bladder ', ' Pain ', ' Frequent urination ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (3, 'Abdomen ', ' Colic ', ' Flatulence ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (4, 'Extremities ', ' Pain ', ' Swelling ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (5, 'Mind ', ' Anger ', ' Delusion ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (6, 'Head ', ' Congestion ', ' Throbbing ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (7, 'Chest ', ' Tightness ', ' Pressure ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (8, 'Generalities ', ' Sensitivity ', ' Weakness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (9, 'Fever / Chill / Perspiration ', ' Sweat ', ' Heat ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (10, 'Mind ', ' Irritability ', ' Sadness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (11, 'Throat ', ' Scraping ', ' Swelling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (12, 'Throat ', ' Scraping ', ' Swelling ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (13, 'Ears ', ' Itching ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (14, 'Skin ', ' Rash ', ' Eruption ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (15, 'Throat ', ' Scraping ', ' Tightness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (16, 'Mind ', ' Sadness ', ' Confusion ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (17, 'Ears ', ' Discharge ', ' Itching ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (18, 'Head ', ' Throbbing ', ' Congestion ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (19, 'Head ', ' Vertigo ', ' Throbbing ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (20, 'Fever / Chill / Perspiration ', ' Sweat ', ' Heat ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (21, 'Skin ', ' Itching ', ' Burning ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (22, 'Bladder ', ' Frequent urination ', ' Incontinence ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (23, 'Fever / Chill / Perspiration ', ' Sweat ', ' Chill ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (24, 'Eyes ', ' Redness ', ' Swelling ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (25, 'Face ', ' Swelling ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (26, 'Head ', ' Throbbing ', ' Heaviness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (27, 'Head ', ' Heaviness ', ' Congestion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (28, 'Extremities ', ' Swelling ', ' Weakness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (29, 'Mind ', ' Irritability ', ' Anxiety ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (30, 'Extremities ', ' Weakness ', ' Swelling ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (31, 'Face ', ' Pain ', ' Swelling ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (32, 'Vertigo ', ' Rising ', ' On standing ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (33, 'Throat ', ' Pain ', ' Scraping ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (34, 'Generalities ', ' Trembling ', ' Sensitivity ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (35, 'Vertigo ', ' Sudden ', ' Motion ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (36, 'Rectum ', ' Pain ', ' Constipation ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (37, 'Mind ', ' Fear ', ' Confusion ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (38, 'Stomach ', ' Hunger ', ' Vomiting ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (39, 'Nose ', ' Bleeding ', ' Discharge ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (40, 'Sleep ', ' Dreams ', ' Insomnia ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (41, 'Ears ', ' Itching ', ' Ringing ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (42, 'Bladder ', ' Frequent urination ', ' Burning ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (43, 'Nose ', ' Smell lost ', ' Sneezing ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (44, 'Extremities ', ' Trembling ', ' Weakness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (45, 'Stomach ', ' Bloating ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (46, 'Generalities ', ' Restlessness ', ' Sensitivity ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (47, 'Eyes ', ' Pain ', ' Swelling ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (48, 'Fever / Chill / Perspiration ', ' Chill ', ' Sweat ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (49, 'Generalities ', ' Sensitivity ', ' Fatigue ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (50, 'Skin ', ' Dryness ', ' Itching ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (51, 'Nose ', ' Obstruction ', ' Bleeding ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (52, 'Vertigo ', ' Sudden ', ' Lying down ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (53, 'Rectum ', ' Itching ', ' Burning ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (54, 'Chest ', ' Oppression ', ' Pressure ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (55, 'Sleep ', ' Insomnia ', ' Interrupted ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (56, 'Chest ', ' Oppression ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (57, 'Bladder ', ' Pain ', ' Frequent urination ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (58, 'Abdomen ', ' Tenderness ', ' Colic ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (59, 'Skin ', ' Dryness ', ' Rash ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (60, 'Ears ', ' Ringing ', ' Itching ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (61, 'Chest ', ' Pressure ', ' Tightness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (62, 'Skin ', ' Rash ', ' Dryness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (63, 'Generalities ', ' Sensitivity ', ' Fatigue ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (64, 'Face ', ' Twitching ', ' Swelling ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (65, 'Throat ', ' Scraping ', ' Pain ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (66, 'Fever / Chill / Perspiration ', ' Evening ', ' Heat ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (67, 'Nose ', ' Sneezing ', ' Obstruction ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (68, 'Eyes ', ' Redness ', ' Burning ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (69, 'Chest ', ' Oppression ', ' Tightness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (70, 'Fever / Chill / Perspiration ', ' Heat ', ' Sweat ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (71, 'Stomach ', ' Vomiting ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (72, 'Generalities ', ' Restlessness ', ' Trembling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (73, 'Rectum ', ' Itching ', ' Diarrhea ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (74, 'Mind ', ' Fear ', ' Anger ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (75, 'Throat ', ' Scraping ', ' Pain ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (76, 'Sleep ', ' Interrupted ', ' Sleepiness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (77, 'Mind ', ' Irritability ', ' Anger ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (78, 'Sleep ', ' Restless ', ' Insomnia ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (79, 'Skin ', ' Dryness ', ' Itching ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (80, 'Stomach ', ' Hunger ', ' Nausea ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (81, 'Ears ', ' Discharge ', ' Blocked sensation ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (82, 'Sleep ', ' Dreams ', ' Insomnia ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (83, 'Vertigo ', ' Rising ', ' Lying down ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (84, 'Ears ', ' Pain ', ' Itching ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (85, 'Chest ', ' Palpitation ', ' Pressure ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (86, 'Mind ', ' Sadness ', ' Anxiety ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (87, 'Generalities ', ' Weakness ', ' Restlessness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (88, 'Extremities ', ' Swelling ', ' Weakness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (89, 'Fever / Chill / Perspiration ', ' Sweat ', ' Evening ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (90, 'Stomach ', ' Hunger ', ' Bloating ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (91, 'Eyes ', ' Itching ', ' Burning ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (92, 'Mind ', ' Sadness ', ' Delusion ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (93, 'Chest ', ' Pain ', ' Tightness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (94, 'Rectum ', ' Pain ', ' Itching ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (95, 'Generalities ', ' Weakness ', ' Trembling ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (96, 'Mind ', ' Anxiety ', ' Anger ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (97, 'Generalities ', ' Fatigue ', ' Weakness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (98, 'Mind ', ' Fear ', ' Irritability ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (99, 'Mind ', ' Fear ', ' Anxiety ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (100, 'Eyes ', ' Pain ', ' Itching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (101, 'Bladder ', ' Burning ', ' Incontinence ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (102, 'Skin ', ' Dryness ', ' Rash ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (103, 'Stomach ', ' Pain ', ' Bloating ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (104, 'Head ', ' Vertigo ', ' Throbbing ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (105, 'Skin ', ' Burning ', ' Eruption ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (106, 'Extremities ', ' Weakness ', ' Numbness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (107, 'Vertigo ', ' Motion ', ' Rising ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (108, 'Vertigo ', ' On standing ', ' Rising ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (109, 'Vertigo ', ' On standing ', ' Motion ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (110, 'Ears ', ' Discharge ', ' Blocked sensation ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (111, 'Sleep ', ' Dreams ', ' Interrupted ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (112, 'Sleep ', ' Sleepiness ', ' Dreams ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (113, 'Eyes ', ' Burning ', ' Redness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (114, 'Sleep ', ' Interrupted ', ' Dreams ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (115, 'Extremities ', ' Pain ', ' Weakness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (116, 'Chest ', ' Pain ', ' Pressure ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (117, 'Extremities ', ' Numbness ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (118, 'Skin ', ' Burning ', ' Itching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (119, 'Vertigo ', ' Motion ', ' Sudden ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (120, 'Extremities ', ' Trembling ', ' Numbness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (121, 'Mind ', ' Confusion ', ' Anger ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (122, 'Sleep ', ' Sleepiness ', ' Insomnia ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (123, 'Bladder ', ' Incontinence ', ' Frequent urination ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (124, 'Sleep ', ' Sleepiness ', ' Insomnia ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (125, 'Abdomen ', ' Colic ', ' Tenderness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (126, 'Mind ', ' Fear ', ' Sadness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (127, 'Eyes ', ' Burning ', ' Redness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (128, 'Bladder ', ' Pain ', ' Retention ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (129, 'Chest ', ' Tightness ', ' Pressure ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (130, 'Generalities ', ' Trembling ', ' Sensitivity ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (131, 'Rectum ', ' Constipation ', ' Burning ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (132, 'Ears ', ' Ringing ', ' Discharge ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (133, 'Sleep ', ' Insomnia ', ' Restless ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (134, 'Nose ', ' Discharge ', ' Obstruction ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (135, 'Ears ', ' Itching ', ' Pain ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (136, 'Generalities ', ' Weakness ', ' Trembling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (137, 'Face ', ' Redness ', ' Paleness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (138, 'Mind ', ' Confusion ', ' Anger ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (139, 'Ears ', ' Discharge ', ' Ringing ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (140, 'Nose ', ' Smell lost ', ' Obstruction ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (141, 'Bladder ', ' Pain ', ' Retention ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (142, 'Nose ', ' Smell lost ', ' Discharge ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (143, 'Generalities ', ' Sensitivity ', ' Fatigue ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (144, 'Bladder ', ' Retention ', ' Incontinence ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (145, 'Throat ', ' Swelling ', ' Tightness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (146, 'Ears ', ' Itching ', ' Discharge ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (147, 'Skin ', ' Dryness ', ' Burning ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (148, 'Extremities ', ' Numbness ', ' Trembling ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (149, 'Eyes ', ' Burning ', ' Swelling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (150, 'Throat ', ' Pain ', ' Tightness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (151, 'Abdomen ', ' Cramping ', ' Flatulence ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (152, 'Extremities ', ' Trembling ', ' Numbness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (153, 'Extremities ', ' Swelling ', ' Trembling ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (154, 'Mind ', ' Confusion ', ' Fear ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (155, 'Ears ', ' Itching ', ' Discharge ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (156, 'Chest ', ' Tightness ', ' Oppression ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (157, 'Fever / Chill / Perspiration ', ' Sweat ', ' Evening ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (158, 'Bladder ', ' Incontinence ', ' Burning ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (159, 'Throat ', ' Pain ', ' Dryness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (160, 'Stomach ', ' Vomiting ', ' Bloating ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (161, 'Head ', ' Congestion ', ' Vertigo ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (162, 'Stomach ', ' Hunger ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (163, 'Bladder ', ' Retention ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (164, 'Skin ', ' Itching ', ' Eruption ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (165, 'Throat ', ' Tightness ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (166, 'Ears ', ' Discharge ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (167, 'Generalities ', ' Trembling ', ' Restlessness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (168, 'Mind ', ' Sadness ', ' Irritability ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (169, 'Skin ', ' Burning ', ' Rash ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (170, 'Sleep ', ' Restless ', ' Insomnia ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (171, 'Extremities ', ' Numbness ', ' Swelling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (172, 'Rectum ', ' Diarrhea ', ' Burning ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (173, 'Throat ', ' Swelling ', ' Dryness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (174, 'Nose ', ' Smell lost ', ' Discharge ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (175, 'Stomach ', ' Bloating ', ' Nausea ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (176, 'Vertigo ', ' Motion ', ' Lying down ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (177, 'Extremities ', ' Pain ', ' Swelling ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (178, 'Bladder ', ' Incontinence ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (179, 'Bladder ', ' Frequent urination ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (180, 'Vertigo ', ' Sudden ', ' On standing ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (181, 'Abdomen ', ' Flatulence ', ' Colic ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (182, 'Nose ', ' Bleeding ', ' Discharge ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (183, 'Nose ', ' Sneezing ', ' Discharge ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (184, 'Skin ', ' Itching ', ' Dryness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (185, 'Nose ', ' Bleeding ', ' Obstruction ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (186, 'Skin ', ' Burning ', ' Rash ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (187, 'Abdomen ', ' Cramping ', ' Distension ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (188, 'Eyes ', ' Redness ', ' Burning ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (189, 'Sleep ', ' Restless ', ' Interrupted ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (190, 'Nose ', ' Obstruction ', ' Smell lost ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (191, 'Mind ', ' Anxiety ', ' Irritability ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (192, 'Stomach ', ' Bloating ', ' Hunger ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (193, 'Chest ', ' Oppression ', ' Pressure ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (194, 'Abdomen ', ' Distension ', ' Cramping ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (195, 'Bladder ', ' Incontinence ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (196, 'Skin ', ' Rash ', ' Burning ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (197, 'Rectum ', ' Itching ', ' Burning ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (198, 'Skin ', ' Dryness ', ' Burning ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (199, 'Face ', ' Swelling ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (200, 'Sleep ', ' Interrupted ', ' Insomnia ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (201, 'Bladder ', ' Retention ', ' Frequent urination ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (202, 'Rectum ', ' Pain ', ' Constipation ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (203, 'Nose ', ' Obstruction ', ' Discharge ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (204, 'Skin ', ' Rash ', ' Itching ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (205, 'Vertigo ', ' On standing ', ' Lying down ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (206, 'Head ', ' Vertigo ', ' Heaviness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (207, 'Throat ', ' Swelling ', ' Dryness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (208, 'Face ', ' Swelling ', ' Paleness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (209, 'Bladder ', ' Frequent urination ', ' Burning ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (210, 'Face ', ' Swelling ', ' Twitching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (211, 'Throat ', ' Dryness ', ' Swelling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (212, 'Extremities ', ' Trembling ', ' Weakness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (213, 'Mind ', ' Anger ', ' Anxiety ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (214, 'Mind ', ' Sadness ', ' Anxiety ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (215, 'Chest ', ' Palpitation ', ' Oppression ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (216, 'Vertigo ', ' On standing ', ' Lying down ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (217, 'Face ', ' Twitching ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (218, 'Throat ', ' Pain ', ' Scraping ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (219, 'Vertigo ', ' Lying down ', ' Sudden ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (220, 'Sleep ', ' Restless ', ' Dreams ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (221, 'Bladder ', ' Frequent urination ', ' Burning ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (222, 'Ears ', ' Ringing ', ' Itching ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (223, 'Extremities ', ' Numbness ', ' Swelling ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (224, 'Generalities ', ' Weakness ', ' Fatigue ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (225, 'Sleep ', ' Interrupted ', ' Restless ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (226, 'Vertigo ', ' Motion ', ' Lying down ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (227, 'Rectum ', ' Constipation ', ' Diarrhea ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (228, 'Chest ', ' Pain ', ' Tightness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (229, 'Throat ', ' Tightness ', ' Scraping ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (230, 'Chest ', ' Pain ', ' Oppression ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (231, 'Generalities ', ' Sensitivity ', ' Trembling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (232, 'Stomach ', ' Nausea ', ' Bloating ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (233, 'Face ', ' Pain ', ' Swelling ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (234, 'Fever / Chill / Perspiration ', ' Evening ', ' Intermittent ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (235, 'Sleep ', ' Interrupted ', ' Insomnia ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (236, 'Bladder ', ' Incontinence ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (237, 'Head ', ' Heaviness ', ' Congestion ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (238, 'Fever / Chill / Perspiration ', ' Heat ', ' Sweat ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (239, 'Extremities ', ' Numbness ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (240, 'Throat ', ' Scraping ', ' Tightness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (241, 'Ears ', ' Pain ', ' Discharge ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (242, 'Throat ', ' Dryness ', ' Tightness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (243, 'Mind ', ' Confusion ', ' Sadness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (244, 'Rectum ', ' Burning ', ' Constipation ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (245, 'Nose ', ' Obstruction ', ' Discharge ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (246, 'Bladder ', ' Burning ', ' Frequent urination ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (247, 'Rectum ', ' Diarrhea ', ' Pain ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (248, 'Head ', ' Heaviness ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (249, 'Throat ', ' Scraping ', ' Dryness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (250, 'Extremities ', ' Weakness ', ' Trembling ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (251, 'Vertigo ', ' Rising ', ' On standing ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (252, 'Head ', ' Throbbing ', ' Congestion ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (253, 'Extremities ', ' Trembling ', ' Swelling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (254, 'Ears ', ' Itching ', ' Blocked sensation ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (255, 'Sleep ', ' Dreams ', ' Insomnia ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (256, 'Stomach ', ' Bloating ', ' Nausea ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (257, 'Skin ', ' Itching ', ' Dryness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (258, 'Mind ', ' Irritability ', ' Confusion ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (259, 'Sleep ', ' Sleepiness ', ' Dreams ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (260, 'Skin ', ' Eruption ', ' Burning ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (261, 'Mind ', ' Irritability ', ' Anxiety ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (262, 'Abdomen ', ' Flatulence ', ' Distension ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (263, 'Face ', ' Pain ', ' Twitching ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (264, 'Face ', ' Twitching ', ' Redness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (265, 'Nose ', ' Obstruction ', ' Bleeding ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (266, 'Stomach ', ' Pain ', ' Vomiting ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (267, 'Throat ', ' Swelling ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (268, 'Generalities ', ' Fatigue ', ' Sensitivity ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (269, 'Generalities ', ' Trembling ', ' Fatigue ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (270, 'Face ', ' Redness ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (271, 'Mind ', ' Irritability ', ' Sadness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (272, 'Rectum ', ' Constipation ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (273, 'Vertigo ', ' Rising ', ' Sudden ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (274, 'Extremities ', ' Pain ', ' Numbness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (275, 'Face ', ' Twitching ', ' Swelling ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (276, 'Vertigo ', ' Rising ', ' Motion ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (277, 'Throat ', ' Pain ', ' Scraping ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (278, 'Mind ', ' Delusion ', ' Anger ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (279, 'Extremities ', ' Trembling ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (280, 'Vertigo ', ' Sudden ', ' Rising ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (281, 'Chest ', ' Palpitation ', ' Tightness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (282, 'Sleep ', ' Restless ', ' Interrupted ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (283, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Evening ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (284, 'Fever / Chill / Perspiration ', ' Evening ', ' Intermittent ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (285, 'Chest ', ' Tightness ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (286, 'Extremities ', ' Numbness ', ' Weakness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (287, 'Head ', ' Vertigo ', ' Congestion ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (288, 'Sleep ', ' Dreams ', ' Interrupted ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (289, 'Ears ', ' Pain ', ' Discharge ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (290, 'Bladder ', ' Incontinence ', ' Retention ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (291, 'Head ', ' Vertigo ', ' Heaviness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (292, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Chill ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (293, 'Eyes ', ' Burning ', ' Itching ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (294, 'Stomach ', ' Nausea ', ' Bloating ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (295, 'Face ', ' Swelling ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (296, 'Face ', ' Redness ', ' Swelling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (297, 'Rectum ', ' Burning ', ' Constipation ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (298, 'Ears ', ' Ringing ', ' Blocked sensation ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (299, 'Chest ', ' Tightness ', ' Palpitation ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (300, 'Ears ', ' Blocked sensation ', ' Itching ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (301, 'Abdomen ', ' Flatulence ', ' Cramping ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (302, 'Abdomen ', ' Tenderness ', ' Distension ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (303, 'Abdomen ', ' Colic ', ' Flatulence ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (304, 'Generalities ', ' Restlessness ', ' Sensitivity ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (305, 'Head ', ' Heaviness ', ' Vertigo ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (306, 'Skin ', ' Dryness ', ' Eruption ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (307, 'Nose ', ' Smell lost ', ' Bleeding ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (308, 'Head ', ' Throbbing ', ' Vertigo ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (309, 'Chest ', ' Pressure ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (310, 'Face ', ' Pain ', ' Redness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (311, 'Nose ', ' Sneezing ', ' Obstruction ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (312, 'Rectum ', ' Burning ', ' Diarrhea ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (313, 'Eyes ', ' Burning ', ' Itching ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (314, 'Chest ', ' Pressure ', ' Oppression ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (315, 'Mind ', ' Anxiety ', ' Confusion ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (316, 'Bladder ', ' Retention ', ' Frequent urination ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (317, 'Skin ', ' Burning ', ' Dryness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (318, 'Sleep ', ' Dreams ', ' Sleepiness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (319, 'Head ', ' Heaviness ', ' Vertigo ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (320, 'Mind ', ' Irritability ', ' Anger ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (321, 'Bladder ', ' Retention ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (322, 'Mind ', ' Sadness ', ' Anger ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (323, 'Eyes ', ' Pain ', ' Redness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (324, 'Stomach ', ' Vomiting ', ' Hunger ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (325, 'Rectum ', ' Itching ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (326, 'Fever / Chill / Perspiration ', ' Sweat ', ' Chill ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (327, 'Face ', ' Paleness ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (328, 'Throat ', ' Tightness ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (329, 'Generalities ', ' Weakness ', ' Fatigue ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (330, 'Bladder ', ' Frequent urination ', ' Retention ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (331, 'Throat ', ' Swelling ', ' Tightness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (332, 'Generalities ', ' Sensitivity ', ' Weakness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (333, 'Abdomen ', ' Distension ', ' Flatulence ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (334, 'Generalities ', ' Fatigue ', ' Sensitivity ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (335, 'Eyes ', ' Pain ', ' Burning ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (336, 'Bladder ', ' Incontinence ', ' Retention ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (337, 'Head ', ' Vertigo ', ' Throbbing ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (338, 'Vertigo ', ' Lying down ', ' On standing ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (339, 'Stomach ', ' Vomiting ', ' Nausea ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (340, 'Extremities ', ' Pain ', ' Swelling ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (341, 'Mind ', ' Anger ', ' Fear ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (342, 'Generalities ', ' Fatigue ', ' Trembling ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (343, 'Skin ', ' Rash ', ' Eruption ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (344, 'Nose ', ' Sneezing ', ' Bleeding ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (345, 'Mind ', ' Fear ', ' Anger ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (346, 'Head ', ' Pain ', ' Throbbing ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (347, 'Rectum ', ' Itching ', ' Constipation ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (348, 'Mind ', ' Anger ', ' Sadness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (349, 'Eyes ', ' Swelling ', ' Itching ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (350, 'Skin ', ' Eruption ', ' Dryness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (351, 'Generalities ', ' Restlessness ', ' Trembling ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (352, 'Mind ', ' Delusion ', ' Confusion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (353, 'Rectum ', ' Pain ', ' Burning ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (354, 'Skin ', ' Eruption ', ' Itching ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (355, 'Nose ', ' Smell lost ', ' Sneezing ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (356, 'Throat ', ' Pain ', ' Swelling ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (357, 'Eyes ', ' Redness ', ' Itching ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (358, 'Vertigo ', ' Lying down ', ' Sudden ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (359, 'Abdomen ', ' Distension ', ' Colic ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (360, 'Head ', ' Heaviness ', ' Congestion ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (361, 'Abdomen ', ' Distension ', ' Cramping ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (362, 'Abdomen ', ' Tenderness ', ' Flatulence ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (363, 'Eyes ', ' Burning ', ' Pain ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (364, 'Mind ', ' Confusion ', ' Fear ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (365, 'Mind ', ' Anxiety ', ' Delusion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (366, 'Skin ', ' Itching ', ' Rash ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (367, 'Head ', ' Heaviness ', ' Vertigo ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (368, 'Throat ', ' Scraping ', ' Dryness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (369, 'Bladder ', ' Retention ', ' Incontinence ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (370, 'Mind ', ' Delusion ', ' Irritability ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (371, 'Fever / Chill / Perspiration ', ' Heat ', ' Evening ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (372, 'Skin ', ' Rash ', ' Dryness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (373, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Sweat ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (374, 'Fever / Chill / Perspiration ', ' Chill ', ' Sweat ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (375, 'Abdomen ', ' Tenderness ', ' Colic ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (376, 'Abdomen ', ' Distension ', ' Colic ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (377, 'Ears ', ' Pain ', ' Blocked sensation ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (378, 'Skin ', ' Dryness ', ' Burning ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (379, 'Generalities ', ' Weakness ', ' Trembling ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (380, 'Fever / Chill / Perspiration ', ' Sweat ', ' Evening ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (381, 'Nose ', ' Discharge ', ' Sneezing ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (382, 'Extremities ', ' Weakness ', ' Numbness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (383, 'Chest ', ' Palpitation ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (384, 'Face ', ' Paleness ', ' Swelling ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (385, 'Eyes ', ' Swelling ', ' Burning ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (386, 'Face ', ' Twitching ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (387, 'Mind ', ' Fear ', ' Delusion ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (388, 'Skin ', ' Burning ', ' Dryness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (389, 'Mind ', ' Irritability ', ' Fear ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (390, 'Fever / Chill / Perspiration ', ' Chill ', ' Intermittent ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (391, 'Sleep ', ' Sleepiness ', ' Interrupted ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (392, 'Eyes ', ' Itching ', ' Redness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (393, 'Face ', ' Swelling ', ' Redness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (394, 'Mind ', ' Anger ', ' Sadness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (395, 'Head ', ' Throbbing ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (396, 'Vertigo ', ' On standing ', ' Sudden ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (397, 'Nose ', ' Sneezing ', ' Smell lost ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (398, 'Extremities ', ' Weakness ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (399, 'Rectum ', ' Diarrhea ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (400, 'Extremities ', ' Numbness ', ' Swelling ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (401, 'Face ', ' Twitching ', ' Swelling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (402, 'Sleep ', ' Interrupted ', ' Insomnia ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (403, 'Mind ', ' Anxiety ', ' Delusion ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (404, 'Skin ', ' Dryness ', ' Eruption ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (405, 'Skin ', ' Eruption ', ' Itching ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (406, 'Fever / Chill / Perspiration ', ' Heat ', ' Evening ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (407, 'Rectum ', ' Pain ', ' Burning ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (408, 'Ears ', ' Discharge ', ' Pain ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (409, 'Mind ', ' Anger ', ' Confusion ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (410, 'Stomach ', ' Pain ', ' Nausea ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (411, 'Abdomen ', ' Tenderness ', ' Cramping ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (412, 'Throat ', ' Tightness ', ' Dryness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (413, 'Sleep ', ' Insomnia ', ' Dreams ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (414, 'Nose ', ' Discharge ', ' Sneezing ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (415, 'Abdomen ', ' Distension ', ' Flatulence ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (416, 'Chest ', ' Oppression ', ' Pressure ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (417, 'Extremities ', ' Weakness ', ' Numbness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (418, 'Mind ', ' Delusion ', ' Anxiety ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (419, 'Skin ', ' Itching ', ' Burning ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (420, 'Abdomen ', ' Cramping ', ' Distension ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (421, 'Nose ', ' Discharge ', ' Obstruction ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (422, 'Stomach ', ' Vomiting ', ' Hunger ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (423, 'Mind ', ' Fear ', ' Irritability ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (424, 'Extremities ', ' Weakness ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (425, 'Nose ', ' Smell lost ', ' Sneezing ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (426, 'Nose ', ' Smell lost ', ' Bleeding ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (427, 'Rectum ', ' Pain ', ' Diarrhea ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (428, 'Eyes ', ' Redness ', ' Burning ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (429, 'Stomach ', ' Vomiting ', ' Bloating ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (430, 'Vertigo ', ' On standing ', ' Motion ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (431, 'Ears ', ' Discharge ', ' Ringing ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (432, 'Chest ', ' Pain ', ' Pressure ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (433, 'Nose ', ' Bleeding ', ' Smell lost ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (434, 'Nose ', ' Discharge ', ' Sneezing ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (435, 'Mind ', ' Anxiety ', ' Irritability ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (436, 'Chest ', ' Tightness ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (437, 'Generalities ', ' Fatigue ', ' Sensitivity ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (438, 'Stomach ', ' Pain ', ' Vomiting ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (439, 'Ears ', ' Ringing ', ' Discharge ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (440, 'Abdomen ', ' Cramping ', ' Distension ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (441, 'Eyes ', ' Redness ', ' Itching ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (442, 'Sleep ', ' Interrupted ', ' Sleepiness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (443, 'Extremities ', ' Swelling ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (444, 'Chest ', ' Pressure ', ' Oppression ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (445, 'Sleep ', ' Restless ', ' Sleepiness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (446, 'Generalities ', ' Fatigue ', ' Trembling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (447, 'Nose ', ' Smell lost ', ' Discharge ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (448, 'Nose ', ' Smell lost ', ' Bleeding ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (449, 'Vertigo ', ' Lying down ', ' Motion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (450, 'Chest ', ' Palpitation ', ' Tightness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (451, 'Ears ', ' Discharge ', ' Pain ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (452, 'Extremities ', ' Numbness ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (453, 'Skin ', ' Eruption ', ' Dryness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (454, 'Generalities ', ' Fatigue ', ' Restlessness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (455, 'Head ', ' Heaviness ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (456, 'Mind ', ' Anger ', ' Delusion ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (457, 'Mind ', ' Confusion ', ' Sadness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (458, 'Head ', ' Pain ', ' Congestion ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (459, 'Eyes ', ' Pain ', ' Swelling ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (460, 'Vertigo ', ' Lying down ', ' On standing ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (461, 'Stomach ', ' Vomiting ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (462, 'Chest ', ' Tightness ', ' Pressure ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (463, 'Mind ', ' Irritability ', ' Fear ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (464, 'Stomach ', ' Bloating ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (465, 'Extremities ', ' Swelling ', ' Weakness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (466, 'Throat ', ' Tightness ', ' Swelling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (467, 'Rectum ', ' Constipation ', ' Itching ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (468, 'Head ', ' Heaviness ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (469, 'Extremities ', ' Swelling ', ' Pain ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (470, 'Stomach ', ' Nausea ', ' Vomiting ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (471, 'Rectum ', ' Itching ', ' Diarrhea ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (472, 'Eyes ', ' Swelling ', ' Burning ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (473, 'Face ', ' Pain ', ' Twitching ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (474, 'Bladder ', ' Pain ', ' Frequent urination ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (475, 'Sleep ', ' Restless ', ' Insomnia ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (476, 'Extremities ', ' Pain ', ' Trembling ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (477, 'Abdomen ', ' Flatulence ', ' Cramping ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (478, 'Mind ', ' Anxiety ', ' Confusion ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (479, 'Head ', ' Pain ', ' Congestion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (480, 'Chest ', ' Palpitation ', ' Pain ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (481, 'Skin ', ' Eruption ', ' Burning ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (482, 'Rectum ', ' Pain ', ' Diarrhea ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (483, 'Extremities ', ' Pain ', ' Numbness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (484, 'Mind ', ' Irritability ', ' Fear ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (485, 'Throat ', ' Dryness ', ' Scraping ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (486, 'Mind ', ' Confusion ', ' Anger ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (487, 'Fever / Chill / Perspiration ', ' Sweat ', ' Intermittent ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (488, 'Bladder ', ' Pain ', ' Burning ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (489, 'Fever / Chill / Perspiration ', ' Sweat ', ' Intermittent ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (490, 'Throat ', ' Pain ', ' Swelling ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (491, 'Mind ', ' Anxiety ', ' Fear ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (492, 'Generalities ', ' Trembling ', ' Weakness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (493, 'Ears ', ' Pain ', ' Discharge ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (494, 'Throat ', ' Pain ', ' Tightness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (495, 'Bladder ', ' Burning ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (496, 'Rectum ', ' Diarrhea ', ' Itching ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (497, 'Stomach ', ' Nausea ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (498, 'Extremities ', ' Weakness ', ' Swelling ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (499, 'Rectum ', ' Diarrhea ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (500, 'Abdomen ', ' Tenderness ', ' Flatulence ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (501, 'Generalities ', ' Restlessness ', ' Weakness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (502, 'Stomach ', ' Nausea ', ' Vomiting ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (503, 'Skin ', ' Rash ', ' Dryness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (504, 'Eyes ', ' Pain ', ' Swelling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (505, 'Head ', ' Vertigo ', ' Pain ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (506, 'Throat ', ' Tightness ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (507, 'Fever / Chill / Perspiration ', ' Sweat ', ' Heat ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (508, 'Abdomen ', ' Distension ', ' Tenderness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (509, 'Nose ', ' Discharge ', ' Bleeding ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (510, 'Bladder ', ' Pain ', ' Retention ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (511, 'Mind ', ' Delusion ', ' Anger ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (512, 'Rectum ', ' Burning ', ' Constipation ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (513, 'Chest ', ' Oppression ', ' Tightness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (514, 'Skin ', ' Itching ', ' Rash ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (515, 'Nose ', ' Discharge ', ' Bleeding ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (516, 'Generalities ', ' Restlessness ', ' Fatigue ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (517, 'Rectum ', ' Constipation ', ' Itching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (518, 'Abdomen ', ' Tenderness ', ' Flatulence ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (519, 'Ears ', ' Blocked sensation ', ' Itching ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (520, 'Face ', ' Twitching ', ' Redness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (521, 'Sleep ', ' Restless ', ' Sleepiness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (522, 'Nose ', ' Sneezing ', ' Smell lost ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (523, 'Mind ', ' Delusion ', ' Fear ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (524, 'Bladder ', ' Incontinence ', ' Burning ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (525, 'Sleep ', ' Sleepiness ', ' Restless ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (526, 'Mind ', ' Sadness ', ' Anxiety ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (527, 'Mind ', ' Sadness ', ' Confusion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (528, 'Nose ', ' Sneezing ', ' Smell lost ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (529, 'Face ', ' Pain ', ' Swelling ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (530, 'Abdomen ', ' Colic ', ' Tenderness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (531, 'Face ', ' Paleness ', ' Twitching ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (532, 'Rectum ', ' Constipation ', ' Itching ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (533, 'Sleep ', ' Dreams ', ' Sleepiness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (534, 'Rectum ', ' Diarrhea ', ' Itching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (535, 'Face ', ' Twitching ', ' Paleness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (536, 'Eyes ', ' Swelling ', ' Redness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (537, 'Face ', ' Redness ', ' Paleness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (538, 'Face ', ' Swelling ', ' Twitching ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (539, 'Throat ', ' Dryness ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (540, 'Head ', ' Vertigo ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (541, 'Stomach ', ' Hunger ', ' Vomiting ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (542, 'Vertigo ', ' Rising ', ' Lying down ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (543, 'Vertigo ', ' Rising ', ' Lying down ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (544, 'Face ', ' Swelling ', ' Paleness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (545, 'Fever / Chill / Perspiration ', ' Heat ', ' Chill ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (546, 'Abdomen ', ' Cramping ', ' Flatulence ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (547, 'Mind ', ' Fear ', ' Delusion ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (548, 'Ears ', ' Blocked sensation ', ' Ringing ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (549, 'Head ', ' Pain ', ' Throbbing ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (550, 'Abdomen ', ' Cramping ', ' Colic ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (551, 'Bladder ', ' Frequent urination ', ' Retention ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (552, 'Throat ', ' Pain ', ' Swelling ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (553, 'Sleep ', ' Sleepiness ', ' Dreams ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (554, 'Face ', ' Paleness ', ' Swelling ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (555, 'Mind ', ' Fear ', ' Anxiety ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (556, 'Mind ', ' Anxiety ', ' Fear ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (557, 'Face ', ' Paleness ', ' Swelling ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (558, 'Bladder ', ' Burning ', ' Retention ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (559, 'Skin ', ' Dryness ', ' Itching ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (560, 'Mind ', ' Fear ', ' Sadness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (561, 'Stomach ', ' Nausea ', ' Bloating ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (562, 'Bladder ', ' Retention ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (563, 'Sleep ', ' Insomnia ', ' Dreams ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (564, 'Chest ', ' Pain ', ' Oppression ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (565, 'Generalities ', ' Fatigue ', ' Weakness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (566, 'Ears ', ' Blocked sensation ', ' Pain ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (567, 'Face ', ' Twitching ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (568, 'Abdomen ', ' Flatulence ', ' Distension ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (569, 'Throat ', ' Swelling ', ' Pain ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (570, 'Throat ', ' Dryness ', ' Tightness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (571, 'Generalities ', ' Weakness ', ' Fatigue ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (572, 'Bladder ', ' Burning ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (573, 'Fever / Chill / Perspiration ', ' Evening ', ' Sweat ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (574, 'Throat ', ' Dryness ', ' Scraping ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (575, 'Fever / Chill / Perspiration ', ' Sweat ', ' Chill ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (576, 'Generalities ', ' Trembling ', ' Restlessness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (577, 'Chest ', ' Pain ', ' Tightness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (578, 'Ears ', ' Blocked sensation ', ' Ringing ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (579, 'Rectum ', ' Pain ', ' Constipation ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (580, 'Abdomen ', ' Cramping ', ' Tenderness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (581, 'Skin ', ' Burning ', ' Rash ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (582, 'Face ', ' Paleness ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (583, 'Mind ', ' Anxiety ', ' Delusion ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (584, 'Fever / Chill / Perspiration ', ' Chill ', ' Heat ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (585, 'Rectum ', ' Burning ', ' Diarrhea ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (586, 'Mind ', ' Confusion ', ' Anxiety ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (587, 'Rectum ', ' Constipation ', ' Burning ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (588, 'Throat ', ' Tightness ', ' Swelling ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (589, 'Stomach ', ' Vomiting ', ' Nausea ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (590, 'Mind ', ' Sadness ', ' Irritability ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (591, 'Eyes ', ' Swelling ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (592, 'Stomach ', ' Nausea ', ' Hunger ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (593, 'Head ', ' Pain ', ' Congestion ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (594, 'Generalities ', ' Weakness ', ' Sensitivity ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (595, 'Chest ', ' Pressure ', ' Palpitation ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (596, 'Generalities ', ' Sensitivity ', ' Trembling ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (597, 'Generalities ', ' Restlessness ', ' Trembling ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (598, 'Chest ', ' Tightness ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (599, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Chill ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (600, 'Bladder ', ' Burning ', ' Retention ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (601, 'Stomach ', ' Vomiting ', ' Nausea ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (602, 'Generalities ', ' Restlessness ', ' Sensitivity ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (603, 'Abdomen ', ' Tenderness ', ' Distension ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (604, 'Eyes ', ' Swelling ', ' Redness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (605, 'Mind ', ' Sadness ', ' Anger ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (606, 'Extremities ', ' Trembling ', ' Weakness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (607, 'Mind ', ' Confusion ', ' Irritability ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (608, 'Bladder ', ' Pain ', ' Incontinence ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (609, 'Generalities ', ' Sensitivity ', ' Restlessness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (610, 'Eyes ', ' Burning ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (611, 'Stomach ', ' Hunger ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (612, 'Nose ', ' Sneezing ', ' Bleeding ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (613, 'Abdomen ', ' Tenderness ', ' Colic ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (614, 'Throat ', ' Swelling ', ' Scraping ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (615, 'Fever / Chill / Perspiration ', ' Chill ', ' Evening ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (616, 'Vertigo ', ' Sudden ', ' Rising ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (617, 'Throat ', ' Swelling ', ' Scraping ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (618, 'Face ', ' Pain ', ' Paleness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (619, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Heat ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (620, 'Stomach ', ' Pain ', ' Vomiting ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (621, 'Mind ', ' Confusion ', ' Delusion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (622, 'Face ', ' Redness ', ' Twitching ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (623, 'Throat ', ' Swelling ', ' Scraping ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (624, 'Rectum ', ' Burning ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (625, 'Bladder ', ' Retention ', ' Frequent urination ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (626, 'Abdomen ', ' Tenderness ', ' Distension ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (627, 'Abdomen ', ' Distension ', ' Flatulence ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (628, 'Sleep ', ' Sleepiness ', ' Restless ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (629, 'Generalities ', ' Fatigue ', ' Trembling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (630, 'Nose ', ' Discharge ', ' Smell lost ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (631, 'Nose ', ' Obstruction ', ' Bleeding ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (632, 'Nose ', ' Smell lost ', ' Obstruction ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (633, 'Abdomen ', ' Cramping ', ' Colic ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (634, 'Chest ', ' Pain ', ' Palpitation ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (635, 'Rectum ', ' Pain ', ' Itching ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (636, 'Eyes ', ' Burning ', ' Redness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (637, 'Skin ', ' Rash ', ' Itching ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (638, 'Mind ', ' Anger ', ' Irritability ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (639, 'Vertigo ', ' Motion ', ' Sudden ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (640, 'Skin ', ' Burning ', ' Eruption ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (641, 'Fever / Chill / Perspiration ', ' Evening ', ' Intermittent ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (642, 'Skin ', ' Itching ', ' Burning ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (643, 'Extremities ', ' Swelling ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (644, 'Abdomen ', ' Distension ', ' Cramping ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (645, 'Chest ', ' Palpitation ', ' Tightness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (646, 'Stomach ', ' Nausea ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (647, 'Stomach ', ' Hunger ', ' Vomiting ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (648, 'Abdomen ', ' Tenderness ', ' Cramping ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (649, 'Ears ', ' Ringing ', ' Blocked sensation ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (650, 'Rectum ', ' Diarrhea ', ' Itching ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (651, 'Rectum ', ' Diarrhea ', ' Constipation ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (652, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Evening ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (653, 'Abdomen ', ' Flatulence ', ' Tenderness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (654, 'Head ', ' Pain ', ' Vertigo ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (655, 'Chest ', ' Tightness ', ' Palpitation ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (656, 'Bladder ', ' Frequent urination ', ' Incontinence ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (657, 'Eyes ', ' Pain ', ' Redness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (658, 'Fever / Chill / Perspiration ', ' Evening ', ' Sweat ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (659, 'Generalities ', ' Sensitivity ', ' Restlessness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (660, 'Extremities ', ' Weakness ', ' Trembling ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (661, 'Eyes ', ' Swelling ', ' Redness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (662, 'Bladder ', ' Frequent urination ', ' Incontinence ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (663, 'Rectum ', ' Constipation ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (664, 'Throat ', ' Scraping ', ' Tightness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (665, 'Vertigo ', ' Lying down ', ' On standing ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (666, 'Face ', ' Paleness ', ' Redness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (667, 'Fever / Chill / Perspiration ', ' Chill ', ' Intermittent ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (668, 'Bladder ', ' Burning ', ' Incontinence ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (669, 'Head ', ' Congestion ', ' Throbbing ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (670, 'Vertigo ', ' Sudden ', ' On standing ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (671, 'Ears ', ' Discharge ', ' Itching ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (672, 'Eyes ', ' Redness ', ' Swelling ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (673, 'Head ', ' Heaviness ', ' Throbbing ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (674, 'Mind ', ' Anger ', ' Confusion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (675, 'Bladder ', ' Burning ', ' Incontinence ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (676, 'Face ', ' Redness ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (677, 'Face ', ' Redness ', ' Twitching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (678, 'Head ', ' Throbbing ', ' Vertigo ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (679, 'Eyes ', ' Itching ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (680, 'Vertigo ', ' Lying down ', ' Motion ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (681, 'Extremities ', ' Weakness ', ' Swelling ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (682, 'Nose ', ' Sneezing ', ' Discharge ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (683, 'Mind ', ' Delusion ', ' Sadness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (684, 'Generalities ', ' Sensitivity ', ' Weakness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (685, 'Extremities ', ' Numbness ', ' Trembling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (686, 'Mind ', ' Sadness ', ' Fear ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (687, 'Ears ', ' Pain ', ' Itching ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (688, 'Chest ', ' Oppression ', ' Pain ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (689, 'Generalities ', ' Fatigue ', ' Weakness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (690, 'Mind ', ' Delusion ', ' Sadness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (691, 'Bladder ', ' Burning ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (692, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Sweat ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (693, 'Ears ', ' Ringing ', ' Itching ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (694, 'Generalities ', ' Trembling ', ' Fatigue ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (695, 'Skin ', ' Eruption ', ' Rash ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (696, 'Ears ', ' Discharge ', ' Ringing ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (697, 'Nose ', ' Discharge ', ' Smell lost ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (698, 'Stomach ', ' Nausea ', ' Vomiting ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (699, 'Abdomen ', ' Colic ', ' Flatulence ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (700, 'Bladder ', ' Incontinence ', ' Burning ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (701, 'Abdomen ', ' Colic ', ' Cramping ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (702, 'Mind ', ' Anger ', ' Confusion ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (703, 'Stomach ', ' Bloating ', ' Hunger ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (704, 'Eyes ', ' Itching ', ' Swelling ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (705, 'Extremities ', ' Swelling ', ' Numbness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (706, 'Eyes ', ' Itching ', ' Swelling ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (707, 'Throat ', ' Dryness ', ' Tightness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (708, 'Eyes ', ' Itching ', ' Redness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (709, 'Generalities ', ' Trembling ', ' Restlessness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (710, 'Rectum ', ' Itching ', ' Constipation ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (711, 'Abdomen ', ' Colic ', ' Cramping ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (712, 'Ears ', ' Blocked sensation ', ' Discharge ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (713, 'Rectum ', ' Burning ', ' Itching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (714, 'Ears ', ' Blocked sensation ', ' Ringing ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (715, 'Mind ', ' Confusion ', ' Sadness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (716, 'Sleep ', ' Insomnia ', ' Interrupted ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (717, 'Stomach ', ' Bloating ', ' Hunger ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (718, 'Nose ', ' Obstruction ', ' Discharge ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (719, 'Stomach ', ' Hunger ', ' Bloating ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (720, 'Throat ', ' Scraping ', ' Dryness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (721, 'Sleep ', ' Interrupted ', ' Dreams ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (722, 'Mind ', ' Sadness ', ' Fear ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (723, 'Skin ', ' Burning ', ' Itching ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (724, 'Stomach ', ' Pain ', ' Nausea ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (725, 'Face ', ' Pain ', ' Paleness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (726, 'Nose ', ' Bleeding ', ' Sneezing ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (727, 'Throat ', ' Pain ', ' Tightness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (728, 'Abdomen ', ' Cramping ', ' Flatulence ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (729, 'Sleep ', ' Dreams ', ' Interrupted ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (730, 'Skin ', ' Eruption ', ' Burning ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (731, 'Head ', ' Congestion ', ' Heaviness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (732, 'Ears ', ' Ringing ', ' Discharge ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (733, 'Generalities ', ' Trembling ', ' Fatigue ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (734, 'Eyes ', ' Pain ', ' Burning ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (735, 'Head ', ' Vertigo ', ' Congestion ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (736, 'Skin ', ' Itching ', ' Eruption ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (737, 'Sleep ', ' Interrupted ', ' Dreams ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (738, 'Eyes ', ' Burning ', ' Itching ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (739, 'Stomach ', ' Hunger ', ' Nausea ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (740, 'Head ', ' Throbbing ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (741, 'Ears ', ' Blocked sensation ', ' Itching ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (742, 'Mind ', ' Confusion ', ' Fear ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (743, 'Chest ', ' Pain ', ' Palpitation ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (744, 'Skin ', ' Rash ', ' Itching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (745, 'Rectum ', ' Burning ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (746, 'Face ', ' Paleness ', ' Twitching ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (747, 'Head ', ' Throbbing ', ' Pain ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (748, 'Ears ', ' Blocked sensation ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (749, 'Vertigo ', ' Motion ', ' On standing ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (750, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Heat ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (751, 'Ears ', ' Discharge ', ' Itching ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (752, 'Vertigo ', ' Motion ', ' On standing ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (753, 'Extremities ', ' Weakness ', ' Trembling ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (754, 'Eyes ', ' Itching ', ' Pain ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (755, 'Head ', ' Congestion ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (756, 'Rectum ', ' Diarrhea ', ' Burning ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (757, 'Sleep ', ' Dreams ', ' Sleepiness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (758, 'Face ', ' Swelling ', ' Paleness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (759, 'Face ', ' Redness ', ' Swelling ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (760, 'Head ', ' Vertigo ', ' Pain ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (761, 'Extremities ', ' Numbness ', ' Weakness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (762, 'Stomach ', ' Hunger ', ' Bloating ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (763, 'Chest ', ' Pressure ', ' Tightness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (764, 'Extremities ', ' Swelling ', ' Trembling ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (765, 'Rectum ', ' Burning ', ' Itching ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (766, 'Mind ', ' Irritability ', ' Sadness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (767, 'Vertigo ', ' Sudden ', ' Rising ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (768, 'Abdomen ', ' Cramping ', ' Tenderness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (769, 'Sleep ', ' Restless ', ' Dreams ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (770, 'Fever / Chill / Perspiration ', ' Chill ', ' Intermittent ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (771, 'Stomach ', ' Vomiting ', ' Bloating ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (772, 'Skin ', ' Itching ', ' Dryness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (773, 'Vertigo ', ' Lying down ', ' Rising ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (774, 'Throat ', ' Swelling ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (775, 'Abdomen ', ' Flatulence ', ' Tenderness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (776, 'Head ', ' Heaviness ', ' Throbbing ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (777, 'Sleep ', ' Dreams ', ' Restless ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (778, 'Vertigo ', ' Motion ', ' On standing ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (779, 'Extremities ', ' Trembling ', ' Swelling ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (780, 'Bladder ', ' Frequent urination ', ' Retention ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (781, 'Head ', ' Pain ', ' Vertigo ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (782, 'Vertigo ', ' Sudden ', ' On standing ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (783, 'Eyes ', ' Swelling ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (784, 'Stomach ', ' Pain ', ' Hunger ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (785, 'Mind ', ' Anger ', ' Anxiety ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (786, 'Throat ', ' Tightness ', ' Dryness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (787, 'Mind ', ' Sadness ', ' Fear ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (788, 'Generalities ', ' Weakness ', ' Sensitivity ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (789, 'Extremities ', ' Pain ', ' Numbness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (790, 'Mind ', ' Delusion ', ' Fear ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (791, 'Eyes ', ' Pain ', ' Itching ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (792, 'Mind ', ' Anger ', ' Delusion ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (793, 'Mind ', ' Delusion ', ' Fear ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (794, 'Mind ', ' Irritability ', ' Delusion ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (795, 'Nose ', ' Obstruction ', ' Sneezing ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (796, 'Sleep ', ' Sleepiness ', ' Restless ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (797, 'Mind ', ' Fear ', ' Anxiety ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (798, 'Eyes ', ' Itching ', ' Burning ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (799, 'Extremities ', ' Pain ', ' Weakness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (800, 'Chest ', ' Palpitation ', ' Pressure ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (801, 'Extremities ', ' Numbness ', ' Weakness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (802, 'Throat ', ' Swelling ', ' Dryness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (803, 'Eyes ', ' Swelling ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (804, 'Head ', ' Congestion ', ' Vertigo ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (805, 'Sleep ', ' Insomnia ', ' Restless ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (806, 'Stomach ', ' Bloating ', ' Nausea ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (807, 'Nose ', ' Bleeding ', ' Sneezing ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (808, 'Eyes ', ' Swelling ', ' Itching ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (809, 'Sleep ', ' Sleepiness ', ' Insomnia ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (810, 'Face ', ' Redness ', ' Paleness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (811, 'Sleep ', ' Insomnia ', ' Restless ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (812, 'Fever / Chill / Perspiration ', ' Chill ', ' Heat ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (813, 'Generalities ', ' Trembling ', ' Sensitivity ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (814, 'Sleep ', ' Insomnia ', ' Dreams ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (815, 'Ears ', ' Pain ', ' Ringing ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (816, 'Abdomen ', ' Colic ', ' Tenderness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (817, 'Face ', ' Pain ', ' Twitching ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (818, 'Extremities ', ' Pain ', ' Trembling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (819, 'Mind ', ' Confusion ', ' Delusion ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (820, 'Vertigo ', ' Motion ', ' Rising ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (821, 'Face ', ' Paleness ', ' Redness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (822, 'Mind ', ' Anger ', ' Fear ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (823, 'Head ', ' Pain ', ' Heaviness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (824, 'Mind ', ' Anxiety ', ' Irritability ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (825, 'Vertigo ', ' On standing ', ' Sudden ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (826, 'Eyes ', ' Redness ', ' Itching ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (827, 'Ears ', ' Pain ', ' Blocked sensation ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (828, 'Mind ', ' Confusion ', ' Irritability ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (829, 'Throat ', ' Scraping ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (830, 'Ears ', ' Ringing ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (831, 'Ears ', ' Ringing ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (832, 'Generalities ', ' Restlessness ', ' Weakness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (833, 'Throat ', ' Tightness ', ' Scraping ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (834, 'Mind ', ' Anxiety ', ' Sadness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (835, 'Mind ', ' Sadness ', ' Delusion ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (836, 'Vertigo ', ' Motion ', ' Rising ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (837, 'Generalities ', ' Trembling ', ' Weakness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (838, 'Nose ', ' Obstruction ', ' Smell lost ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (839, 'Rectum ', ' Pain ', ' Diarrhea ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (840, 'Skin ', ' Rash ', ' Burning ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (841, 'Vertigo ', ' On standing ', ' Sudden ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (842, 'Chest ', ' Pain ', ' Oppression ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (843, 'Head ', ' Pain ', ' Heaviness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (844, 'Generalities ', ' Trembling ', ' Weakness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (845, 'Mind ', ' Confusion ', ' Anxiety ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (846, 'Stomach ', ' Pain ', ' Bloating ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (847, 'Eyes ', ' Itching ', ' Swelling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (848, 'Bladder ', ' Retention ', ' Burning ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (849, 'Skin ', ' Burning ', ' Eruption ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (850, 'Face ', ' Redness ', ' Swelling ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (851, 'Mind ', ' Fear ', ' Sadness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (852, 'Stomach ', ' Nausea ', ' Pain ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (853, 'Stomach ', ' Vomiting ', ' Hunger ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (854, 'Rectum ', ' Pain ', ' Itching ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (855, 'Skin ', ' Itching ', ' Rash ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (856, 'Eyes ', ' Itching ', ' Burning ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (857, 'Bladder ', ' Incontinence ', ' Retention ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (858, 'Mind ', ' Fear ', ' Anger ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (859, 'Nose ', ' Obstruction ', ' Sneezing ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (860, 'Nose ', ' Sneezing ', ' Obstruction ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (861, 'Ears ', ' Blocked sensation ', ' Discharge ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (862, 'Fever / Chill / Perspiration ', ' Heat ', ' Chill ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (863, 'Face ', ' Paleness ', ' Twitching ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (864, 'Stomach ', ' Nausea ', ' Hunger ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (865, 'Mind ', ' Fear ', ' Irritability ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (866, 'Sleep ', ' Dreams ', ' Restless ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (867, 'Abdomen ', ' Cramping ', ' Tenderness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (868, 'Vertigo ', ' On standing ', ' Rising ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (869, 'Chest ', ' Pressure ', ' Tightness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (870, 'Fever / Chill / Perspiration ', ' Heat ', ' Intermittent ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (871, 'Generalities ', ' Weakness ', ' Sensitivity ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (872, 'Skin ', ' Burning ', ' Dryness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (873, 'Face ', ' Redness ', ' Twitching ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (874, 'Head ', ' Pain ', ' Heaviness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (875, 'Eyes ', ' Swelling ', ' Itching ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (876, 'Mind ', ' Confusion ', ' Delusion ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (877, 'Ears ', ' Pain ', ' Ringing ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (878, 'Mind ', ' Anger ', ' Fear ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (879, 'Mind ', ' Anger ', ' Irritability ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (880, 'Head ', ' Congestion ', ' Vertigo ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (881, 'Rectum ', ' Burning ', ' Itching ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (882, 'Generalities ', ' Sensitivity ', ' Trembling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (883, 'Vertigo ', ' Sudden ', ' Lying down ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (884, 'Throat ', ' Dryness ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (885, 'Vertigo ', ' Motion ', ' Lying down ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (886, 'Vertigo ', ' Lying down ', ' Rising ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (887, 'Extremities ', ' Swelling ', ' Numbness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (888, 'Rectum ', ' Itching ', ' Diarrhea ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (889, 'Mind ', ' Anxiety ', ' Sadness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (890, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Evening ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (891, 'Eyes ', ' Burning ', ' Pain ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (892, 'Skin ', ' Eruption ', ' Rash ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (893, 'Fever / Chill / Perspiration ', ' Chill ', ' Evening ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (894, 'Mind ', ' Delusion ', ' Confusion ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (895, 'Mind ', ' Delusion ', ' Sadness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (896, 'Fever / Chill / Perspiration ', ' Evening ', ' Chill ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (897, 'Skin ', ' Eruption ', ' Dryness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (898, 'Bladder ', ' Incontinence ', ' Frequent urination ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (899, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Chill ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (900, 'Throat ', ' Scraping ', ' Swelling ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (901, 'Skin ', ' Rash ', ' Burning ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (902, 'Extremities ', ' Trembling ', ' Swelling ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (903, 'Skin ', ' Eruption ', ' Rash ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (904, 'Mind ', ' Fear ', ' Confusion ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (905, 'Face ', ' Pain ', ' Redness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (906, 'Mind ', ' Delusion ', ' Irritability ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (907, 'Mind ', ' Sadness ', ' Confusion ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (908, 'Sleep ', ' Interrupted ', ' Restless ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (909, 'Mind ', ' Anxiety ', ' Anger ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (910, 'Fever / Chill / Perspiration ', ' Evening ', ' Chill ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (911, 'Stomach ', ' Bloating ', ' Vomiting ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (912, 'Mind ', ' Irritability ', ' Anxiety ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (913, 'Head ', ' Throbbing ', ' Heaviness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (914, 'Generalities ', ' Fatigue ', ' Restlessness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (915, 'Stomach ', ' Nausea ', ' Hunger ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (916, 'Nose ', ' Sneezing ', ' Discharge ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (917, 'Ears ', ' Discharge ', ' Blocked sensation ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (918, 'Head ', ' Congestion ', ' Heaviness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (919, 'Nose ', ' Sneezing ', ' Bleeding ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (920, 'Throat ', ' Dryness ', ' Scraping ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (921, 'Face ', ' Swelling ', ' Redness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (922, 'Vertigo ', ' Sudden ', ' Motion ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (923, 'Nose ', ' Smell lost ', ' Obstruction ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (924, 'Fever / Chill / Perspiration ', ' Heat ', ' Evening ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (925, 'Rectum ', ' Constipation ', ' Diarrhea ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (926, 'Sleep ', ' Restless ', ' Dreams ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (927, 'Chest ', ' Pressure ', ' Palpitation ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (928, 'Ears ', ' Itching ', ' Blocked sensation ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (929, 'Bladder ', ' Incontinence ', ' Frequent urination ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (930, 'Rectum ', ' Burning ', ' Diarrhea ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (931, 'Extremities ', ' Swelling ', ' Trembling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (932, 'Stomach ', ' Vomiting ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (933, 'Abdomen ', ' Colic ', ' Distension ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (934, 'Mind ', ' Irritability ', ' Delusion ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (935, 'Head ', ' Throbbing ', ' Vertigo ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (936, 'Chest ', ' Oppression ', ' Palpitation ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (937, 'Bladder ', ' Pain ', ' Incontinence ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (938, 'Bladder ', ' Frequent urination ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (939, 'Skin ', ' Eruption ', ' Itching ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (940, 'Ears ', ' Blocked sensation ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (941, 'Eyes ', ' Burning ', ' Swelling ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (942, 'Chest ', ' Oppression ', ' Tightness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (943, 'Eyes ', ' Pain ', ' Redness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (944, 'Face ', ' Redness ', ' Pain ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (945, 'Mind ', ' Sadness ', ' Irritability ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (946, 'Extremities ', ' Swelling ', ' Numbness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (947, 'Eyes ', ' Redness ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (948, 'Mind ', ' Confusion ', ' Anxiety ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (949, 'Face ', ' Pain ', ' Paleness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (950, 'Fever / Chill / Perspiration ', ' Heat ', ' Intermittent ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (951, 'Chest ', ' Pressure ', ' Oppression ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (952, 'Nose ', ' Bleeding ', ' Sneezing ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (953, 'Nose ', ' Bleeding ', ' Smell lost ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (954, 'Ears ', ' Itching ', ' Discharge ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (955, 'Bladder ', ' Frequent urination ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (956, 'Extremities ', ' Trembling ', ' Numbness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (957, 'Rectum ', ' Itching ', ' Constipation ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (958, 'Fever / Chill / Perspiration ', ' Sweat ', ' Intermittent ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (959, 'Sleep ', ' Insomnia ', ' Sleepiness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (960, 'Chest ', ' Tightness ', ' Oppression ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (961, 'Vertigo ', ' On standing ', ' Lying down ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (962, 'Throat ', ' Dryness ', ' Pain ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (963, 'Abdomen ', ' Colic ', ' Distension ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (964, 'Vertigo ', ' Rising ', ' Motion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (965, 'Nose ', ' Discharge ', ' Obstruction ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (966, 'Fever / Chill / Perspiration ', ' Chill ', ' Sweat ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (967, 'Mind ', ' Anxiety ', ' Sadness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (968, 'Stomach ', ' Bloating ', ' Vomiting ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (969, 'Generalities ', ' Weakness ', ' Restlessness ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (970, 'Head ', ' Pain ', ' Throbbing ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (971, 'Vertigo ', ' Motion ', ' Sudden ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (972, 'Face ', ' Twitching ', ' Paleness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (973, 'Chest ', ' Pain ', ' Palpitation ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (974, 'Chest ', ' Palpitation ', ' Pressure ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (975, 'Nose ', ' Bleeding ', ' Discharge ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (976, 'Mind ', ' Delusion ', ' Confusion ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (977, 'Eyes ', ' Itching ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (978, 'Stomach ', ' Pain ', ' Hunger ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (979, 'Bladder ', ' Burning ', ' Frequent urination ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (980, 'Mind ', ' Irritability ', ' Anger ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (981, 'Rectum ', ' Constipation ', ' Burning ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (982, 'Extremities ', ' Pain ', ' Trembling ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (983, 'Throat ', ' Tightness ', ' Swelling ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (984, 'Mind ', ' Anxiety ', ' Anger ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (985, 'Rectum ', ' Diarrhea ', ' Burning ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (986, 'Vertigo ', ' On standing ', ' Motion ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (987, 'Mind ', ' Anger ', ' Anxiety ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (988, 'Head ', ' Throbbing ', ' Congestion ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (989, 'Abdomen ', ' Flatulence ', ' Distension ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (990, 'Head ', ' Heaviness ', ' Throbbing ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (991, 'Sleep ', ' Interrupted ', ' Sleepiness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (992, 'Chest ', ' Oppression ', ' Palpitation ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (993, 'Mind ', ' Anxiety ', ' Confusion ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (994, 'Chest ', ' Palpitation ', ' Oppression ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (995, 'Fever / Chill / Perspiration ', ' Chill ', ' Heat ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (996, 'Generalities ', ' Fatigue ', ' Restlessness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (997, 'Stomach ', ' Hunger ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (998, 'Skin ', ' Itching ', ' Eruption ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (999, 'Eyes ', ' Pain ', ' Itching ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1000, 'Throat ', ' Dryness ', ' Swelling ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1001, 'Generalities ', ' Restlessness ', ' Fatigue ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1002, 'Head ', ' Vertigo ', ' Congestion ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1003, 'Ears ', ' Ringing ', ' Blocked sensation ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1004, 'Rectum ', ' Constipation ', ' Diarrhea ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1005, 'Sleep ', ' Insomnia ', ' Sleepiness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1006, 'Mind ', ' Fear ', ' Delusion ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1007, 'Chest ', ' Tightness ', ' Oppression ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1008, 'Vertigo ', ' Lying down ', ' Rising ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1009, 'Sleep ', ' Dreams ', ' Restless ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1010, 'Fever / Chill / Perspiration ', ' Heat ', ' Intermittent ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1011, 'Abdomen ', ' Colic ', ' Distension ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1012, 'Nose ', ' Obstruction ', ' Sneezing ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1013, 'Head ', ' Vertigo ', ' Heaviness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1014, 'Eyes ', ' Burning ', ' Swelling ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1015, 'Abdomen ', ' Flatulence ', ' Tenderness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1016, 'Abdomen ', ' Tenderness ', ' Cramping ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1017, 'Face ', ' Paleness ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1018, 'Extremities ', ' Weakness ', ' Pain ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1019, 'Ears ', ' Ringing ', ' Pain ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1020, 'Rectum ', ' Itching ', ' Burning ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1021, 'Head ', ' Congestion ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1022, 'Stomach ', ' Bloating ', ' Vomiting ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1023, 'Vertigo ', ' On standing ', ' Rising ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1024, 'Chest ', ' Palpitation ', ' Oppression ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1025, 'Bladder ', ' Retention ', ' Burning ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1026, 'Skin ', ' Dryness ', ' Eruption ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1027, 'Vertigo ', ' Rising ', ' Sudden ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1028, 'Bladder ', ' Retention ', ' Incontinence ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1029, 'Bladder ', ' Burning ', ' Retention ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1030, 'Face ', ' Twitching ', ' Paleness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1031, 'Extremities ', ' Numbness ', ' Trembling ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1032, 'Rectum ', ' Diarrhea ', ' Constipation ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1033, 'Vertigo ', ' Rising ', ' Sudden ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1034, 'Throat ', ' Swelling ', ' Tightness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1035, 'Stomach ', ' Pain ', ' Bloating ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1036, 'Eyes ', ' Redness ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1037, 'Head ', ' Pain ', ' Vertigo ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1038, 'Mind ', ' Irritability ', ' Confusion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1039, 'Bladder ', ' Burning ', ' Frequent urination ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1040, 'Sleep ', ' Sleepiness ', ' Interrupted ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1041, 'Extremities ', ' Pain ', ' Weakness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1042, 'Mind ', ' Confusion ', ' Irritability ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1043, 'Sleep ', ' Interrupted ', ' Restless ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1044, 'Extremities ', ' Trembling ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1045, 'Bladder ', ' Pain ', ' Burning ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1046, 'Skin ', ' Rash ', ' Eruption ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1047, 'Throat ', ' Tightness ', ' Dryness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1048, 'Rectum ', ' Constipation ', ' Pain ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1049, 'Ears ', ' Pain ', ' Ringing ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1050, 'Head ', ' Congestion ', ' Heaviness ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1051, 'Throat ', ' Pain ', ' Dryness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1052, 'Nose ', ' Discharge ', ' Bleeding ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1053, 'Bladder ', ' Retention ', ' Burning ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1054, 'Stomach ', ' Pain ', ' Nausea ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1055, 'Abdomen ', ' Colic ', ' Cramping ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1056, 'Rectum ', ' Itching ', ' Pain ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1057, 'Face ', ' Paleness ', ' Redness ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1058, 'Chest ', ' Palpitation ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1059, 'Nose ', ' Obstruction ', ' Smell lost ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1060, 'Abdomen ', ' Distension ', ' Tenderness ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1061, 'Skin ', ' Burning ', ' Itching ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1062, 'Vertigo ', ' Sudden ', ' Lying down ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1063, 'Face ', ' Twitching ', ' Redness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1064, 'Eyes ', ' Itching ', ' Redness ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1065, 'Face ', ' Swelling ', ' Redness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1066, 'Vertigo ', ' Lying down ', ' Sudden ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1067, 'Chest ', ' Pressure ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1068, 'Sleep ', ' Insomnia ', ' Interrupted ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1069, 'Mind ', ' Sadness ', ' Anger ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1070, 'Ears ', ' Blocked sensation ', ' Discharge ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1071, 'Face ', ' Pain ', ' Redness ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1072, 'Abdomen ', ' Distension ', ' Colic ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1073, 'Chest ', ' Oppression ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1074, 'Ears ', ' Pain ', ' Itching ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1075, 'Fever / Chill / Perspiration ', ' Heat ', ' Chill ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1076, 'Generalities ', ' Weakness ', ' Restlessness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1077, 'Bladder ', ' Pain ', ' Incontinence ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1078, 'Rectum ', ' Itching ', ' Pain ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1079, 'Vertigo ', ' Rising ', ' Motion ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1080, 'Rectum ', ' Burning ', ' Pain ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1081, 'Sleep ', ' Restless ', ' Interrupted ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1082, 'Abdomen ', ' Flatulence ', ' Colic ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1083, 'Nose ', ' Discharge ', ' Smell lost ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1084, 'Mind ', ' Irritability ', ' Delusion ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1085, 'Rectum ', ' Pain ', ' Burning ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1086, 'Chest ', ' Pain ', ' Pressure ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1087, 'Throat ', ' Tightness ', ' Scraping ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1088, 'Rectum ', ' Diarrhea ', ' Constipation ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1089, 'Stomach ', ' Bloating ', ' Pain ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1090, 'Bladder ', ' Pain ', ' Burning ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1091, 'Mind ', ' Delusion ', ' Irritability ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1092, 'Mind ', ' Anger ', ' Irritability ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1093, 'Generalities ', ' Restlessness ', ' Weakness ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1094, 'Eyes ', ' Redness ', ' Pain ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1095, 'Fever / Chill / Perspiration ', ' Evening ', ' Heat ', ' Better from pressure');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1096, 'Fever / Chill / Perspiration ', ' Heat ', ' Sweat ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1097, 'Throat ', ' Pain ', ' Dryness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1098, 'Sleep ', ' Restless ', ' Sleepiness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1099, 'Chest ', ' Oppression ', ' Palpitation ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1100, 'Eyes ', ' Swelling ', ' Burning ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1101, 'Skin ', ' Dryness ', ' Rash ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1102, 'Nose ', ' Bleeding ', ' Smell lost ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1103, 'Fever / Chill / Perspiration ', ' Evening ', ' Chill ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1104, 'Mind ', ' Sadness ', ' Delusion ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1105, 'Ears ', ' Pain ', ' Blocked sensation ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1106, 'Vertigo ', ' Sudden ', ' Motion ', ' After exertion');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1107, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Heat ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1108, 'Head ', ' Throbbing ', ' Heaviness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1109, 'Mind ', ' Irritability ', ' Confusion ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1110, 'Stomach ', ' Hunger ', ' Nausea ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1111, 'Ears ', ' Itching ', ' Ringing ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1112, 'Ears ', ' Itching ', ' Ringing ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1113, 'Head ', ' Congestion ', ' Throbbing ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1114, 'Chest ', ' Pressure ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1115, 'Abdomen ', ' Flatulence ', ' Cramping ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1116, 'Nose ', ' Bleeding ', ' Obstruction ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1117, 'Fever / Chill / Perspiration ', ' Evening ', ' Heat ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1118, 'Chest ', ' Pressure ', ' Palpitation ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1119, 'Abdomen ', ' Cramping ', ' Colic ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1120, 'Mind ', ' Delusion ', ' Anxiety ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1121, 'Generalities ', ' Sensitivity ', ' Restlessness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1122, 'Vertigo ', ' Lying down ', ' Motion ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1123, 'Throat ', ' Dryness ', ' Swelling ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1124, 'Fever / Chill / Perspiration ', ' Intermittent ', ' Sweat ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1125, 'Sleep ', ' Sleepiness ', ' Interrupted ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1126, 'Chest ', ' Tightness ', ' Palpitation ', ' Worse from cold');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1127, 'Mind ', ' Delusion ', ' Anxiety ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1128, 'Extremities ', ' Trembling ', ' Pain ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1129, 'Ears ', ' Itching ', ' Blocked sensation ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1130, 'Ears ', ' Itching ', ' Pain ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1131, 'Abdomen ', ' Distension ', ' Tenderness ', ' In evening');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1132, 'Sleep ', ' Insomnia ', ' Sleepiness ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1133, 'Abdomen ', ' Flatulence ', ' Colic ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1134, 'Stomach ', ' Pain ', ' Hunger ', ' Worse during menses');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1135, 'Nose ', ' Bleeding ', ' Obstruction ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1136, 'Face ', ' Swelling ', ' Twitching ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1137, 'Mind ', ' Anxiety ', ' Fear ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1138, 'Eyes ', ' Redness ', ' Swelling ', ' In morning');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1139, 'Mind ', ' Delusion ', ' Anger ', ' Chronic');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1140, 'Generalities ', ' Restlessness ', ' Fatigue ', ' Sudden onset');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1141, 'Mind ', ' Fear ', ' Confusion ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1142, 'Fever / Chill / Perspiration ', ' Chill ', ' Evening ', ' After eating');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1143, 'Mind ', ' Anger ', ' Sadness ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1144, 'Head ', ' Congestion ', ' Pain ', ' Before sleep');
INSERT INTO public.symptoms OVERRIDING SYSTEM VALUE VALUES (1145, 'Fever / Chill / Perspiration ', ' Evening ', ' Sweat ', ' After exertion');


--
-- Name: embeddings_id_seq; Type: SEQUENCE SET; Schema: meta; Owner: postgres
--

SELECT pg_catalog.setval('meta.embeddings_id_seq', 1, false);


--
-- Name: symptoms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.symptoms_id_seq', 1145, true);


--
-- Name: embeddings embeddings_pkey; Type: CONSTRAINT; Schema: meta; Owner: postgres
--

ALTER TABLE ONLY meta.embeddings
    ADD CONSTRAINT embeddings_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: meta; Owner: postgres
--

ALTER TABLE ONLY meta.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: symptoms symptoms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.symptoms
    ADD CONSTRAINT symptoms_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

