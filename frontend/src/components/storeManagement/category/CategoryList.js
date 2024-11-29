import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createCategory,
  getCategories,
  deleteCategory,
  editCategory,
  deleteProduct,
  enableProduct,
} from "../../../redux/apiRequest"; // Add updateCategory and deleteCategory functions
import axiosJWT from "../../../config/axiosJWT";
import CreateProduct from "../product/CreateProduct";
import EditProduct from "../product/EditProduct"; // Import EditProduct
import { IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faPen, faTrash, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const CategoryList = () => {
  const user = useSelector((state) => state.auth?.login.currentUser);
  const store = useSelector((state) => state.store?.store.currentStore);
  const categories = useSelector((state) => state.store?.category?.allCategories);
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [categoryToAddProduct, setCategoryToAddProduct] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null); // For editing product
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false); // For product delete confirmation
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false); // For category delete confirmation
  const [categoryToDelete, setCategoryToDelete] = useState(null); // To track which category to delete
  const dispatch = useDispatch();

  useEffect(() => {
    getCategories(user?.accessToken, dispatch, axiosJWT);
  }, [user, dispatch, store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const category = { name };
    await createCategory(user?.accessToken, dispatch, category, axiosJWT);
    setName("");
  };

  const handleAddProduct = (category) => {
    setCategoryToAddProduct(category);
    setShowCreateProduct(true);
  };

  const closeAddProduct = () => {
    setCategoryToAddProduct(null);
    setShowCreateProduct(false);
  };

  const toggleDropdown = (productId) => {
    setDropdownOpen(dropdownOpen === productId ? null : productId);
  };

  // Handle opening the Edit Product popup
  const handleOpenEditPopup = (product) => {
    setProductToEdit(product);
    setEditPopupOpen(true); // Open the edit product popup
    setDropdownOpen(null);
  };

  // Handle closing the Edit Product popup
  const closeEditProduct = () => {
    setEditPopupOpen(false);
    setProductToEdit(null);
  };

  // Handle delete product logic
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setDropdownOpen(null);
    setShowDeleteProductModal(true); // Show the delete confirmation modal
  };

  // Confirm product deletion
  const confirmDeleteProduct = async () => {
    console.log(`Deleting product: ${productToDelete._id}`);
    await deleteProduct(user?.accessToken, dispatch, productToDelete._id, axiosJWT);
    setShowDeleteProductModal(false);
  };

  const cancelDeleteProduct = () => {
    setShowDeleteProductModal(false);
    setProductToDelete(null);
  };

  // Handle delete category logic (trigger the confirmation modal)
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryModal(true); // Show the delete confirmation modal
  };

  // Confirm category deletion
  const confirmDeleteCategory = async () => {
    await deleteCategory(user?.accessToken, dispatch, categoryToDelete._id, axiosJWT);
    setShowDeleteCategoryModal(false);
    setCategoryToDelete(null); // Reset the state
  };

  const cancelDeleteCategory = () => {
    setShowDeleteCategoryModal(false);
    setCategoryToDelete(null); // Reset the state
  };

  const handleEditCategory = async (category) => {
    const updatedCategory = { name: editName };
    await editCategory(user?.accessToken, dispatch, updatedCategory, category._id, axiosJWT);
    setEditingCategoryId(null);
    setEditName("");
  };

  const handleEnableToggle = async (product) => {
    await enableProduct(user?.accessToken, dispatch, product._id, axiosJWT);
    toggleDropdown(null);
  }

  const formatPrice = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat().format(value);
  };

  return (
    <div>
      <form className="relative w-full px-4" onSubmit={handleSubmit}>
        <div>
          <h1 className="text-2xl font-semibold mb-3">Create New Category</h1>
        </div>
        <div className="relative mb-5 flex items-center space-x-3">
          <div className="relative flex-grow">
            <input
              type="text"
              id="name"
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="name"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
                name ? " -translate-y-[18px] text-xs bg-white px-1" : ""
              }`}
            >
              {name ? "Category Name" : "Name"}
            </label>
          </div>

          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md transition duration-300 ${
              name.trim() !== ""
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
            disabled={name.trim() === ""}
          >
            Save
          </button>
        </div>
      </form>

      <div className="px-4">
        <h1 className="text-2xl font-semibold mb-3">Categories</h1>
        {/* Displaying Categories and Products */}
        <div className="space-y-4">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <div key={category._id} className="border p-4 rounded-md bg-white">
                <div className="flex justify-between items-center mb-2 border-b border-gray-300 pb-4 ">
                  <h2 className="text-xl font-bold">{category.name}</h2>
                  <div className="space-x-2">
                    {/* Add Product Button */}
                    <button
                      onClick={() => handleAddProduct(category)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                    >
                      Add Product
                    </button>

                    {showCreateProduct && (
                      <div className="fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50">
                        <div className="bg-white p-4 rounded-lg relative">
                          <label
                            style={{ position: "absolute", left: 30, top: 14 }}
                          >
                            Add Product
                          </label>
                          <IconButton
                            aria-label="close"
                            onClick={closeAddProduct}
                            style={{ position: "absolute", right: 8, top: 8 }}
                            title="Close"
                          >
                            <CloseIcon />
                          </IconButton>
                          <div className="w-[400px] mt-8 h-[380px] overflow-y-auto">
                            <CreateProduct
                              category={categoryToAddProduct}
                              onCreateSuccess={closeAddProduct}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Edit Category Button */}
                    <button
                      onClick={() => {
                        editingCategoryId
                          ? setEditingCategoryId(null)
                          : setEditingCategoryId(category._id);
                        setEditName(category.name);
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200"
                    >
                      Edit Category
                    </button>
                    {/* Delete Category Button */}
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                    >
                      Delete Category
                    </button>
                  </div>
                </div>

                {/* Editing Category Input */}
                {editingCategoryId === category._id && (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="block w-full px-4 py-2 mb-2 text-lg bg-white border border-gray-300 rounded-md"
                      placeholder="Edit category name"
                    />
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                    >
                      Save Change
                    </button>
                  </div>
                )}

                {/* Displaying Products */}
                {category.products && category.products.length > 0 ? (
                  <div className="space-y-4">
                    {category.products.map((product) => (
                      <div
                        key={product._id}
                        className={`flex items-start border-b border-gray-300 py-4 ${!product.enable ? 'opacity-50' : ''}`}
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 mr-6 flex-shrink-0 relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                          {!product.enable && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs italic p-1 rounded-lg transform rotate-12">Sold out</span>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-grow -translate-y-[6px]">
                          <h3 className="text-lg font-semibold mb-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-500 text-sm mb-1">
                            {product.description}
                          </p>
                          <p className="text-gray-500 text-sm mb-1">
                            {product.sold ?? 0} sold
                          </p>
                          <p className="text-lg font-semibold text-red-500">
                            {formatPrice(product.price)}đ
                          </p>
                        </div>

                        {/* Ellipsis button for more actions */}
                        <div className="relative -top-3 cursor-pointer mr-6">
                          <FontAwesomeIcon
                            icon={faEllipsisH}
                            onClick={() => toggleDropdown(product._id)}
                          />
                        </div>

                        {dropdownOpen === product._id && (
                          <div className={`absolute right-14 mt-3 mr-6 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10`}>
                            <button
                              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 hover:rounded-lg"
                              onClick={() => handleOpenEditPopup(product)}
                            >
                              <FontAwesomeIcon icon={faPen} className="mr-2" />
                              Edit
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 hover:rounded-lg"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-2 text-red-600"
                              />
                              Delete
                            </button>
                            <button
                              className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 hover:rounded-lg ${product.enable ? 'text-yellow-500' : 'text-green-600'}`}
                              onClick={() => handleEnableToggle(product)}
                            >
                              <FontAwesomeIcon
                                icon={product.enable ? faTimesCircle : faCheckCircle}
                                className={`mr-2 ${product.enable ? 'text-yellow-500' : 'text-green-600'}`}
                              />
                              {product.enable ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No products available for this category.
                  </p>
                )}

              </div>
            ))
          ) : (
            <p className="text-gray-500">No categories available.</p>
          )}
        </div>
      </div>

      {/* Edit Product Popup */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-4 rounded-lg relative">
                          <label
                            style={{ position: "absolute", left: 30, top: 14 }}
                          >
                            Edit Product
                          </label>
                          <IconButton
                            aria-label="close"
                            onClick={closeEditProduct}
                            style={{ position: "absolute", right: 8, top: 8 }}
                            title="Close"
                          >
                            <CloseIcon />
                          </IconButton>
                          <div className="w-[400px] mt-8 h-[380px] overflow-y-auto">
                            <EditProduct
                            product={productToEdit}
                            onSaveSuccess={closeEditProduct} 
                            />
                          </div>
                        </div>
                      </div>
      )}

      {/* Delete Product Confirmation */}
      {showDeleteProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-center">Delete product?</h2>
            <p className="mb-4 text-center">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex flex-col space-y-4">
              <button
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                onClick={confirmDeleteProduct}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={cancelDeleteProduct}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      {showDeleteCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-center">Delete category?</h2>
            <p className="mb-4 text-center">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex flex-col space-y-4">
              <button
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                onClick={confirmDeleteCategory}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={cancelDeleteCategory}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
