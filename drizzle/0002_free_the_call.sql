ALTER TABLE `exams` ADD `class_code` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `exams_class_code_unique` ON `exams` (`class_code`);