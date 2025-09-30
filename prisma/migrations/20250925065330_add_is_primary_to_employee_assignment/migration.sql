-- AlterTable
ALTER TABLE "hr"."EmployeeAssignment" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "hr"."EmployeeAssignment" ADD CONSTRAINT "EmployeeAssignment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."EmployeeAssignment" ADD CONSTRAINT "EmployeeAssignment_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "org"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."EmployeeAssignment" ADD CONSTRAINT "EmployeeAssignment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hr"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."EmployeeAssignment" ADD CONSTRAINT "EmployeeAssignment_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "catalog"."Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."EmployeeAssignment" ADD CONSTRAINT "EmployeeAssignment_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "catalog"."Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
