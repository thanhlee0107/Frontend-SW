import React, { useState, useEffect } from "react";
import {
  FolderOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { uploadFile, getAllFile, deleteFile } from "../../api/studentApi";
import { Modal, notification, Pagination, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "./File.css";

function File() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const pageReal = page - 1;
      const data = await getAllFile(token, pageReal);
      setTotalFiles(data.totalElements);
      setUploadedFiles(Array.isArray(data.content) ? data.content : []);
    } catch (error) {
      setUploadedFiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [token, page]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredFiles = uploadedFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery)
  );

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRemoveFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    for (const file of files) {
      try {
         await uploadFile(token, file);
        notification.success({
          message: `File ${file.name} tải lên thành công`,
        });
        await fetchFiles();
      } catch (error) {
        notification.error({
          message: "Tải file thất bại",
          description: "Kích thước file quá lớn",
        });
      }
    }

    setUploading(false);
    setFiles([]);
  };

  const handleDeleteFile = (fileId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa file này không?",
      okText: "Có",
      cancelText: "Không",
      onOk: async () => {
        try {
          await deleteFile(token, fileId);
          await fetchFiles();
        } catch (error) {
          notification.error({
            message: "Delete FAILED",
            description: "Không thể xóa file. Vui lòng thử lại.",
          });
        }
      },
      onCancel: () => {
      },
    });
  };

  const handlePrintFile = (file) => {
    navigate("/print", { state: { file } });
  };

  return (
    <div>
      <div className="header-file">
        <NavLink to="/">&larr; Trở về trang chủ</NavLink>
        <h1>Tập tin</h1>
      </div>
      <div className="file-upload-container">
        <div className="file-upload-header">
          <div className="file-image">
            <FolderOutlined style={{ fontSize: "24px", color: "#000" }} />
            <h2>Tải tập tin</h2>
          </div>
          <div className="file-actions">
            <label className="file-choose-button">
              Chọn tệp
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            <button
              onClick={handleUpload}
              className="upload-button"
              disabled={
                !Array.isArray(files) || files.length === 0 || uploading
              }
            >
              {uploading ? "Đang tải lên..." : "Tải lên"}
            </button>
          </div>
        </div>

        <div
          className="file-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <UploadOutlined style={{ fontSize: "24px", color: "#08c" }} />
          {Array.isArray(files) && files.length > 0 ? (
            <div className="files-info">
              {files.map((file) => (
                <div key={file.name} className="file-item">
                  <span>{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(file)}
                    style={{
                      marginLeft: "10px",
                      color: "red",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>Kéo thả tệp tin vào đây hoặc chọn tệp ở trên</p>
          )}
        </div>
      </div>

      <div className="file-upload-container">
        <h2>Danh sách file đã tải lên</h2>
        <div className="file-container">
          <div className="search-container">
            <div className="search-input-wrapper">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input-file"
              />
            </div>
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <Spin tip="Đang tải..." />
            </div>
          ) : filteredFiles.length > 0 ? (
            <table className="file-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên tệp</th>
                  <th>Kích thước (KB)</th>
                  <th>Ngày tải lên</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => (
                  <tr key={file.id}>
                    <td>{index + 1 + (page - 1) * 10}</td>
                    <td>{file.name}</td>
                    <td>{(file.fileSize / 1024).toFixed(2)}</td>
                    <td>{new Date(file.uploadDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="action-button delete-button"
                      >
                        Xóa file
                      </button>
                      <button
                        onClick={() => handlePrintFile(file)}
                        className="action-button print-button"
                      >
                        In file
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không tìm thấy file nào khớp với lựa chọn.</p>
          )}
        </div>
        <div className="pagination">
          <Pagination
            current={page}
            total={totalFiles}
            pageSize={10}
            onChange={(current) => setPage(current)}
          />
        </div>
      </div>
    </div>
  );
}

export default File;
