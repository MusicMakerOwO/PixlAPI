module.exports = function ResolveIP(req) {
	const [ IPv6, IPv4 ] = (req.headers['x-forwarded-for'] ?? '').split(',');
	return IPv6 || IPv4 || '127.0.0.1';
}