const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const productFile = path.join(__dirname, "data", "products.json");

const readProducts = () => {
    if (!fs.existsSync(productFile)) return [];
    return JSON.parse(fs.readFileSync(productFile, "utf8"));
};

const writeProducts = (data) => {
    fs.writeFileSync(productFile, JSON.stringify(data, null, 2), "utf8");
};

// ===== GET ALL =====
app.get("/api/products", (req, res) => {
    res.json(readProducts());
});

// ===== ADD =====
app.post("/api/products", (req, res) => {
    const products = readProducts();

    const newProduct = {
        id: Date.now(),
        ...req.body
    };

    products.push(newProduct);
    writeProducts(products);

    res.status(201).json(newProduct);
});

// ===== UPDATE =====
app.put("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const products = readProducts();

    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    products[index] = { id, ...req.body };
    writeProducts(products);

    res.json(products[index]);
});

// ===== DELETE =====
app.delete("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const products = readProducts().filter(p => p.id !== id);

    writeProducts(products);
    res.json({ message: "Đã xóa sản phẩm" });
});

app.listen(PORT, () => {
    console.log(` Server chạy: http://localhost:${PORT}`);
});
