
-- Add new columns to questions table for Evidence Analysis
ALTER TABLE questions 
ADD COLUMN iso_27001_control TEXT,
ADD COLUMN description TEXT,
ADD COLUMN feedback_to_ai TEXT,
ADD COLUMN field_audit_findings TEXT,
ADD COLUMN control_evaluation_by_ai TEXT,
ADD COLUMN remediation_guidance TEXT,
ADD COLUMN feedback_for_remediation TEXT;
