ALTER TABLE user_notification_preferences
ADD COLUMN notify_by_sms boolean NOT NULL DEFAULT false;
