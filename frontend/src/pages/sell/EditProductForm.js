import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";
import SubMenu from "../../components/SubMenu";

const EditProductForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [existingImage, setExistingImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [image, setImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

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

    // Fetch product data from the backend
    const fetchProduct = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`);
            const data = await response.json();
            if (response.ok) {
                setName(data.title);
                setDescription(data.description);
                setPrice(data.price);
                setCategory(data.categoryId?._id || data.categoryId);
                setQuantity(data.quantity || 1);
                setExistingImage(data.image || null);
            } else {
                setError("Failed to fetch product data");
            }
        } catch (error) {
            setError("Error fetching product data");
            console.error("Error fetching product data:", error);
        }
    }

    fetchCategories();
    fetchProduct();
  }, [id]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
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

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/sellerProduct"); // Redirect to seller products list on success
      } else {
        setError(data.message || "Failed to update product");
      }
    } catch (error) {
      setError("Error updating product");
      console.error("Error updating product:", error);
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
        <h1 className="text-2xl font-bold mb-4">Chỉnh sửa sản phẩm</h1>
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
            <label className="block text-sm font-medium text-gray-700">
              Hình ảnh hiện tại
            </label>
            <div className="mt-2 flex space-x-2">
              {existingImage ? (
                <img src={existingImage.startsWith('http') ? existingImage : `http://localhost:5000/${existingImage}`} alt="product" className="w-20 h-20 object-cover rounded-md" />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Thêm hình ảnh mới
            </label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm; 