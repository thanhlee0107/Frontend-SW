import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../Authentication/Authenticate";
import { PlusOutlined } from "@ant-design/icons";
import {
  Select,
  Button,
  Modal,
  Form,
  Input,
  notification,
  Flex,
  Spin,
} from "antd";
import { api } from "../../../../api/baseURL";
import InkImage from "../../../Assets/ink-pic.jpeg";
import { NavLink } from "react-router-dom";

const { Option } = Select;

const contentStyle = {
  padding: 50,
  borderRadius: 4,
  marginLeft: 450,
};
const content = <div style={contentStyle} />;

function MaterialStorage() {
  const token = localStorage.getItem("token");
  const [materials, setMaterials] = useState([]);
  const [addModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addMaterial, setAddMaterial] = useState({
    name: "",
    value: "",
  });

  const [modifiedValue, setModifiedValue] = useState({
    name: "",
    value: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModifiedValue((prev) => ({
      ...prev,
      [name]: value,
      name: selectedMaterial.name,
    }));
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const getMaterialApi = async (e) => {
    setLoading(true);
    try {
      const response = await api.get("/materialStorage", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      //console.log("Fetch material success", response.data.result);
      setMaterials(
        Array.isArray(response.data.result) ? response.data.result : []
      );
    } catch (error) {
      //console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (product) => {
    setSelectedMaterial(product);
    setIsModalVisible(true);
  };

  const handleModifiedMaterial = async () => {
    //console.log(modifiedValue)
    if (isNaN(modifiedValue.value)) {
      notification.error({
        message: "Vui lòng nhập một số hợp lệ!",
        description: "Error",
      });
    } else {
      notification.info({
        message: "Vui lòng chờ, đang cập nhật",
        description: "Updating",
      });
      await modifiedMaterialApi();
      await getMaterialApi();
      setModifiedValue(0);
      handleCloseModal();
    }
  };

  const modifiedMaterialApi = async () => {
    try {
      const response = await api.post(
        "/materialStorage/addjustMaterialRequest",
        {
          name: modifiedValue.name,
          value: modifiedValue.value,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //console.log("Modified material success", response.data.result);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      //console.error("Modified failed:", errorMessage);

      notification.error({
        message: "Update error",
        description: errorMessage,
      });
    }
  };

  const handleDeleteMaterial = async () => {
    try {
      const response = await api.delete("/materialStorage", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: selectedMaterial.name,
        },
      });

      //console.log("Delete material success", response.data.result);
      await getMaterialApi();
      setSelectedMaterial(null);
      handleCloseModal();
    } catch (error) {
      //console.error("Delete failed:", error.response?.data?.message || error.message);
      notification.error({
        message: "Delete error",
        description: error.response?.data?.message || "An error occurred",
      });
    }
  };

  const handleSelectAddMaterial = (e) => {
    if (typeof e === "string") {
      setAddMaterial((prev) => ({ ...prev, name: e }));
    }
    //console.log(addMaterial.name)
  };

  const handleInputChangeAddMaterial = (e) => {
    const { name, value } = e.target;
    if (isNaN(value) || value.trim() === "") {
      notification.error({
        message: "Vui lòng nhập một giá trị hợp lệ!",
        description: "Giá trị phải là số",
      });
      return;
    }
    //console.log(value)
    setAddMaterial((prev) => ({ ...prev, [name]: value }));
    //console.log(addMaterial.value)
  };

  const handleAddMaterial = async () => {
    //console.log(addMaterial.name,addMaterial.value)
    try {
      const response = await api.post(
        "/materialStorage/createMaterialRequest",
        {
          name: addMaterial.name,
          value: addMaterial.value,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //console.log("Add material success", response.data.result);

      await getMaterialApi();
      handleCloseAddModal();
    } catch (error) {
      //console.error("Add failed:", error.response?.data?.message || error.message);
      notification.error({
        message: "Add error",
        description: error.response?.data?.message || "An error occurred",
      });
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalVisible(false);
    setAddMaterial({ name: "", value: "" });
  };
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMaterial(null);
  };

  useEffect(() => {
    getMaterialApi();
  }, []);

  return (
    <div className="wrap-report">
      <div>
        <NavLink to="/">&larr; Trở về trang chủ</NavLink>
        <h1>Vật liệu in</h1>
      </div>

      <div className="add-button">
        <Button
          onClick={showAddModal}
          className="print-button"
          style={{ padding: 15, borderRadius: 10, height: 40 }}
        >
          <PlusOutlined />
          Thêm material
        </Button>
      </div>

      <div className="printer-container">
        {loading ? (
          <Flex gap="middle" vertical>
            <Flex gap="middle">
              <Spin tip="Loading" size="large">
                {content}
              </Spin>
            </Flex>
          </Flex>
        ) : (
          Array.isArray(materials) &&
          materials.map((material) => (
            <div
              className={`printer `}
              key={material.id}
              style={{ "border-bottom": "4px solid" }}
              onClick={() => showModal(material)}
            >
              {material.name !== "COLOR_INK" &&
              material.name !== "BLACK_WHITE_INK" ? (
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD8uGjW28XbcYbGWH3QGVihx2eaFFVRRynNA&s"
                  alt="Ảnh máy in"
                />
              ) : (
                <img src={InkImage} />
              )}
              <h3>Material name {material.name}</h3>
              <p>Material value : {material.value}</p>
            </div>
          ))
        )}
      </div>

      <Modal
        title={selectedMaterial?.name}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={handleDeleteMaterial}
            danger
          >
            Xóa
          </Button>,
        ]}
      >
        {selectedMaterial && (
          <>
            {selectedMaterial.name !== "COLOR_INK" &&
            selectedMaterial.name !== "BLACK_WHITE_INK" ? (
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD8uGjW28XbcYbGWH3QGVihx2eaFFVRRynNA&s"
                alt="Ảnh máy in"
              />
            ) : (
              <img src={InkImage} />
            )}

            <div>
              <p>Date update: {selectedMaterial.dateUpdate}</p>

              <p>Value : {selectedMaterial.value}</p>
              <Form>
                <Form.Item label="Tăng/giảm">
                  <Input
                    name="value"
                    value={modifiedValue.value}
                    onChange={handleInputChange}
                  />
                </Form.Item>
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleModifiedMaterial}
                >
                  {" "}
                  Điều chỉnh{" "}
                </Button>
              </Form>
            </div>
          </>
        )}
      </Modal>

      <Modal
        title="Add Material"
        visible={addModalVisible}
        onCancel={handleCloseAddModal}
        footer={[
          <Button
            key="submit"
            type="primary"
            className="print-button"
            onClick={handleAddMaterial}
          >
            Thêm
          </Button>,
        ]}
      >
        <>
          <img
            src="https://adsmo.vn/wp-content/uploads/2019/11/in-an.png"
            style={{ width: "100%" }}
          />
          <label htmlFor="material-select">Chọn Material:</label>
          <Select
            id="material-select"
            className="select"
            placeholder="Set Material"
            style={{ width: "200px", marginLeft: "10px" }}
            value={addMaterial.name}
            onChange={handleSelectAddMaterial}
          >
            <Option value="A5Page">A5Page</Option>
            <Option value="A4Page">A4Page</Option>
            <Option value="A3Page">A3Page</Option>
            <Option value="A2Page">A2Page</Option>
            <Option value="A1Page">A1Page</Option>
            <Option value="A0Page">A0Page</Option>
            <Option value="BLACK_WHITE_INK">BLACK_WHITE_INK</Option>
            <Option value="COLOR_INK">COLOR_INK</Option>
          </Select>
          <Form style={{ marginTop: "14px" }}>
            <Form.Item label="Set value">
              <Input
                name="value"
                value={addMaterial.value}
                onChange={handleInputChangeAddMaterial}
              />
            </Form.Item>
          </Form>
        </>
      </Modal>
    </div>
  );
}

export default MaterialStorage;
