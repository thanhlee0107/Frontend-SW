import React, { useState, useEffect } from "react";
import {
  getPricePaper,
  createNewPrice,
  editPricePaper,
} from "../../../api/adminApi";
import { Pagination, Modal, Input, Select, Button, notification } from "antd";
import { EditTwoTone } from "@ant-design/icons";
import { SearchOutlined } from '@ant-design/icons';
import "./PriceSetting.css";
import { NavLink } from "react-router-dom";

const { Option } = Select;

const PriceSetting = () => {
  const [price, setPrice] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [newPrice, setNewPrice] = useState({
    colorType: "",
    pageType: "",
    faceType: false,
    pricePage: "",
  });
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState({
    id: "",
    colorType: "",
    pageType: "",
    faceType: false,
    pricePage: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filteredPrices = price.filter(item =>
      (item.colorType && item.colorType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.pageType && item.pageType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.pricePage && item.pricePage.toString().includes(searchTerm))
    );
    setCurrentItems(filteredPrices.slice(startIndex, endIndex));
  }, [currentPage, price, itemsPerPage, searchTerm]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = () => {
    getPricePaper(token)
      .then((res) => {
        setPrice(res.data.result);
      })
      .catch((error) => {
        ////console.error("Error fetching printers:", error);
      });
  };

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentItems(price.slice(startIndex, endIndex));
  }, [currentPage, price, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenAddModal = () => {
    setIsOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setIsOpenAddModal(false);
    setNewPrice({
      colorType: "",
      pageType: "",
      faceType: false,
      pricePage: "",
    });
  };

  const handleInputChange = (key, value) => {
    setNewPrice((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddPrice = () => {
    if (!newPrice.colorType || !newPrice.pageType || !newPrice.pricePage) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    createNewPrice(token, newPrice)
      .then(() => {
        fetchPrices();
        handleCloseAddModal();
        notification.success({
          message: "Thêm giá in thành công",
          description: "Success",
        });
      })
      .catch((error) => {
        handleCloseAddModal();
        notification.error({
          message: "Lỗi",
          description: "Đã xảy ra lỗi.",
        });
      });
  };

  const handleOpenEditModal = (item) => {
    setIsOpenEditModal(true);
    setEditingPrice({
      colorType: item.colorType,
      pageType: item.pageType,
      faceType: item.faceType,
      pricePage: item.pricePage,
    });
  };

  const handleCloseEditModal = () => {
    setIsOpenEditModal(false);
    setEditingPrice({
      id: "",
      colorType: "",
      pageType: "",
      faceType: false,
      pricePage: "",
    });
  };

  const handleEditPrice = () => {
    if (
      !editingPrice.colorType ||
      !editingPrice.pageType ||
      !editingPrice.pricePage
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    editPricePaper(token, {
      colorType: editingPrice.colorType,
      pageType: editingPrice.pageType,
      faceType: editingPrice.faceType,
      pricePage: editingPrice.pricePage,
    })
      .then(() => {
        fetchPrices();
        handleCloseEditModal();
        notification.success({
          message: "Thay đổi giá in thành công",
          description: "Success",
        });
      })
      .catch((error) => {
        handleCloseEditModal();
        notification.error({
          message: "Lỗi",
          description: `${error.message || error}`,
        });
      });
  };

  return (
    <div id="wrapper">
      <div id="header">
         <NavLink to="/">&larr; Trở về trang chủ</NavLink>
        <h1>Cập nhật giá in</h1>
      </div>
      <div className="outer">
        <div className="price-setting container">
          <h3>Thông tin giá in</h3>
          <Input
            placeholder="Tìm kiếm theo tên loại giấy"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
            style={{ marginBottom: "20px" }}
            prefix={<SearchOutlined />}
            size="large"
          />
          <div className="price-header">
            <button className="add-price-button" onClick={handleOpenAddModal}>
              Thêm giá in
            </button>
          </div>
          <table className="price-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Loại màu</th>
                <th>Loại giấy</th>
                <th>Mặt in</th>
                <th>Giá tiền</th>
                <th>Ngày thêm giá</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>
                    {item.colorType === "BLACK_WHITE_INK"
                      ? "In trắng đen"
                      : "In màu"}
                  </td>
                  <td>{item.pageType}</td>
                  <td>{item.faceType ? "In 2 mặt" : "In 1 mặt"}</td>
                  <td>{item.pricePage}</td>
                  <td>
                    {new Date(item.dateUpdate).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <EditTwoTone
                      onClick={() => handleOpenEditModal(item)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-container">
          <Pagination
            style={{
              display: "flex",
              justifyContent: "center",
            }}
            current={currentPage}
            pageSize={itemsPerPage}
            total={price.length}
            onChange={handlePageChange}
          />
        </div>

        <Modal
          title="Thêm giá in mới"
          visible={isOpenAddModal}
          onCancel={handleCloseAddModal}
          footer={[
            <Button key="cancel" onClick={handleCloseAddModal}>
              Hủy
            </Button>,
            <Button key="add" type="primary" onClick={handleAddPrice}>
              Thêm
            </Button>,
          ]}
        >
          <label>Loại màu:</label>
          <Select
            value={newPrice.colorType}
            onChange={(value) => handleInputChange("colorType", value)}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <Option value="BLACK_WHITE_INK">In trắng đen</Option>
            <Option value="COLOR_INK">In màu</Option>
          </Select>
          <label>Loại giấy:</label>
          <Select
            value={newPrice.pageType}
            onChange={(value) => handleInputChange("pageType", value)}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <Option value="A5Page">Giấy A5</Option>
            <Option value="A4Page">Giấy A4</Option>
            <Option value="A3Page">Giấy A3</Option>
            <Option value="A2Page">Giấy A2</Option>
            <Option value="A1Page">Giấy A1</Option>
            <Option value="A0Page">Giấy A0</Option>
          </Select>
          <label>Mặt in:</label>
          <Select
            value={newPrice.faceType}
            onChange={(value) => handleInputChange("faceType", value)}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <Option value={true}>In 2 mặt</Option>
            <Option value={false}>In 1 mặt</Option>
          </Select>
          <label>Giá tiền:</label>
          <Input
            type="number"
            value={newPrice.pricePage}
            onChange={(e) => handleInputChange("pricePage", e.target.value)}
            style={{ marginBottom: "10px" }}
          />
        </Modal>
        <Modal
          title="Chỉnh sửa giá in"
          visible={isOpenEditModal}
          onCancel={handleCloseEditModal}
          footer={[
            <Button key="cancel" onClick={handleCloseEditModal}>
              Hủy
            </Button>,
            <Button key="edit" type="primary" onClick={handleEditPrice}>
              Lưu thay đổi
            </Button>,
          ]}
        >
          <label>Loại màu:</label>
          <Select
            value={editingPrice.colorType}
            onChange={(value) =>
              setEditingPrice({ ...editingPrice, colorType: value })
            }
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <Option value="BLACK_WHITE_INK">In trắng đen</Option>
            <Option value="COLOR_INK">In màu</Option>
          </Select>
          <label>Loại giấy:</label>
          <Select
            value={editingPrice.pageType}
            onChange={(value) =>
              setEditingPrice({ ...editingPrice, pageType: value })
            }
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <Option value="A5Page">Giấy A5</Option>
            <Option value="A4Page">Giấy A4</Option>
            <Option value="A3Page">Giấy A3</Option>
            <Option value="A2Page">Giấy A2</Option>
            <Option value="A1Page">Giấy A1</Option>
            <Option value="A0Page">Giấy A0</Option>
          </Select>
          <label>Mặt in:</label>
          <Select
            value={editingPrice.faceType}
            onChange={(value) =>
              setEditingPrice({ ...editingPrice, faceType: value })
            }
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <Option value={true}>In 2 mặt</Option>
            <Option value={false}>In 1 mặt</Option>
          </Select>
          <label>Giá tiền:</label>
          <Input
            type="number"
            value={editingPrice.pricePage}
            onChange={(e) =>
              setEditingPrice({ ...editingPrice, pricePage: e.target.value })
            }
            style={{ marginBottom: "10px" }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default PriceSetting;
