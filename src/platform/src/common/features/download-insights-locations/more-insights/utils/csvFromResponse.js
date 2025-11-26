export default function csvFromResponse(res) {
  let csv = '';
  if (typeof res === 'string') {
    csv = res.replace(/^resp/, '');
  } else if (res?.data) {
    const rows = Array.isArray(res.data) ? res.data : [res.data];
    const headers = Object.keys(rows[0] || {}).join(',');
    const body = rows.map((r) => Object.values(r).join(',')).join('\n');
    csv = `${headers}\n${body}`;
  }
  return csv;
}
