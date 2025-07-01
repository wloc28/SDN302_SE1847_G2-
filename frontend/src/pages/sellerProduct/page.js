"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import MainHeader from "../../components/MainHeader"
import TopMenu from "../../components/TopMenu"
import SubMenu from "../../components/SubMenu"
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaGavel,
  FaEye,
  FaChartLine,
  FaTimes,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEyeSlash,
} from "react-icons/fa"

const SellerProducts = () => {
  const navigate = useNavigate()
  const [productsDetails, setProductsDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("idProduct")
  const [sortDirection, setSortDirection] = useState("asc")
  const [filterHidden, setFilterHidden] = useState("all")

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const didFetch = useRef(false)

  useEffect(() => {
    if (!currentUser || !currentUser.id || didFetch.current) return
    didFetch.current = true
    const fetchSellerProducts = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(
          `http://localhost:5000/api/products/seller/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        if (!response.ok) {
          throw new Error("Không thể lấy danh sách sản phẩm của người bán")
        }
        const products = await response.json()
        setProductsDetails(products)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSellerProducts()
  }, [currentUser])

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể xóa sản phẩm.")
      }

      setProductsDetails(productsDetails.filter((p) => p._id !== productId))
    } catch (err) {
      console.error("Delete Error:", err)
      alert("Không thể xóa sản phẩm: " + err.message)
    }
  }

  const handleToggleHideProduct = async (productId, hidden) => {
    const confirmMsg = hidden ? "Bạn có chắc muốn hiện sản phẩm này?" : "Bạn có chắc muốn ẩn sản phẩm này?"
    if (!window.confirm(confirmMsg)) return

    try {
      const token = localStorage.getItem("token")
      const endpoint = hidden ? "show" : "hide"
      const response = await fetch(`http://localhost:5000/api/products/${productId}/${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Không thể cập nhật trạng thái sản phẩm.")
      const updatedProduct = await response.json()
      setProductsDetails(productsDetails.map((p) => (p._id === productId ? updatedProduct : p)))
    } catch (err) {
      alert("Lỗi: " + err.message)
    }
  }

  const handleEditProduct = (product) => {
    navigate(`/sell/edit-product/${product._id}`)
  }

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />
    if (sortDirection === "asc") return <FaSortUp />
    return <FaSortDown />
  }

  const filteredProducts =
    productsDetails.filter(product => {
      if (filterHidden === "active") return !product.hidden;
      if (filterHidden === "hidden") return product.hidden;
      return true;
    }).filter((product) => {
      const searchTermLower = searchTerm.toLowerCase()
      return (
        product.title?.toLowerCase().includes(searchTermLower) ||
        product.description?.toLowerCase().includes(searchTermLower)
      )
    }) || []

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valueA, valueB

    switch (sortField) {
      case "name":
        valueA = a.title || ""
        valueB = b.title || ""
        break
      case "price":
        valueA = a.price || 0
        valueB = b.price || 0
        break
      case "quantity":
        valueA = a.quantity || 0
        valueB = b.quantity || 0
        break
      case "status":
        valueA = a.hidden ? "Hidden" : "Active"
        valueB = b.hidden ? "Hidden" : "Active"
        break
      default:
        valueA = a._id
        valueB = b._id
    }

    if (typeof valueA === "string") {
      return sortDirection === "asc" ? valueA.localeCompare(valueB) : b.localeCompare(valueA)
    }
    return sortDirection === "asc" ? valueA - valueB : b - valueA
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case true:
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Đã ẩn
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Đang hoạt động
          </span>
        )
    }
  }

  if (!currentUser || !currentUser.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Chưa đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để quản lý sản phẩm của bạn.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!productsDetails || productsDetails.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Không có dữ liệu</h2>
          <p className="text-gray-600 mb-6">Không tìm thấy dữ liệu sản phẩm cho tài khoản của bạn.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                Quản lý sản phẩm
              </h1>
              <div className="relative w-full sm:w-auto">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="mb-4">
              <select
                value={filterHidden}
                onChange={e => setFilterHidden(e.target.value)}
                className="border rounded p-2"
              >
                <option value="all">Tất cả sản phẩm</option>
                <option value="active">Đang bán</option>
                <option value="hidden">Đã ẩn</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th
                      className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Tên {getSortIcon("name")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th
                      className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      Giá {getSortIcon("price")}
                    </th>
                    <th
                      className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("quantity")}
                    >
                      Số lượng {getSortIcon("quantity")}
                    </th>
                    <th
                      className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Trạng thái {getSortIcon("status")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-gray-500">
                        Không tìm thấy sản phẩm nào.
                      </td>
                    </tr>
                  ) : (
                    sortedProducts.map((product) => {
                      return (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 align-middle">
                            {product.image ? (
                              <img
                                src={product.image.startsWith('http') ? product.image : `http://localhost:5000/${product.image}`}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-md border border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </td>
                          <td className="p-3 align-middle font-medium text-gray-800">{product.title}</td>
                          <td className="p-3 align-middle text-sm text-gray-800">{product.categoryId?.name || "Không có danh mục"}</td>
                          <td className="p-3 align-middle text-sm text-gray-600 max-w-xs truncate">
                            {product.description}
                          </td>
                          <td className="p-3 align-middle text-sm text-gray-800">${product.price.toFixed(2)}</td>
                          <td className="p-3 align-middle text-sm text-gray-800">{product.quantity}</td>
                          <td className="p-3 align-middle">{getStatusBadge(product.hidden)}</td>
                          <td className="p-3 align-middle">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-all duration-200"
                                title="Sửa"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleToggleHideProduct(product._id, product.hidden)}
                                className={`p-2 rounded-full ${
                                  product.hidden
                                    ? "text-gray-600 bg-gray-100 hover:bg-gray-200"
                                    : "text-yellow-600 bg-yellow-100 hover:bg-yellow-200"
                                } transition-all duration-200`}
                                title={product.hidden ? "Hiện" : "Ẩn"}
                              >
                                {product.hidden ? <FaEye /> : <FaEyeSlash />}
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 transition-all duration-200"
                                title="Xóa"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SellerProducts

