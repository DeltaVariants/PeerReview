export function checkLeaderPassword(password: string): boolean {
  const correctPassword = process.env.LEADER_PASSWORD || 'admin123';
  return password === correctPassword;
}

export function setLeaderSession() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('leader_auth', 'true');
  }
}

export function clearLeaderSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('leader_auth');
  }
}

export function isLeaderAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('leader_auth') === 'true';
  }
  return false;
}
