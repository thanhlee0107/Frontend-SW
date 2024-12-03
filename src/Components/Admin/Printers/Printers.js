import "./Printers.css";
import axios from "axios";
import printerImage from './printer.jpg';
import { useState, useEffect } from "react";
import { Modal, Button, Input, Form, notification, Switch, Select } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { postNewPrinterApi, editPrinterInfo, deletePrinter, addPrinterMaterial, getAllPrinter } from "../../../api/adminApi";

function Printers() {
    const [printers, setPrinters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isAddMaterial, setIsAddMaterial] = useState(false);
    const token = localStorage.getItem("token");
    const [newPrinter, setNewPrinter] = useState({
        name: "",
        manufacturer: "",
        model: "",
        description: "",
        base: "",
        building: "",
        floor: "",
        blackWhiteInkStatus: 500,
        colorInkStatus: 500,
        a0paperStatus: 500,
        a1paperStatus: 500,
        a2paperStatus: 500,
        a3paperStatus: 500,
        a4paperStatus: 500,
        a5paperStatus: 500,
        capacity: 500,
        warrantyDate: "",
    });

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddMaterialModal, setIsAddMaterialModal] = useState(false);
    const [editedPrinter, setEditedPrinter] = useState({});
    const [addedPrinter, setAddedPrinter] = useState({});
    const { Option } = Select;
    const paperType = [
        { value: "A0Page", label: "A0" },
        { value: "A1Page", label: "A1" },
        { value: "A2Page", label: "A2" },
        { value: "A3Page", label: "A3" },
        { value: "A4Page", label: "A4" },
        { value: "A5Page", label: "A5" },
        { value: "COLOR_INK", label: "In Màu" },
        { value: "BLACK_WHITE_INK", label: "Đen Trắng" }
    ];
    const [materialType, setMaterialType] = useState(null);
    const [amount, setAmount] = useState(0);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = printers.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(printers.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showModal = (product) => {
        setSelectedProduct(product);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedProduct(null);
    };

    const showAddModal = () => {
        setIsAddModalVisible(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalVisible(false);
        setNewPrinter({
            name: "",
            manufacturer: "",
            model: "",
            description: "",
            base: "",
            building: "",
            floor: "",
            paperStatus: 500,
            capacity: 500,
            warrantyDate: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPrinter((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitNewPrinter = () => {
        if (!newPrinter.base || !newPrinter.building || !newPrinter.floor || !newPrinter.name || !newPrinter.manufacturer || !newPrinter.model || !newPrinter.description) {
            notification.error({
                message: "Vui lòng điền đầy đủ thông tin",
                description: "Error",
            });
            return;
        }

        postNewPrinterApi(token, newPrinter)
            .then((response) => {
                const data = response.data;
                setPrinters((prev) => [...prev, data]);
                handleCloseAddModal();
                notification.success({
                    message: "Thêm máy in thành công",
                    description: "Success",
                });
            })
            .catch((error) => {
                notification.error({
                    message: "Không thể thêm máy in",
                    description: `Lỗi: ${error.message}`,
                });
            });
    };

    const showEditModal = () => {
        setEditedPrinter(selectedProduct || {});
        setIsEditModalVisible(true);
        // handleCloseModal();
    };
    const showAddMaterialModal = () => {
        setAddedPrinter(selectedProduct || {});
        setIsAddMaterialModal(true);
        setIsEditModalVisible(false);
    };
    const resetModal = () => {
        setMaterialType(null); 
        setAmount(0); 
    };

    const handleSubmitEditPrinter = () => {
        const { id, status } = editedPrinter;

        editPrinterInfo(token, id, status)
            .then((response) => {
                const updatedPrinter = response.data;
                setPrinters((prev) => prev.map((printer) => (printer.id === updatedPrinter.id ? updatedPrinter : printer)));
                setIsEditModalVisible(false);
                setIsEdit(!isEdit);
                notification.success({
                    message: "Cập nhật trạng thái máy in thành công",
                    description: "Success",
                });
                setIsModalVisible(false);
            })
            .catch((error) => {
                notification.error({
                    message: "Không thể cập nhật trạng thái máy in",
                    description: `Lỗi: ${error.message}`,
                });
            });
    };

    const showDeleteConfirmation = () => {
        Modal.confirm({
            title: 'Bạn chắc chắn muốn xóa máy in?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                handleDeletePrinterConfirmed();
            },
            onCancel() {
                handleCloseModal();
            },
        });
    };

    const handleDeletePrinterConfirmed = () => {
        deletePrinter(token, selectedProduct.id)
            .then(() => {
                setPrinters(prevPrinters => prevPrinters.filter(printer => printer.id !== selectedProduct.id));
                notification.success({
                    message: `Xóa máy in thành công máy in ID ${selectedProduct.id}`,
                    description: "Success",
                });
                handleCloseModal();
            })
            .catch((error) => {
                notification.error({
                    message: "Không thể xóa máy in",
                    description: `Lỗi: ${error.message}`,
                });
            });
    };

    const handleDeletePrinter = () => {
        showDeleteConfirmation();
    };

    const handleAddMaterialPrinter = () => {
        const data = {
            printerId: addedPrinter.id,
            materialType: materialType,
            amount: amount,
        };

        addPrinterMaterial (token, data)
            .then((response) => {
                notification.success({
                    message: "Thêm vật liệu thành công",
                    description: "Vật liệu đã được thêm vào máy in.",
                });
                resetModal();
                setIsAddMaterialModal(false);
                setIsModalVisible(false);
                setIsAddMaterial(!isAddMaterial);
            })
            .catch((error) => {
                notification.error({
                    message: "Không thể thêm vật liệu",
                    description: `Lỗi: ${error.message}`,
                });
            });
    };

    useEffect(() => {
        getAllPrinter(token)
            .then((res) => {
                setPrinters(res.data.result);
            })
            .catch((error) => {
                console.error("Error fetching printers:", error);
            });
    }, [isEdit, isAddMaterial]);

    return (
        <div id="wrapper">
            <div id="header">
                <a href="/" className="back-button">
                    &larr; Trở về trang chủ
                </a>
                <h1>Quản lý máy in</h1>
            </div>

            <div className="add-button">
                <button onClick={showAddModal} className="add-printer-button">
                    <PlusOutlined style={{ marginRight: 8 }} />
                    Thêm máy in
                </button>
            </div>

            <div className="printer-container">
                {currentProducts && currentProducts.map((product) => (
                    <div
                        className={`printer ${product.status ? 'active' : 'inactive'}`}
                        key={product.id}
                        onClick={() => showModal(product)}
                    >
                        <img src={printerImage} alt="Ảnh máy in" />
                        <h3>Máy in {product.name}</h3>
                        <p>{product.address.base}, tòa {product.address.building}, tầng {product.address.floor}</p>
                    </div>
                ))}
            </div>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        disabled={currentPage === index + 1}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <Modal
                title={selectedProduct?.name}
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button type="primary" key="edit" onClick={showEditModal}>
                        Chỉnh sửa
                    </Button>,
                    <Button type="primary" key="delete" onClick={handleDeletePrinter} danger>
                        Xóa
                    </Button>,
                ]}
            >
                {selectedProduct && (
                    <>
                        <img src={printerImage} alt="Ảnh máy in" style={{ width: "100%", height: "auto" }} />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                margin: "10px 0",
                            }}
                        >
                            <p style={{ margin: 0 }}>
                                <span
                                    className={`status-box ${selectedProduct.status ? "status-active" : "status-inactive"
                                        }`}
                                >
                                    {selectedProduct.status ? "Đang hoạt động" : "Tạm dừng"}
                                </span>
                            </p>
                        </div>

                        <p>
                            <strong>Kiểu in:</strong> {selectedProduct.model}
                        </p>
                        <p>
                            <strong>Vị trí:</strong> {selectedProduct.address.base}, tòa {selectedProduct.address.building}, tầng {selectedProduct.address.floor}
                        </p>
                        <p>
                            <strong>Mực in trắng đen: </strong> {selectedProduct.blackWhiteInkStatus}
                        </p>
                        <p>
                            <strong>Mực in màu: </strong> {selectedProduct.colorInkStatus}
                        </p>
                        <p>
                            <strong>Số giấy a0: </strong> {selectedProduct.a0paperStatus}
                        </p>
                        <p>
                            <strong>Số giấy a1: </strong> {selectedProduct.a1paperStatus}
                        </p>
                        <p>
                            <strong>Số giấy a2: </strong> {selectedProduct.a2paperStatus}
                        </p>
                        <p>
                            <strong>Số giấy a3: </strong> {selectedProduct.a3paperStatus}
                        </p>
                        <p>
                            <strong>Số giấy a4: </strong> {selectedProduct.a4paperStatus}
                        </p>
                        <p>
                            <strong>Số giấy a5: </strong> {selectedProduct.a5paperStatus}
                        </p>
                        <p>
                            <strong>Sức chứa: </strong> {selectedProduct.capacity}
                        </p>
                        <p>
                            <strong>Ngày bảo hành: </strong> {new Date(selectedProduct.warrantyDate).toLocaleDateString("vi-VN")}
                        </p>
                    </>
                )}
            </Modal>

            <Modal
                title="Thêm Máy In"
                visible={isAddModalVisible}
                onCancel={handleCloseAddModal}
                footer={[
                    <Button key="back" onClick={handleCloseAddModal}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSubmitNewPrinter}>
                        Thêm
                    </Button>,
                ]}
            >
                <Form layout="vertical">
                    <Form.Item label="Tên máy in">
                        <Input name="name" value={newPrinter.name} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Nhà sản xuất">
                        <Input name="manufacturer" value={newPrinter.manufacturer} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Kiểu in">
                        <Input name="model" value={newPrinter.model} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Mô tả">
                        <Input name="description" value={newPrinter.description} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Vị trí">
                        <Input name="base" placeholder="CS1 hoặc CS2" value={newPrinter.base} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Tòa">
                        <Input name="building" placeholder="H6, H1..." value={newPrinter.building} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Tầng">
                        <Input name="floor" placeholder="1, 2..." value={newPrinter.floor} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Mực in trắng đen">
                        <Input type="number" name="blackWhiteInkStatus" value={newPrinter.blackWhiteInkStatus} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Mực in màu">
                        <Input type="number" name="colorInkStatus" value={newPrinter.colorInkStatus} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Số lượng giấy a0">
                        <Input type="number" name="a0paperStatus" value={newPrinter.a0paperStatus} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Số lượng giấy a1">
                        <Input type="number" name="a1paperStatus" value={newPrinter.a1paperStatus} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Số lượng giấy a2">
                        <Input type="number" name="a2paperStatus" value={newPrinter.a2paperStatus} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Số lượng giấy a3">
                        <Input type="number" name="a3paperStatus" value={newPrinter.a3paperStatus} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Số lượng giấy a4">
                        <Input type="number" name="a4paperStatus" value={newPrinter.a4paperStatus} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Số lượng giấy a5">
                        <Input type="number" name="a5paperStatus" value={newPrinter.a5paperStatus} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Sức chứa">
                        <Input type="number" name="capacity" value={newPrinter.capacity} onChange={handleInputChange} />
                    </Form.Item>
                    <Form.Item label="Ngày bảo hành">
                        <Input type="date" name="warrantyDate" value={newPrinter.warrantyDate} onChange={handleInputChange} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Chỉnh sửa Máy In"
                visible={isEditModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="addMaterial" onClick={showAddMaterialModal}>
                        Thêm vật liệu
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSubmitEditPrinter}>
                        Xong
                    </Button>,
                ]}
            >
                <Form layout="vertical">
                    <Form.Item label="Trạng thái hoạt động">
                        <Switch
                            checked={editedPrinter.status}
                            onChange={(checked) => setEditedPrinter({ ...editedPrinter, status: checked })}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Thêm vật liệu"
                visible={isAddMaterialModal}
                onCancel={() => setIsAddMaterialModal(false)}
                footer={[
                    <Button key="submit" type="primary" onClick={handleAddMaterialPrinter}>
                        Xong
                    </Button>,
                ]}
            >
                <Form layout="vertical">
                    <Form.Item label="Chọn vật liệu">
                        <Select
                            placeholder="A0"
                            style={{ width: 200 }}
                            onChange={value => setMaterialType(value)}
                        >
                            {paperType.map((type) => (
                                <Option key={type.value} value={type.value}>
                                    {type.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Số lượng giấy">
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
}

export default Printers;