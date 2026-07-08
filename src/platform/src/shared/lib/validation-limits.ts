/**
 * Centralized, reasonable input length limits for the application.
 *
 * Use these constants in Zod schemas, HTML maxLength attributes, and custom
 * validators so that short fields (e.g. first/last name) cannot accept
 * paragraph-long input while longer text areas still have a sane upper bound.
 */

// ─── User / Auth ───
export const FIRST_NAME_MAX = 50;
export const LAST_NAME_MAX = 50;
export const FULL_NAME_MAX = 100;
export const EMAIL_MAX = 254; // RFC 5321 compliant upper bound
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const JOB_TITLE_MAX = 100;
export const PHONE_MAX = 30;
export const USER_BIO_MAX = 500;

// ─── Organization / Group ───
export const GROUP_TITLE_MAX = 120;
export const GROUP_DESCRIPTION_MAX = 500;
export const GROUP_INDUSTRY_MAX = 100;
export const GROUP_TIMEZONE_MAX = 100;
export const GROUP_WEBSITE_MAX = 200;

// ─── Organization Request ───
export const PROJECT_NAME_MAX = 120;
export const CITY_MAX = 100;
export const COUNTRY_MAX = 100;
export const FUNDER_PARTNER_MAX = 120;
export const CONTACT_NAME_MAX = 100;
export const USE_CASE_MAX = 1000;

// ─── Roles ───
export const ROLE_NAME_MAX = 50;
export const ROLE_CODE_MAX = 50;
export const ROLE_DESCRIPTION_MAX = 250;

// ─── Security ───
export const PROVIDER_NAME_MAX = 100;
export const ASN_MAX = 20;
export const CIDR_RANGE_MAX = 20;
export const BLOCK_REASON_MAX = 500;
export const RESOLUTION_NOTE_MAX = 1000;

// ─── Feedback / Communication ───
export const FEEDBACK_MESSAGE_MAX = 2000;
export const FEEDBACK_REPLY_MAX = 2000;
export const ADMIN_NOTES_MAX = 2000;
export const WATCHER_NAME_MAX = 100;

// ─── Webhooks ───
export const WEBHOOK_NAME_MAX = 100;
export const WEBHOOK_URL_MAX = 500;
export const WEBHOOK_SECRET_MAX = 255;

// ─── Surveys ───
export const SURVEY_TITLE_MAX = 120;
export const SURVEY_DESCRIPTION_MAX = 500;
export const SURVEY_QUESTION_MAX = 500;
export const SURVEY_OPTION_MAX = 1000;
export const SURVEY_PLACEHOLDER_MAX = 200;

// ─── Data Visualizer ───
export const CHART_TITLE_MAX = 120;
export const CHART_SUBTITLE_MAX = 200;
export const CHART_AXIS_LABEL_MAX = 100;
export const CHART_REFERENCE_LABEL_MAX = 100;
export const HEX_COLOR_MAX = 7;

// ─── Email lists / Misc ───
export const EMAIL_LIST_MAX = 2000; // comma/newline separated lists
export const SEARCH_TERM_MAX = 100;
export const TEXTAREA_DEFAULT_MAX = 2000;
export const REJECTION_REASON_MAX = 500;
