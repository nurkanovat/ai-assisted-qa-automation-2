/** Curated invalid / boundary program names for validation specs — not random. */
export const EMPTY_PROGRAM_NAME = '';
export const WHITESPACE_ONLY_PROGRAM_NAME = '   ';
export const OVER_MAX_PROGRAM_NAME = 'A'.repeat(101);
export const OVER_MAX_EDIT_PROGRAM_NAME = 'B'.repeat(257);
export const XSS_PROGRAM_DESCRIPTION = '<script>alert("xss")</script>';
export const HTML_IN_DESCRIPTION = '<b>bold</b> description';
