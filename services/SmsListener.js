import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

// This module hooks into Android's SMS broadcast receiver
// It filters specifically for MPESA sender ID
const MPESA_SENDER = 'MPESA';

export function parseMpesaSMS(body) {
  const amtMatch = body.match(/Ksh\s?([\d,]+(?:\.\d{1,2})?)/i);
  const toMatch = body.match(/(?:sent to|paid to|received from)\s+([A-Z0-9 &'\-]+?)(?:\s+\d{10,}|\s+on\s)/i);
  const refMatch = body.match(/^([A-Z0-9]{10})/);
  const dateMatch = body.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*[AP]M)/i);
  const balMatch = body.match(/balance is Ksh\s?([\d,]+(?:\.\d{1,2})?)/i);
  const typeMatch = body.match(/\b(sent to|paid to|received from|withdrew|deposited)\b/i);

  if (!amtMatch) return null;

  return {
    amount: amtMatch[1],
    to: toMatch ? toMatch[1].trim() : 'Unknown',
    ref: refMatch ? refMatch[1] : '—',
    date: dateMatch
      ? dateMatch[1] + ' ' + dateMatch[2]
      : new Date().toLocaleDateString('en-KE'),
    balance: balMatch ? balMatch[1] : null,
    type: typeMatch ? typeMatch[1].toLowerCase() : 'sent to',
    raw: body,
  };
}

export function isMpesaSMS(sender, body) {
  return (
    sender?.toUpperCase().includes(MPESA_SENDER) ||
    body?.includes('M-PESA') ||
    body?.includes('M-Pesa') ||
    (body?.includes('Ksh') && body?.includes('balance'))
  );
}