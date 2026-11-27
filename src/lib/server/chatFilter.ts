/**
 * Safety check for chat messages. It runs on the server before a message is saved, so it cannot be
 * skipped by editing the app. It blocks phone numbers, emails, links, social handles, off-platform
 * contact requests and requests for money. It cannot catch everything (people get creative), which is
 * why chats also have a Report button and a review list.
 */

export type BlockReason = 'phone' | 'email' | 'link' | 'handle' | 'contact' | 'money';

export type FilterResult = { ok: true } | { ok: false; reason: BlockReason; message: string };

const MESSAGES: Record<BlockReason, string> = {
	phone: "For your safety, phone numbers can't be shared in chat.",
	email: "For your safety, email addresses can't be shared in chat.",
	link: "For your safety, links and websites can't be shared in chat.",
	handle: "For your safety, social media handles can't be shared in chat.",
	contact: "For your safety, please keep the conversation in the Gidi Tour chat.",
	money: "For your safety, requests for money or bank details aren't allowed. Pay only through Gidi Tour."
};

const block = (reason: BlockReason): FilterResult => ({ ok: false, reason, message: MESSAGES[reason] });

const NUMBER_WORDS: Record<string, string> = {
	zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9'
};

const ZERO_WIDTH = /[​-‏⁠﻿]/g;

// Words that are only ever used for off-platform contact or money. Checked again with every
// space and symbol removed, so "w h a t s a p p" and "w.h.a.t.s.a.p.p" are caught too.
const STRONG_COMPACT = ['whatsapp', 'telegram', 'westernunion', 'moneygram', 'accountnumber', 'bankaccount', 'cashapp', 'bankdetails'];

const CONTACT =
	/\b(whats\s?app|whatsap|watsapp|telegram|snapchat|instagram|insta|facebook|messenger|wechat|viber|signal app|call me|text me|sms me|dm me|inbox me|ring me|my (phone )?number|my (whatsapp|contact|line)|reach me (on|at|outside)|contact me (on|at|outside)|chat (me )?outside|outside (the )?app)\b/;

const MONEY =
	/\b(send (me )?(the |some )?(money|cash|funds)|transfer (me|the money|funds|to my)|(send|make|do) (a )?(bank |wire )?transfer|bank transfer|wire transfer|wire (me|money)|bank (account|details)|account (number|no|details)|sort code|iban|swift code|routing number|western union|moneygram|cash ?app|zelle|venmo|paypal|bitcoin|btc|crypto|usdt|gift ?card|pay (me|directly|cash|outside|offline)|payment (outside|offline|directly)|opay|palmpay|moniepoint|kuda|ussd)\b/;

const EMAIL = /[a-z0-9._%+-]+\s*(?:@|\(at\)|\[at\])\s*[a-z0-9-]+\s*(?:\.|\(dot\)|\[dot\])\s*[a-z]{2,}/;
const EMAIL_PROVIDER = /\b(gmail|googlemail|yahoo|hotmail|outlook|icloud|protonmail|aol)\b/;
const HANDLE = /(^|[\s(])@[a-z0-9_.]{3,}/;
const LINK = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]{2,}\.(com|net|org|io|co|me|ng|ly|app|link|xyz|info|biz)\b/;

// Dates and times are fine: "12/11/2026", "10:30".
const DATE = /\b\d{1,4}[/.\-]\d{1,2}[/.\-]\d{2,4}\b(?![/.\-]?\d)/g;
const TIME = /\b\d{1,2}:\d{2}\b/g;

// 8 or more digits in a row, allowing a few separators between them.
const DIGIT_RUN = /(?:\d[\s\-._()]{0,2}){8,}/;
const PLUS_NUMBER = /\+\s?\d[\d\s\-.()]{5,}/;

export function checkMessage(raw: string): FilterResult {
	const text = raw.normalize('NFKC').replace(ZERO_WIDTH, '').toLowerCase();

	// Spoken numbers: "zero eight zero one two three ..."
	const spoken = text.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine)\b/g, (w) => NUMBER_WORDS[w]);
	const forDigits = spoken.replace(DATE, ' ').replace(TIME, ' ');

	if (PLUS_NUMBER.test(forDigits) || DIGIT_RUN.test(forDigits)) return block('phone');
	if (EMAIL.test(text) || EMAIL_PROVIDER.test(text)) return block('email');
	if (LINK.test(text)) return block('link');
	if (HANDLE.test(text)) return block('handle');
	if (MONEY.test(text)) return block('money');
	if (CONTACT.test(text)) return block('contact');

	const compact = text.replace(/[^a-z0-9]/g, '');
	for (const word of STRONG_COMPACT) {
		if (compact.includes(word)) return block(word.includes('bank') || word.includes('account') || word.includes('union') || word.includes('gram') || word === 'cashapp' ? 'money' : 'contact');
	}

	return { ok: true };
}
