import { UserOutlined, CaretDownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Button } from "antd";
import React, { useContext } from "react";
import "./Layout.css";
import { AuthContext } from "../Components/Authentication/Authenticate";
import { NavLink } from "react-router-dom";

function UserInfo() {
  const { setToken, userData, fetchUserData } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_DB_URL;
  const handleLogout = async () => {
    logOutApi();
    localStorage.removeItem("token");
    setToken(null);
  };

  const logOutApi = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        throw new Error("Unable to delete token");
      } else {
      }
    } catch (error) {
      ////console.error("Logout token failed", error);
    }
  };

  const menu = (
    <Menu style={{ marginTop: "10px" }}>
      <Menu.Item key="1">
        <NavLink to="/user-profile">Thông tin cá nhân</NavLink>
      </Menu.Item>

      {userData?.result.role === "ADMIN" && (
        <Menu.Item key="2">
          <NavLink to="/user-adminis">Quản lý tài khoản</NavLink>
        </Menu.Item>
      )}

      {userData?.result.role === "ADMIN" && (
        <Menu.Item key="3">
          <NavLink to="/create-staff">Tạo tài khoản</NavLink>
        </Menu.Item>
      )}

      {!(userData?.result.role === "ADMIN") && (
        <Menu.Item key="4">
          <NavLink to="/payment">Nạp tiền</NavLink>
        </Menu.Item>
      )}

      <Menu.Item key="5" onClick={handleLogout}>
        <NavLink to="/login">Thoát</NavLink>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="info-form">
      <UserOutlined className="user-icon" />
      <ul className="info-list">
        <li style={{ fontWeight: "bold", color: "white" }}>
          {userData?.result.lastName} {userData?.result.firstName}
        </li>
        <li style={{ color: "white" }}>{userData?.result.role}</li>
      </ul>
      <div className="dropdown">
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button className="transparent-button" size="small">
            <CaretDownOutlined />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}

export default UserInfo;
