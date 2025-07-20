const Database = require("../../Database");
module.exports = {
	method: 'POST',
	route: '/lobby/leave',
	params: {
		token: 'string',
	},
	handler: async (req) => {
		const token = req.body.token.trim();
		Database.prepare(`
			DELETE FROM Players
			WHERE user_id = (
				SELECT user_id FROM Users WHERE token = ?
			)
		`).run(token);



		return { status: 200 };
	}
}
