import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";
import SubMenu from "../../components/SubMenu";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Google test key

const NewProductForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories from the backend
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();
        if (response.ok) {
          setCategories(data);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (error) {
        setError("Error fetching categories");
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!recaptchaToken) {
      setError("Vui lòng xác thực reCAPTCHA!");
      setIsLoading(false);
      return;
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      setError("Giá sản phẩm phải là số dương!");
      setIsLoading(false);
      return;
    }
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      setError("Số lượng phải là số nguyên dương!");
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("title", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", category);
    formData.append("quantity", quantity);
    if (image) formData.append("image", image);
    formData.append("recaptchaToken", recaptchaToken);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/sell");
      } else {
        setError(data.message || "Failed to create product");
      }
    } catch (error) {
      setError("Error creating product");
      console.error("Error creating product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Đăng bán sản phẩm</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tên sản phẩm
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Giá
            </label>
            <input
              type="text"
              id="price"
              value={price}
              onChange={e => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val) || val === "") setPrice(val);
              }}
              min={1}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Danh mục
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Số lượng
            </label>
            <input
              type="text"
              id="quantity"
              value={quantity}
              onChange={e => {
                const val = e.target.value;
                if (/^\d*$/.test(val) || val === "") setQuantity(val);
              }}
              min={1}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Hình ảnh
            </label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              required
            />
          </div>
          <div>
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Tạo sản phẩm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProductForm; 