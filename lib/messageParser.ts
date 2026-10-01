interface ParsedSegment {
  type: 'text' | 'link' | 'phone' | 'email';
  content: string;
  href?: string;
}

export function parseMessage(text: string): ParsedSegment[] {
  if (!text) return [];

  const segments: ParsedSegment[] = [];
  
  // Regex patterns
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const phonePattern = /(\+?[\d\s\-\(\)]{10,})/g;
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  
  // Combined pattern to match all types
  const combinedPattern = new RegExp(
    `(${urlPattern.source})|(${phonePattern.source})|(${emailPattern.source})`,
    'gi'
  );

  let lastIndex = 0;
  let match;

  while ((match = combinedPattern.exec(text)) !== null) {
    const fullMatch = match[0];
    const matchIndex = match.index;

    // Add text before the match
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, matchIndex)
      });
    }

    // Determine the type of match
    if (fullMatch.match(urlPattern)) {
      let href = fullMatch;
      if (!href.startsWith('http://') && !href.startsWith('https://')) {
        href = 'https://' + href;
      }
      segments.push({
        type: 'link',
        content: fullMatch,
        href: href
      });
    } else if (fullMatch.match(emailPattern)) {
      segments.push({
        type: 'email',
        content: fullMatch,
        href: `mailto:${fullMatch}`
      });
    } else if (fullMatch.match(phonePattern)) {
      // Clean phone number for tel: link
      const cleanPhone = fullMatch.replace(/[\s\-\(\)]/g, '');
      segments.push({
        type: 'phone',
        content: fullMatch,
        href: `tel:${cleanPhone}`
      });
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return segments;
}