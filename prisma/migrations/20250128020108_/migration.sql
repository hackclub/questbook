/*
  Warnings:

  - The values [STARTED_FLOW,OPENED_COC] on the enum `Stage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Stage_new" AS ENUM ('INITIALIZED', 'OPENED_LID', 'SHOW_COC', 'ACCEPTED_COC', 'FINISHED');
ALTER TABLE "User" ALTER COLUMN "tutorial_stage" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "tutorial_stage" TYPE "Stage_new" USING ("tutorial_stage"::text::"Stage_new");
ALTER TYPE "Stage" RENAME TO "Stage_old";
ALTER TYPE "Stage_new" RENAME TO "Stage";
DROP TYPE "Stage_old";
ALTER TABLE "User" ALTER COLUMN "tutorial_stage" SET DEFAULT 'INITIALIZED';
COMMIT;
