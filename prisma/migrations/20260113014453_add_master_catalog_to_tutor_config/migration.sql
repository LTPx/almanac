/*
  Warnings:

  - Added the required column `masterCatalog` to the `tutor_config` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add columns as nullable first
ALTER TABLE "public"."tutor_config"
ADD COLUMN "masterCatalog" JSONB,
ADD COLUMN "routerModel" TEXT DEFAULT 'gemini-2.0-flash',
ADD COLUMN "routerTemperature" DOUBLE PRECISION DEFAULT 0.1;

-- Step 2: Update existing rows with default Master Catalog
UPDATE "public"."tutor_config"
SET "masterCatalog" = '[
  {"id":"track_1_math","title":"The Source Code","desc":"Math, Logic, Probability, Algorithms, Number Theory"},
  {"id":"track_2_physics","title":"The Building Blocks","desc":"Physics, Chemistry, Energy, Matter, Atoms, Forces"},
  {"id":"track_3_biology","title":"The Bio-Machine","desc":"General Biology, Health, DNA, Evolution, Body Systems"},
  {"id":"track_4_language","title":"The Interface","desc":"Language, Art, Culture, Storytelling, Communication"},
  {"id":"track_5_astronomy","title":"The Stage","desc":"Astronomy, Space, Geography, Earth Science, Maps"},
  {"id":"track_6_history","title":"The Operating System","desc":"History, Civics, Justice, Laws, Economics, Democracy (Global/Theoretical context)"},
  {"id":"track_7_engineering","title":"The Workshop","desc":"Engineering, Design Thinking, Creativity, Structures, Problem Solving"},
  {"id":"ccse_spain","title":"CCSE (Ciudadanía)","desc":"Specific preparation for the Spanish Citizenship Test. Spanish Constitution, government, symbols, and culture specifically for the exam."},
  {"id":"efp_finance","title":"EFP Finance","desc":"European Financial Planning certification, technical finance standards, banking regulations."},
  {"id":"personal_finance_v2","title":"Personal Finance v2","desc":"Everyday money management, budgeting, investing, debt, and financial literacy for individuals."},
  {"id":"know_your_brain","title":"Know Your Brain","desc":"Deep dive into Neuroscience, brain architecture (amygdala, cortex), and psychology. (Distinct from general biology)."}
]'::jsonb
WHERE "masterCatalog" IS NULL;

-- Step 3: Make masterCatalog NOT NULL
ALTER TABLE "public"."tutor_config"
ALTER COLUMN "masterCatalog" SET NOT NULL;

-- Step 4: Make other columns NOT NULL with defaults
ALTER TABLE "public"."tutor_config"
ALTER COLUMN "routerModel" SET NOT NULL,
ALTER COLUMN "routerModel" SET DEFAULT 'gemini-2.0-flash',
ALTER COLUMN "routerTemperature" SET NOT NULL,
ALTER COLUMN "routerTemperature" SET DEFAULT 0.1;
