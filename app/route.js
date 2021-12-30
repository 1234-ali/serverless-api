const bcrypt = require('bcryptjs');
const pool = require('./db');

module.exports = function(app) {
    app.get('/testdb', async (req, res) => {
        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.query('SHOW DATABASES');

            await connection.release();

            res.status(200).json(rows);
        } catch (err) {
            res.status(505).json({
                message: JSON.stringify(err),
                success: false
            });
        }
    });

    app.post('/addUser', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).send({success: false, message:'Fields are empty!'});
        }

        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', 
                [
                    email
                ]
            );

            if (rows.length > 0) {
                await connection.release();

                return res.status(404).json({
                    message: 'Account already exists!',
                    success: false
                });
            }

            const hashedPassword = bcrypt.hashSync(password, 8);

            await connection.query('INSERT INTO users(email, password) VALUES (?, ?)', 
                [ 
                    email, 
                    hashedPassword
                ]
            );

            await connection.release();

            res.status(200).json({ 
                message:  `User added Successfully`,
                success: true
            });
        } catch (err) {
            res.status(505).json({
                message: err.message,
                success: false
            });
        }
    });

    app.put('/updateUser/:id', async (req, res) => {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!id || !oldPassword || !newPassword) {
            return res.status(404).send({success: false, message:'Fields are empty!'});
        }

        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', 
                [
                    id
                ]
            );

            const isMatch = bcrypt.compareSync(oldPassword, rows[0].password);

            if (!isMatch) {
                await connection.release();

                return res.status(404).json({
                    message: 'Old password is not correct!',
                    success: false
                });
            }

            const hashedPassword = bcrypt.hashSync(newPassword, 10);

            await connection.query('UPDATE users SET password = ? WHERE id = ?', 
                [
                    hashedPassword,
                    id
                ]
            );

            await connection.release();

            res.status(200).json({ 
                message:  `User updated Successfully`,
                success: true
            });
        } catch (err) {
            res.status(505).json({
                message: err.message,
                success: false
            });
        }
    });

    app.delete('/deleteUser/:id', async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(404).send({success: false, message:'Fields are empty!'});
        }

        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.query('DELETE FROM users WHERE id = ?', 
                [
                    id
                ]
            );

            await connection.release();

            res.status(200).json({ 
                message:  `User deleted Successfully`,
                success: true
            });
        } catch (err) {
            res.status(505).json({
                message: err.message,
                success: false
            });
        }
    });

    app.get('/listUsers', async (req, res) => {
        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.query('Select * FROM users');

            await connection.release();

            res.status(200).json({ 
                users: rows,
                success: true
            });
        } catch (err) {
            res.status(505).json({
                message: err.message,
                success: false
            });
        }
    });

    app.get('/getUserByEmail/:email', async (req, res) => {
        const { email } = req.params;

        if (!email) {
            return res.status(404).send({success: false, message:'Fields are empty!'});
        }

        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.query('Select * FROM users WHERE email = ?',
                [
                    email
                ]
            );

            await connection.release();

            res.status(200).json({ 
                user: rows[0],
                success: true
            });
        } catch (err) {
            res.status(505).json({
                message: err.message,
                success: false
            });
        }
    });

    app.post('/addStudio', async (req, res) => {
        const { userId, studio } = req.body;

        if (!userId || !studio) {
            return res.status(404).send({success: false, message:'Fields are empty!'});
        }

        try {
            const connection = await pool.getConnection();

            let [rows] = await connection.query('SELECT * FROM users WHERE id = ?', 
                [
                    userId
                ]
            );

            if (rows.length === 0) {
                await connection.release();

                return res.status(404).json({
                    message: 'No user exists!',
                    success: false
                });
            }

            [rows] = await connection.query('SELECT * FROM studio WHERE name = ?', 
                [
                    studio
                ]
            );

            if (rows.length > 0) {
                await connection.release();

                return res.status(404).json({
                    message: 'Name Already Exists!',
                    success: false
                });
            }

            await connection.query('INSERT INTO studio(name, userId) VALUES (?, ?)', 
                [ 
                    userId, 
                    studio
                ]
            );

            await connection.release();

            res.status(200).json({ 
                message:  `User added Successfully`,
                success: true
            });
        } catch (err) {
            res.status(505).json({
                message: err.message,
                success: false
            });
        }
    });

    app.post('/getStudioById/:id', async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(404).send({success: false, message:'Fields are empty!'});
        }

        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.query('SELECT * FROM users us, studio st WHERE us.id = st.userId AND us.id in ?', 
                [
                    id
                ]
            );

            await connection.release();

            res.status(200).json({ 
                data: rows,
                success: true
            });
        } catch (err) {
            res.status(505).json({
                message: err.message,
                success: false
            });
        }
    });
};