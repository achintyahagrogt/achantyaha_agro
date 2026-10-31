/**
 * Converts Google Drive sharing links or standard image URLs into direct image source URLs.
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - Standard HTTP/HTTPS image URLs
 */
export const formatImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Pattern 1: drive.google.com/file/d/FILE_ID
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // Pattern 2: drive.google.com/open?id=FILE_ID or /uc?id=FILE_ID
  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // Pattern 3: Dropbox sharing links
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/[?&]dl=0/, '');
  }

  // Pattern 4: Uploaded images served from server in local dev
  if (trimmed.startsWith('/uploads/')) {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const isLocalOrLAN = host === 'localhost' || host === '127.0.0.1' || /^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
      if (isLocalOrLAN && window.location.port !== '5001') {
        return `http://${host}:5001${trimmed}`;
      }
    }
    return trimmed;
  }

  // Pattern 5: Hardcoded localhost in stored URLs accessed from a phone/LAN device
  if (trimmed.includes('localhost:5001/uploads/') || trimmed.includes('127.0.0.1:5001/uploads/')) {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') {
        // Replace localhost with actual device hostname (e.g., 192.168.1.x) or relative path
        const isLAN = /^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
        if (isLAN) {
          return trimmed.replace(/(?:localhost|127\.0\.0\.1):5001/, `${host}:5001`);
        }
        // In cloud/production, strip localhost:5001 to relative path
        return trimmed.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):5001/, '');
      }
    }
  }

  return trimmed;
};

