require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticateToken = require("../middleware/auth");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Database connection
const db = new Pool({
  host: "localhost",
  user: "postgres",
  password: "12345678",
  database: "subbagian",
  port: 5432,
});

db.connect((err) => {
  if (err) {
    console.error("Error connection to database :", err);
    return;
  }
  console.log("Connected to the Database");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Secret key untuk JWT
const JWT_SECRET = process.env.JWT_SECRET || "react";

// Endpoint login
app.post("/login", async (req, res) => {
  const { username, password, roles_id } = req.body;

  try {
    // Validasi input
    if (!username || !password || !roles_id) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Query ke database untuk mencari user berdasarkan username dan role
    const result = await db.query(
      `SELECT u.*, d.division_name 
   FROM users u
   INNER JOIN divisions d ON u.division_id = d.division_id
   WHERE u.username = $1 AND u.roles_id = $2`,
      [username, roles_id]
    );

    const users = result.rows[0];

    // Jika user tidak ditemukan
    if (!users) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, users.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        user_id: users.user_id,
        username: users.username,
        roles_id: users.roles_id,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Kirim respons
    res.json({
      message: "Login successfull",
      token: token,
      roles_id: users.roles_id, // Mengembalikan role untuk redirect di frontend
      user_id: users.user_id,
      full_name: users.full_name,
      division_name: users.division_name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

app.get("/users/:user_id", async (req, res) => {
  const userId = parseInt(req.params.user_id, 10); // Konversi ke integer

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const query = `
      SELECT 
        u.full_name,
        d.division_name 
      FROM users u
      INNER JOIN divisions d ON u.division_id = d.division_id
      WHERE u.user_id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

// Endpoint untuk mendapatkan data kategori barang
app.get("/categories", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM categories WHERE category_id != 3"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/items", async (req, res) => {
  const { category_id } = req.query;
  try {
    const result = await db.query(
      `SELECT i.item_id, i.item_name, i.stock, c.category_name 
      FROM items i
      JOIN
      categories c ON i.category_id = c.category_id 
      WHERE 
      i.category_id = $1`,
      [category_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//MENAMBAHKAN PERMINTAAN
app.post("/requests/batch", async (req, res) => {
  const { user_id, requests } = req.body; // Menerima user_id dan requests dari body
  if (!user_id || !requests || requests.length === 0) {
    return res.status(400).json({ message: "Data permintaan tidak valid" });
  }

  try {
    await db.query("BEGIN"); // Mulai transaksi

    const batchDetails = [];

    for (const request of requests) {
      const { item_id, quantity, reason } = request;

      // Validasi stok barang
      const itemResult = await db.query(
        `SELECT i.item_id, i.item_name, i.stock, c.category_name 
        FROM items i 
        JOIN categories c ON i.category_id = c.category_id 
        WHERE i.item_id = $1 `, // Ambil category_id juga
        [item_id]
      );
      if (itemResult.rows.length === 0) {
        throw new Error(`Barang dengan ID ${item_id} tidak ditemukan`);
      }
      if (!item_id) {
        throw new Error("Item ID tidak valid atau tidak dikirimkan");
      }

      const { item_name, stock, category_name } = itemResult.rows[0];

      if (stock < quantity) {
        throw new Error(
          `Stok barang dengan ID ${item_id} tidak mencukupi. Stok saat ini: ${stock}`
        );
      }

      // Kurangi stok barang
      await db.query("UPDATE items SET stock = stock - $1 WHERE item_id = $2", [
        quantity,
        item_id,
      ]);

      // Simpan permintaan dengan mengambil category_id dari item
      await db.query(
        `
        INSERT INTO requests (item_id, quantity, reason, requested_by, status)
        VALUES ($1, $2, $3, $4, 'pending')`,
        [item_id, quantity, reason, user_id] // Menggunakan requested_by sebagai user_id
      );
      // Menambahkan item_name ke dalam batchDetails
      batchDetails.push({
        item_name, // Menambahkan item_name ke dalam batchDetails
        category_name,
        quantity,
        stock,
        reason,
      });
      console.log("Item Data:", itemResult.rows);
      console.log("Batch Details to be sent:", batchDetails);
    }

    await db.query("COMMIT"); // Selesaikan transaksi
    res.status(201).json({ message: "Permintaan berhasil diajukan" });
  } catch (error) {
    await db.query("ROLLBACK"); // Batalkan transaksi jika terjadi error
    console.error("Error processing batch requests:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
    console.log("Received batch requests:", req.body);
  }
});

// Endpoint untuk mendapatkan daftar permintaan user
app.get("/requests", async (req, res) => {
  const { user_id } = req.query;
  console.log("Received user_id:", user_id); // Debugging

  if (!user_id) {
    return res.status(400).json({ message: "User ID diperlukan" });
  }

  try {
    const result = await db.query(
      `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total_requests
      FROM 
        requests 
      WHERE 
        requested_by = $1
      GROUP BY 
        DATE(created_at)
      ORDER BY 
        DATE(created_at) DESC
      `,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching requests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint: Menampilkan Detail Permintaan
app.get("/requests/detail/:date", async (req, res) => {
  const { date } = req.params;
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "User ID diperlukan" });
  }

  try {
    const result = await db.query(
      `SELECT 
          r.request_id,
          r.quantity,
          r.reason,
          r.rejection_reason,
          r.status,
          r.created_at,
          u.full_name AS requested_by,
          i.item_name,
          i.unit
       FROM 
          requests r
          INNER JOIN
          users u  ON r.requested_by = u.user_id
          INNER JOIN
          items i ON r.item_id = i.item_id
       WHERE 
          requested_by = $1 AND DATE(created_at) = $2`,
      [user_id, date]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching request details:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

//menampilkan daftar persetujuan kepala unit
app.get("/requestsApprovHead/head-approval/:division", async (req, res) => {
  const { division } = req.params; // Divisi kepala unit dari localStorage

  try {
    const result = await db.query(
      `SELECT 
        r.requested_by AS user_id,
        u.full_name,
        COUNT(DISTINCT r.request_id) AS total_requests,
        r.created_at, 
        d.division_name, 
        r.status
      FROM 
        requests r
      JOIN 
        users u ON r.requested_by = u.user_id
      JOIN 
        divisions d ON u.division_id = d.division_id
      WHERE 
        d.division_name = $1 
        AND r.status = 'pending'
      GROUP BY 
        r.requested_by, u.full_name, d.division_name, r.created_at, r.status
      ORDER BY 
        u.full_name, r.created_at DESC;`,
      [division]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching request details:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

//menampilkan detail persetujuan kepala unit
app.get(
  "/requestsApprovHead/head-approval/details/:created_at",
  authenticateToken,
  async (req, res) => {
    const { created_at } = req.params; // Tanggal dari frontend
    const user_id = req.user.user_id; // Mengambil user_id dari sesi atau token autentikasi
    console.log("User ID:", user_id);
    console.log("Created At received by Backend:", created_at);
    try {
      // Ambil division_id dari user_id
      const divisionResult = await db.query(
        `
        SELECT division_id
        FROM users
        WHERE user_id = $1;
        `,
        [user_id]
      );

      if (divisionResult.rows.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan.",
        });
      }

      const division_id = divisionResult.rows[0].division_id;

      // Ambil semua request_id yang sesuai
      const requestIdsResult = await db.query(
        `
         SELECT r.request_id, r.status
        FROM requests r
        JOIN users u ON r.requested_by = u.user_id
        WHERE u.division_id = $1
          AND r.status = 'pending'
          AND r.created_at::date = $2;
        `,
        [division_id, created_at]
      );

      const requestIds = requestIdsResult.rows.map((row) => row.request_id);

      console.log("Request IDs from first query:", requestIds);

      if (requestIds.length === 0) {
        return res.status(404).json({
          message: "Tidak ada detail permintaan yang sesuai.",
        });
      }

      const detailResult = await db.query(
        `
      SELECT 
        r.request_id, 
        r.item_id, 
        r.requested_by AS user_id,
        u.full_name,
        i.item_name, 
        r.quantity, 
        r.reason, 
        r.status, 
        r.rejection_reason,
        d.division_name AS user_division,
        r.created_at
      FROM 
        requests r
      JOIN 
        items i ON r.item_id = i.item_id
      JOIN 
        users u ON r.requested_by = u.user_id
      JOIN
        divisions d ON u.division_id = d.division_id 
      WHERE 
        r.request_id = ANY($1::int[]);
      `,
        [requestIds]
      );

      console.log("Detail Result:", detailResult.rows);

      if (detailResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Detail permintaan tidak ditemukan." });
      }

      res.status(200).json(detailResult.rows); // Mengirimkan detail permintaan
    } catch (error) {
      console.error("Error fetching detail persetujuan:", error.message);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  }
);

//mengupdate status disetujui atau ditolak kepala unit
app.put("/requestsApprovHead/:request_id/head-approval", async (req, res) => {
  const { request_id } = req.params;
  const { status, rejection_reason } = req.body;

  try {
    // Validasi input status
    if (!["Approved by Head", "Rejected by Head"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid." });
    }

    // Validasi alasan penolakan
    if (
      status === "Rejected by Head" &&
      (!rejection_reason || rejection_reason.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "Alasan penolakan harus diisi jika ditolak." });
    }

    // Ambil data permintaan
    const request = await db.query(
      `SELECT item_id, quantity,status FROM requests WHERE request_id = $1`,
      [request_id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ message: "Permintaan tidak ditemukan." });
    }

    const { item_id, quantity, status: currentStatus } = request.rows[0];

    // Cek jika permintaan sudah disetujui/ditolak sebelumnya
    if (currentStatus !== "pending") {
      return res
        .status(400)
        .json({ message: "Permintaan sudah diproses sebelumnya." });
    }

    // Update status permintaan
    await db.query(
      "UPDATE requests SET status = $1, rejection_reason = $2 WHERE request_id = $3 AND status = 'pending'",
      [status, rejection_reason || null, request_id]
    );

    // Jika ditolak, kembalikan stok barang
    if (status === "Rejected by Head") {
      await db.query(
        `UPDATE items 
       SET stock = stock + $1 
       WHERE item_id = $2`,
        [quantity, item_id]
      );
    }
    res.json({ message: "Persetujuan kepala unit berhasil diperbarui." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui persetujuan kepala unit." });
  }
});

//menampilkan daftar persetujuan staff
app.get("/requestsApprovalAdmin/:division", async (req, res) => {
  const { division } = req.params; // Divisi kepala unit dari localStorage

  try {
    const result = await db.query(
      `SELECT 
      r.requested_by AS user_id,
      u.full_name,
      COUNT(DISTINCT r.request_id) AS total_requests,
      r.created_at, 
      d.division_name,
      r.status
    FROM 
      requests r
    JOIN 
      users u ON r.requested_by = u.user_id
    JOIN 
      divisions d ON u.division_id = d.division_id
    WHERE 
      d.division_name = $1 
      AND r.status = 'Approved by Head'
    GROUP BY 
      r.requested_by, u.full_name, d.division_name, r.created_at, r.status
    ORDER BY 
      u.full_name, r.created_at DESC;`,
      [division]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching request details:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

//menampilkan detail persetujuan staff
app.get(
  "/requestsApprovalAdmin/details/:created_at",
  authenticateToken,
  async (req, res) => {
    const { created_at } = req.params; // Tanggal dari frontend
    const user_id = req.user.user_id; // Mengambil user_id dari sesi atau token autentikasi
    console.log("User ID:", user_id);
    console.log("Created At received by Backend:", created_at);
    try {
      // Ambil division_id dari user_id
      const divisionResult = await db.query(
        `
        SELECT division_id
        FROM users
        WHERE user_id = $1;
        `,
        [user_id]
      );

      if (divisionResult.rows.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan.",
        });
      }

      const division_id = divisionResult.rows[0].division_id;

      // Ambil semua request_id yang sesuai
      const requestIdsResult = await db.query(
        `
        SELECT r.request_id, r.status
        FROM requests r
        JOIN users u ON r.requested_by = u.user_id
        WHERE u.division_id = $1
          AND r.status = 'Approved by Head'
          AND r.created_at::date = $2;
        `,
        [division_id, created_at]
      );

      const requestIds = requestIdsResult.rows.map((row) => row.request_id);

      console.log("Request IDs from first query:", requestIds);

      if (requestIds.length === 0) {
        return res.status(404).json({
          message: "Tidak ada detail permintaan yang sesuai.",
        });
      }

      const detailResult = await db.query(
        `
      SELECT 
        r.request_id, 
        r.item_id, 
        r.requested_by AS user_id,
        u.full_name,
        i.item_name, 
        r.quantity, 
        r.reason, 
        r.status, 
        r.rejection_reason,
        d.division_name AS user_division,
        r.created_at
      FROM 
        requests r
      JOIN 
        items i ON r.item_id = i.item_id
      JOIN 
        users u ON r.requested_by = u.user_id
      JOIN
        divisions d ON u.division_id = d.division_id 
      WHERE 
        r.request_id = ANY($1::int[]);
      `,
        [requestIds]
      );

      console.log("Detail Result:", detailResult.rows);

      if (detailResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Detail permintaan tidak ditemukan." });
      }

      res.status(200).json(detailResult.rows); // Mengirimkan detail permintaan
    } catch (error) {
      console.error("Error fetching detail persetujuan:", error.message);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  }
);

app.put(
  "/requestsApprovalAdmin/:request_id/admin-approval",
  async (req, res) => {
    const { request_id } = req.params;
    const { status, rejection_reason } = req.body;
    try {
      if (status === "Rejected by Staff SBUM" && !rejection_reason) {
        return res
          .status(400)
          .json({ message: "Alasan penolakan harus diisi jika ditolak." });
      }

      // Ambil data permintaan untuk mendapatkan jumlah barang dan item_id
      const request = await db.query(
        `SELECT item_id, quantity FROM requests WHERE request_id = $1`,
        [request_id]
      );

      if (request.rows.length === 0) {
        return res.status(404).json({ message: "Permintaan tidak ditemukan." });
      }
      const req = await db.query(
        `SELECT status FROM requests WHERE request_id = $1`,
        [request_id]
      );
      console.log("Status saat ini:", req.rows[0]?.status);

      const { item_id, quantity } = request.rows[0];

      // Update status permintaan
      await db.query(
        `UPDATE 
      requests 
      SET 
      status = $1, rejection_reason = $2 
      WHERE 
      request_id = $3 AND status = 'Approved by Head'`,
        [status, rejection_reason || null, request_id]
      );

      // Jika ditolak, kembalikan stok barang
      if (status === "Rejected by Staff SBUM") {
        await db.query(
          `UPDATE items 
         SET stock = stock + $1 
         WHERE item_id = $2`,
          [quantity, item_id]
        );
      }

      res.json({ message: "Persetujuan admin berhasil diperbarui." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Gagal memperbarui persetujuan oleh Admin." });
    }
  }
);

///CRUD MANAJEMEN BARANG
// CREATE: Tambah Barang
app.post("/items", async (req, res) => {
  const { item_code, item_name, category_id, unit, stock } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO items (item_code, item_name, category_id, unit, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [item_code, item_name, category_id, unit, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// READ: Dapatkan Barang Berdasarkan Kategori
app.get("/manage/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  const categoryIdInt = parseInt(categoryId, 10);
  if (isNaN(categoryIdInt)) {
    return res.status(400).send("Invalid category ID");
  }

  try {
    const result = await db.query(
      "SELECT * FROM items WHERE category_id = $1",
      [categoryId]
    );
    res.json(result.rows); // kirim data ke frontend
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
});

// Mengupdate data item berdasarkan id
app.put("/items/:itemId", async (req, res) => {
  const { itemId } = req.params; // Mengambil item_id dari URL parameter
  const { item_code, item_name, category_id, unit, stock } = req.body;

  try {
    // Update data berdasarkan item_id
    const result = await db.query(
      `UPDATE items SET item_code = $1, item_name = $2, category_id = $3, unit = $4, stock = $5 WHERE item_id = $6 RETURNING *`,
      [item_code, item_name, category_id, unit, stock, itemId]
    );

    // Jika item tidak ditemukan
    if (result.rowCount === 0) {
      return res.status(404).send("Item not found");
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error during PUT request:", error); // Menampilkan error di console
    res.status(500).send("Server Error");
  }
});

app.delete("/items/:itemId", async (req, res) => {
  const { itemId } = req.params; // Mengambil item_id dari URL parameter

  try {
    // Menghapus item berdasarkan item_id
    const result = await db.query(
      "DELETE FROM items WHERE item_id = $1 RETURNING *",
      [itemId]
    );

    // Jika tidak ada item yang dihapus
    if (result.rowCount === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).send("Item deleted successfully");
  } catch (error) {
    console.error("Error during DELETE request:", error); // Menampilkan error di console
    res.status(500).send("Server Error");
  }
});
