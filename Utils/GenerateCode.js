const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
module.exports = function GenerateCode(length = 8) {
	const result = new Array(length);
	for (let i = 0; i < length; i++) {
		result[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
	}
	return result.join('');
}
